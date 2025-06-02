import API_BASE_URL from "../config/apiConfig";
import { OrderFilter, OrderResponse, OrderStatus, Response } from "../types/order";
import apiClient from "./apiClient";


const API_URL = `${API_BASE_URL}`;

export const orderService = {
    // Get orders with pagination
    getOrders: async (page: number = 0, size: number = 5): Promise<OrderResponse> => {
        try {
            const response = await apiClient.get<OrderResponse>(`${API_URL}/orders`, {
                params: {
                    page,
                    size
                }
            });
            console.log('Fetched orders:', response.data);

            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    filterOrders: async (filter: OrderFilter, page: number = 0, size: number = 5): Promise<OrderResponse> => {
        try {
            const response = await apiClient.post<OrderResponse>(
                `${API_URL}/orders/filter?page=${page}&size=${size}`,
                filter
            );
            return response.data;
        } catch (error) {
            console.error('Error filtering orders:', error);
            throw error;
        }
    },

    generateOrderPdfUrl: async (orderIds: number[]): Promise<Response> => {
        try {
            const response = await apiClient.post(
                `${API_URL}/orders/generate-pdfs`,
                orderIds
            );
            // Giả sử API trả về { url: "http://..." }
            return response.data;
        } catch (error) {
            console.error('Error generating order PDF URL:', error);
            throw error;
        }
    },

    updateOrdersStatus: async (request: OrderStatus): Promise<Response> => {
        try {
            const response = await apiClient.post<Response>(
                `${API_URL}/orders/update-status`,
                request
            );
            return response.data;
        } catch (error) {
            console.error('Error updating orders status:', error);
            throw error;
        }
    },

    getOrderById: async (orderId: number): Promise<any> => {
        try {
            const response = await apiClient.get<Response>(`${API_URL}/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            throw error;
        }
    },

    updateOrder: async (orderId: number, orderData: any): Promise<Response> => {
        try {
            const response = await apiClient.put<Response>(
                `${API_URL}/orders/${orderId}`,
                orderData
            );
            return response.data;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },

    createOrder: async (orderData: any): Promise<Response> => {
        try {
            const response = await apiClient.post<Response>(
                `${API_URL}/orders`,
                orderData
            );
            return response.data;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    },

    deleteOrders: async (orderIds: number[]): Promise<Response> => {

        try {
            const response = await apiClient.post(
                `${API_URL}/orders/delete`, orderIds
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }


};