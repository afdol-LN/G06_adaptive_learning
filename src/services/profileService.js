/**
 * @file profileService.js
 * @description Service Layer สำหรับจัดการข้อมูลผู้ใช้และ Branches (จัดเก็บใน localStorage)
 */
import { UserModel } from '../models/user.model';

const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  BRANCHES: 'branches',
  ACTIVE_BRANCH_ID: 'activeBranchId',
};

export class ProfileService {
  /**
   * ดึงข้อมูล UserProfile จาก LocalStorage
   * @returns {import('../models/user.model').UserProfile | null}
   */
  static getUserProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * บันทึกข้อมูล UserProfile ลง LocalStorage
   * @param {Partial<import('../models/user.model').UserProfile>} data
   * @returns {import('../models/user.model').UserProfile}
   */
  static saveUserProfile(data) {
    const profile = UserModel.createUserProfile(data);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return profile;
  }

  /**
   * ดึงรายการ Branches ทั้งหมด
   * @returns {import('../models/user.model').Branch[]}
   */
  static getBranches() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * ดึง Active Branch ID
   * @returns {string | null}
   */
  static getActiveBranchId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID) || null;
  }

  /**
   * บันทึก Active Branch ID
   * @param {string} branchId
   */
  static setActiveBranchId(branchId) {
    if (branchId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, branchId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
    }
  }

  /**
   * เพิ่ม Branch ใหม่และบันทึกลง LocalStorage
   * @param {Partial<import('../models/user.model').Branch>} branchData
   * @returns {import('../models/user.model').Branch}
   */
  static addBranch(branchData) {
    const branches = ProfileService.getBranches();
    const newBranch = UserModel.createBranch(branchData);
    const updatedBranches = [...branches, newBranch];
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(updatedBranches));
    return newBranch;
  }

  /**
   * อัปเดตข้อมูลภายใน Branch ตาม ID
   * @param {string} branchId
   * @param {Partial<import('../models/user.model').Branch>} changes
   * @returns {import('../models/user.model').Branch[]}
   */
  static updateBranch(branchId, changes) {
    const branches = ProfileService.getBranches();
    const updated = branches.map(b => (b.id === branchId ? { ...b, ...changes } : b));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(updated));
    return updated;
  }
}
