import { useState } from 'react';
import apiClient from './apiService';
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu
export interface AddressRequest {
    phoneNumber: string;
    street: string;
    city: string;
    district: string;
    ward: string;
    detailAddress: string;
    zip?: string; // Optional
    userId: number;
}

export interface AddressResponse {
    id: number;
    phoneNumber: string;
    street: string;
    city: string;
    district: string;
    ward: string;
    detailAddress: string;
    zip?: string;
}

export const useAddressService = () => {
    const [loading, setLoading] = useState(false);

    // Thêm địa chỉ mới
    const addAddress = async (userId: number, addressData: AddressRequest): Promise<AddressResponse> => {
        setLoading(true);
        try {
            const response = await apiClient.post(
                `/addresses/users/${userId}`,
                addressData
            );
            toast.success("Thêm địa chỉ thành công");
            return response.data.result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể thêm địa chỉ";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách địa chỉ của người dùng
    const getAddresses = async (userId: number): Promise<AddressResponse[]> => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/addresses/users/${userId}`
            );
            return response.data.result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể lấy danh sách địa chỉ";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    // Lấy địa chỉ theo ID
    const getAddressById = async (addressId: number): Promise<AddressResponse> => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/addresses/${addressId}`
            );
            return response.data.result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể lấy thông tin địa chỉ";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật địa chỉ
    const updateAddress = async (addressId: number, addressData: AddressRequest): Promise<AddressResponse> => {
        setLoading(true);
        try {
            const response = await apiClient.put(
                `/addresses/${addressId}`,
                addressData
            );
            toast.success("Cập nhật địa chỉ thành công");
            return response.data.result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể cập nhật địa chỉ";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Xóa địa chỉ
    const deleteAddress = async (addressId: number): Promise<void> => {
        setLoading(true);
        try {
            await apiClient.delete(
                `/addresses/${addressId}`
            );
            toast.success("Xóa địa chỉ thành công");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Không thể xóa địa chỉ";
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        addAddress,
        getAddresses,
        getAddressById,
        updateAddress,
        deleteAddress
    };
};
