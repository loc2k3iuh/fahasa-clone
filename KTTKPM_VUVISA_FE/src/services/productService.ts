import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

export interface Product {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  category: {
    id: number;
    categoryName: string;
  };
  discounts?: {
    startDate?: [number, number, number];
    endDate?: [number, number, number];
    discountPercentage?: number;
    discountAmount?: number;
  }[];
}

// Phân trang sản phẩm
interface PaginatedProducts {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
}


// Get products by category name
export const getProductsByCategory = async (
  categoryId: number,  // Đổi từ categoryName sang categoryId và kiểu number
  page: number = 0,
): Promise<PaginatedProducts> => {
  try {
    console.log("api call", `${API_BASE_URL}/products/category/${categoryId}`);

    const response = await axios.get(
      `${API_BASE_URL}/products/category/${categoryId}`,  // Đổi đường dẫn API để khớp với backend
      { params: { page } }
    );

    const result = response.data.result;
    return {
      content: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
      number: result.number
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to fetch products by category');
  }
};


// Get products by category name
export const getProductsByCategoryType = async (
  type: string,  // Đổi từ categoryName sang categoryId và kiểu number
  page: number = 0,
): Promise<PaginatedProducts> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/products/category-type/${type}`,  // Đổi đường dẫn API để khớp với backend
      { params: { page } }
    );
    
    const result = response.data.result; 
    return {
      content: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
      number: result.number
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to fetch products by category');
  }
};





// get product by Name or authorName
export const getProductByNameOrAuthorName = async (
  term: string,
  page: number = 0,
  size: number = 12
): Promise<PaginatedProducts> => {
  try {
    const encodedTerm = encodeURIComponent(term);
    const response = await axios.get(
      `${API_BASE_URL}/products/search/${encodedTerm}`, { params: { page, size } }
    );
    if (!response.data?.result) {
      throw new Error("Invalid response structure");
    }
    const result = response.data.result;
    return {
      content: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
      number: result.number
    };
  } catch (error) {
    console.log("Error fetching products by name or author name:", error);
    throw new Error("Failed to fetch products by name or author name");
  }
};
// get product by supplier name and category name
export const getProductsBySupplierIdAndCategoryName = async (
  supplierId: number,
  categoryId: number,
  page: number = 0,
): Promise<PaginatedProducts> => {
  try {

    const response = await axios.get(`${API_BASE_URL}/products/category/${categoryId}/supplier/${supplierId}`,);

    if (!response.data?.result) {
      throw new Error("Invalid response structure");
    }

    const result = response.data.result;
    return {
      content: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
      number: result.number
    };
  } catch (error) {
    console.log("Error fetching products by supplier ID and category name:", error);
    throw new Error("Failed to fetch products by supplier ID and category name");
  }
}

// Get flash sale products (with discounts)
export const getFlashSaleProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/random-with-discounts`, {
      params: { limit }
    });

    if (!response.data?.result) {
      throw new Error("Invalid response structure");
    }

    return response.data.result;
  } catch (error) {
    console.error('Error fetching flash sale products:', error);
    throw new Error('Failed to fetch flash sale products');
  }
};

// Lấy sản phẩm mới nhất
export const getNewestProducts = async (limit: number = 15): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/newest`, {
      params: { limit }
    });

    if (!response.data?.result) {
      throw new Error("Invalid response structure");
    }

    return response.data.result;
  } catch (error) {
    console.error('Error fetching newest products:', error);
    throw new Error('Failed to fetch newest products');
  }
};






