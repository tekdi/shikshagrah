
import axios from 'axios';
export const verifyOtp = async (
  contactValue: string,
  contactMethod: 'email' | 'phone',
  otp: string
) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_VERIFY_OTP}`,
    {
      request: { key: contactValue, type: contactMethod, otp },
    }
  );
  return response.data.result.response === 'SUCCESS';
};

export const resetPassword = async (
  contactValue: string,
  newPassword: string
) => {
  return axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/password/reset`, {
    request: { key: contactValue, password: newPassword },
  });
};
