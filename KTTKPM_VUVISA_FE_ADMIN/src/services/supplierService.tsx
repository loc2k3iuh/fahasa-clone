import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

export interface Supplier {
  id: number;
  supplierName: string;
  description: string;
}

interface PaginatedSuppliers {
  content: Supplier[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const getSuppliers = async (page: number = 0, searchTerm: string = ''): Promise<PaginatedSuppliers> => {
  try {
    const params: Record<string, any> = {
      page,
      size: 10
    };

    if (searchTerm.trim()) {
      params.supplierName = searchTerm;
    }

    const response = await apiClient.get(`${API_BASE_URL}/suppliers`, { params });

    if (!response.data?.result?.content) {
      throw new Error('Invalid response structure');
    }

    return {
      content: response.data.result.content,
      totalPages: response.data.result.totalPages,
      totalElements: response.data.result.totalElements,
      number: response.data.result.number
    };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error('Failed to fetch suppliers');
  }
};

export const createSupplier = async (supplierData: { supplierName: string; description: string }): Promise<Supplier> => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/suppliers/create`, supplierData);
    return response.data.result;
  } catch (error) {
    console.error("Error create supplier:", error);
    throw error;
  }
};

export const updateSupplier = async (id: number, supplierData: { supplierName: string; description: string }): Promise<Supplier> => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/suppliers/${id}`, supplierData);
    return response.data.result;
  } catch (error) {
    console.error("Error update supplier:", error);
    throw error;
  }
};

export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_BASE_URL}/suppliers/${id}`);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};