import rateLimitedApiClient from "./RateLimitedApiClient";

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
  categoryId: number,
  page: number = 0,
  size: number = 12
): Promise<PaginatedProducts> => {
  try {
    const response = await rateLimitedApiClient.get(
      `/products/category/${categoryId}`,
      { params: { page, size } }
    );
    
    const result = response.result; 
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
    const response = await rateLimitedApiClient.get(
      `/products/search/${encodedTerm}`,
      {params: {page, size}}
    );
    
    if (!response?.result) {
      throw new Error("Invalid response structure");
    }
    
    const result = response.result;
    return {
      content: result.content,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
      number: result.number
    };
  } catch(error) {
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
    const response = await rateLimitedApiClient.get(
      `/products/category/${categoryId}/supplier/${supplierId}`
    );
    
    if (!response?.result) {
      throw new Error("Invalid response structure");
    }

    const result = response.result;
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
};

// Get flash sale products (with discounts)
export const getFlashSaleProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const response = await rateLimitedApiClient.get(
      `/products/random-with-discounts`, 
      { params: { limit } }
    );
    
    if (!response?.result) {
      throw new Error("Invalid response structure");
    }
    
    return response.result;
  } catch (error) {
    console.error('Error fetching flash sale products:', error);
    throw new Error('Failed to fetch flash sale products');
  }
};

// Lấy sản phẩm mới nhất
export const getNewestProducts = async (limit: number = 15): Promise<Product[]> => {
  try {
    const response = await rateLimitedApiClient.get(
      `/products/newest`, 
      { params: { limit } }
    );
    
    if (!response?.result) {
      throw new Error("Invalid response structure");
    }
    
    return response.result;
  } catch (error) {
    console.error('Error fetching newest products:', error);
    throw new Error('Failed to fetch newest products');
  }
};

// Group all functions as a single service for easier use in test component
const rateLimitedProductService = {
  getProductsByCategory,
  getProductByNameOrAuthorName,
  getProductsBySupplierIdAndCategoryName,
  getFlashSaleProducts,
  getNewestProducts
};

export default rateLimitedProductService;