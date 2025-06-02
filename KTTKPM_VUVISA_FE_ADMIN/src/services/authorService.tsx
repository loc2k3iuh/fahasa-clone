import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

interface Author {
    id: number;
    authorName: string;
    description: string;
    bookIds?: number[];
  }


interface PaginatedAuthors {
    content: Author[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export const getAuthors = async (page: number = 0, searchTerm: string = ''): Promise<PaginatedAuthors> => {
    try {
      const params: Record<string, any> = {
        page,
        size: 10 // Thêm size để phù hợp với backend (10 items/page)
      };
  
      // Thêm search term nếu có
      if (searchTerm.trim()) {
        // Kiểm tra nếu searchTerm là số (tìm theo ID)
        if (!isNaN(Number(searchTerm))) {
          params.id = searchTerm;
        } else {
          params.authorName = searchTerm;
        }
      }
  
      const response = await apiClient.get(`${API_BASE_URL}/authors`, { params });
      
      // Kiểm tra cấu trúc response phù hợp với backend
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
      console.error('Error fetching authors:', error);
      throw new Error('Failed to fetch authors');
    }
  };

export const createAuthor = async(authorData :{authorName : string; description : string}) : Promise<Author> =>{
    try {
        console.log('Creating author with:', authorData); 
        const response = await apiClient.post(`${API_BASE_URL}/authors/create`,authorData);
        return response.data.result;
    } catch (error) {
        console.error("Error create author:",error);
        throw error;
    }
};

export const updateAuthor = async(id : number, authorData : {authorName : string; description : string}) : Promise<Author> =>{
    try {
        const response= await apiClient.put(`${API_BASE_URL}/authors/${id}`,authorData);
        return response.data.result;
    } catch (error) {
        console.error("Error update author:",error);
        throw error;
    }
};

export const deleteAuthor = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${API_BASE_URL}/authors/${id}`);
    } catch (error) {
      console.error('Error deleting author:', error);
      throw error;
    }
  };