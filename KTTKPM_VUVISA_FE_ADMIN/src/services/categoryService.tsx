import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

interface Category {
  id: number;
  categoryName: string;
  description: string;
  type: CategoryType; // Thêm trường type
}
export enum CategoryType {
  SACH_TRONG_NUOC = "SACH_TRONG_NUOC",
  SACH_NUOC_NGOAI = "SACH_NUOC_NGOAI", 
  VAN_PHONG_PHAM = "VAN_PHONG_PHAM"
}

interface PaginatedCategories {
  content: Category[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const getCategories = async (page: number = 0, searchTerm: string = ''): Promise<PaginatedCategories> => {
  try {
    const params: Record<string, any> = { page, size: 10 };
    
    if (searchTerm.trim()) {
      params.categoryName = searchTerm;
    }

    const response = await apiClient.get(`${API_BASE_URL}/categories`, { params });
    if(!response.data?.result?.content){
      throw new Error("Invalid response structure");
    }
    
    // Map the API response to match your interface
    const content = response.data.result.content.map((item: any) => ({
      id: item.id,
      categoryName: item.categoryName,
      description: item.description,
      type: item.categoryType as CategoryType // Map categoryType to type
    }));

    return {
      content: content,
      totalPages: response.data.result.totalPages,
      totalElements: response.data.result.totalElements,
      number: response.data.result.number
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

export const createCategory = async (categoryData: { 
  categoryName: string; 
  description: string;
  type: string;
}): Promise<Category> => {
  try {
    // Map type to categoryType for the API
    const apiData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description,
      categoryType: categoryData.type
    };
    const response = await apiClient.post(`${API_BASE_URL}/categories/create`, apiData);
    return {
      ...response.data.result,
      type: response.data.result.categoryType
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id: number, categoryData: { 
  categoryName: string; 
  description: string;
  type: string;
}): Promise<Category> => {
  try {
    // Map type to categoryType for the API
    const apiData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description,
      categoryType: categoryData.type
    };
    const response = await apiClient.put(`${API_BASE_URL}/categories/${id}`, apiData);
    return {
      ...response.data.result,
      type: response.data.result.categoryType
    };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_BASE_URL}/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};