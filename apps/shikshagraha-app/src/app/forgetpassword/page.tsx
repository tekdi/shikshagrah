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
  checkUserExists,
} from '../../services/LoginService';
import AppConst from '../../utils/AppConst/AppConst';
import { Visibility, VisibilityOff } from '@mui/icons-material';
const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'otp' | 'reset'>('input');
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    username: '',
  });
  const [otp, setOtp] = useState('');
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

  const basePath = AppConst?.BASEPATH;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.email && !formData.mobile) {
      setError('Please provide either email or mobile');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const payload = formData.email
        ? { email: formData.email, reason: 'forgot' }
        : { mobile: formData.mobile, reason: 'forgot' };

      const response = await sendOtp(payload);

      if (response?.params?.successmessage === 'OTP sent successfully') {
        setHash(response?.result?.data?.hash);
        setStep('otp');
      } else {
        setError(response?.data?.params?.err || 'Failed to send OTP');
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
    if (!otp) {
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
            otp,
            hash,
            username: formData.username,
          }
        : {
            mobile: formData.mobile,
            reason: 'forgot',
            otp,
            hash,
            username: formData.username,
          };

      const response = await verifyOtpService(payload);

      if (response?.params?.successmessage === 'OTP validation Sucessfully') {
        setToken(response?.result?.token || '');
        setStep('reset');
      } else {
        setError(response?.data?.params?.err || 'Invalid OTP');
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
        setError(response?.data?.params?.err || 'Failed to reset password');
        setShowError(true);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            mb: 2,
            gap: 1,
          }}
        >
          <Box
            component="img"
            src={`${basePath}/assets/images/SG_Logo.png`}
            alt="logo"
            sx={{
              width: { xs: '100%', sm: '100%' },
              height: { xs: '100%', sm: '100%' },
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: '#582E92',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Shikshalokam
          </Typography>
        </Box>
        {step === 'input' && (
          <>
            <Typography variant="body1" gutterBottom>
              <Typography variant="h5" gutterBottom>
                Forgot Password
              </Typography>
              Enter your email or mobile number to receive OTP
            </Typography>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              disabled={!!formData.mobile}
            />

            <Typography variant="body1" textAlign="center" my={1}>
              OR
            </Typography>

            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              margin="normal"
              disabled={!!formData.email}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOtp}
              disabled={loading || (!formData.email && !formData.mobile)}
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
            <Typography variant="h5" gutterBottom>
              Verify OTP
            </Typography>
            <Typography variant="body1" gutterBottom>
              Enter the OTP sent to {formData.email || formData.mobile}
            </Typography>

            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
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
            <Typography variant="h5" gutterBottom>
              Reset Password
            </Typography>

            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
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
              }}
            />

            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
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
              onClick={() => router.push('/login')}
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
