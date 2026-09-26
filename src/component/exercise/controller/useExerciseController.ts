import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { usePreferences } from "../../../context/PreferencesContext";
import { SessionService } from "../../../services/sessionService";
import { NextQuestion, SessionSummary, SubmitAnswerResponse } from "../../../models/sessionModel";
import { SkillProgress } from "../../../models/branchSkillModel";
import { exerciseDraftService } from "../exerciseDraft.service";
import { soundService } from "../../../services/soundService";
import { isMastered } from "../../home/utils/skillTree";

const NOT_STARTED: SkillProgress = { progressPercent: 0, attemptCount: 0 };

interface ExerciseLocationState {
  skillId: number;
  skillCode: string;
  skillsName: string;
}

/** Outcome of one submitted answer. It only exists once /session/:id/answer has responded,
 *  and it belongs to the exercise it was given for (adt-learning/docs/adr/0002). */
export interface AnswerResult {
  exerciseId: number;
  /** the option the student picked; null for fill-in-the-blank */
  choiceId: number | null;
  isCorrect: boolean;
}

/** What the bottom answer sheet shows. It outlives the result it came from so the sheet
 *  keeps its content while sliding away. */
export interface AnswerFeedback {
  isCorrect: boolean;
  /** Progress right before and right after this one answer */
  before: SkillProgress;
  after: SkillProgress;
  /** this answer ended the session — the sheet's button opens the summary instead */
  isLast: boolean;
}

export function useExerciseController() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { t } = usePreferences();
  const { activeBranchId } = useApp();
  const state = location.state as ExerciseLocationState | null;

  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<NextQuestion | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number | null>(null);
  // Progress as the skill-tree node shows it (from the backend), not raw P(L)
  const [progress, setProgress] = useState<SkillProgress>(NOT_STARTED);
  const [progressStart, setProgressStart] = useState<SkillProgress>(NOT_STARTED);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fillInBlankInput, setFillInBlankInput] = useState("");
  // true while /answer is in flight: the answer is locked but its result isn't known yet
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  // the answered response waits here until the student presses "next" on the answer sheet
  const [pending, setPending] = useState<SubmitAnswerResponse | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [stopReason, setStopReason] = useState<SubmitAnswerResponse["stopReason"]>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  // the "leave and keep the draft" confirmation (adt-learning/docs/adr/0003)
  const [exitOpen, setExitOpen] = useState(false);

  // Answer-time clock (ms). The KT engine rewards answering within expectTime, so time
  // spent with the tour or the rules card open is paused out of it.
  const questionStartRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);

  const startQuestionClock = useCallback(() => {
    const now = Date.now();
    questionStartRef.current = now;
    // a guide still open when the question appears keeps the clock paused from now
    if (pausedAtRef.current !== null) pausedAtRef.current = now;
  }, []);

  const pauseClock = useCallback(() => {
    if (pausedAtRef.current === null) pausedAtRef.current = Date.now();
  }, []);

  const resumeClock = useCallback(() => {
    if (pausedAtRef.current === null) return;
    questionStartRef.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = null;
  }, []);

  // load the effect files now, so the first ✓/✗ plays without a delay
  useEffect(() => {
    soundService.preload();
  }, []);

  useEffect(() => {
    async function start() {
      if (!activeBranchId || !state?.skillId) {
        navigate("/home");
        return;
      }
      setIsLoading(true);
      const res = await SessionService.startSession(
        Number(activeBranchId),
        state.skillId,
      );
      setSessionId(res.sessionId);
      setQuestion(res.question);
      setQuestionLimit(res.questionLimit ?? null);
      setProgress(res.progress);
      setProgressStart(res.progress);

      // A resumed draft continues its counter and its "N correct" (adt-learning/docs/adr/0003)
      const answeredCount = res.answeredCount ?? 0;
      setQuestionIndex(answeredCount);
      setCorrectCount(res.correctCount ?? 0);
      // ...and gets back the pick that wasn't submitted, if it was for this same question
      const unsent = exerciseDraftService.load(res.sessionId);
      if (unsent?.exerciseId === res.question.exerciseId) {
        const stillAChoice = res.question.choices?.some((c) => c.id === unsent.choiceId);
        setSelected(stillAChoice ? unsent.choiceId : null);
        setFillInBlankInput(unsent.text ?? "");
      }
      if (res.resumed) {
        toast.normal(t("exercise.resumed"), t("exercise.resumedBody", { count: answeredCount }));
      }

      startQuestionClock();
      setIsLoading(false);
    }
    start();
  }, [activeBranchId, state?.skillId]);

  // Once submitted, an answer can't change — while it is checked and while its result shows
  const locked = checking || result !== null;

  // Keep the unsent answer, so leaving the page never loses it (adt-learning/docs/adr/0003)
  useEffect(() => {
    if (!sessionId || !question || locked) return;
    exerciseDraftService.save(sessionId, {
      exerciseId: question.exerciseId,
      choiceId: selected,
      text: fillInBlankInput,
    });
  }, [sessionId, question, selected, fillInBlankInput, locked]);

  const pick = useCallback(
    (choiceId: number) => {
      if (locked) return;
      setSelected(choiceId);
    },
    [locked],
  );

  const showNext = useCallback(
    (res: SubmitAnswerResponse) => {
      if (res.sessionEnded) {
        if (sessionId) exerciseDraftService.clear(sessionId); // no draft left to resume
        setSessionEnded(true);
        // the celebration sound is for mastering the skill — running out of questions or turns isn't a win
        if (res.stopReason === "mastered") soundService.play("complete");
        setStopReason(res.stopReason);
        setSummary(res.summary ?? null);
      } else if (res.nextQuestion) {
        setQuestion(res.nextQuestion);
        setQuestionIndex((i) => i + 1);
        setSelected(null);
        setFillInBlankInput("");
        setResult(null);
        startQuestionClock();
      }
    },
    [sessionId, startQuestionClock],
  );

  const submit = useCallback(async () => {
    if (!sessionId || !question || locked) return;
    const choiceId = question.type === "CHOICE" ? selected : null;
    const chosenAnswer =
      question.type === "CHOICE"
        ? question.choices?.find((c) => c.id === selected)?.script
        : fillInBlankInput;
    if (chosenAnswer === undefined || chosenAnswer === "") return;

    // a paused clock stopped when the guide opened
    const endMs = pausedAtRef.current ?? Date.now();
    setChecking(true);

    let res: SubmitAnswerResponse;
    try {
      res = await SessionService.submitAnswer(sessionId, {
        exerciseId: question.exerciseId,
        chosenAnswer,
        startTime: new Date(questionStartRef.current).toISOString(),
        endTime: new Date(endMs).toISOString(),
      });
    } catch {
      // back to answering — the same answer can be sent again
      setChecking(false);
      toast.error(t("exercise.submitError"), t("exercise.submitErrorBody"));
      return;
    }

    // ✓/✗ exists only from here on, and only for this exercise
    setChecking(false);
    setResult({ exerciseId: question.exerciseId, choiceId, isCorrect: res.isCorrect });
    soundService.play(res.isCorrect ? "correct" : "incorrect");
    if (res.isCorrect) setCorrectCount((c) => c + 1);
    setFeedback({
      isCorrect: res.isCorrect,
      before: progress,
      after: res.progress,
      isLast: res.sessionEnded,
    });
    setProgress(res.progress);
    setPending(res);
  }, [sessionId, question, locked, selected, fillInBlankInput, progress, toast, t]);

  // "Next" on the answer sheet: the next question, or the summary after the last answer
  const next = useCallback(() => {
    if (!pending) return;
    setPending(null);
    showNext(pending);
  }, [pending, showNext]);

  const goHome = useCallback(() => navigate("/home"), [navigate]);
  // after completing the goal: the skill tree (and its goal node) now lives on the Home tab
  const goToSkillTree = useCallback(() => navigate("/home"), [navigate]);

  // From the session summary straight into a new session. `replace` so Back goes to Home, not to the
  // finished session; Exercise remounts on every navigation (key = location.key), so state starts clean.
  const startSkill = useCallback(
    (skill: { skillId: number; skillCode: string; skillsName: string }) =>
      navigate("/exercise", {
        replace: true,
        state: { skillId: skill.skillId, skillCode: skill.skillCode, skillsName: skill.skillsName },
      }),
    [navigate],
  );
  // the finished session's questions are only excluded within that session, so a new one has them all again
  const practiseAgain = useCallback(() => {
    if (state) startSkill(state);
  }, [state, startSkill]);

  // Leaving keeps the draft: answers are already saved server-side, the pick in localStorage
  const requestExit = useCallback(() => setExitOpen(true), []);
  const cancelExit = useCallback(() => setExitOpen(false), []);
  const confirmExit = useCallback(() => {
    setExitOpen(false);
    toast.normal(t("exercise.exitSaved"));
    navigate("/home");
  }, [navigate, toast, t]);

  return {
    isLoading,
    skillsName: state?.skillsName ?? "",
    question,
    questionIndex,
    questionLimit,
    progress,
    progressStart,
    selected,
    fillInBlankInput,
    setFillInBlankInput,
    checking,
    result,
    locked,
    correctCount,
    sessionEnded,
    stopReason,
    summary,
    pick,
    submit,
    feedback,
    feedbackOpen: pending !== null,
    next,
    skillId: state?.skillId ?? null,
    // started at 100% = a review: the backend keeps P(L) frozen, so there is no Progress to show
    // or move (adt-learning/docs/adr/0007) — same test as the backend's pL ≥ 0.95 (ADR 0004)
    reviewing: isMastered(progressStart),
    // at 100% now — from the start (a review) or since an answer in this session; the session still
    // runs its full round, and every answer after this one is a review with P(L) frozen (ADR 0007)
    completed: isMastered(progress),
    goHome,
    goToSkillTree,
    startSkill,
    practiseAgain,
    pauseClock,
    resumeClock,
    exitOpen,
    requestExit,
    cancelExit,
    confirmExit,
  };
}
