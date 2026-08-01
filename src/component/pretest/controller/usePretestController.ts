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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<PretestAnswer[]>([]);
  const [fillInBlankInput, setFillInBlankInput] = useState<string>("");
  const [showUnansweredModal, setShowUnansweredModal] = useState<boolean>(false);

  const [isCorrectList, setIsCorrectList] = useState<boolean[]>([]);
  const [resultsList, setResultsList] = useState<PretestResultItem[]>([]);
  const [scoreSummary, setScoreSummary] = useState<PretestScoreSummary>({
    correct: 0,
    total: 5,
    pct: 0,
    results: [],
    isCorrectList: [],
  });

  // Load questions from backend on mount
  useEffect(() => {
    async function loadPretestQuestions() {
      setIsLoading(true);
      const activeGoalId =
        localStorage.getItem("activeBranchId") ||
        localStorage.getItem("goalId") ||
        localStorage.getItem("branchId") ||
        "G06";
      const currentUserId = localStorage.getItem("user_id");

      const fetchedQuestions = await PretestService.fetchPretestQuestions(
        activeGoalId,
        currentUserId!,
        1
      );
      const questionList =
        fetchedQuestions && fetchedQuestions.length > 0
          ? fetchedQuestions
          : PretestService.getFallbackQuestions();

      setQuestions(questionList);
      setAnswers(new Array(questionList.length).fill(null));
      setIsCorrectList([]);
      setResultsList([]);
      setIsLoading(false);
    }

    loadPretestQuestions();
  }, []);

  const currentQuestion: PretestQuestion = questions[currentQuestionIndex] || {
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

  const answeredCount = answers.filter(
    (answer) => answer !== null && answer !== "" && answer !== undefined
  ).length;
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Sync fillInBlankInput when question index changes or when an answer is selected
  useEffect(() => {
    if (questions.length > 0 && currentQuestion.type === "FILL_IN_BLANK") {
      const existingAnswer = answers[currentQuestionIndex];
      if (typeof existingAnswer === "string") {
        setFillInBlankInput(existingAnswer);
      } else {
        setFillInBlankInput("");
      }
    } else {
      setFillInBlankInput("");
    }
  }, [currentQuestionIndex, questions, currentQuestion.type]);

  const startQuiz = useCallback(() => {
    setCurrentScreen("quiz");
  }, []);

  const selectChoiceAnswer = useCallback(
    (choiceIndex: number) => {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = choiceIndex;
      setAnswers(updatedAnswers);
    },
    [answers, currentQuestionIndex]
  );

  const handleFillInBlankInputChange = useCallback(
    (inputValue: string) => {
      setFillInBlankInput(inputValue);
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = inputValue;
      setAnswers(updatedAnswers);
    },
    [answers, currentQuestionIndex]
  );

  const advanceToNextQuestion = useCallback(
    (isSkippingQuestion: boolean = false) => {
      const currentAnswer = isSkippingQuestion ? null : answers[currentQuestionIndex];
      const { isCorrect, resultItem } = PretestService.evaluateQuestionAtIndex(
        currentQuestionIndex,
        questions[currentQuestionIndex],
        currentAnswer
      );

      const nextIsCorrectList = [...isCorrectList];
      nextIsCorrectList[currentQuestionIndex] = isCorrect;
      setIsCorrectList(nextIsCorrectList);

      const nextResultsList = [...resultsList];
      nextResultsList[currentQuestionIndex] = resultItem;
      setResultsList(nextResultsList);

      if (currentQuestionIndex === questions.length - 1) {
        const finalSummary = PretestService.calculateScoreSummary(
          questions.length,
          nextIsCorrectList,
          nextResultsList
        );
        setScoreSummary(finalSummary);
        setCurrentScreen("done");
      } else {
        setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
      }
    },
    [answers, currentQuestionIndex, isCorrectList, questions, resultsList]
  );

  const handleNextQuestion = useCallback(() => {
    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer === null || currentAnswer === "" || currentAnswer === undefined) {
      setShowUnansweredModal(true);
      return;
    }
    advanceToNextQuestion(false);
  }, [advanceToNextQuestion, answers, currentQuestionIndex]);

  const confirmSkipQuestion = useCallback(() => {
    setShowUnansweredModal(false);
    advanceToNextQuestion(true);
  }, [advanceToNextQuestion]);

  const navigateToDashboard = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  const highlightCodeLine = useCallback((codeLine: string) => {
    return PretestService.highlightCodeLine(codeLine);
  }, []);

  return {
    isLoading,
    questions,
    currentScreen,
    currentQuestionIndex,
    currentQuestion,
    answers,
    fillInBlankInput,
    showUnansweredModal,
    isCorrectList,
    resultsList,
    scoreSummary,
    progressPercentage,
    startQuiz,
    selectChoiceAnswer,
    handleFillInBlankInputChange,
    handleNextQuestion,
    confirmSkipQuestion,
    navigateToDashboard,
    setShowUnansweredModal,
    highlightCodeLine,
  };
}

export type PretestControllerType = ReturnType<typeof usePretestController>;
