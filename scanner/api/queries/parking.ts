import api from '@/utils/api';

export const getTicketDetails = async (ticketId: string) => {
    try {
        const response = await api.get(`/api/v1/parking/${ticketId}`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error((error as Error).message);
    }
};
