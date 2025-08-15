import api from "@/utils/api";

export const getRevenue = async (
  filter: "week" | "year",
  timeOffset: number = 0
) => {
  try {
    const response = await api.get(
      `/api/v1/revenue?filter=${filter}&timeOffset=${timeOffset}`
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error((error as Error).message);
  }
};

export const getUnpaidTickets = async () => {
  try {
    const response = await api.get(`/api/v1/revenue/unpaid-tickets-by-day`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error((error as Error).message);
  }
};

export const getUserTransactions = async ({ page = 1, pageSize = 10 } = {}) => {
  try {
    const response = await api.get(`/api/v1/revenue/user-transactions`, {
      params: {
        page,
        pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error((error as Error).message);
  }
};
