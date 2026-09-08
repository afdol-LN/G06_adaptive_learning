import { FaCheck, FaPen, FaRotate, FaXmark } from "react-icons/fa6";
import {
  AiDraft,
  ExerciseDraftPayload,
  GoalDraftPayload,
  SkillDraftPayload,
} from "../../../../models/aiDraftModel";
import { getStatusColor, getTierColor, getTierLabel } from "../../../../utils/adminUi";
import CodeBlock from "../../../common/CodeBlock";

interface DraftCardProps {
  draft: AiDraft;
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

const STATUS_LABEL: Record<AiDraft["status"], string> = {
  pending: "รอตรวจ",
  approved: "อนุมัติแล้ว",
  rejected: "ปฏิเสธแล้ว",
};

/** pending ยังไม่มีสีใน getStatusColor ของเดิม จึง map เอง */
function statusColor(status: AiDraft["status"]): string {
  if (status === "approved") return getStatusColor("active");
  if (status === "rejected") return getStatusColor("inactive");
  return getStatusColor("pending");
}

function ExerciseBody({
  payload,
  skillNameById,
}: {
  payload: ExerciseDraftPayload;
  skillNameById: (skillId: number) => string;
}) {
  return (
    <>
      <p className="ad-ai-draft-title">{payload.description}</p>
      <CodeBlock code={payload.code} language={payload.language} />
      <div className="ad-ai-draft-meta">
        <span>Skill: {skillNameById(payload.skillId)}</span>
        <span>ระดับ {payload.skillLevel}</span>
        <span>{payload.type}</span>
        {payload.expectTime ? <span>{payload.expectTime} วิ</span> : null}
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
          คำตอบ: <strong>{payload.fillInBlank}</strong>
          {payload.isCasesensitive === "YES" && " (ตรวจตัวพิมพ์เล็ก/ใหญ่)"}
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
  return (
    <>
      <p className="ad-ai-draft-title">{payload.skillsName}</p>
      <div className="ad-ai-draft-meta">
        <span>รหัส: {payload.skillCode}</span>
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
          <span className="ad-muted">— ไม่มี prerequisite —</span>
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
  isBusy,
  skillNameById,
  onApprove,
  onEdit,
  onRegenerate,
  onReject,
}: DraftCardProps) {
  const isPending = draft.status === "pending";

  return (
    <div className="ad-card ad-ai-draft-card">
      <div className="ad-ai-draft-head">
        <span className="ad-ai-entity-badge">
          {ENTITY_LABEL[draft.entityType]}
        </span>
        <span
          className="ad-ai-status-badge"
          style={{
            background: `${statusColor(draft.status)}18`,
            color: statusColor(draft.status),
            border: `1px solid ${statusColor(draft.status)}40`,
          }}
        >
          {STATUS_LABEL[draft.status]}
        </span>
        <span className="ad-muted ad-ai-draft-id">#{draft.id}</span>
      </div>

      <div className="ad-ai-draft-body">
        {draft.entityType === "exercise" && (
          <ExerciseBody
            payload={draft.payload as ExerciseDraftPayload}
            skillNameById={skillNameById}
          />
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
          บันทึกลงระบบแล้ว (id {draft.approvedEntityId})
        </div>
      )}
      {draft.status === "rejected" && draft.note && (
        <div className="ad-hint-text">เหตุผล: {draft.note}</div>
      )}

      {isPending && (
        <div className="ad-action-btns ad-ai-draft-actions">
          <button
            type="button"
            className="ad-btn-sm ad-btn-toggle"
            onClick={onApprove}
            disabled={isBusy}
          >
            <FaCheck /> อนุมัติ
          </button>
          <button
            type="button"
            className="ad-btn-sm ad-btn-view"
            onClick={onEdit}
            disabled={isBusy}
          >
            <FaPen /> แก้ไข
          </button>
          <button
            type="button"
            className="ad-btn-sm ad-btn-regen"
            onClick={onRegenerate}
            disabled={isBusy}
          >
            <FaRotate /> สร้างใหม่
          </button>
          <button
            type="button"
            className="ad-btn-sm ad-btn-del"
            onClick={onReject}
            disabled={isBusy}
          >
            <FaXmark /> ปฏิเสธ
          </button>
        </div>
      )}
    </div>
  );
}
