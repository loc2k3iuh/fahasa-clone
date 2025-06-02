import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiService";

const API_BASE = `${API_BASE_URL}`;

class ReviewService {
  /**
   * Create a new review.
   */
  async createReview(createReviewDTO: any): Promise<any> {
    try {
      const response = await apiClient.post(`${API_BASE}/reviews`, createReviewDTO);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to create review!";
    }
  }

  /**
   * Update an existing review.
   */
  async updateReview(id: number, updateReviewDTO: any): Promise<any> {
    try {
      const response = await apiClient.put(`${API_BASE}/reviews/${id}`, updateReviewDTO);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to update review!";
    }
  }

  /**
   * Delete a review by its ID.
   */
  async deleteReview(id: number): Promise<any> {
    try {
      const response = await apiClient.delete(`${API_BASE}/reviews/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to delete review!";
    }
  }

  /**
   * Get all reviews with pagination.
   */
  async getAllReviews(page: number = 0, size: number = 10): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/reviews`, {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve reviews!";
    }
  }

  /**
   * Get reviews filtered by User ID.
   */
  async getReviewsByUserId(userId: number): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/reviews/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve reviews by user!";
    }
  }

  /**
   * Get reviews filtered by Product ID.
   */
  async getReviewsByProductId(productId: number): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/reviews/product/${productId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve reviews by product!";
    }
  }
}

export default new ReviewService();