import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiService";

const API_BASE = `${API_BASE_URL}`;

export const orderService = {
    getOrdersByUserId: async (userId: number, page: number, size: number) => {
        try {
            const response = await apiClient.get(`${API_BASE}/orders/user/${userId}?page=${page}&size=${size}`);
            return response.data.result || [];
        } catch (error) {
            console.error('Error fetching order by user', error);
            return [];
        }
    },
};