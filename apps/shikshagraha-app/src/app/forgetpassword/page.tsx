// components/ForgotPassword.tsx
'use client';
import React from 'react';

import { useRouter } from 'next/navigation';
import PasswordReset from '../../Components/PasswordReset';

const ForgotPassword = () => {
  const router = useRouter();

  return (
    <>
      <PasswordReset name={'Forgot Password'} />
    </>
  );
};

export default ForgotPassword;
