import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

export interface Publisher {
    id: number;
    publisherName: string;
    description: string;
}

interface PaginatedPublishers {
    content: Publisher[];
    totalPages: number;
    totalElements: number;
    number: number;
}

export const getPublishers = async (page: number = 0, searchTerm: string = ''): Promise<PaginatedPublishers> => {
    try {
        const params: Record<string, any> = {
            page,
            size: 10
        };

        if (searchTerm.trim()) {
            params.publisherName = searchTerm;
        }

        const response = await apiClient.get(`${API_BASE_URL}/publishers`, { params });

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
        console.error('Error fetching publishers:', error);
        throw new Error('Failed to fetch publishers');
    }
};

export const createPublisher = async (publisherData: { publisherName: string; description: string }): Promise<Publisher> => {
    try {
        const response = await apiClient.post(`${API_BASE_URL}/publishers/create`, publisherData);
        return response.data.result;
    } catch (error) {
        console.error("Error creating publisher:", error);
        throw error;
    }
};

export const updatePublisher = async (id: number, publisherData: { publisherName: string; description: string }): Promise<Publisher> => {
    try {
        const response = await apiClient.put(`${API_BASE_URL}/publishers/${id}`, publisherData);
        return response.data.result;
    } catch (error) {
        console.error("Error updating publisher:", error);
        throw error;
    }
};

export const deletePublisher = async (id: number): Promise<void> => {
    try {
        await apiClient.delete(`${API_BASE_URL}/publishers/${id}`);
    } catch (error) {
        console.error('Error deleting publisher:', error);
        throw error;
    }
};
