import { useState, useEffect, useCallback } from "react";
import { UserProfileDetail } from "../../../models/userModel";
import { userProfileService } from "../userProfile.service";

export function useUserProfileController() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [error, setError] = useState<string>("");

  const fetchProfile = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await userProfileService.getProfile(userId);
    if (!res.isError && res.data) {
      setProfile(res.data);
      setError("");
    } else {
      setError(res.errorMessage);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    isLoading,
    profile,
    error,
    refresh: fetchProfile,
  };
}

export type UserProfileControllerType = ReturnType<typeof useUserProfileController>;
