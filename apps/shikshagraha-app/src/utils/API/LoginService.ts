// import { get, post } from "./RestClient";
import axios from 'axios';
import { post } from './RestClient';
import { API_ENDPOINTS } from './EndUrls';

interface LoginParams {
  username: string;
  password: string;
}

interface RefreshParams {
  refresh_token: string;
}

export const login = async ({
  username,
  password,
}: LoginParams): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.accountLogin;

  try {
    const response = await post(apiUrl, { username, password });
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    throw error;
  }
};

export const refresh = async ({
  refresh_token,
}: RefreshParams): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.authRefresh;
  try {
    const response = await post(apiUrl, { refresh_token });
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    throw error;
  }
};
export const logout = async (refreshToken: string): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.authLogout;
  try {
    const response = await post(apiUrl, { refresh_token: refreshToken });
    return response;
  } catch (error) {
    console.error('error in logout', error);
    throw error;
  }
};

export const getUserId = async (): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.userAuth;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token not found');
    }

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response?.data?.result;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      // Clear all localStorage data
      localStorage.clear();
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    console.error('Error in fetching user details', error);
    throw error;
  }
};
export const resetPassword = async (newPassword: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.resetPassword;
  try {
    const response = await post(apiUrl, { newPassword });
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};
