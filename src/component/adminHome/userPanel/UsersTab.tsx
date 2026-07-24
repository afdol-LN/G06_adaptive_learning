import { userController } from "./user.controller";
import SearchBar from "./component/searchBar";
import UserCard from "./component/userCard";
import CreateUserModal from "./component/CreateUserModal";
import { UserResponseAdmin } from "../../../models/userModel";

export default function UsersTab() {
  const {
    users,
    isLoading,
    erros,
    userSearch,
    setUserSearch,
    userFiltered,
    viewUser,
    setViewUser,
    getStatusColor,
    getScoreColor,
    toggleUserStatus,
    isCreateModalOpen,
    setIsCreateModalOpen,
    gendersList,
    rolesList,
    isCreatingUser,
    handleCreateUser,
  } = userController();

  return (
    <div className="ad-tab-users">
      <div
        className="ad-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="ad-page-title">จัดการผู้ใช้งาน</h1>
          <span className="ad-page-sub">ผู้ใช้ทั้งหมด {users.length} คน</span>
        </div>
        <button
          type="button"
          className="ad-btn-primary ad-btn-add"
          onClick={() => setIsCreateModalOpen(true)}
        >
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <SearchBar
        userSearch={userSearch}
        onChange={setUserSearch}
        totalCount={userFiltered.length}
        isLoading={isLoading}
        error={erros}
      />

      <div className="ad-user-grid">
        {userFiltered && userFiltered.length > 0 ? (
          userFiltered.map((u: UserResponseAdmin, index: number) => (
            <UserCard
              key={index}
              user={u}
              getStatusColor={getStatusColor}
              getScoreColor={getScoreColor}
              onViewUser={setViewUser}
              onToggleStatus={toggleUserStatus}
            />
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
            }}
          >
            ❌ ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

      {viewUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              minWidth: "320px",
              maxWidth: "500px",
            }}
          >
            <h3>
              👁 ข้อมูลผู้ใช้: {viewUser.fullName} {viewUser.id !== undefined ? `(#${viewUser.id})` : ""}
            </h3>
            <p><strong>วิทยาเขต:</strong> {viewUser.campusName || "-"}</p>
            <p><strong>คณะ:</strong> {viewUser.facultyName || "-"}</p>
            <div>
              <strong>เป้าหมาย:</strong>{" "}
              {(() => {
                const goalsList: string[] = Array.isArray(viewUser.goals)
                  ? viewUser.goals
                  : typeof viewUser.goals === "string" && viewUser.goals !== "-" && viewUser.goals.trim() !== ""
                  ? viewUser.goals.split("-").map((g) => g.trim()).filter(Boolean)
                  : [];
                return goalsList.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {goalsList.map((g, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        🎯 {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: "#9ca3af" }}> - ไม่ได้ระบุ - </span>
                );
              })()}
            </div>
            <p style={{ marginTop: "12px" }}><strong>สถานะ:</strong> {viewUser.status || "-"}</p>

            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                textAlign: "center",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#334155" }}>
                  {viewUser.sessionCount ?? 0}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Sessions</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: getScoreColor(viewUser.correctPercent ?? viewUser.correctPercent ?? 0),
                  }}
                >
                  {viewUser.correctPercent ?? viewUser.correctPercent ?? 0}%
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Correct %</div>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#e11d48" }}>
                  🔥 {viewUser.dayStreak ?? viewUser.dayStreak ?? 0}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Streak</div>
              </div>
            </div>

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button
                className="ad-btn-sm"
                onClick={() => setViewUser(null)}
                style={{ background: "#e2e8f0", padding: "8px 16px" }}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={isCreatingUser}
        gendersList={gendersList}
        rolesList={rolesList}
      />
    </div>
  );
}
