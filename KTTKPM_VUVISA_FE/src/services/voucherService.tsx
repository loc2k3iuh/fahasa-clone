import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

export interface Voucher {
  id: number;
  code: string;
  discount_name: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  min_order_value: number;
  max_uses: number;
  start_date: string;
  end_date: string;
}

interface PaginatedVouchers {
  content: Voucher[];
  totalPages: number;
  totalElements: number;
  number: number;
}

const voucherService = {
  /**
   * Lấy tất cả voucher với phân trang
   */
  getAllVouchers: async (page: number = 0, size: number = 10): Promise<PaginatedVouchers> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers`, {
        params: { page, size }
      });
      
      if (!response.data?.result) {
        throw new Error("Invalid response structure");
      }
      
      return response.data.result;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw new Error('Failed to fetch vouchers');
    }
  },

  /**
   * Lấy voucher theo ID
   */
  getVoucherById: async (id: number): Promise<Voucher> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers/${id}`);
      
      if (!response.data?.result) {
        throw new Error("Invalid response structure");
      }
      
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching voucher with ID ${id}:`, error);
      throw new Error(`Failed to fetch voucher with ID ${id}`);
    }
  },

  /**
   * Tìm kiếm voucher theo tên
   */
  searchVouchersByName: async (name: string, page: number = 0, size: number = 10): Promise<PaginatedVouchers> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers/search-name`, {
        params: { name, page, size }
      });
      
      if (!response.data?.result) {
        throw new Error("Invalid response structure");
      }
      
      return response.data.result;
    } catch (error) {
      console.error('Error searching vouchers by name:', error);
      throw new Error('Failed to search vouchers by name');
    }
  },

  /**
   * Tìm kiếm voucher theo mã
   */
  searchVouchersByCode: async (code: string, page: number = 0, size: number = 10): Promise<PaginatedVouchers> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers/search-code`, {
        params: { name: code, page, size }
      });
      
      if (!response.data?.result) {
        throw new Error("Invalid response structure");
      }
      
      return response.data.result;
    } catch (error) {
      console.error('Error searching vouchers by code:', error);
      throw new Error('Failed to search vouchers by code');
    }
  },

  /**
   * Lấy 5 voucher ngẫu nhiên
   */
  getRandomVouchers: async (): Promise<Voucher[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vouchers/random`);
      
      if (!response.data?.result) {
        throw new Error("Invalid response structure");
      }
      
      return response.data.result;
    } catch (error) {
      console.error('Error fetching random vouchers:', error);
      throw new Error('Failed to fetch random vouchers');
    }
  }
};

export default voucherService;