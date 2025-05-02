// components/ForgotPassword.tsx
'use client';
import React, { useState } from 'react';
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
} from '../../services/LoginService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Visibility, VisibilityOff } from '@mui/icons-material';
const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'otp' | 'reset'>('input');
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    username: '',
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
    username: '',
    email: '',
    mobile: '',
  });
  const usernameRegex = /^\w+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}"';<>?,./\\]).{8,}$/;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    let error = '';
    if (name === 'username' && value && !usernameRegex.test(value)) {
      error = 'Only letters, numbers, and underscores are allowed';
    } else if (name === 'email' && value && !emailRegex.test(value)) {
      error = 'Enter a valid email address.';
    } else if (name === 'mobile' && value && !mobileRegex.test(value)) {
      error = 'Enter a valid 10-digit mobile number';
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };
  const getAuthPayload = () =>
    formData.email
      ? { email: formData.email, reason: 'forgot' }
      : { mobile: formData.mobile, reason: 'forgot' };

  const handleSendOtp = async () => {
    if (!formData.email && !formData.mobile) {
      setError('Please provide either email or mobile');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const response = await sendOtp(getAuthPayload());

      if (response?.params?.successmessage === 'OTP sent successfully') {
        setHash(response?.result?.data?.hash);
        setStep('otp');
      } else {
        setError(response?.data?.params?.err ?? 'Failed to send OTP');
        setShowError(true);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
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
      const payload = formData.email
        ? {
            email: formData.email,
            reason: 'forgot',
            otp: otpString,
            hash,
            username: formData.username,
          }
        : {
            mobile: formData.mobile,
            reason: 'forgot',
            otp: otpString,
            hash,
            username: formData.username,
          };

      const response = await verifyOtpService(payload);

      if (response?.params?.successmessage === 'OTP validation Sucessfully') {
        setToken(response?.result?.token ?? '');
        setStep('reset');
      } else {
        setError(response?.data?.params?.err ?? 'Invalid OTP');
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
      setError('Passwords do not match');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const payload = formData.email
        ? { email: formData.email, newPassword, token }
        : { mobile: formData.mobile, newPassword, token };

      const response = await resetPassword(payload);

      if (response?.params?.status === 'successful') {
        setShowSuccess(true);
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(response?.data?.params?.err ?? 'Failed to reset password');
        setShowError(true);
      }
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
    if (step === 'input') {
      router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    } else if (step === 'otp') {
      setStep('input');
    } else if (step === 'reset') {
      setStep('otp');
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
        return 'Passwords do not match';
      }
    } else {
      return null;
    }
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    const name = event.target.name;
    let errorMsg;
    if (name === 'password') {
      errorMsg = validatePassword(val, name);
      setPasswordError(errorMsg ?? null);
    } else if (name === 'confirmPassword') {
      errorMsg = validatePassword(val, name);
      setConfirmPasswordError(errorMsg ?? null);
    } else {
      setPasswordError(null);
      setConfirmPasswordError(null);
    }
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
        {step === 'input' && (
          <>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Forgot Password
              </Typography>
            </Box>
            <TextField
              fullWidth
              label={
                <>
                  Username <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              helperText={formErrors.username}
              margin="normal"
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
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              disabled={!!formData.mobile}
              helperText={formErrors.email}
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

            <Typography variant="body1" textAlign="center" my={1}>
              OR
            </Typography>

            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              helperText={formErrors.mobile}
              onChange={handleInputChange}
              margin="normal"
              disabled={!!formData.email}
              onKeyDown={(e) => {
                // Allow only numbers, backspace, delete, arrows, tab
                const allowedKeys = [
                  'Backspace',
                  'Delete',
                  'ArrowLeft',
                  'ArrowRight',
                  'Tab',
                ];
                if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }}
              FormHelperTextProps={{
                sx: {
                  color: 'red', // ✅ helperText color set manually
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 10,
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

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOtp}
              disabled={
                !formData.username || (!formData.email && !formData.mobile)
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

        {step === 'otp' && (
          <>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" gutterBottom>
                Enter the OTP sent to {formData.email ?? formData.mobile}
              </Typography>
            </Box>
            <Box
              display="flex"
              gap={1}
              justifyContent="center"
              width={'95%'}
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
            {/* <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
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
            /> */}

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={!otp}
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
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
          </>
        )}

        {step === 'reset' && (
          <>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Reset Password
              </Typography>
            </Box>
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              name="password"
              label="New Password"
              value={newPassword}
              onChange={handleChangePassword}
              helperText={passwordError ?? ''}
              margin="normal"
              FormHelperTextProps={{
                sx: {
                  color: 'red', // ✅ helperText color set manually
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
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}
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
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              value={confirmPassword}
              name="confirmPassword"
              onChange={handleChangePassword}
              helperText={confirmPasswordError ?? ''}
              margin="normal"
              FormHelperTextProps={{
                sx: {
                  color: 'red', // ✅ helperText color set manually
                  fontSize: '11px',
                  marginLeft: '0px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
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

            <Button
              fullWidth
              variant="contained"
              onClick={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword}
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
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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

export default ForgotPassword;
