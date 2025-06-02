import API_BASE_URL from '../config/apiConfig';
import apiClient from '../services/apiService';

const API_BASE = `${API_BASE_URL}`;


export interface Item {
    id: number;
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
    image_url: string;
    quantity_in_stock: number;
}

export interface Cart {
    id: number;
    user_id: number;
    items: Item[];
    total_items: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}


export const cartService = {


    getCartByUserId: async (userId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_BASE}/carts/${userId}`);
            console.log('Cart response:', response.data);

            return response.data.result || [];
        } catch (error) {
            console.error('Error fetching cart history:', error);
            return [];
        }
    },

    removeItemFromCart: async (userId: number, itemId: number): Promise<any> => {
        try {
            const response = await apiClient.delete(`${API_BASE}/carts/${userId}/items/${itemId}`);
            return response.data.result || [];
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return null;
        }
    },

    updateCartItem: async (userId: number, itemId: number, quantity: number): Promise<any> => {
        try {
            const response = await apiClient.put(`${API_BASE}/carts/${userId}/items/${itemId}?quantity=${quantity}`);
            return response.data.result || [];
        } catch (error) {
            console.error('Error updating cart item:', error);
            return null;
        }
    },

    createOrder: async (orderData: any) => {
        try {
            console.log('Creating order with data:', orderData);

            const response = await apiClient.post(`${API_BASE}/orders`, orderData);
            return response.data.result || null;
        } catch (error) {
            throw error;
        }
    },

    clearCart: async (userId: number): Promise<any> => {
        try {
            const response = await apiClient.delete(`${API_BASE}/carts/${userId}`);
            return response.data.result || [];
        } catch (error) {
            console.error('Error clearing cart:', error);
            return null;
        }
    },

    searchVouchersByCode: async (code: string): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_BASE}/vouchers/search-code?name=${code}`);
            return response.data.result.content || [];
        } catch (error) {
            console.error('Error searching vouchers:', error);
            return null;
        }
    },

    createPayment: async (paymentData: any) => {
        try {
            const response = await apiClient.post(`${API_BASE}/vnpay`, paymentData);
            return response.data.result || null;
        } catch (error) {
            throw error;
        }
    },

    returnPayment: async (paymentData: any) => {
        try {
            const response = await apiClient.post(`${API_BASE}/vnpay/return`, paymentData);
            return response.data.result || null;
        } catch (error) {
            throw error;
        }
    },

    addItemToCart: async (userId: number, cartItemDTO: any): Promise<any> => {
        try {
            const response = await apiClient.post(`${API_BASE}/carts/${userId}/items`, cartItemDTO);
            return response.data.result || [];
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return null;
        }
    }




};
