import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { PretestControllerType } from "../controller/usePretestController";
import QuestionCard from "../../common/QuestionCard";
import { usePreferences } from "../../../context/PreferencesContext";

interface PretestQuizProps {
  controller: PretestControllerType;
}

export const PretestQuiz: React.FC<PretestQuizProps> = ({ controller }) => {
  const { t } = usePreferences();
  const currentQuestion = controller.currentQuestion;
  const index = controller.currentQuestionIndex;
  const isLast = index === controller.questions.length - 1;
  const answer = controller.answers[index];

  return (
    <div
      id="screenQuiz"
      className="screen-active"
      style={{ width: "100%", maxWidth: "660px" }}
    >
      {/* Progress Track */}
      <div className="quiz-progress-wrap">
        <div className="quiz-progress-top">
          <span className="quiz-progress-label">{t("pretest.progress")}</span>
          <span className="quiz-progress-pct">{controller.progressPercentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${controller.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <QuestionCard
        key={index}
        index={index}
        total={controller.questions.length}
        skillName={
          currentQuestion.skillName || t("pretest.skillFallback", { id: currentQuestion.skillId })
        }
        level={currentQuestion.level || currentQuestion.diff || 1}
        type={currentQuestion.type}
        description={currentQuestion.description || currentQuestion.text || ""}
        code={currentQuestion.code}
        language={currentQuestion.language}
        choices={(currentQuestion.choices || []).map((script, i) => ({ key: i, script }))}
        selectedKey={typeof answer === "number" ? answer : null}
        onPick={controller.selectChoiceAnswer}
        fillValue={controller.fillInBlankInput}
        onFillChange={controller.handleFillInBlankInputChange}
        onFillEnter={controller.handleNextQuestion}
        footer={
          <>
            <div className="dot-indicators">
              {controller.questions.map((_, i) => {
                const a = controller.answers[i];
                const hasAnswered = a !== null && a !== undefined && a !== "";
                return (
                  <div
                    key={i}
                    className={`dot-ind ${i === index ? "current" : hasAnswered ? "answered" : ""}`}
                  ></div>
                );
              })}
            </div>
            <button
              className={isLast ? "btn-next submit-btn" : "btn-next"}
              onClick={controller.handleNextQuestion}
            >
              <span>{isLast ? t("pretest.submit") : t("pretest.next")}</span>
              {!isLast && <FaArrowRight className="next-arrow" aria-hidden />}
            </button>
          </>
        }
      />
    </div>
  );
};
