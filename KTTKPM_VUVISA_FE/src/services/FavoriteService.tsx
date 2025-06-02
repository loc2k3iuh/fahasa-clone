import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

export interface FavoriteRequest {
  userId: number;
  productId: number;
}

export interface FavoriteResponse {
  id: number;
  userId: number;
  productId: number;
  product?: any;
  createdAt?: string;
}

const API_BASE = `${API_BASE_URL}/favorites`;

const favoriteService = {
  // Thêm sản phẩm vào danh sách yêu thích
  addFavorite: async (request: FavoriteRequest): Promise<FavoriteResponse> => {
    try {
      const response = await axios.post(`${API_BASE}`, request);
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw new Error('Failed to add product to favorites');
    }
  },

  // Xóa sản phẩm khỏi danh sách yêu thích
  removeFavorite: async (userId: number, productId: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`${API_BASE}/${userId}/${productId}`);
      return response.data.removed;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw new Error('Failed to remove product from favorites');
    }
  },

  // Kiểm tra sản phẩm có trong danh sách yêu thích không
  checkFavorite: async (userId: number, productId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE}/check/${userId}/${productId}`);
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  // Lấy danh sách yêu thích của người dùng
  getUserFavorites: async (userId: number): Promise<FavoriteResponse[]> => {
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw new Error('Failed to get user favorites');
    }
  },

  // Lấy danh sách sản phẩm yêu thích của người dùng
  getUserFavoritedProducts: async (userId: number): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}/products`);
      return response.data;
    } catch (error) {
      console.error('Error getting user favorited products:', error);
      throw new Error('Failed to get user favorited products');
    }
  },

  // Đếm số lượng yêu thích của sản phẩm
  countProductFavorites: async (productId: number): Promise<number> => {
    try {
      const response = await axios.get(`${API_BASE}/count/${productId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error counting product favorites:', error);
      return 0;
    }
  }
};

export default favoriteService;