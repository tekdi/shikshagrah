import axios from 'axios';
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

export const authenticateUser = async ({ token }: AuthParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/user/auth`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`, // Token passed as a parameter
      },
    });
    return response?.data;
  } catch (error) {
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

    return response?.data;
  } catch (error) {
    console.error('Error fetching tenant data:', error);
    return error;
  }
};
