import api from "@/utils/api";
import { extractApiErrorMessage } from "@/utils/helper";

export type UpdateStatusPayload = {
  id: string;
  status: "active" | "inactive";
};

export const updateUserStatus = async (payload: UpdateStatusPayload) => {
  try {
    const response = await api.put("/api/v1/profile/status", payload);
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
};
