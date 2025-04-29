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
export const schemaRead = async (): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/interface/v1/form/read?context=USERS&contextType=LEARNER`;
  console.log(apiUrl);
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        tenantId: 'ebae40d1-b78a-4f73-8756-df5e4b060436',
      },
    });
    return response?.data;
  } catch (error) {
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
    throw error;
  }
};
