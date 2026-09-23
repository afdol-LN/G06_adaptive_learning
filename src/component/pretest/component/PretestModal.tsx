import React from "react";
import { PretestControllerType } from "../controller/usePretestController";

interface PretestModalProps {
  controller: PretestControllerType;
}

export const PretestModal: React.FC<PretestModalProps> = ({ controller }) => {
  return (
    <div className={`modal-overlay ${controller.showUnansweredModal ? "show" : ""}`}>
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <div className="modal-title">ยังไม่ได้เลือก/พิมพ์คำตอบ</div>
        <div className="modal-body">
          คุณยังไม่ได้ระบุคำตอบสำหรับข้อนี้
          <br />
          หากข้ามไปข้อถัดไป <strong>จะไม่สามารถย้อนกลับมาตอบได้อีก</strong>
          <br />
          ต้องการข้ามข้อนี้หรือไม่?
        </div>
        <div className="modal-btns">
          <button
            className="modal-cancel"
            onClick={() => controller.setShowUnansweredModal(false)}
          >
            ← กลับไปตอบ
          </button>
          <button className="modal-confirm" onClick={controller.confirmSkipQuestion}>
            ข้ามข้อนี้
          </button>
        </div>
      </div>
    </div>
  );
};
