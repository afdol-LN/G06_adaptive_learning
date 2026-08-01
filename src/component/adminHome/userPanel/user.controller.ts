import { userService } from "./user.service";
import { useCallback, useEffect, useState } from "react";
import {
  UserResponseAdmin,
  GenderOption,
  RoleOption,
  CreateUserByAdminRequest,
} from "../../../models/userModel";
import { getStatusColor, getScoreColor } from "../../../utils/adminUi";

export function userController() {
  const [users, setUsers] = useState<UserResponseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [erros, setErrors] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState<string>("");
  const [userFiltered, setUserFiltered] = useState<UserResponseAdmin[]>([]);
  const [viewUser, setViewUser] = useState<UserResponseAdmin | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [gendersList, setGendersList] = useState<GenderOption[]>([]);
  const [rolesList, setRolesList] = useState<RoleOption[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  useEffect(() => {
    loadUser();
    fetchOptions();
  }, []);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    const result = await userService.getAllUsers();

    if (result.isError) {
      setErrors(result.errorMessage);
      setUsers([]);
      setUserFiltered([]);
    } else {
      const data = result?.data || [];
      console.log('users data : ', data)
      setUsers(data);
      setUserFiltered(data);
      setErrors(null);
    }
    setIsLoading(false);
  }, []);

  const fetchOptions = useCallback(async () => {
    const [genderRes, roleRes] = await Promise.all([
      userService.getGenders(),
      userService.getRoles(),
    ]);

    if (!genderRes.isError && genderRes.data) {
      setGendersList(genderRes.data);
    }
    if (!roleRes.isError && roleRes.data) {
      setRolesList(roleRes.data);
    }
  }, []);

  useEffect(() => {
    if (!userSearch.trim()) {
      setUserFiltered(users);
    } else {
      const term = userSearch.toLowerCase();
      const filtered = users.filter((user) =>
        (user.fullName || "").toLowerCase().includes(term) ||
        (user.facultyName || "").toLowerCase().includes(term) ||
        (user.campusName || "").toLowerCase().includes(term) ||
        (user.majorName || "").toLowerCase().includes(term) ||
        (Array.isArray(user.goals) ? user.goals.join(" ") : user.goals || "").toLowerCase().includes(term) ||
        (user.status || "").toLowerCase().includes(term)
      );
      setUserFiltered(filtered);
    }
  }, [userSearch, users]);

  const toggleUserStatus = async (targetUser: UserResponseAdmin) => {
    if (!targetUser.id) {
      alert("ไม่พบรหัสผู้ใช้ (ID) สำหรับทำรายการ");
      return;
    }
    const newStatus = targetUser.status === "active" ? "inactive" : "active";
    setIsLoading(true);
    const result = await userService.updateUserStatus(targetUser.id, newStatus);
    if (result.isError) {
      alert(`อัปเดตสถานะไม่สำเร็จ: ${result.errorMessage || "เกิดข้อผิดพลาด"}`);
    } else {
      const updatedUsers = users.map((u) =>
        u.id === targetUser.id ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      if (viewUser && viewUser.id === targetUser.id) {
        setViewUser({ ...viewUser, status: newStatus });
      }
    }
    setIsLoading(false);
  };

  const handleCreateUser = async (data: CreateUserByAdminRequest) => {
    setIsCreatingUser(true);
    try {
      const result = await userService.createAdminUser(data);
      if (result.isError) {
        throw new Error(result.errorMessage || "ไม่สามารถสร้างผู้ใช้งานได้");
      }
      setIsCreateModalOpen(false);
      await loadUser();
    } finally {
      setIsCreatingUser(false);
    }
  };

  return {
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
  };
}
