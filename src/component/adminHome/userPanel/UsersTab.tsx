import React from "react";
import { FaFire, FaEye, FaPen } from "react-icons/fa6";
import { userController } from "./user.controller";
import SearchBar from "./component/searchBar";
import UserFormModal from "./component/UserFormModal";
import UserViewModal from "./component/UserViewModal";
import { UserResponseAdmin } from "../../../models/userModel";
import { StatusSwitch } from "../../common/StatusSwitch";

interface UsersTabProps {
  icon?: React.ReactNode;
}

export default function UsersTab({ icon }: UsersTabProps) {
  const {
    users,
    isLoading,
    erros,
    userSearch,
    setUserSearch,
    statusFilter,
    setStatusFilter,
    userFiltered,
    toggleUserStatus,
    isFormModalOpen,
    editingUser,
    openCreateModal,
    openEditModal,
    closeFormModal,
    gendersList,
    rolesList,
    isSavingUser,
    handleSaveUser,
    viewingUser,
    viewBranches,
    isLoadingViewBranches,
    openViewModal,
    closeViewModal,
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
          <h1 className="ad-page-title">{icon} จัดการผู้ใช้งาน</h1>
          <span className="ad-page-sub">ผู้ใช้ทั้งหมด {users.length} คน</span>
        </div>
        <button
          type="button"
          className="ad-btn-primary ad-btn-add"
          onClick={openCreateModal}
        >
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <SearchBar
        userSearch={userSearch}
        onChange={setUserSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={userFiltered.length}
        isLoading={isLoading}
        error={erros}
      />

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>ชื่อ - นามสกุล</th>
              <th>Actions</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: 24 }}>
                  กำลังโหลด...
                </td>
              </tr>
            ) : userFiltered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: 24 }}>
                  ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              userFiltered.map((u: UserResponseAdmin) => {
                const fadeClass = u.status === "inactive" ? "ad-fade-cell" : "";

                return (
                  <tr key={u.id}>
                    <td className={fadeClass}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="ad-avatar-sm" style={{ textTransform: "uppercase" }}>
                          {u.fullName[0] || "?"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                              {u.fullName}
                            </span>
                            {u.dayStreak !== undefined && u.dayStreak > 0 && (
                              <span
                                style={{
                                  color: "var(--orange)",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <FaFire /> {u.dayStreak}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: 4 }}>
                            {u.campusName} • {u.facultyName} • {u.majorName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="ad-btn-sm ad-btn-view" onClick={() => openViewModal(u)}>
                          <FaEye /> ดู
                        </button>
                        <button className="ad-btn-sm" onClick={() => openEditModal(u)}>
                          <FaPen /> แก้ไข
                        </button>
                      </div>
                    </td>
                    <td>
                      <StatusSwitch status={u.status} onToggle={() => toggleUserStatus(u)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal
        isOpen={isFormModalOpen}
        editingUser={editingUser}
        onClose={closeFormModal}
        onSubmit={handleSaveUser}
        isLoading={isSavingUser}
        gendersList={gendersList}
        rolesList={rolesList}
      />

      <UserViewModal
        user={viewingUser}
        branches={viewBranches}
        isLoadingBranches={isLoadingViewBranches}
        onClose={closeViewModal}
        onEdit={(user) => {
          closeViewModal();
          openEditModal(user);
        }}
      />
    </div>
  );
}
