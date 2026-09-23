import type { MouseEvent } from "react";
import { ConfirmState } from "../../workspace.types";

export interface ConfirmDialogProps {
  state: ConfirmState | null;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function confirmDialogController({ state, isBusy, onConfirm, onCancel }: ConfirmDialogProps) {
  const items = state?.items ?? [];

  return {
    isOpen: state !== null,
    title: state?.title ?? "",
    message: state?.message ?? "",
    items,
    hasItems: items.length > 0,
    confirmLabel: state?.confirmLabel ?? "",
    isBusy,
    // ระหว่างกำลังทำงาน คลิกพื้นหลังไม่ปิด dialog
    handleOverlayClick: () => {
      if (!isBusy) onCancel();
    },
    handleDialogClick: (e: MouseEvent) => e.stopPropagation(),
    handleConfirm: onConfirm,
    handleCancel: onCancel,
  };
}
