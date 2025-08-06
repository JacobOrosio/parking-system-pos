import api from '@/utils/api';
import { extractApiErrorMessage } from '@/utils/helper';

interface SingInPayload {
    email: string;
    password: string;
}

interface SignInResponse {
    token: string;
}

export const signIn = async (payload: SingInPayload): Promise<SignInResponse> => {
    try {
        const response = await api.post('/auth/signin', payload);
        return response.data;
    } catch (error) {
        const message = extractApiErrorMessage(error);
        throw new Error(message);
    }
};
