import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { UpdateUserDTO, UserResponse } from "../../types/user";

const API_BASE = "http://localhost:9090/vuvisa/api/v1";

export const fetchUserDetail = createAsyncThunk<UserResponse>(
    "user/fetchUserDetail",
    async (_, { rejectWithValue }) => {   
      try {
        const response = await apiClient.get<any>(`${API_BASE}/users/myinfor`);
        return response.data.result;
      } catch (error: any) {
        return rejectWithValue(error.response?.data || "Lấy thông tin người dùng thất bại!");
      }
    }
  );

  // Thunk để cập nhật thông tin người dùng
  export const updateUserDetail = createAsyncThunk<UserResponse,UpdateUserDTO, { rejectValue: string }>("user/updateUserDetail", async (updateUserDTO, { getState, rejectWithValue }) => {
  try {

    const state: any = getState();
    const userId = state.user.user?.id;

    if (!userId) {
        throw new Error("User ID not found in Redux store!");
    }

    const formData = new FormData();

    // Thêm các trường vào FormData
    formData.append("email", updateUserDTO.email || "");
    formData.append("full_name", updateUserDTO.full_name || "");
    formData.append("phone_number", updateUserDTO.phone_number || "");
    formData.append("address", updateUserDTO.address || "");
    formData.append("date_of_birth", updateUserDTO.date_of_birth || "");

    // Nếu có avatar, thêm vào FormData
    if (updateUserDTO.avatar) {
      formData.append("avatar", updateUserDTO.avatar);
    }

    // Gửi yêu cầu cập nhật thông tin người dùng
    const response = await apiClient.put(`${API_BASE}/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.result;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || "Cập nhật thông tin người dùng thất bại!");
  }
});
  
  const userSlice = createSlice({
    name: "user",
    initialState: {
      user: null as UserResponse | null,
      loading: false,
      error: null as string | null,
    },
    reducers: {
      clearUser: (state) => {
        state.user = null;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchUserDetail.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchUserDetail.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload;
        })
        .addCase(fetchUserDetail.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })

        // Xử lý updateUserDetail
        .addCase(updateUserDetail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateUserDetail.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        })
        .addCase(updateUserDetail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;