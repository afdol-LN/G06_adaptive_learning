// Prerequisite edges worth drawing — shared by the student skill tree (SkillTreeSVG) and the admin goal workspace.
// A→C is hidden when C also needs some B that is itself built on A: A→B→C already shows it, and the extra
// line would run past B's row. Drawing only — unlock rules and the side panels still use every prerequisite.
// Returns keys `${prerequisiteId}-${skillId}`.
export function drawnPrerequisiteEdgeKeys(skills: { id: number; prerequisiteIds: number[] }[]): Set<string> {
  const prereqsOf = new Map(skills.map((s) => [s.id, s.prerequisiteIds.filter((p) => p !== s.id)]));
  const ancestors = new Map<number, Set<number>>();
  const ancestorsOf = (id: number, visiting = new Set<number>()): Set<number> => {
    const cached = ancestors.get(id);
    if (cached) return cached;
    const out = new Set<number>();
    if (visiting.has(id)) return out; // cycle guard
    visiting.add(id);
    for (const p of prereqsOf.get(id) || []) {
      if (!prereqsOf.has(p)) continue;
      out.add(p);
      ancestorsOf(p, visiting).forEach((a) => out.add(a));
    }
    ancestors.set(id, out);
    return out;
  };

  const drawn = new Set<string>();
  for (const s of skills) {
    const prereqs = (prereqsOf.get(s.id) || []).filter((p) => prereqsOf.has(p));
    for (const a of prereqs) {
      const implied = prereqs.some((b) => b !== a && ancestorsOf(b).has(a));
      if (!implied) drawn.add(`${a}-${s.id}`);
    }
  }
  return drawn;
}
