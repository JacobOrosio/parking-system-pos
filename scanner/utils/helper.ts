import { AxiosError } from 'axios';

export const extractApiErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
        const axiosError = error as AxiosError;

        if (axiosError.message === 'Network Error') {
            return 'No internet connection. Please check your connection.';
        }

        return (
            (axiosError.response?.data as any)?.message ||
            axiosError.message ||
            'Something went wrong'
        );
    }

    if (error instanceof Error) return error.message;

    return 'Unknown error occurred';
};
