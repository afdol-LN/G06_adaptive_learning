import { FaCircleXmark } from "react-icons/fa6";
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

  const isUserExpanded = (u: UserResponseAdmin) =>
    !!viewUser && viewUser.id !== undefined && viewUser.id === u.id;

  const handleToggleExpand = (u: UserResponseAdmin) => {
    setViewUser(isUserExpanded(u) ? null : u);
  };

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

      <div className="ad-user-list">
        {userFiltered && userFiltered.length > 0 ? (
          userFiltered.map((u: UserResponseAdmin, index: number) => (
            <UserCard
              key={index}
              user={u}
              getStatusColor={getStatusColor}
              getScoreColor={getScoreColor}
              isExpanded={isUserExpanded(u)}
              onToggleExpand={handleToggleExpand}
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
<FaCircleXmark /> ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>

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
