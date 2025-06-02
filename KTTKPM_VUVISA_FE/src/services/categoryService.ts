import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

// Kiểu Category trong frontend
export interface Category {
  id: number;
  categoryName: string;
  description: string;
  type: CategoryType;
}

// Enum Type
export enum CategoryType {
  SACH_TRONG_NUOC = "SACH_TRONG_NUOC",
  SACH_NUOC_NGOAI = "SACH_NUOC_NGOAI", 
  VAN_PHONG_PHAM = "VAN_PHONG_PHAM"
}

// Kiểu dữ liệu trả về từ API cho từng Category item
interface CategoryResponseItem {
  id: number;
  categoryName: string;
  description: string;
  categoryType: CategoryType;
}

// Phân trang
interface PaginatedCategories {
  content: Category[];
  totalPages: number;
  totalElements: number;
  number: number;
}

// 🟢 Get all categories (paged, search)
export const getCategories = async (page: number = 0, searchTerm: string = ''): Promise<PaginatedCategories> => {
  try {
    const params: Record<string, string | number> = { page, size: 10 };
    
    if (searchTerm.trim()) {
      params.categoryName = searchTerm;
    }

    const response = await axios.get(`${API_BASE_URL}/categories`, { params });
    const data = response.data?.result;

    if (!data?.content) {
      throw new Error("Invalid response structure");
    }

    const content: Category[] = data.content.map((item: CategoryResponseItem): Category => ({
      id: item.id,
      categoryName: item.categoryName,
      description: item.description,
      type: item.categoryType
    }));

    return {
      content,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      number: data.number
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// 🟢 Create category
export const createCategory = async (categoryData: { 
  categoryName: string; 
  description: string;
  type: string;
}): Promise<Category> => {
  try {
    const apiData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description,
      categoryType: categoryData.type
    };

    const response = await axios.post(`${API_BASE_URL}/categories/create`, apiData);
    const result: CategoryResponseItem = response.data.result;

    return {
      id: result.id,
      categoryName: result.categoryName,
      description: result.description,
      type: result.categoryType
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// 🟢 Update category
export const updateCategory = async (id: number, categoryData: { 
  categoryName: string; 
  description: string;
  type: string;
}): Promise<Category> => {
  try {
    const apiData = {
      categoryName: categoryData.categoryName,
      description: categoryData.description,
      categoryType: categoryData.type
    };

    const response = await axios.put(`${API_BASE_URL}/categories/${id}`, apiData);
    const result: CategoryResponseItem = response.data.result;

    return {
      id: result.id,
      categoryName: result.categoryName,
      description: result.description,
      type: result.categoryType
    };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// 🟢 Delete category
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// 🟢 Get all categories grouped by type
export const getAllCategoriesGroupedByType = async (): Promise<Record<CategoryType, Category[]>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/by-type`);
    console.log('API Response:', response); // Thêm log này
    
    if (!response.data || !response.data.result) {
      throw new Error("Invalid response structure");
    }

    const result = response.data.result;
    const grouped: Record<CategoryType, Category[]> = {} as Record<CategoryType, Category[]>;

    // Đảm bảo xử lý đúng kiểu dữ liệu trả về
    (Object.entries(result) as [CategoryType, CategoryResponseItem[]][]).forEach(([key, items]) => {
      grouped[key] = items.map(item => ({
        id: item.id,
        categoryName: item.categoryName,
        description: item.description,
        type: item.categoryType
      }));
    });

    return grouped;
  } catch (error) {
    console.error("Full error details:", error); 
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    throw new Error("Failed to fetch grouped categories");
  }
};