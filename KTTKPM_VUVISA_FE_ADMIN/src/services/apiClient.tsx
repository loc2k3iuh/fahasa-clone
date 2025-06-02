import axios from 'axios';
import { plainTokenService } from '../services/plainTokenService';
import API_BASE_URL from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  withCredentials: true, // Gửi cookie (chứa refresh token) theo request
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = plainTokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('http://localhost:9090/vuvisa/api/v1/users/auth/refresh-token', {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const newAccessToken = res?.data?.result?.token;
        if (!newAccessToken) {
          window.location.href = '/admin/login';
        }

        plainTokenService.setAccessToken(newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        plainTokenService.removeToken();
        window.location.href = '/admin/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
