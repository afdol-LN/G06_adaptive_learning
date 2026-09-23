import { th } from "./th";
import { en } from "./en";
import { adminTh } from "./admin.th";
import { adminEn } from "./admin.en";

// หน้า student (th/en) + หน้า admin (admin.th/admin.en) รวมเป็นพจนานุกรมเดียว
const thAll = { ...th, ...adminTh };

export type Lang = "th" | "en";
export type TKey = keyof typeof thAll;
export type TVars = Record<string, string | number>;
export type Translate = (key: TKey, vars?: TVars) => string;

const DICTIONARIES: Record<Lang, Record<TKey, string>> = {
  th: thAll,
  en: { ...en, ...adminEn },
};

const warnedMissing = new Set<string>();

// แทนที่ {name} ด้วยค่าจาก vars — ตัวที่ไม่มีใน vars (เช่น {{current}} ของ driver.js) ปล่อยไว้ตามเดิม
// key ที่ไม่มีในพจนานุกรมไหนเลยจะแสดงเป็นชื่อ key แทน — ข้อความผิดดีกว่าทั้งหน้าขาว
export function translate(lang: Lang, key: TKey, vars?: TVars): string {
  let template: string | undefined = DICTIONARIES[lang][key] ?? thAll[key];
  if (template === undefined) {
    if (import.meta.env.DEV && !warnedMissing.has(key)) {
      warnedMissing.add(key);
      console.warn(`[i18n] missing key "${key}"`);
    }
    template = key;
  }
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}
