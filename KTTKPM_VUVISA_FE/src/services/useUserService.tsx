import { useCallback, useEffect } from 'react';
import { RegisterDTO, LoginDTO, UpdateUserDTO, UserResponse, LoginResponse, UserListResponse, ChangePasswordDTO, ResetPasswordDTO, LogoutDTO, FacebookUserRequest, RegisterTokenRequest, ResendConfirmationRequest, SendMailResetPasswordDTO } from "../types/user";
import apiClient from "./apiService";
import API_BASE_URL from '../config/apiConfig';

const API_BASE = `${API_BASE_URL}`;

export const useUserService = () => {

  const register = useCallback(async (registerDTO: RegisterDTO): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("username", registerDTO.username || "");
      formData.append("email", registerDTO.email || "");
      formData.append("password", registerDTO.password || "");
      formData.append("retypePassword", registerDTO.retype_password || "");
      formData.append("fullName", registerDTO.full_name || "");
      if (registerDTO.avatar) {
        formData.append("file", registerDTO.avatar);
      }

      await apiClient.post(`${API_BASE}/users/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
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
      throw error.data?.code || "Đăng nhập thất bại!";
    }
  }, []);

  const loginTemporarily = useCallback(async (loginDTO: LoginDTO): Promise<any> => {
    try {
      const response = await apiClient.post<LoginResponse>(`${API_BASE}/users/auth/login-temporarily`, loginDTO);
      return {
        accessToken: response.data.result.token,
      };
    } catch (error: any) {
      debugger
      throw error.data?.code || "Đăng nhập thất bại!";
    }
  }, []);

  const logout = useCallback(async (logoutDTO: LogoutDTO): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/users/auth/logout`, logoutDTO);
    } catch (error: any) {
      throw error.response?.data || "Đăng xuất thất bại!";
    }
  }, []);

  const confirmEmail = useCallback(async (registerTokenRequest: RegisterTokenRequest): Promise<UserResponse> => {
    try {
      const response = await apiClient.post(`${API_BASE}/users/confirm`, registerTokenRequest);
      const userResponse: UserResponse = response.data.result;
      return userResponse;
    } catch (error: any) {
      throw error.response?.data || "Xác nhận email thất bại!";
    }
  }, []);

  const resendConfirmEmail = useCallback(async (resendConfirmationRequest: ResendConfirmationRequest): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/users/resend-confirmation`, resendConfirmationRequest);
      return;
    } catch (error: any) {
      throw error.response?.data || "Xác nhận email thất bại!";
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


  const getOnlineAdmins = useCallback(async (): Promise<UserResponse[]> => {
    try {
      const response = await apiClient.get<any>(`${API_BASE}/users/online-admins`);
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
      const response = await apiClient.post(`${API_BASE}/users/inactivate/${userId}`);
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || "Không thể thay đổi trạng thái hoạt động của người dùng!";
    }
  }, []);

  const sendResetPasswordEmail = useCallback(async (sendMailResetPasswordDTO: SendMailResetPasswordDTO): Promise<void> => {
    try {
      await apiClient.post(`${API_BASE}/users/auth/forgot-password`, sendMailResetPasswordDTO);
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
    resendConfirmEmail,
    confirmEmail,
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
    facebookAuthenticationUser,
    loginTemporarily,
    getOnlineAdmins
  };
};
