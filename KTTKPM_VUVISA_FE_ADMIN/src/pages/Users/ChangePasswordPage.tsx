import React, { useState, useEffect } from "react";
import { ChangePasswordDTO, UserResponse } from "../../types/user";
import { toast } from "sonner";
import { useUserService  } from "../../services/useUserService";
import { useTokenService } from "../../services/useTokenService";

import { useParams } from 'react-router-dom';


const ChangePassword: React.FC = () => {
  useEffect(() => {
    document.title = "Change Password";
  }, []);

  const { changePassword, removeUserFromLocalStorage, logout } = useUserService();
  const { removeToken, getAccessToken } = useTokenService();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { id } = useParams(); 

  const getUserResponseFromLocalStorage = (): UserResponse | null => {
    try {
      const userResponseJSON = localStorage.getItem("user");
      return userResponseJSON ? (JSON.parse(userResponseJSON) as UserResponse) : null;
    } catch (error) {
      console.error("Error retrieving user response:", error);
      return null;
    }
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setPasswordError("");
    return true;
  };
  
  const validateConfirmPassword = (confirm: string): boolean => {
    if (confirm.length < 6) {
      setConfirmPasswordError("Mật khẩu xác nhận phải có ít nhất 6 ký tự");
      return false;
    }
    if (confirm !== newPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const existingUser = getUserResponseFromLocalStorage();
    if (!existingUser?.username) {
      toast.error("Không tìm thấy tài khoản đăng nhập!");
      return;
    }

    if (!validatePassword(newPassword) || !validateConfirmPassword(confirmPassword)) {
      return;
    }

    const payload: ChangePasswordDTO = {
      old_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };

    try {
      if(!id){
        console.log("User ID is missing !");
        return;
      }
      const user = await changePassword(id , payload);
      console.log(user);
      const accessToken = getAccessToken(); // Lấy access token từ localStorage
  
      await logout({ token: accessToken}); // Gọi logout với đối tượng LogoutDTO
      removeToken(); // Xóa token khỏi localStorage
      removeUserFromLocalStorage();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Change password successful!");

      setTimeout(() => {
        window.location.href = "/admin/login"; // Chuyển hướng về trang đăng nhập
    }, 1000); // Chuyển hướng về trang đăng nhập
    } catch (error: any) {
      toast.error(error.message || "Error occurred while changing password!");
    }
  };

  return (
    <main className="bg-gray-900 min-h-screen p-6">
      <div className="p-4 mx-auto max-w-[--breakpoint-2xl] md:p-6 mb-15">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Change Password</h2>
          <nav>
            <ol className="flex items-center gap-1.5">
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-500"
                  href="/admin"
                >
                  Home
                  <svg className="stroke-current" width="17" height="16" viewBox="0 0 17 16" fill="none">
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
           
              <li className="text-[0.875rem] text-white/90">Edit User</li>
            </ol>
          </nav>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636] p-6"
        >
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 mt-1 text-gray-400 hover:text-gray-300"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={`mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border ${passwordError ? 'border-red-500' : 'border-gray-700'} rounded-lg pr-10`}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 mt-1 text-gray-400 hover:text-gray-300"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border ${confirmPasswordError ? 'border-red-500' : 'border-gray-700'} rounded-lg pr-10`}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 mt-1 text-gray-400 hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition duration-200 ease-in-out cursor-pointer"
              disabled={!currentPassword || !newPassword || !confirmPassword || !!passwordError || !!confirmPasswordError}
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ChangePassword;
