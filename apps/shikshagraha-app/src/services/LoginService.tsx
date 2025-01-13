import axios from 'axios';
interface LoginParams {
  username: string;
  password: string;
}
export const getToken = async ({ username, password }: LoginParams) => {
  const data = new URLSearchParams({
    client_id: `${process.env.NEXT_PUBLIC_CLIENT_ID}`,
    client_secret: `${process.env.NEXT_PUBLIC_CLIENT_SECRET}`,
    grant_type: `${process.env.NEXT_PUBLIC_GRANT_TYPE}`,
    username: username,
    password: password,
  });

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_PATH}`,
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response?.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data?.error_description;
  }
};
