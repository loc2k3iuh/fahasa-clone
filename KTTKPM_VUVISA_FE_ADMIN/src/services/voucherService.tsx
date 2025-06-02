import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

const API_BASE = `${API_BASE_URL}`;

class VoucherService {
  /**
   * Create a new voucher.
   */
  async createVoucher(voucherCreateDTO: any): Promise<any> {
    try {
      const response = await apiClient.post(`${API_BASE}/vouchers`, voucherCreateDTO);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to create voucher!";
    }
  }

  /**
   * Get voucher details by ID.
   */
  async getVoucherById(id: number): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/vouchers/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve voucher details!";
    }
  }

  /**
   * Get all vouchers with pagination.
   */
  async getVouchers(page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/vouchers`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve vouchers!";
    }
  }

  /**
   * Search vouchers by name with pagination.
   */
  async searchVouchersByName(voucherName: string, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/vouchers/search-name`, {
        params: { name: voucherName, page, size },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to search vouchers by name!";
    }
  }

  /**
   * Search vouchers by code with pagination.
   */
  async searchVouchersByCode(voucherCode: string, page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/vouchers/search-code`, {
        params: { name: voucherCode, page, size },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to search vouchers by code!";
    }
  }

  /**
   * Update an existing voucher by ID.
   */
  async updateVoucher(id: number, voucherUpdateDTO: any): Promise<any> {
    try {
      const response = await apiClient.put(`${API_BASE}/vouchers/${id}`, voucherUpdateDTO);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to update voucher!";
    }
  }

  /**
   * Delete a voucher by ID.
   */
  async deleteVoucher(id: number): Promise<any> {
    try {
      const response = await apiClient.delete(`${API_BASE}/vouchers/delete/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to delete voucher!";
    }
  }
}

export default new VoucherService();