export type TimeUnit = "second" | "minute" | "hour";

const UNIT_SECONDS: Record<TimeUnit, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
};

const UNIT_LABEL_TH: Record<TimeUnit, string> = {
  second: "วินาที",
  minute: "นาที",
  hour: "ชั่วโมง",
};

export function toSeconds(value: number, unit: TimeUnit): number {
  return value * UNIT_SECONDS[unit];
}

export function fromSeconds(seconds: number): { value: number; unit: TimeUnit } {
  if (seconds % 3600 === 0) return { value: seconds / 3600, unit: "hour" };
  if (seconds % 60 === 0) return { value: seconds / 60, unit: "minute" };
  return { value: seconds, unit: "second" };
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "-";
  const { value, unit } = fromSeconds(seconds);
  return `${value} ${UNIT_LABEL_TH[unit]}`;
}
