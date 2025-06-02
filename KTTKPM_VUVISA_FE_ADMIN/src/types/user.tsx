export interface RegisterDTO {
  username?: string | null;
  full_name: string | null;
  email?: string | null;
  avatar?: File | null;
}

export interface FacebookUserRequest {
  name: string;
  email: string;
  picture: string;
}

export interface UpdateUserDTO {
  username?: string | null;
  email?: string | null;
  full_name: string | null;
  phone_number?: string;
  address?: string | null;
  date_of_birth?: string | null; // Nếu bạn muốn format là ngày, có thể dùng Date
  avatar?: File | null;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface LogoutDTO {
  token: string;
}

export interface UserIdDTO {
  id: string;
}


export interface LoginResponse {
  code: number;
  message: string;
  result: {
    authenticated: boolean;
    token: string;
  };
}

export interface Role {
  name: string;
  description: string;
  permissions: any[];  // Có thể thay đổi thành một kiểu dữ liệu cụ thể nếu bạn có thông tin về permissions
}

export interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  address: string | null;
  full_name: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  updated_date: string | null;
  is_active: boolean | null;
  avatar_url: string | null;
  message: string | null;
  roles: Role[];
  status: string | null;
  created_date: string | null;
}

export interface UserListResponse {
  users: UserResponse[];
  totalPages: number;
}

export interface ChangePasswordDTO {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordDTO {
  token: string;
  new_password: string;
  confirm_password: string;
}


export interface SendMailResetPasswordDTO {
  email: string;
  is_admin: boolean;
}


export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  authenticated: boolean;
  token: string;
}

