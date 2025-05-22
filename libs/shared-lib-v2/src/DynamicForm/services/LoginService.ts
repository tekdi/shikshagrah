import axios from 'axios';
import { post } from './RestClient';
import API_ENDPOINTS from '../utils/API/APIEndpoints';

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
  const apiUrl: string = API_ENDPOINTS.accountLogin

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
  const apiUrl: string = API_ENDPOINTS.authRefresh
  try {
    const response = await post(apiUrl, { refresh_token });
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    throw error;
  }
};

export const logout = async (refreshToken: string): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.authLogout
  try {
    const response = await post(apiUrl, { refresh_token: refreshToken });
    return response;
  } catch (error) {
    console.error('error in logout', error);
    throw error;
  }
};

export const resetPassword = async (
  newPassword: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.resetPassword
  try {
    const response = await post(apiUrl, { newPassword });
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};

export const forgotPasswordAPI = async (
  newPassword: any  , token: any): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.forgotPassword
  try {
    const response = await post(apiUrl, { newPassword, token });
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};


export const resetPasswordLink = async (
  username: any , ): Promise<any> => {
  const apiUrl: string = API_ENDPOINTS.passwordResetLink
  try {
    let redirectUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL  || ''
    if(redirectUrl === ''  && typeof window !== 'undefined' ){
      redirectUrl = window.location.origin
    }
    const response = await post(apiUrl, { username  , redirectUrl});
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};



// export const successfulNotification = async (
//   isQueue:boolean,
//   context: any,
//   key: any,
//   email: any
// ): Promise<any> => {
//   const apiUrl: string =   `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/notification/send`;
//   try {
//     const response = await post(apiUrl, { isQueue, context, key, email });
//     return response?.data;
//   } catch (error) {
//     console.error('error in reset', error);
//     throw error;
//   }
// };




