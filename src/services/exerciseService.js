/**
 * @file exerciseService.js
 * @description Service Layer สำหรับดึงแบบทดสอบ/โจทย์คำถาม ตรวจคำตอบ และคำนวณผลลัพธ์
 */
import { ExerciseModel } from '../models/exercise.model';

const DEFAULT_SESSION = {
  id: 3,
  label: 'Session 3',
  skillName: 'Stack (SK-008)',
  skillTier: 'Tier 2',
  goalName: 'Data Structures',
  questions: [
    {
      id: 'q1',
      diff: 1,
      dLbl: 'Easy',
      tier: 'T2',
      text: 'Stack ใช้หลักการใดในการจัดการข้อมูล?',
      choices: [
        'FIFO — First In First Out',
        'LIFO — Last In First Out',
        'FILO — First In Last Out',
        'Random access order',
      ],
      correct: 1,
      hint: 'คิดถึงกองจาน — จานที่วางทีหลังจะหยิบออกก่อนเสมอ',
    },
    {
      id: 'q2',
      diff: 2,
      dLbl: 'Easy+',
      tier: 'T2',
      text: 'Code ต่อไปนี้แสดงผลอะไร?',
      code: `stack = []\nstack.<span class="fn">append</span>(<span class="nm">10</span>)\nstack.<span class="fn">append</span>(<span class="nm">20</span>)\nstack.<span class="fn">append</span>(<span class="nm">30</span>)\n<span class="fn">print</span>(stack.<span class="fn">pop</span>())`,
      choices: ['10', '20', '30', '[10, 20, 30]'],
      correct: 2,
      hint: 'list.pop() โดยไม่ระบุ index จะดึง element ตัวสุดท้ายออกเสมอ',
    },
    {
      id: 'q3',
      diff: 3,
      dLbl: 'Medium',
      tier: 'T2',
      text: 'Stack ถูกนำไปใช้งานใน use case ใดต่อไปนี้?',
      choices: [
        'Print queue ของ printer',
        'Browser back-button history',
        'Message queue ของ LINE',
        'Waiting list ระบบจองตั๋ว',
      ],
      correct: 1,
      hint: 'กด back บน browser = ย้อนกลับหน้าล่าสุด — เหมือน pop จาก stack',
    },
    {
      id: 'q4',
      diff: 4,
      dLbl: 'Hard',
      tier: 'T2',
      text: 'function ต่อไปนี้ทำงานอะไร?',
      code: `<span class="kw">def</span> <span class="fn">is_balanced</span>(s: <span class="tp">str</span>) -> <span class="tp">bool</span>:\n    stack = []\n    pairs = {<span class="st">')'</span>: <span class="st">'('</span>, <span class="st">']'</span>: <span class="st">'['</span>, <span class="st">'}'</span>: <span class="st">'{'</span>}\n    <span class="kw">for</span> ch <span class="kw">in</span> s:\n        <span class="kw">if</span> ch <span class="kw">in</span> <span class="st">'([{'</span>:\n            stack.<span class="fn">append</span>(ch)\n        <span class="kw">elif</span> ch <span class="kw">in</span> pairs:\n            <span class="kw">if not</span> stack <span class="kw">or</span> stack[-<span class="nm">1</span>] != pairs[ch]:\n                <span class="kw">return False</span>\n            stack.<span class="fn">pop</span>()\n    <span class="kw">return</span> <span class="fn">len</span>(stack) == <span class="nm">0</span>`,
      choices: [
        'นับจำนวน bracket ใน string',
        'ตรวจว่า bracket สมดุลหรือไม่',
        'แปลง string เป็น stack โดยตรง',
        'เรียงลำดับ bracket ใน string',
      ],
      correct: 1,
      hint: 'สังเกต pairs dict กับการ pop() เมื่อเจอ closing bracket — classic balanced bracket check',
    },
  ],
};

const NEXT_SESSION = {
  id: 4,
  skill: 'Queue (SK-009)',
  tier: 'Tier 2',
  qs: 5,
  goal: 'Data Structures',
  priority: 'Priority #1',
  reason: 'Stack lv2 ✓ → unlock Queue prerequisite',
};

export class ExerciseService {
  /**
   * ดึงข้อมูล Session ปัจจุบันและรายการโจทย์คำถาม
   * @returns {Object}
   */
  static getCurrentSession() {
    return DEFAULT_SESSION;
  }

  /**
   * ดึงคำแนะนำ Session ถัดไป
   * @returns {Object}
   */
  static getNextSessionRecommendation() {
    return NEXT_SESSION;
  }

  /**
   * ตรวจคำตอบของข้อนั้นๆ
   * @param {number} questionIndex
   * @param {number} selectedChoiceIndex
   * @returns {boolean}
   */
  static checkAnswer(questionIndex, selectedChoiceIndex) {
    const question = DEFAULT_SESSION.questions[questionIndex];
    if (!question) return false;
    return question.correct === selectedChoiceIndex;
  }

  /**
   * คำนวณสรุปผล Session ปัจจุบัน (Performance %, ผลลัพธ์ BKT เป็นต้น)
   * @param {number} correctCount
   * @param {number} totalQuestions
   * @returns {Object}
   */
  static evaluateSession(correctCount, totalQuestions) {
    const ps = Math.round((correctCount / totalQuestions) * 100);
    const passed = ps >= 60;
    const updates = [
      {
        ico: '📚',
        name: 'Stack (SK-008)',
        tier: 'T2',
        plA: 0.1,
        plB: passed ? 0.65 : 0.25,
        lvA: 0,
        lvB: passed ? 2 : 1,
        verdict: passed ? 'UP' : 'MAINTAIN',
        req: 2,
      },
    ];
    return {
      performanceScore: ps,
      passed,
      updates,
      record: ExerciseModel.createSessionRecord({
        skillId: 'SK-008',
        score: correctCount,
        total: totalQuestions,
        xpEarned: correctCount * 50,
      }),
    };
  }
}
