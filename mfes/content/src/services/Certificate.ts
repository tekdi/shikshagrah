import axios from 'axios';

export const getUserCertificateStatus = async ({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/user_certificate/status/get`,
    {
      userId,
      courseId,
    },
    {
      headers: {
        tenantId: localStorage.getItem('tenantId') ?? '',
        Authorization: `Bearer ${localStorage.getItem('accToken') ?? ''}`,
      },
    }
  );
  return response?.data ?? {};
};

export const createUserCertificateStatus = async ({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage in server environment');
  }
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/user_certificate/status/create`,
    {
      userId,
      courseId,
    },
    {
      headers: {
        tenantId: localStorage.getItem('tenantId') ?? '8',
        Authorization: `Bearer ${localStorage.getItem('accToken') ?? ''}`,
      },
    }
  );
  return response?.data ?? {};
};

export const getUserCertificates = async ({
  userId,
  limit = 2,
  offset = 0,
}: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<any> => {
  try {
    // Ensure the environment variable is defined
    const searchApiUrl = process.env.NEXT_PUBLIC_MIDDLEWARE_URL;
    if (!searchApiUrl) {
      throw new Error('Search API URL environment variable is not configured');
    }
    // Axios request configuration
    const data = {
      filters: {
        userId: [userId],
      },
      limit,
      offset,
    };

    // Execute the request
    const response = await axios.post(
      `${searchApiUrl}/tracking/user_certificate/status/search`,
      data
    );
    const res = response?.data;

    return res;
  } catch (error) {
    console.error('Error in getUserCertificates:', error);
    throw error;
  }
};

export const courseUpdate = async ({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage in server environment');
  }
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/user_certificate/status/update`,
    {
      userId,
      courseId,
    },
    {
      headers: {
        tenantId: localStorage.getItem('tenantId') ?? '',
        Authorization: `Bearer ${localStorage.getItem('accToken') ?? ''}`,
      },
    }
  );
  return response?.data ?? {};
};

export const courseIssue = async (data: {
  userId: string;
  courseId: string;
  [key: string]: any;
}) => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage in server environment');
  }
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/certificate/issue`,
    data,
    {
      headers: {
        tenantId: localStorage.getItem('tenantId') ?? '',
        Authorization: `Bearer ${localStorage.getItem('accToken') ?? ''}`,
      },
    }
  );
  return response?.data ?? {};
};
export const getUserByToken = async (token: string): Promise<any> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/auth`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response?.data?.result;
  } catch (error) {
    console.error('error in fetching user details', error);
    throw error;
  }
};

export const showCertificate = async ({
  credentialId,
  templateId,
}: {
  credentialId: string;
  templateId: string;
}) => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage in a server environment');
  }
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/tracking/certificate/render`,
    {
      credentialId,
      templateId,
    },
    {
      headers: {
        tenantId: localStorage.getItem('tenantId') ?? '',
        Authorization: `Bearer ${localStorage.getItem('accToken') ?? ''}`,
      },
    }
  );
  return response?.data ?? {};
};
