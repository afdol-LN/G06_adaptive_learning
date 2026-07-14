 {/* ══ SKILLS ══ */}
       import React from 'react';

export default function SkillTab({ 
  skills, 
  skillSearch, 
  setSkillSearch, 
  setEditSkill, 
  EMPTY_SKILL, 
  filteredSkills, 
  getTierColor, 
  getStatusColor, 
  getSkillQuestions, 
  setViewSkillQ, 
  toggleSkillStatus, 
  setDeleteSkill 
}) {
  return (
    <div className="ad-tab-skills">
      <div className="ad-page-header">
        <h1 className="ad-page-title">🌳 จัดการ Skill</h1>
        <span className="ad-page-sub">Skill ทั้งหมด {skills.length} รายการ</span>
      </div>
      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon">🔍</span>
          <input className="ad-search" placeholder="ค้นหาชื่อ Skill, Tier..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
        </div>
        <button className="ad-btn-primary ad-btn-add" onClick={() => setEditSkill({ ...EMPTY_SKILL })}>➕ เพิ่ม Skill ใหม่</button>
      </div>
      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr><th>Skill</th><th>Tier</th><th>สถานะ</th><th>Requires</th><th>ผู้ใช้</th><th>Avg Progress</th><th>โจทย์</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredSkills.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="ad-skill-cell">
                    <span className="ad-skill-icon">{s.icon}</span>
                    <span className="ad-skill-name">{s.name}</span>
                  </div>
                </td>
                <td>
                  <span className="ad-tier-badge" style={{ background: `${getTierColor(s.tier)}18`, color: getTierColor(s.tier), border: `1px solid ${getTierColor(s.tier)}40` }}>{s.tier}</span>
                </td>
                <td>
                  <span className="ad-status-dot" style={{ background: getStatusColor(s.status) }} />
                  <span className="ad-muted">{s.status}</span>
                </td>
                <td>
                  <div className="ad-req-tags">
                    {s.requires.length === 0
                      ? <span className="ad-muted">—</span>
                      : s.requires.map(rid => { const rs = skills.find(x => x.id === rid); return rs ? <span key={rid} className="ad-req-tag">{rs.icon} {rs.name}</span> : null; })
                    }
                  </div>
                </td>
                <td><span className="ad-mono">{s.userCount}</span></td>
                <td>
                  <div className="ad-prog-cell">
                    <div className="ad-prog-track"><div className="ad-prog-fill" style={{ width: `${s.avgProgress}%`, background: getTierColor(s.tier) }} /></div>
                    <span className="ad-prog-pct" style={{ color: getTierColor(s.tier) }}>{s.avgProgress}%</span>
                  </div>
                </td>
                <td>
                  <button className="ad-btn-sm" style={{ borderColor: 'rgba(139,92,246,0.3)', color: '#8b5cf6' }}
                    onClick={() => setViewSkillQ(s)}>
                    📝 {getSkillQuestions(s.id).length} ข้อ
                  </button>
                </td>
                <td>
                  <div className="ad-action-btns">
                    <button className="ad-btn-sm ad-btn-view" onClick={() => setEditSkill({ ...s })}>✏️ แก้ไข</button>
                    <button className="ad-btn-sm ad-btn-toggle" onClick={() => toggleSkillStatus(s.id)}>
                      {s.status === 'active' ? '🔴 ระงับ' : '🟢 เปิด'}
                    </button>
                    <button className="ad-btn-sm ad-btn-del" onClick={() => setDeleteSkill(s)}>🗑 ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}