import api from "@/utils/api";
import { extractApiErrorMessage } from "@/utils/helper";

export const getUserStatus = async () => {
  try {
    const response = await api.get("/api/v1/profile/status");
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
};
