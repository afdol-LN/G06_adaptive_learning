import { userService } from "./user.service";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../context/ToastContext";
import { usePreferences } from "../../../context/PreferencesContext";
import {
  UserResponseAdmin,
  GenderOption,
  RoleOption,
  CreateUserByAdminRequest,
  UpdateUserByAdminRequest,
} from "../../../models/userModel";
import { getStatusColor, getScoreColor } from "../../../utils/adminUi";

// ป้าย "ใหม่" ค้างไว้นานเท่านี้หลังสร้างผู้ใช้ แล้วแถวกลับไปอยู่ตามลำดับเดิมของ backend
const NEW_USER_HIGHLIGHT_MS = 60_000;

export function userController() {
  const toast = useToast();
  const { t } = usePreferences();
  const [users, setUsers] = useState<UserResponseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [erros, setErrors] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [userFiltered, setUserFiltered] = useState<UserResponseAdmin[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserResponseAdmin | null>(null);
  const [gendersList, setGendersList] = useState<GenderOption[]>([]);
  const [rolesList, setRolesList] = useState<RoleOption[]>([]);
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  const [viewingUser, setViewingUser] = useState<UserResponseAdmin | null>(null);
  const [viewBranches, setViewBranches] = useState<any[]>([]);
  const [isLoadingViewBranches, setIsLoadingViewBranches] = useState<boolean>(false);

  // id ของผู้ใช้ที่เพิ่งสร้างในหน้านี้ — ใช้ดันขึ้นบนสุดและแสดงป้าย "ใหม่" เท่านั้น (backend ไม่ส่งวันที่สร้างมา)
  const [newUserIds, setNewUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (newUserIds.size === 0) return;
    const timer = setTimeout(() => setNewUserIds(new Set()), NEW_USER_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [newUserIds]);

  useEffect(() => {
    loadUser();
    fetchOptions();
  }, []);

  // คืนรายการที่โหลดมาด้วย ให้ handleSaveUser เทียบหา id ของผู้ใช้ที่เพิ่งสร้างได้
  const loadUser = useCallback(async (): Promise<UserResponseAdmin[]> => {
    setIsLoading(true);
    const result = await userService.getAllUsers();

    let data: UserResponseAdmin[] = [];
    if (result.isError) {
      setErrors(result.errorMessage);
      setUsers([]);
      setUserFiltered([]);
    } else {
      data = result?.data || [];
      setUsers(data);
      setUserFiltered(data);
      setErrors(null);
    }
    setIsLoading(false);
    return data;
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
    const term = userSearch.trim().toLowerCase();
    const filtered = users.filter((user) => {
      if (term) {
        const matches =
          (user.fullName || "").toLowerCase().includes(term) ||
          (user.facultyName || "").toLowerCase().includes(term) ||
          (user.campusName || "").toLowerCase().includes(term) ||
          (user.majorName || "").toLowerCase().includes(term) ||
          (Array.isArray(user.goals) ? user.goals.join(" ") : user.goals || "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      return true;
    });
    // ผู้ใช้ใหม่ขึ้นบนสุด ที่เหลือคงลำดับเดิม (sort ของ JS เป็น stable)
    if (newUserIds.size > 0) {
      const rank = (u: UserResponseAdmin) => (u.id !== undefined && newUserIds.has(u.id) ? 0 : 1);
      filtered.sort((a, b) => rank(a) - rank(b));
    }
    setUserFiltered(filtered);
  }, [userSearch, statusFilter, users, newUserIds]);

  const toggleUserStatus = async (targetUser: UserResponseAdmin) => {
    if (!targetUser.id) {
      toast.error(t("admin.users.toast.noId"));
      return;
    }
    const newStatus = targetUser.status === "active" ? "inactive" : "active";
    setIsLoading(true);
    const result = await userService.updateUserStatus(targetUser.id, newStatus);
    if (result.isError) {
      toast.error(t("admin.users.toast.statusFailed"), result.errorMessage || t("admin.common.error"));
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
    const isCreate = !editingUser?.id;
    const idsBefore = new Set(users.map((u) => u.id));
    try {
      const result = editingUser?.id
        ? await userService.updateAdminUser(editingUser.id, data as UpdateUserByAdminRequest)
        : await userService.createAdminUser(data as CreateUserByAdminRequest);

      if (result.isError) {
        throw new Error(
          result.errorMessage ||
            (editingUser ? t("admin.users.saveFailedUpdate") : t("admin.users.saveFailedCreate"))
        );
      }
      closeFormModal();
      const fresh = await loadUser();
      if (isCreate) {
        const createdIds = fresh
          .map((u) => u.id)
          .filter((id): id is number => id !== undefined && !idsBefore.has(id));
        if (createdIds.length > 0) {
          // ล้างตัวกรอง ไม่งั้นผู้ใช้ใหม่อาจถูกซ่อนจนดูเหมือนสร้างไม่สำเร็จ
          setUserSearch("");
          setStatusFilter("all");
          setNewUserIds(new Set(createdIds));
        }
      }
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
    statusFilter,
    setStatusFilter,
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
    newUserIds,
  };
}
