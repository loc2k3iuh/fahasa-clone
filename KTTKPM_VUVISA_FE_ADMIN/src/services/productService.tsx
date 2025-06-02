import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

const API_URL = `${API_BASE_URL}`;

export interface CategoryCount {
    categoryName: string;
    productCount: number;
}

export interface CategoryTypeCount {
    categoryType: string;
    productCount: number;
}

export const productService = {
    searchProducts: async (query: string) => {
        try {
            const response = await apiClient.get(`${API_URL}/products/search?name=${query}`);
            const data = await response.data;

            const mappedProducts = data.map((item: any) => ({
                id: item.id,
                productName: item.productName,
                price: item.price,
                quantity: item.stockQuantity,
                total: item.price,
                imageUrl: item.imageUrl
            }));

            return mappedProducts;
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    },

    getProductById: async (productId: number) => {
        try {
            const response = await apiClient.get(`${API_URL}/products/${productId}`);
            const data = response.data;

            // Map the API response to the expected Product format
            return {
                id: data.id,
                productName: data.productName,
                price: data.price,
                quantity: data.stockQuantity,
                total: data.price,
                imageUrl: data.imageUrl
            };
        } catch (error) {
            console.error(`Error fetching product with ID ${productId}:`, error);
            return null;
        }
    }
};

export const getTotalProductCount = async (): Promise<number> => {
    try {
        const response = await apiClient.get(`${API_URL}/products/count`);
        return response.data.result;
    } catch (error: any) {
        throw error.response?.data || "Failed to fetch total products count!";
    }
};

export const getProductCountByCategory = async (): Promise<CategoryCount[]> => {
    try {
        const response = await apiClient.get(`${API_URL}/products/count-by-category`);
        return response.data.result;
    } catch (error: any) {
        console.error("Failed to fetch product count by category:", error);
        throw error.response?.data || "Failed to fetch product count by category!";
    }
};

export const getProductCountByCategoryType = async (): Promise<CategoryTypeCount[]> => {
    try {
        const response = await apiClient.get(`${API_URL}/products/count-by-category-type`);
        return response.data.result;
    } catch (error: any) {
        console.error("Failed to fetch product count by category type:", error);
        throw error.response?.data || "Failed to fetch product count by category type!";
    }
};