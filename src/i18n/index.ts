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

// ข้อความที่แสดงแทนเมื่อหา key ไม่เจอในทุกภาษา — t() ต้องคืน string เสมอ
// ถ้าคืน undefined ผู้เรียกที่ทำ .split() / .replace() ต่อจะ throw ระหว่าง render แล้วทั้งหน้าจอขาว
export const MISSING_I18N_TEXT = "no i18n key";

// เตือนครั้งเดียวต่อ key — t() ถูกเรียกทุก render ไม่งั้น console จะเต็ม
const warnedKeys = new Set<string>();
function warnOnce(id: string, message: string) {
  if (warnedKeys.has(id)) return;
  warnedKeys.add(id);
  console.warn(`[i18n] ${message}`);
}

// TKey กันได้แค่ตอน compile — key ที่มาตอน runtime (ค่าจาก config/backend, `as any`) ยังหลุดมาได้
// จึงเช็กจริงทุกครั้ง: ภาษาที่เลือก → ภาษาไทย (พจนานุกรมหลัก) → MISSING_I18N_TEXT
function lookup(lang: Lang, key: string): string {
  const dict = DICTIONARIES[lang] as Record<string, unknown> | undefined;
  const value = dict?.[key];
  if (typeof value === "string") return value;

  const fallback = (thAll as Record<string, unknown>)[key];
  if (typeof fallback === "string") {
    warnOnce(`${lang}:${key}`, `missing "${lang}" translation for "${key}", using Thai`);
    return fallback;
  }

  warnOnce(`*:${key}`, `no i18n key "${key}"`);
  return MISSING_I18N_TEXT;
}

// แทนที่ {name} ด้วยค่าจาก vars — ตัวที่ไม่มีใน vars (เช่น {{current}} ของ driver.js) ปล่อยไว้ตามเดิม
export function translate(lang: Lang, key: TKey, vars?: TVars): string {
  const template = lookup(lang, key);
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    vars[name] != null ? String(vars[name]) : match
  );
}
