/**
 * Axios API client with interceptors
 * Handles auth, error formatting, and request/response processing
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config/env';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null;

      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const apiError = formatApiError(error);
      return Promise.reject(apiError);
    }
  );

  return client;
};

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

const formatApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as { message?: string; error?: string };
    return {
      message: data.message || data.error || 'An error occurred',
      code: error.code || 'UNKNOWN',
      status: error.response.status,
    };
  }

  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
      status: 0,
    };
  }

  return {
    message: error.message || 'Unknown error',
    code: 'UNKNOWN',
    status: 0,
  };
};

export const apiClient = createApiClient();
