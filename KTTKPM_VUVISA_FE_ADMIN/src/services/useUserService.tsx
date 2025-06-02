import { useCallback } from 'react';
import { RegisterDTO, LoginDTO, UpdateUserDTO, UserResponse, LoginResponse, UserListResponse, ChangePasswordDTO, ResetPasswordDTO, LogoutDTO, FacebookUserRequest, SendMailResetPasswordDTO } from "../types/user";
import apiClient from "./apiClient";
import API_BASE_URL from '../config/apiConfig';

const API_BASE = `${API_BASE_URL}`;

export const useUserService = () => {

  const register = useCallback(async (registerDTO: RegisterDTO): Promise<any> => {
    try {
      await apiClient.post(`${API_BASE}/users/register`, registerDTO);
      return;
    } catch (error: any) {
      throw error.response?.data || "Đăng ký thất bại!";
    }
  }, []);

  const login = useCallback(async (loginDTO: LoginDTO): Promise<any> => {
    try {
      const response = await apiClient.post<LoginResponse>(`${API_BASE}/users/auth/login`, loginDTO);
      return {
        accessToken: response.data.result.token,
      };
    } catch (error: any) {
      throw error.response?.data || "Đăng nhập thất bại!";
    }
  }, []);

  const loginTemporarily = useCallback(async (loginDTO: LoginDTO): Promise<any> => {
    try {
      const response = await apiClient.post<LoginResponse>(`${API_BASE}/users/auth/login-temporarily`, loginDTO);
      return {
        accessToken: response.data.result.token,
      };
    } catch (error: any) {
      throw error.response?.data || "Đăng nhập thất bại!";
    }
  }, []);

  const logout = useCallback(async (logoutDTO: LogoutDTO): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/users/auth/logout`, logoutDTO);
    } catch (error: any) {
      throw error.response?.data || "Đăng xuất thất bại!";
    }
  }, []);

  const getUserDetail = useCallback(async (): Promise<UserResponse> => {
    try {
      const response = await apiClient.get<any>(`${API_BASE}/users/myinfor`);
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || "Lấy thông tin người dùng thất bại!";
    }
  }, []);

  const getOnlineUsers = useCallback(async (): Promise<UserResponse[]> => {
    try {
      const response = await apiClient.get<any>(`${API_BASE}/users/online-users`);
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || "Lấy thông tin người dùng thất bại!";
    }
  }, []);




  const updateUserDetail = useCallback(async (userId: string, updateUserDTO: UpdateUserDTO): Promise<UserResponse> => {
    try {

      const formData = new FormData();
      formData.append("fullName", updateUserDTO.full_name || "");
      formData.append("phoneNumber", updateUserDTO.phone_number || "");
      formData.append("address", updateUserDTO.address || "");
      formData.append("dateOfBirth", updateUserDTO.date_of_birth || "");
      if (updateUserDTO.avatar) {
        formData.append("file", updateUserDTO.avatar);
      }

      const response = await apiClient.put(`${API_BASE}/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      removeUserFromLocalStorage();
      const userResponse: UserResponse = response.data.result;
      saveUserResponseToLocalStorage(userResponse);
      return userResponse;
    } catch (error: any) {
      console.error("Error during user update:", error);
      throw error.response?.data || "Cập nhật thất bại!";
    }
  }, []);

  const changePassword = useCallback(async (userid: string, changePasswordDTO: ChangePasswordDTO): Promise<any> => {
    try {
      const response = await apiClient.post(`${API_BASE}/users/auth/change-password/${userid}`, changePasswordDTO);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Đổi mật khẩu thất bại!";
    }
  }, []);

  const getAllUsers = useCallback(async (
    page: number = 0,
    limit: number = 10,
    keyword?: string,
    state?: boolean
  ): Promise<UserListResponse> => {
    try {
      const params: any = { page, limit };
      if (keyword) params.keyword = keyword;
      if (state !== undefined) params.state = state;

      const response = await apiClient.get(`${API_BASE}/users`, { params });
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || "Lấy danh sách người dùng thất bại!";
    }
  }, []);

  const saveUserResponseToLocalStorage = (userResponse: UserResponse): void => {
    try {
      localStorage.setItem("user", JSON.stringify(userResponse));
    } catch (error) {
      console.error("Error saving user response:", error);
    }
  };

  const getUserResponseFromLocalStorage = (): UserResponse | null => {
    try {
      const userResponseJSON = localStorage.getItem("user");
      return userResponseJSON ? JSON.parse(userResponseJSON) as UserResponse : null;
    } catch (error) {
      console.error("Error retrieving user response:", error);
      return null;
    }
  };

  const removeUserFromLocalStorage = (): void => {
    try {
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  };

  const inactivateUser = useCallback(async (userId: number): Promise<UserResponse> => {
    try {
      // Gọi API để vô hiệu hóa tài khoản
      const response = await apiClient.post(`${API_BASE}/users/inactivate/${userId}`);



      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || "Không thể thay đổi trạng thái hoạt động của người dùng!";
    }
  }, []);

  const sendResetPasswordEmail = useCallback(async (data: SendMailResetPasswordDTO): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/users/auth/forgot-password`, data);
      return;
    } catch (error: any) {
      throw error.response?.data || "Không thể gửi email khôi phục!";
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordDTO): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/users/auth/reset-password`, data);
    } catch (error: any) {
      throw error.response?.data || "Không thể đổi mật khẩu!";
    }
  }, []);

  const outboundAuthenticationUser = useCallback(async (code: string): Promise<any> => {
    try {
      const response = await apiClient.post(`${API_BASE}/users/auth/outbound-google/authentication?code=${code}`);
      return {
        accessToken: response.data.result.token,
      };
    } catch (error: any) {
      throw error.response?.data || "Không thể xác thực người dùng!";
    }
  }, []);

  const getTotalUserCount = useCallback(async (): Promise<number> => {
    try {
      const response = await apiClient.get(`${API_BASE}/users/count`);
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || "Failed to fetch total user count!";

    }
  }, []);

  // Facebook authentication
  const facebookAuthenticationUser = useCallback(async (facebookUserRequest: FacebookUserRequest): Promise<any> => {
    try {
      const response = await apiClient.post(`${API_BASE}/users/auth/outbound-facebook/authentication`, facebookUserRequest);
      return {
        accessToken: response.data.result.token,
      };
    } catch (error: any) {
      throw error.response?.data || "Không thể xác thực người dùng Facebook!";
    }
  }, []);

  return {
    register,
    login,
    logout,
    getOnlineUsers,
    getUserDetail,
    updateUserDetail,
    changePassword,
    getAllUsers,
    inactivateUser,
    sendResetPasswordEmail,
    resetPassword,
    saveUserResponseToLocalStorage,
    getUserResponseFromLocalStorage,
    removeUserFromLocalStorage,
    outboundAuthenticationUser,
    loginTemporarily,
    getTotalUserCount,
    facebookAuthenticationUser
  };
};