import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { SessionService } from "../../../services/sessionService";
import { NextQuestion, SessionSummary } from "../../../models/sessionModel";

interface ExerciseLocationState {
  skillId: number;
  skillCode: string;
  skillsName: string;
}

export function useExerciseController() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBranchId } = useApp();
  const state = location.state as ExerciseLocationState | null;

  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<NextQuestion | null>(null);
  const [pL, setPL] = useState(0);
  const [pLStart, setPLStart] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fillInBlankInput, setFillInBlankInput] = useState("");
  const [responded, setResponded] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(
    new Date().toISOString(),
  );

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
      setPL(res.pL);
      setPLStart(res.pL);
      setQuestionStartTime(new Date().toISOString());
      setIsLoading(false);
    }
    start();
  }, [activeBranchId, state?.skillId]);

  const pick = useCallback(
    (choiceId: number) => {
      if (responded) return;
      setSelected(choiceId);
    },
    [responded],
  );

  const submit = useCallback(async () => {
    if (!sessionId || !question) return;
    const chosenAnswer =
      question.type === "CHOICE"
        ? question.choices?.find((c) => c.id === selected)?.script
        : fillInBlankInput;
    if (chosenAnswer === undefined || chosenAnswer === "") return;

    setResponded(true);
    const endTime = new Date().toISOString();

    const res = await SessionService.submitAnswer(sessionId, {
      exerciseId: question.exerciseId,
      chosenAnswer,
      startTime: questionStartTime,
      endTime,
    });

    setLastCorrect(res.isCorrect);
    if (res.isCorrect) setCorrectCount((c) => c + 1);
    setPL(res.pL);

    setTimeout(() => {
      if (res.sessionEnded) {
        setSessionEnded(true);
        setSummary(res.summary ?? null);
      } else if (res.nextQuestion) {
        setQuestion(res.nextQuestion);
        setQuestionIndex((i) => i + 1);
        setSelected(null);
        setFillInBlankInput("");
        setResponded(false);
        setQuestionStartTime(new Date().toISOString());
      }
    }, 1200);
  }, [sessionId, question, selected, fillInBlankInput, questionStartTime]);

  const goHome = useCallback(() => navigate("/home"), [navigate]);

  return {
    isLoading,
    skillsName: state?.skillsName ?? "",
    question,
    questionIndex,
    pL,
    pLStart,
    selected,
    fillInBlankInput,
    setFillInBlankInput,
    responded,
    lastCorrect,
    correctCount,
    sessionEnded,
    summary,
    pick,
    submit,
    goHome,
  };
}
