import { userService } from "./user.service";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  UserResponseAdmin,
  GenderOption,
  RoleOption,
  CreateUserByAdminRequest,
  UpdateUserByAdminRequest,
} from "../../../models/userModel";
import { getStatusColor, getScoreColor } from "../../../utils/adminUi";

export function userController() {
  const toast = useToast();
  const [users, setUsers] = useState<UserResponseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [erros, setErrors] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState<string>("");
  const [userFiltered, setUserFiltered] = useState<UserResponseAdmin[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserResponseAdmin | null>(null);
  const [gendersList, setGendersList] = useState<GenderOption[]>([]);
  const [rolesList, setRolesList] = useState<RoleOption[]>([]);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  const [viewingUser, setViewingUser] = useState<UserResponseAdmin | null>(null);
  const [viewBranches, setViewBranches] = useState<any[]>([]);
  const [isLoadingViewBranches, setIsLoadingViewBranches] = useState<boolean>(false);

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
      toast.error("ไม่พบรหัสผู้ใช้ (ID) สำหรับทำรายการ");
      return;
    }
    const newStatus = targetUser.status === "active" ? "inactive" : "active";
    setIsLoading(true);
    const result = await userService.updateUserStatus(targetUser.id, newStatus);
    if (result.isError) {
      toast.error("อัปเดตสถานะไม่สำเร็จ", result.errorMessage || "เกิดข้อผิดพลาด");
    } else {
      const updatedUsers = users.map((u) =>
        u.id === targetUser.id ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      if (viewingUser && viewingUser.id === targetUser.id) {
        setViewingUser({ ...viewingUser, status: newStatus });
      }
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: UserResponseAdmin) => {
    setEditingUser(user);
    setViewingUser(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (data: CreateUserByAdminRequest | UpdateUserByAdminRequest) => {
    setIsSavingUser(true);
    try {
      const result = editingUser?.id
        ? await userService.updateAdminUser(editingUser.id, data as UpdateUserByAdminRequest)
        : await userService.createAdminUser(data as CreateUserByAdminRequest);

      if (result.isError) {
        throw new Error(
          result.errorMessage || `ไม่สามารถ${editingUser ? "แก้ไข" : "สร้าง"}ผู้ใช้งานได้`
        );
      }
      closeFormModal();
      await loadUser();
    } finally {
      setIsSavingUser(false);
    }
  };

  const openViewModal = async (user: UserResponseAdmin) => {
    setViewingUser(user);
    if (!user.id) return;
    setIsLoadingViewBranches(true);
    const res = await userService.getUserBranches(user.id);
    setViewBranches(!res.isError && res.data ? res.data : []);
    setIsLoadingViewBranches(false);
  };

  const closeViewModal = () => {
    setViewingUser(null);
    setViewBranches([]);
  };

  return {
    users,
    isLoading,
    erros,
    userSearch,
    setUserSearch,
    userFiltered,
    getStatusColor,
    getScoreColor,
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
  };
}
