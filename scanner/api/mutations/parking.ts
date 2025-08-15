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

type PayFirstParkingData = {
    totalFee: number;
    isPWD: boolean;
    issuedById: string;
};

export const payFirstParking = async (payload: PayFirstParkingData) => {
    try {
        const response = await api.post('/api/v1/parking/pay-first-parking', payload);
        return response.data;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

type UserTransactionData = {
    userId: string;
    totalAmount: number;
    schedule: string;
};

export const userTransaction = async (payload: UserTransactionData) => {
    try {
        console.log(payload);
        const response = await api.post('/api/v1/revenue/user-transaction', payload);
        return response.data;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};
