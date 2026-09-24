import { useMemo, useState } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";
import plaintext from "highlight.js/lib/languages/plaintext";
import "../decorate/CodeBlock.css";

// ลงทะเบียนเฉพาะภาษาที่ CodeLanguage ฝั่ง backend รองรับ
// import ทั้งก้อนจะลาก grammar ~190 ภาษาเข้า bundle โดยไม่จำเป็น
const LANGUAGES: Record<string, unknown> = {
  python,
  javascript,
  typescript,
  java,
  c,
  cpp,
  sql,
  plaintext,
};

let registered = false;
function ensureRegistered() {
  if (registered) return;
  Object.entries(LANGUAGES).forEach(([name, definition]) => {
    hljs.registerLanguage(name, definition as never);
  });
  registered = true;
}

const DEFAULT_LANGUAGE = "python";

interface CodeBlockProps {
  /** รับ array ด้วยเพราะ pretest เก็บโค้ดเป็นบรรทัด ๆ มาแต่เดิม */
  code?: string | string[] | null;
  language?: string | null;
  /** ป้ายมุมซ้ายบน ไม่ระบุจะใช้ชื่อภาษา */
  label?: string;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// โจทย์ fill-in-blank เขียนช่องว่างเป็น "_____" ในเนื้อโค้ดเอง (ไม่ใช่ field แยก) —
// เติมสีให้แค่ตอน "แสดงผล" เท่านั้น ไม่แตะเนื้อโค้ดจริงที่ยิงไปตรวจคำตอบ
// เงื่อนไข: underscore ยาว 3 ตัวขึ้นไป และไม่ติดตัวอักษร/ตัวเลขข้างใดข้างหนึ่ง
// กันไม่ให้ไปจับ dunder จริงในโค้ด เช่น __init__ (ซึ่งติดตัวอักษรทั้งสองข้าง)
// export ไว้ให้ ExerciseFormModal ใช้ตัวเดียวกันวาด overlay ไฮไลต์ blank สดขณะ admin พิมพ์ (ไม่ใช่แค่ตอน render โค้ดจริง)
export const BLANK_PATTERN = /(?<![A-Za-z0-9])_{3,}(?![A-Za-z0-9])/g;
export function highlightBlanks(html: string): string {
  return html.replace(BLANK_PATTERN, (match) => `<span class="ctp-code-blank">${match}</span>`);
}

/**
 * กล่องแสดงโค้ดของโจทย์ — ตัวเดียวที่ใช้ทุกหน้า (session, pretest, admin, AI draft)
 *
 * ธีม Catppuccin Mocha ประกาศไว้ใน CodeBlock.css บน .ctp-code เท่านั้น
 * ไม่พึ่ง CSS variable ของหน้าไหนเลย เพราะ Exercise.css / Pretest.css / Adminhome.css
 * ต่างประกาศ :root ทับกันด้วยชื่อ token คนละชุด
 */
export default function CodeBlock({ code, language, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const source = Array.isArray(code) ? code.join("\n") : (code ?? "");
  const trimmed = source.replace(/\s+$/, "");
  const lang = (language || DEFAULT_LANGUAGE).toLowerCase();

  const html = useMemo(() => {
    if (!trimmed) return "";
    ensureRegistered();
    // ภาษาที่ไม่รู้จักไม่ควรทำให้ทั้งหน้าพัง แค่แสดงเป็นข้อความธรรมดา
    if (!hljs.getLanguage(lang)) return highlightBlanks(escapeHtml(trimmed));
    try {
      return highlightBlanks(hljs.highlight(trimmed, { language: lang }).value);
    } catch {
      return highlightBlanks(escapeHtml(trimmed));
    }
  }, [trimmed, lang]);

  if (!trimmed) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // คลิปบอร์ดถูกบล็อก (ไม่ใช่ https หรือผู้ใช้ปฏิเสธ) — ไม่ต้องทำอะไร
    }
  };

  return (
    <div className="ctp-code">
      <div className="ctp-code-bar">
        <span className="ctp-code-lang">{label ?? lang}</span>
        <button
          type="button"
          className="ctp-code-copy"
          onClick={handleCopy}
          title="คัดลอกโค้ด"
        >
          {copied ? "คัดลอกแล้ว" : "คัดลอก"}
        </button>
      </div>
      <pre className="ctp-code-pre">
        {/* html มาจาก highlight.js ซึ่ง escape ให้แล้ว หรือจาก escapeHtml ข้างบน */}
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
