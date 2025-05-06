// components/ForgotPassword.tsx
'use client';
import React from 'react';

import { useRouter } from 'next/navigation';

import PasswordReset from '../../Components/PasswordReset';
const ResetPassword = () => {
  const router = useRouter();

  return (
    <>
      <PasswordReset name={'Reset Password'} />
    </>
  );
};

export default ResetPassword;
