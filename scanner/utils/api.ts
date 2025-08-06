import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '../constants/api';
import * as SecureStore from 'expo-secure-store';

const DEFAULT_TIMEOUT = 60000;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.timeout = DEFAULT_TIMEOUT;

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  const session = await SecureStore.getItemAsync('session');
  const token = session ? JSON.parse(session)?.token : null;

  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use((res) => res, async (error: AxiosError) => {
  if (
    error.response?.status === 401 &&
    error.request &&
    !error.config?.url?.includes('/signin')
  ) {
    await SecureStore.deleteItemAsync('session');
    // TODO: Handle refresh token
  }
  return Promise.reject(error); 
});

export default api;
