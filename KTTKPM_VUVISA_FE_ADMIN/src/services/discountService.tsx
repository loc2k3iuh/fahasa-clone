import { DiscountDTO, discountCreateDTO } from "../types/discount";
import apiClient from "../services/apiClient";
import API_BASE_URL from "../config/apiConfig";

const API_BASE = `${API_BASE_URL}`;

class DiscountService {

    async createDiscount(discountCreateDTO: any): Promise<any> {
        try {
            const response = await apiClient.post(`${API_BASE}/discounts`, discountCreateDTO);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Tạo mã giảm giá thất bại!";
        }
    }

    async getDiscounts(page: number = 0, size: number = 10): Promise<any> {
        try {
            const response = await apiClient.get(`${API_BASE}/discounts`, {
                params: {
                    page,
                    size,
                },
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Lấy danh sách mã giảm giá thất bại!";
        }
    }

    async updateDiscount(id: number, discountDTO: any): Promise<any> {
        try {
            const response = await apiClient.put(`${API_BASE}/discounts/${id}`, discountDTO);
            return response.data;
        } catch (error: any) {
            throw error?.message || "Cập nhật mã giảm giá thất bại!";
        }
    }

    async searchDiscountsByName(discountName: string, page: number = 0, size: number = 10): Promise<any> {
        try {
            const response = await apiClient.get(`${API_BASE}/discounts/search`, {
                params: {
                    name: discountName,
                    page,
                    size,
                },
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Tìm kiếm mã giảm giá thất bại!";
        }
    }

    async getDiscountById(id: number): Promise<any> {
        try {
            const response = await apiClient.get(`${API_BASE}/discounts/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Lấy thông tin mã giảm giá thất bại!";
        }
    }

    async deleteDiscount(id: number): Promise<any> {
        try {
            const response = await apiClient.delete(`${API_BASE}/discounts/delete/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || "Xóa mã giảm giá thất bại!";
        }
    }

}

export default new DiscountService();