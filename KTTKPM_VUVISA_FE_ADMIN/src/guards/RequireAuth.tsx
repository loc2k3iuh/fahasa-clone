import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTokenService } from '../services/useTokenService';
import apiClient from '../services/apiClient'; // bạn cần gọi API để trigger interceptor
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isTokenExpired, getUserId } = useTokenService();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userId = getUserId();

      if (!isTokenExpired() && userId > 0) {
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        try {
          // Gửi 1 request dummy để trigger interceptor refresh
          await apiClient.get('/users/auth/ping'); // endpoint không cần quyền gì
          const refreshedUserId = getUserId();
          if (refreshedUserId > 0) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (err) {
          setIsAuthenticated(false);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkAuth();
  }, []);

  if (isChecking) return (
    <div className="flex items-center justify-center h-screen bg-white z-[100000]">
      <div className="text-center">
        <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin mb-4 mx-auto" />
        <p className="text-lg text-gray-700 font-medium">Verifying account...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/admin/unauthenticated" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
