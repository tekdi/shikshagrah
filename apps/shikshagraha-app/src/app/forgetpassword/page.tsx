'use client';
import React, { useState } from 'react';
import {
  Button,
  Typography,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { sendOtp } from '../../services/ProfileService';
import { verifyOtp } from '../../services/ForgetPasswordService';
import Link from 'next/link';
const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'input' | 'otp' | 'reset-password'>('input');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>(
    'email'
  );
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (step === 'reset-password') {
      setStep('otp');
    } else if (step === 'otp') {
      setStep('input');
    } else {
      router.back();
    }
  };

  const handleSendOtp = async () => {
    if (!contactValue.trim()) {
      setError(true);
      return;
    }
    setLoading(true);
    try {
      await sendOtp(contactValue, contactMethod);
      setStep('otp');
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 5) {
      setError(true);
      return;
    }
    setLoading(true);
    try {
      const success = await verifyOtp(contactValue, contactMethod, otp);
      if (success) {
        setStep('reset-password');
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword || newPassword.length < 6) {
      setError(true);
      return;
    }
    console.log('Password Reset Successful:', newPassword);
    router.push('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: '#f5f5f5',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#FFC857',
          p: 2,
          borderBottom: '2px solid #FFC857',
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Button onClick={handleBack} sx={{ color: '#024F9D' }}>
              <ArrowBackIcon />
            </Button>
          </Grid>
          <Grid item xs={8} textAlign="center">
            <Typography
              variant="h6"
              sx={{ color: '#024F9D', fontWeight: 'bold' }}
            >
              {step === 'input'
                ? 'Forgot Password'
                : step === 'otp'
                ? 'Enter OTP'
                : 'Reset Password'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
          bgcolor: '#ffffff',
          p: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Link
            href={`${process.env.NEXT_PUBLIC_BASE_URL}/recover/identify/account`}
            passHref
          >
            Password
          </Link>
        </Box>
      </Box>

      {/* <Box sx={{ p: 3, maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
        {step === 'input' && (
          <>
            <Typography
              variant="h5"
              sx={{ color: '#024F9D', fontWeight: 'bold', mb: 1 }}
            >
              Reset Your Password
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
              Please enter your email address or phone number to receive an OTP.
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Contact Method</InputLabel>
              <Select
                value={contactMethod}
                onChange={(e) =>
                  setContactMethod(e.target.value as 'email' | 'phone')
                }
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={contactMethod === 'email' ? 'Email' : 'Phone'}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleSendOtp}
              fullWidth
              sx={{
                bgcolor: '#024F9D',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  bgcolor: '#FFC857',
                },
                width: '50%', // Ensures it spans the width of its container
              }}
              disabled={loading || !contactValue.trim()}
            >
              {loading ? 'Sending OTP...' : 'Confirm'}
            </Button>
          </>
        )}
        {step === 'otp' && (
          <>
            <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
              Please enter OTP received.
            </Typography>
            <TextField
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              fullWidth
              sx={{
                bgcolor: '#024F9D',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  bgcolor: '#FFC857',
                },
                width: '50%', // Ensures it spans the width of its container
              }}
              disabled={otp.length < 5}
            >
              Verify OTP
            </Button>
          </>
        )}
        {step === 'reset-password' && (
          <>
            <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
              Please enter the new password for reset.
            </Typography>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleResetPassword}
              fullWidth
              sx={{
                bgcolor: '#024F9D',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  bgcolor: '#FFC857',
                },
                width: '50%', // Ensures it spans the width of its container
              }}
            >
              Confirm
            </Button>
          </>
        )}
      </Box>  */}

      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid #FFC857',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Typography variant="body2">
          Remembered your password?{' '}
          <Button
            variant="text"
            onClick={() => router.push('/login')}
            sx={{ color: '#024F9D', fontWeight: 'bold' }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
