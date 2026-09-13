import React from "react";
import { PretestControllerType } from "../controller/usePretestController";
import CodeBlock from "../../common/CodeBlock";

interface PretestQuizProps {
  controller: PretestControllerType;
}

export const PretestQuiz: React.FC<PretestQuizProps> = ({ controller }) => {
  const currentQuestion = controller.currentQuestion;

  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div
      id="screenQuiz"
      className="screen-active"
      style={{ width: "100%", maxWidth: "660px" }}
    >
      {/* Progress Track */}
      <div className="quiz-progress-wrap">
        <div className="quiz-progress-top">
          <span className="quiz-progress-label">ความคืบหน้า</span>
          <span className="quiz-progress-pct">{controller.progressPercentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${controller.progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-ticks">
          {controller.questions.map((_, index) => {
            const hasAnswered =
              controller.answers[index] !== null &&
              controller.answers[index] !== undefined &&
              controller.answers[index] !== "";
            return (
              <div
                key={index}
                className={`tick ${
                  index === controller.currentQuestionIndex
                    ? "current"
                    : hasAnswered
                    ? "done"
                    : ""
                }`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="q-card" key={controller.currentQuestionIndex}>
        <div className="q-header">
          <div className="q-num-badge">
            <span className="q-num">
              ข้อ <strong>{controller.currentQuestionIndex + 1}</strong> / {controller.questions.length}
            </span>
            <span className="q-skill-tag">
              {currentQuestion.skillName || `Skill ${currentQuestion.skillId}`}
            </span>
          </div>
          <span
            className="q-diff-tag"
            style={{
              background: `${currentQuestion.diffColor || "#10b981"}18`,
              border: `1px solid ${currentQuestion.diffColor || "#10b981"}44`,
              color: currentQuestion.diffColor || "#10b981",
            }}
          >
            Level {currentQuestion.level || currentQuestion.diff || 1} •{" "}
            {currentQuestion.type === "FILL_IN_BLANK" ? "เติมคำ" : "ตัวเลือก"}
          </span>
        </div>

        <div className="q-body">
          <div className="q-text">
            {currentQuestion.description || currentQuestion.text}
          </div>

          <CodeBlock
            code={currentQuestion.code}
            language={currentQuestion.language}
          />

          {currentQuestion.type === "FILL_IN_BLANK" ? (
            /* ── Fill-In-The-Blank Input UI ── */
            <div className="fill-blank-container">
              <div className="fill-blank-label">
                📝 กรุณาพิมพ์คำตอบลงในช่องว่างด้านล่าง:
              </div>
              <input
                type="text"
                className="fill-blank-input"
                placeholder="พิมพ์คำตอบของคุณที่นี่..."
                value={controller.fillInBlankInput}
                onChange={(event) => controller.handleFillInBlankInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    controller.handleNextQuestion();
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            /* ── Multiple Choice Cards UI ── */
            <div className="choices">
              {(currentQuestion.choices || []).map((choiceText, choiceIndex) => (
                <div
                  key={choiceIndex}
                  className={`choice ${
                    controller.answers[controller.currentQuestionIndex] === choiceIndex ? "selected" : ""
                  }`}
                  onClick={() => controller.selectChoiceAnswer(choiceIndex)}
                >
                  <div className="choice-letter">
                    {choiceLabels[choiceIndex] || choiceIndex + 1}
                  </div>
                  <div className="choice-text">{choiceText}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="q-footer">
          <div className="q-footer-left">
            <div className="dot-indicators">
              {controller.questions.map((_, index) => {
                const hasAnswered =
                  controller.answers[index] !== null &&
                  controller.answers[index] !== undefined &&
                  controller.answers[index] !== "";
                return (
                  <div
                    key={index}
                    className={`dot-ind ${
                      index === controller.currentQuestionIndex
                        ? "current"
                        : hasAnswered
                        ? "answered"
                        : ""
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>
          <button
            className={`btn-next ${
              controller.currentQuestionIndex === controller.questions.length - 1
                ? "submit-btn"
                : ""
            }`}
            onClick={controller.handleNextQuestion}
          >
            <span>
              {controller.currentQuestionIndex === controller.questions.length - 1
                ? "Submit"
                : "Next"}
            </span>
            {controller.currentQuestionIndex !== controller.questions.length - 1 && (
              <svg
                className="next-arrow"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
