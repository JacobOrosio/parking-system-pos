import api from '@/utils/api';

type ParkingData = {
    issuedById: string;
    vehicleType: string;
    isPWD: boolean;
};

export const customerParking = async (payload: ParkingData) => {
    try {
        const response = await api.post('/api/v1/parking/ticket', payload);
        return response.data;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

type PayParkingData = {
    ticketId: string;
    totalFee: number;
    durationMins: number;
    checkedOutById: string;
};

export const payParking = async (payload: PayParkingData) => {
    try {
        const response = await api.post('/api/v1/parking/pay-parking', payload);
        return response;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};
