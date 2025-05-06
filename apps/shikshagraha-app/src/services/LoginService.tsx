import axios from 'axios';
import { useRouter } from 'next/router';
interface LoginParams {
  username: string;
  password: string;
}
interface AuthParams {
  token: string;
}
interface TenantParams {
  tenantId: string;
  token: string;
}
interface AuthParamsProfile {
  token: string;
  userId: string;
  tenantId: string;
}
export const signin = async ({
  username,
  password,
}: LoginParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/account/login`;

  try {
    const response = await axios.post(apiUrl, {
      username: username,
      password: password,
    });
    return response?.data;
  } catch (error) {
    console.error('error in login', error);
    // throw error;
    return error;
  }
};

export const authenticateLoginUser = async ({
  token,
}: AuthParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/auth`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`, // Token passed as a parameter
      },
    });
    return response?.data;
  } catch (error) {
    debugger;
    console.error('error in login', error);
    // throw error;
    return error;
  }
};

export const authenticateUser = async ({
  token,
  userId,
  tenantId,
}: AuthParamsProfile): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/read/${userId}?fieldvalue=true`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: 'ebae40d1-b78a-4f73-8756-df5e4b060436', // Token passed as a parameter
      },
    });
    if(response.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE || '';
    }

    return response?.data;
  } catch (error:any) {
    if(error.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE || '';
    }
    console.error('error in login', error);
    // throw error;
    return error;
  }
};

export const fetchTenantData = async ({
  tenantId,
  token,
}: TenantParams): Promise<any> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/tenant/read`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { tenantId }, // Passing tenantId as a query parameter
    });

    if(response.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE || '';
    }

    return response?.data;
  } catch (error:any) {
    if(error.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE || '';
    }
    console.error('Error fetching tenant data:', error);
    return error;
  }
};
export const schemaRead = async (): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/form/read?context=USERS&contextType=LEARNER`;
  console.log(apiUrl);
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        tenantId: 'ebae40d1-b78a-4f73-8756-df5e4b060436',
      },
    });
    if(response.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE || '';
    }
    return response?.data;
  } catch (error:any) {
    if(error.status == 401) {
      localStorage.removeItem('accToken');
      localStorage.clear();
      window.location.href = process.env.NEXT_PUBLIC_LOGINPAGE || '';
    }
    console.error('error in login', error);
    // throw error;
    return error;
  }
};

export const registerUserService = async (requestData: any) => {
  const modifiedRequestData = requestData?.requestData || requestData;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_NEW_REGISTRATION}`,
      modifiedRequestData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error submitting registration data:', error);
      return error.response;
    } else {
      // handle other types of errors
    }
  }
};

export const fetchContentOnUdise = async (udise: string): Promise<any> => {
  console.log(udise);
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL_ENTITY}/entities/details/${udise}`;
  try {
    const response = await axios.get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('error in fetching user details', error);
    return error;
  }
};
export const sendOtp = async (requestData: any) => {
  // const modifiedRequestData = requestData?.requestData || requestData;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/send-otp`,
      requestData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error submitting registration data:', error);
      return error.response;
    } else {
      // handle other types of errors
    }
  }
};

export const readIndividualTenantData = async (tenantId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
  }

  const apiUrl = `${baseUrl}/interface/v1/user/tenant/read/${tenantId}`;

  try {
    const { data } = await axios.get(apiUrl);
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        'Error fetching tenant data:',
        err.response?.status,
        err.response?.data
      );
      throw new Error(`API error: ${err.response?.status}`);
    }
    console.error('Unexpected error:', err);
    throw err;
  }
};
export const verifyOtpService = async (requestData: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/verify-otp`,
      requestData
    );
    return response?.data; // Return response to be handled in the component
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error submitting registration data:', error);
      return error.response;
    } else {
      // handle other types of errors
    }
  }
};
export const resetPassword = async (payload: {
  newPassword: string;
  token: string;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/forgot-password`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error during resetPassword API call:', error);
    throw error;
  }
};
