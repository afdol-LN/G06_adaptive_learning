import { AppClient } from "../API/appRestApi";
import {
  PretestQuestion,
  PretestAnswer,
  PretestResultItem,
  PretestScoreSummary,
} from "../models/pretestModel";

export class PretestService {
  static async fetchPretestQuestions(
    goalId?: string | number,
    userId?: string | number,
    level?: number
  ): Promise<PretestQuestion[]> {
    try {
      const response = await AppClient.post("/exercise/pretest", {
        goalId,
        userId,
        level,
      });

      if (Array.isArray(response)) {
        return response;
      }
      if (response && response.isError === false && Array.isArray(response.data)) {
        return response.data;
      }
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.error("Failed to fetch pretest exercises from API:", error);
    }

    console.warn("Using fallback pretest questions (Choice & Fill-in-the-Blank)");
    return PretestService.getFallbackQuestions();
  }

  static async submitPretest(branchId: number, resultsList: PretestResultItem[]): Promise<void> {
    try {
      const answers = resultsList.map((res) => ({
        exerciseId: res.questionId,
        isCorrect: res.isCorrect,
        startTime: res.startTime || new Date().toISOString(),
        endTime: res.endTime || new Date().toISOString(),
        chosenAnswer: res.chosenAnswerText || null,
      }));

      await AppClient.post("/exercise/pretest/submit", {
        branchId,
        answers,
      });
    } catch (error) {
      console.error("Failed to submit pretest:", error);
      throw error;
    }
  }

  static evaluateQuestionAtIndex(
    questionIndex: number,
    question: PretestQuestion,
    userAnswer: PretestAnswer,
    startTime: string,
    endTime: string
  ): { isCorrect: boolean; resultItem: PretestResultItem } {
    let isCorrect = false;
    let chosenAnswerText: string | null = null;

    if (question.type === "FILL_IN_BLANK") {
      const userString = typeof userAnswer === "string" ? userAnswer.trim() : "";
      chosenAnswerText = typeof userAnswer === "string" ? userAnswer : "";
      const targetString =
        typeof question.answer === "string"
          ? question.answer.trim()
          : typeof question.fillInBlank === "string"
          ? question.fillInBlank.trim()
          : "";

      if (question.isCasesensitive === "YES") {
        isCorrect = userString === targetString && targetString !== "";
      } else {
        isCorrect =
          userString.toLowerCase() === targetString.toLowerCase() && targetString !== "";
      }
    } else {
      isCorrect =
        userAnswer !== null &&
        userAnswer !== undefined &&
        question.answer !== null &&
        question.answer !== undefined &&
        userAnswer.toString() === question.answer.toString();

      if (userAnswer !== null && userAnswer !== undefined) {
        const choiceIdx = Number(userAnswer);
        if (question.exerciseChoices && question.exerciseChoices[choiceIdx]) {
          chosenAnswerText = question.exerciseChoices[choiceIdx].script;
        } else if (question.choices && question.choices[choiceIdx]) {
          chosenAnswerText = question.choices[choiceIdx];
        }
      }
    }

    const resultItem: PretestResultItem = {
      questionIndex: questionIndex,
      questionId: question.id,
      skillId: question.skillId,
      skillName: question.skillName,
      type: question.type,
      userAnswer: userAnswer,
      correctAnswer: question.answer,
      isCorrect: isCorrect,
      startTime: startTime,
      endTime: endTime,
      chosenAnswerText: chosenAnswerText,
    };

    return { isCorrect, resultItem };
  }

  static calculateScoreSummary(
    totalQuestions: number,
    isCorrectList: boolean[],
    resultsList: PretestResultItem[]
  ): PretestScoreSummary {
    const correctCount = isCorrectList.filter((isCorrect) => isCorrect === true).length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return {
      correct: correctCount,
      total: totalQuestions,
      pct: percentage,
      results: resultsList,
      isCorrectList: isCorrectList,
    };
  }

  static getFallbackQuestions(): PretestQuestion[] {
    return [
      {
        id: 101,
        skillId: 1,
        skillName: "Python Fundamentals",
        level: 1,
        description: "ผลลัพธ์ของโค้ด x = 10; y = 3; print(x % y) คืออะไร?",
        text: "ผลลัพธ์ของโค้ด x = 10; y = 3; print(x % y) คืออะไร?",
        type: "CHOICE",
        fillInBlank: null,
        isCasesensitive: "NO",
        exerciseChoices: [
          { id: 1, script: "0", isAnswer: false },
          { id: 2, script: "1", isAnswer: true },
          { id: 3, script: "3", isAnswer: false },
          { id: 4, script: "3.33", isAnswer: false },
        ],
        choices: ["0", "1", "3", "3.33"],
        answer: 1,
        diff: 1,
        diffLabel: "Basic",
        diffColor: "#38b874",
      },
      {
        id: 102,
        skillId: 2,
        skillName: "Control Flow",
        level: 2,
        description:
          "คำสั่งใน Python สำหรับวนลูปที่มีจำนวนรอบแน่นอน คือคำสั่งใด (พิมพ์คำสั่ง 1 คำ)?",
        text: "คำสั่งใน Python สำหรับวนลูปที่มีจำนวนรอบแน่นอน คือคำสั่งใด (พิมพ์คำสั่ง 1 คำ)?",
        type: "FILL_IN_BLANK",
        fillInBlank: "for",
        isCasesensitive: "NO",
        exerciseChoices: [],
        choices: [],
        answer: "for",
        diff: 2,
        diffLabel: "Intermediate",
        diffColor: "#e8a03c",
      },
      {
        id: 103,
        skillId: 3,
        skillName: "Functions",
        level: 3,
        description:
          "ฟังก์ชัน mystery(n) ที่คืนค่า n * mystery(n-1) เมื่อ n <= 1 คืนค่า 1 ถ้าเรียก mystery(4) จะได้ผลลัพธ์เท่าใด?",
        text: "ฟังก์ชัน mystery(n) ที่คืนค่า n * mystery(n-1) เมื่อ n <= 1 คืนค่า 1 ถ้าเรียก mystery(4) จะได้ผลลัพธ์เท่าใด?",
        type: "CHOICE",
        fillInBlank: null,
        isCasesensitive: "NO",
        exerciseChoices: [
          { id: 5, script: "12", isAnswer: false },
          { id: 6, script: "24", isAnswer: true },
          { id: 7, script: "6", isAnswer: false },
          { id: 8, script: "16", isAnswer: false },
        ],
        choices: ["12", "24", "6", "16"],
        answer: 1,
        diff: 3,
        diffLabel: "Advanced",
        diffColor: "#0047AB",
      },
      {
        id: 104,
        skillId: 4,
        skillName: "Data Structures",
        level: 2,
        description:
          "เมธอดที่ใช้สำหรับเพิ่มสมาชิกใหม่ต่อท้าย List ใน Python คือคำสั่งใด (พิมพ์ชื่อเมธอด)?",
        text: "เมธอดที่ใช้สำหรับเพิ่มสมาชิกใหม่ต่อท้าย List ใน Python คือคำสั่งใด (พิมพ์ชื่อเมธอด)?",
        type: "FILL_IN_BLANK",
        fillInBlank: "append",
        isCasesensitive: "NO",
        exerciseChoices: [],
        choices: [],
        answer: "append",
        diff: 2,
        diffLabel: "Intermediate",
        diffColor: "#e8a03c",
      },
      {
        id: 105,
        skillId: 5,
        skillName: "Sort & Search",
        level: 4,
        description: "Binary Search มีเงื่อนไขสำคัญอะไรในการใช้งาน?",
        text: "Binary Search มีเงื่อนไขสำคัญอะไรในการใช้งาน?",
        type: "CHOICE",
        fillInBlank: null,
        isCasesensitive: "NO",
        exerciseChoices: [
          { id: 9, script: "Array ไม่จำเป็นต้องเรียงลำดับ", isAnswer: false },
          { id: 10, script: "Array ต้องเรียงลำดับ (Sorted) มาก่อนเสมอ", isAnswer: true },
          { id: 11, script: "Array ต้องมีเฉพาะตัวเลขจำนวนเต็มเท่านั้น", isAnswer: false },
          { id: 12, script: "ใช้ได้เฉพาะกับ Linked List", isAnswer: false },
        ],
        choices: [
          "Array ไม่จำเป็นต้องเรียงลำดับ",
          "Array ต้องเรียงลำดับ (Sorted) มาก่อนเสมอ",
          "Array ต้องมีเฉพาะตัวเลขจำนวนเต็มเท่านั้น",
          "ใช้ได้เฉพาะกับ Linked List",
        ],
        answer: 1,
        diff: 4,
        diffLabel: "Expert",
        diffColor: "#e05c5c",
      },
    ];
  }
}
