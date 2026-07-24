import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PretestQuestion,
  PretestAnswer,
  PretestResultItem,
  PretestScoreSummary,
} from "../../../models/pretestModel";
import { PretestService } from "../../../services/pretestService";

export function usePretestController() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<PretestQuestion[]>([]);
  const [currentScreen, setCurrentScreen] = useState<"intro" | "quiz" | "done">("intro");
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<PretestAnswer[]>([]);
  const [fillInBlankInput, setFillInBlankInput] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  // One-by-one evaluation tracking (`isCorrect` array stored as requested)
  const [isCorrectList, setIsCorrectList] = useState<boolean[]>([]);
  const [results, setResults] = useState<PretestResultItem[]>([]);
  const [score, setScore] = useState<PretestScoreSummary>({
    correct: 0,
    total: 5,
    pct: 0,
    results: [],
    isCorrectList: [],
  });

  // Load questions from backend on mount
  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      const goalId =
        localStorage.getItem("activeBranchId") ||
        localStorage.getItem("goalId") ||
        localStorage.getItem("branchId") ||
        "G06";
      const userId = localStorage.getItem("user_id") || "1";

      const fetched = await PretestService.fetchPretestQuestions(goalId, userId, 1);
      const qList = fetched && fetched.length > 0 ? fetched : PretestService.getFallbackQuestions();

      setQuestions(qList);
      setAnswers(new Array(qList.length).fill(null));
      setIsCorrectList([]);
      setResults([]);
      setIsLoading(false);
    }
    loadQuestions();
  }, []);

  const currentQ: PretestQuestion = questions[currentQIndex] || {
    id: 0,
    skillId: 1,
    skillName: "General",
    level: 1,
    description: "Loading question...",
    text: "Loading question...",
    type: "CHOICE",
    choices: [],
    diff: 1,
  };

  const answeredCount = answers.filter((a) => a !== null && a !== "").length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Sync fillInBlankInput when question index changes or when an answer is selected
  useEffect(() => {
    if (questions.length > 0 && currentQ.type === "FILL_IN_BLANK") {
      const existing = answers[currentQIndex];
      if (typeof existing === "string") {
        setFillInBlankInput(existing);
      } else {
        setFillInBlankInput("");
      }
    } else {
      setFillInBlankInput("");
    }
  }, [currentQIndex, questions, currentQ.type]);

  const startQuiz = useCallback(() => {
    setCurrentScreen("quiz");
  }, []);

  const selectChoice = useCallback(
    (choiceIndex: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQIndex] = choiceIndex;
      setAnswers(newAnswers);
    },
    [answers, currentQIndex]
  );

  const handleFillInBlankChange = useCallback(
    (value: string) => {
      setFillInBlankInput(value);
      const newAnswers = [...answers];
      newAnswers[currentQIndex] = value;
      setAnswers(newAnswers);
    },
    [answers, currentQIndex]
  );

  // Evaluate the answer for question at index right away (One-by-one evaluation)
  const evaluateQuestionAtIndex = useCallback(
    (idx: number, userAnswer: PretestAnswer): { isCorrect: boolean; resultItem: PretestResultItem } => {
      const q = questions[idx];
      let isCorrect = false;

      if (q.type === "FILL_IN_BLANK") {
        const userStr = typeof userAnswer === "string" ? userAnswer.trim() : "";
        const targetStr = typeof q.answer === "string" ? q.answer.trim() : typeof q.fillInBlank === "string" ? q.fillInBlank.trim() : "";
        if (q.isCasesensitive === "YES") {
          isCorrect = userStr === targetStr && targetStr !== "";
        } else {
          isCorrect = userStr.toLowerCase() === targetStr.toLowerCase() && targetStr !== "";
        }
      } else {
        // CHOICE type
        isCorrect =
          userAnswer !== null &&
          userAnswer !== undefined &&
          q.answer !== null &&
          q.answer !== undefined &&
          userAnswer.toString() === q.answer.toString();
      }

      const resultItem: PretestResultItem = {
        questionIndex: idx,
        questionId: q.id,
        skillId: q.skillId,
        skillName: q.skillName,
        type: q.type,
        userAnswer: userAnswer,
        correctAnswer: q.answer,
        isCorrect: isCorrect,
      };

      return { isCorrect, resultItem };
    },
    [questions]
  );

  const advance = useCallback(
    (isSkipping: boolean = false) => {
      const currentAnswer = isSkipping ? null : answers[currentQIndex];
      const { isCorrect, resultItem } = evaluateQuestionAtIndex(currentQIndex, currentAnswer);

      // Store exercise result one by one (`isCorrect: boolean` inside our array state)
      const nextIsCorrectList = [...isCorrectList];
      nextIsCorrectList[currentQIndex] = isCorrect;
      setIsCorrectList(nextIsCorrectList);

      const nextResults = [...results];
      nextResults[currentQIndex] = resultItem;
      setResults(nextResults);

      if (currentQIndex === questions.length - 1) {
        // Final question completed -> calculate summary score and move to done screen
        const correctCount = nextIsCorrectList.filter((c) => c === true).length;
        const pct = Math.round((correctCount / questions.length) * 100);
        const finalSummary: PretestScoreSummary = {
          correct: correctCount,
          total: questions.length,
          pct,
          results: nextResults,
          isCorrectList: nextIsCorrectList,
        };
        setScore(finalSummary);
        setCurrentScreen("done");
      } else {
        setCurrentQIndex((prev) => prev + 1);
      }
    },
    [answers, currentQIndex, evaluateQuestionAtIndex, isCorrectList, questions.length, results]
  );

  const handleNext = useCallback(() => {
    const currentAnswer = answers[currentQIndex];
    if (currentAnswer === null || currentAnswer === "" || currentAnswer === undefined) {
      setShowModal(true);
      return;
    }
    advance(false);
  }, [advance, answers, currentQIndex]);

  const confirmSkip = useCallback(() => {
    setShowModal(false);
    advance(true);
  }, [advance]);

  const goDashboard = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  const highlightCode = useCallback((line: string) => {
    if (!line) return { __html: "" };
    const KWS = [
      "def",
      "return",
      "if",
      "else",
      "elif",
      "for",
      "in",
      "while",
      "import",
      "from",
      "class",
      "True",
      "False",
      "None",
      "and",
      "or",
      "not",
      "print",
      "range",
      "append",
      "pop",
      "len",
      "const",
      "let",
      "var",
      "function",
    ];

    let h = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    h = h.replace(/(#[^]*)$/, '<span class="code-cm">$1</span>');
    h = h.replace(/(\/\/[^]*)$/, '<span class="code-cm">$1</span>');

    const strPlaceholders: string[] = [];
    h = h.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (match) => {
      strPlaceholders.push(match);
      return `\x00STR${strPlaceholders.length - 1}\x00`;
    });

    h = h.replace(
      new RegExp(`\\b(${KWS.join("|")})\\b`, "g"),
      '<span class="code-kw">$1</span>'
    );
    h = h.replace(/\b(\d+)\b/g, '<span class="code-num">$1</span>');
    h = h.replace(
      /\x00STR(\d+)\x00/g,
      (_, i) => `<span class="code-str">${strPlaceholders[parseInt(i)]}</span>`
    );

    return { __html: h };
  }, []);

  return {
    isLoading,
    questions,
    currentScreen,
    currentQIndex,
    currentQ,
    answers,
    fillInBlankInput,
    showModal,
    isCorrectList,
    results,
    score,
    progressPct,
    startQuiz,
    selectChoice,
    handleFillInBlankChange,
    handleNext,
    confirmSkip,
    goDashboard,
    setShowModal,
    highlightCode,
  };
}
