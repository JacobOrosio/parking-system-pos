import api from "@/utils/api";
import { extractApiErrorMessage } from "@/utils/helper";

interface SingInPayload {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
}

export const signIn = async (
  payload: SingInPayload
): Promise<SignInResponse> => {
  try {
    const response = await api.post("/auth/signin-admin", payload);
    return response.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
};

interface SignUpPayload {
  email: string;
  password: string;
  role: string;
  name: string;
}

export const signUp = async (payload: SignUpPayload) => {
  try {
    console.log("create payload", payload);

    const response = await api.post("/auth/signup", payload);
    return response;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    throw new Error(message);
  }
};
