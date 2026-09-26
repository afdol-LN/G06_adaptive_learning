import { useEffect, useState } from "react";
import { recommendationService } from "../recommendation.service";

// โหลดใหม่ทุกครั้งที่เปลี่ยน branch; กลับจากหน้า exercise HomeShell mount ใหม่อยู่แล้วจึงได้ค่าล่าสุด
// error หรือไม่มีคำแนะนำ → null (UI แค่ไม่แสดงป้าย ไม่ต้องแจ้งผู้ใช้)
export function useRecommendationController(branchId: number | null) {
  const [recommendedSkillId, setRecommendedSkillId] = useState<number | null>(null);

  useEffect(() => {
    setRecommendedSkillId(null);
    if (!branchId) return;
    let cancelled = false;
    recommendationService.getRecommendation(branchId).then((res) => {
      if (cancelled) return;
      setRecommendedSkillId(!res.isError && res.data ? res.data.skillId : null);
    });
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return { recommendedSkillId };
}

export type RecommendationControllerType = ReturnType<typeof useRecommendationController>;
