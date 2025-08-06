import { UserProfile } from "@/types/user";
import api from "@/utils/api";
import { extractApiErrorMessage } from "@/utils/helper";

export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get("/api/v1/profile");
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
};
