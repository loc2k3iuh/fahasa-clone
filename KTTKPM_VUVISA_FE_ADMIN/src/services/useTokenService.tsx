// === useTokenService.ts ===
import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'access_token';

export const useTokenService = () => {
  const getAccessToken = (): string => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
  };

  const setAccessToken = (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  };


  const removeToken = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

  };

  const getUserId = (): number => {
    const token = getAccessToken();
    console.log('Token:', token);
    try {
      const userObject: any = jwtDecode(token);
      return parseInt(userObject?.userId ?? 0);
    } catch (error) {
      console.error('Error decoding token:', error);
      return 0;
    }
  };

  const isTokenExpired = (): boolean => {
    const token = getAccessToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded?.exp;
      return Math.floor(Date.now() / 1000) >= exp;
    } catch (error) {
      return true;
    }
  };

  const getTokenExpireTime = (): number => {
    const token = getAccessToken();
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000;
    } catch {
      return 0;
    }
  };

  const isTokenExpiringSoon = (thresholdSeconds = 300): boolean => {
    const expireTime = getTokenExpireTime();
    return expireTime - Date.now() <= thresholdSeconds * 1000;
  };

  return {
    getAccessToken,
    setAccessToken,
    removeToken,
    getUserId,
    isTokenExpired,
    getTokenExpireTime,
    isTokenExpiringSoon,
  };
};