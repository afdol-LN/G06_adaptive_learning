import { FaCheck, FaPen, FaRotate, FaXmark } from "react-icons/fa6";
import {
  AiDraft,
  ExerciseDraftPayload,
  GoalDraftPayload,
  SkillDraftPayload,
} from "../../../../models/aiDraftModel";
import { getTierColor, getTierLabel } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";
import CodeBlock from "../../../common/CodeBlock";

interface DraftCardProps {
  draft: AiDraft;
  /** true เฉพาะการ์ดที่เพิ่ง generate ออกมารอบล่าสุด — ใส่ border ฟ้า + pulse ให้เด่นจากการ์ดเก่า */
  isNew?: boolean;
  isBusy: boolean;
  skillNameById: (skillId: number) => string;
  onApprove: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onReject: () => void;
}

const ENTITY_LABEL: Record<AiDraft["entityType"], string> = {
  exercise: "Exercise",
  skill: "Skill",
  goal: "Goal",
};

function ExerciseBody({ payload }: { payload: ExerciseDraftPayload }) {
  const { t } = usePreferences();
  return (
    <>
      <p className="ad-ai-draft-title">{payload.description}</p>
      <CodeBlock code={payload.code} language={payload.language} />
      <div className="ad-ai-draft-meta">
        <span className="ad-ai-meta-tag">{t("admin.ai.draft.level", { n: payload.skillLevel })}</span>
        <span className="ad-ai-meta-tag">{payload.type}</span>
        {payload.expectTime ? <span>{t("admin.ai.draft.seconds", { n: payload.expectTime })}</span> : null}
      </div>

      {payload.type === "CHOICE" ? (
        <ul className="ad-ai-choice-list">
          {(payload.choices || []).map((choice, index) => (
            <li
              key={index}
              className={choice.isAnswer ? "ad-ai-choice is-answer" : "ad-ai-choice"}
            >
              {choice.isAnswer && <FaCheck />} {choice.script}
            </li>
          ))}
        </ul>
      ) : (
        <div className="ad-ai-draft-answer">
          {t("admin.ai.draft.answer")} <strong>{payload.fillInBlank}</strong>
          {payload.isCasesensitive === "YES" && ` (${t("admin.exView.caseOn")})`}
        </div>
      )}
    </>
  );
}

function SkillBody({
  payload,
  skillNameById,
}: {
  payload: SkillDraftPayload;
  skillNameById: (skillId: number) => string;
}) {
  const { t } = usePreferences();
  return (
    <>
      <p className="ad-ai-draft-title">{payload.skillsName}</p>
      <div className="ad-ai-draft-meta">
        <span>{t("admin.ai.draft.code", { code: payload.skillCode })}</span>
        {payload.tier && (
          <span
            className="ad-tier-badge"
            style={{
              background: `${getTierColor(payload.tier)}18`,
              color: getTierColor(payload.tier),
              border: `1px solid ${getTierColor(payload.tier)}40`,
            }}
          >
            {getTierLabel(payload.tier)}
          </span>
        )}
      </div>
      <div className="ad-req-tags">
        {(payload.prerequisites || []).length === 0 ? (
          <span className="ad-muted">{t("admin.skillView.noPrereq")}</span>
        ) : (
          payload.prerequisites.map((p) => (
            <span key={p.prerequisiteSkillId} className="ad-req-tag">
              {skillNameById(p.prerequisiteSkillId)}
            </span>
          ))
        )}
      </div>
    </>
  );
}

function GoalBody({
  payload,
  skillNameById,
}: {
  payload: GoalDraftPayload;
  skillNameById: (skillId: number) => string;
}) {
  return (
    <>
      <p className="ad-ai-draft-title">{payload.goal}</p>
      {payload.goalDescription && (
        <div className="ad-ai-draft-meta">
          <span>{payload.goalDescription}</span>
        </div>
      )}
      <div className="ad-req-tags">
        {(payload.skillRequires || []).map((r) => (
          <span key={r.skillId} className="ad-req-tag">
            {skillNameById(r.skillId)}
            {r.levelRequire ? ` · Lv.${r.levelRequire}` : ""}
          </span>
        ))}
      </div>
    </>
  );
}

export default function DraftCard({
  draft,
  isNew = false,
  isBusy,
  skillNameById,
  onApprove,
  onEdit,
  onRegenerate,
  onReject,
}: DraftCardProps) {
  const { t, locale } = usePreferences();
  const isPending = draft.status === "pending";

  // แทนที่ป้ายสถานะ "รอตรวจ" เดิมด้วยชื่อ skill + วันที่ generate — สถานะจริงยังดูได้จากปุ่ม action /
  // ข้อความ "savedAs"/"reason" ด้านล่างการ์ดอยู่แล้ว ไม่ต้องพึ่งป้ายนี้
  const draftSkillId =
    draft.entityType === "exercise" ? (draft.payload as ExerciseDraftPayload).skillId : null;
  const draftSkillName = draftSkillId != null ? skillNameById(draftSkillId) : null;
  const createdAtDate = new Date(draft.createdAt);
  // ป้ายตัดคำด้วย ellipsis (มีแค่บรรทัดเดียว) จึงใส่เวลาสั้น ๆ พอ ส่วนวันที่/เวลาเต็มไปอยู่ที่ title (tooltip ตอน hover)
  const generatedDate = createdAtDate.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const generatedTime = createdAtDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const generatedFull = createdAtDate.toLocaleString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`ad-card ad-ai-draft-card${isNew ? " ad-ai-draft-card--new" : ""}`}>
      <div className="ad-ai-draft-head">
        <span className="ad-ai-entity-badge">
          {ENTITY_LABEL[draft.entityType]}
        </span>
        {draftSkillName && (
          <span className="ad-ai-source-badge" title={draftSkillName}>
            {draftSkillName}
          </span>
        )}
        <span className="ad-ai-date-badge" title={generatedFull}>
          {generatedDate} {generatedTime}
        </span>
        <span className="ad-muted ad-ai-draft-id">#{draft.id}</span>
      </div>

      <div className="ad-ai-draft-body">
        {draft.entityType === "exercise" && (
          <ExerciseBody payload={draft.payload as ExerciseDraftPayload} />
        )}
        {draft.entityType === "skill" && (
          <SkillBody
            payload={draft.payload as SkillDraftPayload}
            skillNameById={skillNameById}
          />
        )}
        {draft.entityType === "goal" && (
          <GoalBody
            payload={draft.payload as GoalDraftPayload}
            skillNameById={skillNameById}
          />
        )}
      </div>

      {draft.status === "approved" && draft.approvedEntityId && (
        <div className="ad-hint-text">
          {t("admin.ai.draft.savedAs", { id: draft.approvedEntityId })}
        </div>
      )}
      {draft.status === "rejected" && draft.note && (
        <div className="ad-hint-text">{t("admin.ai.draft.reason", { note: draft.note })}</div>
      )}

      {isPending && (
        <div className="ad-action-btns ad-ai-draft-actions">
          <button
            type="button"
            className="ad-btn-sm ad-btn-toggle"
            onClick={onApprove}
            disabled={isBusy}
          >
            <FaCheck /> {t("admin.ai.draft.approve")}
          </button>
          <button
            type="button"
            className="ad-btn-sm ad-btn-view"
            onClick={onEdit}
            disabled={isBusy}
          >
            <FaPen /> {t("admin.common.edit")}
          </button>
          <button
            type="button"
            className="ad-btn-sm ad-btn-regen"
            onClick={onRegenerate}
            disabled={isBusy}
          >
            <FaRotate /> {t("admin.ai.draft.regenerate")}
          </button>
          <button
            type="button"
            className="ad-btn-sm ad-btn-del"
            onClick={onReject}
            disabled={isBusy}
          >
            <FaXmark /> {t("admin.ai.draft.reject")}
          </button>
        </div>
      )}
    </div>
  );
}
