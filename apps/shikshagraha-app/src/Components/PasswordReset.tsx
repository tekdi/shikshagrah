// components/ForgotPassword.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  sendOtp,
  verifyOtpService,
  resetPassword,
  sendForgetOtp,
} from '../services/LoginService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Visibility, VisibilityOff } from '@mui/icons-material';
const PasswordReset = ({ name }: { name: string }) => {
  const router = useRouter();
  const [step, setStep] = useState<'reset' | 'otp' | 'input'>('reset');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [formErrors, setFormErrors] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
  });
  const usernameRegex = /^[a-zA-Z0-9_]+$/; //add
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}"';<>?,./\\]).{8,}$/;
  const [timer, setTimer] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(605);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  // Calculate remaining time
  const remainingResendTime = lastResendTime
    ? Math.max(0, 30 - Math.floor((Date.now() - lastResendTime) / 1000))
    : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    let error = '';
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };
  // const getAuthPayload = () =>
  //   formData.email
  //     ? { email: formData.email, reason: 'forgot' }
  //     : { mobile: formData.mobile, reason: 'forgot' };

  const handleSendOtp = async () => {
    if (!formData?.identifier || !formData?.password) {
      setError('Please provide both email and password');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const isMobile = /^[6-9]\d{9}$/.test(formData.identifier);

      const otpPayload = {
        identifier: formData.identifier,
        password: formData.password,
        ...(isMobile && { phone_code: '+91' }),
      };

      console.log(otpPayload);
      const response = await sendForgetOtp(otpPayload);

      console.log(response);
      if (response?.responseCode === 'OK') {
        setStep('otp');
        setSecondsLeft(605);
      } else {
        setError(response?.params?.errmsg || 'Failed to send OTP');
        setShowError(true);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === 'otp' && (secondsLeft > 0 || timer > 0)) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [step, secondsLeft, timer]);

  const handleResendOtp = async () => {
    if (remainingResendTime > 0) return; // Prevent multiple clicks

    setLastResendTime(Date.now());

    try {
      const isMobile = /^[6-9]\d{9}$/.test(formData.identifier);
      const otpPayload = {
        identifier: formData.identifier,
        password: formData.password,
        ...(isMobile && { phone_code: '+91' }),
      };

      await sendForgetOtp(otpPayload);
      setSecondsLeft(600); // Reset expiration timer
    } catch (err) {
      setError('Failed to resend OTP');
      setShowError(true);
      setLastResendTime(null); // Reset on failure
    }
  };
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');

    if (!otpString) {
      setError('Please enter OTP');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const isMobile = /^[6-9]\d{9}$/.test(formData.identifier);
      const payload = {
        identifier: formData.identifier,
        ...(isMobile && { phone_code: '+91' }),
        password: formData.password,
        otp: parseInt(otpString),
      };
      console.log(payload, 'verify otp');
      const response = await verifyOtpService(payload);

       if (response?.responseCode === 'OK') {
         setShowSuccess(true);
        //  setTimeout(() => router.push('/'));
       } else {
         setError(response?.message || 'Invalid OTP');
         setShowError(true);
       }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Password and confirm password must be the same.');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const payload = formData.identifier;

      // const response = await resetPassword(payload);

      // if (response?.params?.status === 'successful') {
      //   setShowSuccess(true);
      //   setTimeout(() => router.push('/'), 2000);
      // } else {
      //   setError(response?.data?.params?.err ?? 'Failed to reset password');
      //   setShowError(true);
      // }
    } catch (err: any) {
      console.error('Password reset failed:', err); // 👈 Logging the actual error
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to reset password. Please try again.';
      setError(errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleBack = () => {
    if (step === 'otp') {
      setStep('reset');
    } else if (step === 'reset') {
       router.push('/');
    }
  };
  const validatePassword = (val: string, name: string) => {
    if (name === 'password') {
      setNewPassword(val);
      if (!passwordRegex.test(val)) {
        return 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(val);
      if (val !== newPassword) {
        return 'Password and confirm password must be the same.';
      }
    } else {
      return null;
    }
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    const name = event.target.name;

    let errorMsg: string | null | undefined;

    if (name === 'password') {
      errorMsg = validatePassword(val, name);
      setFormErrors((prev) => ({
        ...prev,
        [name]: errorMsg ?? '',
      }));
    } else if (name === 'confirmPassword') {
      errorMsg = validatePassword(val, name);
      setFormErrors((prev) => ({
        ...prev,
        [name]: errorMsg ?? '',
      }));
    }

    // Always assign string to form data
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus to next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f5f5, #f5f5f5)',
        minHeight: '100vh',
        padding: 2,
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          maxWidth: { xs: '90%', sm: '400px', md: '500px' },
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          borderRadius: '16px',
          padding: { xs: 2, sm: 3 },
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            padding: '4px',
            background: 'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          },
        }}
      >
        <Grid item xs={12} textAlign="left">
          <Button
            onClick={handleBack}
            sx={{
              color: '#572E91',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              textTransform: 'none',
              justifyContent: 'flex-start',
              '&:hover': {
                backgroundColor: '#F5F5F5',
              },
            }}
          >
            <ArrowBackIcon sx={{ marginRight: '4px' }} />
            Back
          </Button>
        </Grid>
        {step === 'otp' && (
          <>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="100%"
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1" gutterBottom>
                  Enter the OTP sent to {formData.identifier}
                </Typography>
              </Box>

              <Box
                display="flex"
                gap={1}
                justifyContent="center"
                width="95%"
                m={2}
              >
                {otp.map((digit, index) => (
                  <TextField
                    key={`otp-${index}`}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputProps={{
                      maxLength: 1,
                      sx: {
                        textAlign: 'center',
                        fontSize: { xs: 10, sm: 20 },
                        width: { xs: 30, sm: 40 },
                      },
                    }}
                  />
                ))}
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="100%"
                mt={1}
              >
                <Typography variant="body2" color="textSecondary">
                  Didn’t receive the code?
                </Typography>
                <Button
                  onClick={handleResendOtp}
                  disabled={remainingResendTime > 0}
                  variant="text"
                  sx={{
                    color: remainingResendTime > 0 ? 'grey' : '#582E92',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '14px',
                  }}
                >
                  {remainingResendTime > 0
                    ? `Resend OTP in ${remainingResendTime}s`
                    : 'Resend OTP'}
                </Button>
              </Box>

              <Typography variant="body2" color="textSecondary">
                Note: OTP will expire in 10 minutes ({formatTime(secondsLeft)}{' '}
                left).
              </Typography>

              {/* ✅ This ensures it appears on a new line */}
              <Box display="flex" justifyContent="center" mt={2} width="100%">
                <Button
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={!otp.join('').trim()}
                  sx={{
                    bgcolor: '#582E92',
                    color: '#FFFFFF',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '8px 32px',
                    '&:hover': {
                      bgcolor: '#543E98',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                </Button>
              </Box>
            </Box>
          </>
        )}

        {step === 'reset' && (
          <>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Forgot Password
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Email/Mobile"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              margin="normal"
              helperText={formErrors.identifier}
              FormHelperTextProps={{
                sx: {
                  color: 'red', // ✅ helperText color set manually
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                sx: {
                  '& .MuiInputBase-input': {
                    padding: '14px',
                    fontSize: '12px',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '12px', // Label font size
                  '&.Mui-focused': {
                    transform: 'translate(14px, -6px) scale(0.75)', // Shrink the label when focused
                    color: '#582E92', // Optional: change label color on focus
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)', // Shrink when filled or focused
                    color: '#582E92', // Optional: change label color when filled
                  },
                },
              }}
            />
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'} // ✅ toggle based on state
              name="password"
              label="New Password"
              value={formData.password}
              onChange={handleChangePassword}
              helperText={formErrors.password ?? ''}
              margin="normal"
              FormHelperTextProps={{
                sx: {
                  color: formErrors.password ? 'red' : 'inherit',
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowNewPassword}
                      edge="end"
                    >
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}{' '}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '& .MuiInputBase-input': {
                    padding: '14px',
                    fontSize: '12px',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  '&.Mui-focused': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChangePassword}
              helperText={formErrors.confirmPassword ?? ''}
              margin="normal"
              FormHelperTextProps={{
                sx: {
                  color: formErrors.confirmPassword ? 'red' : 'inherit',
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}{' '}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '& .MuiInputBase-input': {
                    padding: '14px',
                    fontSize: '12px',
                  },
                },
              }}
              InputLabelProps={{
                sx: {
                  fontSize: '12px',
                  '&.Mui-focused': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                    color: '#582E92',
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOtp}
              // onClick={handleResetPassword}
              disabled={
                loading ||
                !formData.password ||
                !formData.confirmPassword ||
                !formData.identifier ||
                !!formErrors.identifier ||
                !!formErrors.password ||
                !!formErrors.confirmPassword
              }
              sx={{
                bgcolor: '#582E92',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  bgcolor: '#543E98',
                },
                width: { xs: '50%', sm: '50%' },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </>
        )}

        {showError && (
          <Snackbar
            open={showError}
            autoHideDuration={4000}
            onClose={() => setShowError(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity="error"
              onClose={() => setShowError(false)}
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          </Snackbar>
        )}

        <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
          <DialogTitle>Password Reset Successful</DialogTitle>
          <DialogContent>
            <Typography>Your password has been reset successfully.</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                bgcolor: '#582E92',
                color: '#FFFFFF',
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 16px',
                '&:hover': {
                  bgcolor: '#543E98',
                },
                width: { xs: '50%', sm: '50%' },
              }}
              onClick={() => router.push('/')}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
};

export default PasswordReset;
