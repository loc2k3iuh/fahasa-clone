import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserService } from "../services/useUserService";
import { useTokenService } from "../services/useTokenService";
import { plainTokenService } from "../services/plainTokenService";

interface AccountDisabledModalProps {
  onClose: () => void;
}

const AccountDisabledModal: React.FC<AccountDisabledModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { removeUserFromLocalStorage } = useUserService();
  const { removeToken } = useTokenService();

  const handleLogout = () => {
    // Xóa thông tin người dùng và token khỏi localStorage
    removeUserFromLocalStorage();
    removeToken();
    plainTokenService.removeToken();
    
    // Đóng modal
    onClose();
    
    // Điều hướng về trang đăng nhập
    navigate("/user/login");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center">
            <svg 
              className="w-16 h-16 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mt-4">Tài khoản đã bị vô hiệu hóa!</h2>
          <p className="text-gray-600 mt-2 mb-6">
            Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên. 
            Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm chi tiết.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium cursor-pointer"
          >
            Quay về trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDisabledModal;