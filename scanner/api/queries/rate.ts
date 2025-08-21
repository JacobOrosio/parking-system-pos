import api from '@/utils/api';

export const getRate = async () => {
    try {
        const response = await api.get(`/api/v1/rate`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error((error as Error).message);
    }
};
