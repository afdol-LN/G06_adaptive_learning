import React from "react";

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = "bg-blue-600",
  backgroundColor = "bg-slate-100",
  showLabel = false,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-600">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${backgroundColor}`}
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
