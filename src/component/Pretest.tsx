import React from "react";
import "./decorate/Pretest.css";
import { usePretestController } from "./pretest/controller/usePretestController";
import { PretestBackground } from "./pretest/component/PretestBackground";
import { PretestLoading } from "./pretest/component/PretestLoading";
import { PretestQuiz } from "./pretest/component/PretestQuiz";
import { PretestDone } from "./pretest/component/PretestDone";
import { PretestModal } from "./pretest/component/PretestModal";

export default function Pretest() {
  const controller = usePretestController();

  if (controller.isLoading) {
    return (
      <div className="pt-root">
        <PretestBackground />
        <PretestLoading />
      </div>
    );
  }

  return (
    <div className="pt-root">
      <PretestBackground />

      <main className="page">
        {controller.currentScreen === "quiz" && (
          <PretestQuiz controller={controller} />
        )}

        {controller.currentScreen === "done" && (
          <PretestDone controller={controller} />
        )}
      </main>

      <PretestModal controller={controller} />
    </div>
  );
}