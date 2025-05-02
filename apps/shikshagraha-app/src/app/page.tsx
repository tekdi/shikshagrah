/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  ButtonBase,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import {
  authenticateLoginUser,
  fetchTenantData,
  signin,
} from '../services/LoginService';
import AppConst from '../utils/AppConst/AppConst';

export default function Login() {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [error, setError] = useState({ userName: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const basePath = AppConst?.BASEPATH;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+\-={}:";'<>?,./\\]).{8,}$/;

  useEffect(() => {
    const token = localStorage.getItem('accToken');
    const status = localStorage.getItem('userStatus');
    if (token && status !== 'archived') {
      router.push('/home');
    }
  }, []);

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setShowError(false);
      const value = event.target.value;

      setFormData({
        ...formData,
        [field]: value,
      });

      setError((prev) => ({
        ...prev,
        [field]:
          field === 'password'
            ? !passwordRegex.test(value)
            : value.trim() === '',
      }));
    };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, []);

  const handleButtonClick = async () => {
    setShowError(false);
    if (!formData.userName || !formData.password) {
      setError({
        userName: !formData.userName,
        password: !formData.password,
      });
      return;
    }

    if (error.password) {
      setShowError(true);
      setErrorMessage(
        'Password must be at least 8 characters long, include numerals, uppercase, lowercase, and special characters.'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await signin({
        username: formData.userName,
        password: formData.password,
      });

      const accessToken = response?.result?.access_token;
      const refreshToken = response?.result?.refresh_token;

      if (accessToken) {
        const tenantResponse = await authenticateLoginUser({
          token: accessToken,
        });
        const userStatus = tenantResponse?.result?.status?.toLowerCase();

        localStorage.setItem('userStatus', userStatus);

        if (userStatus === 'archived') {
          setShowError(true);
          setErrorMessage('The user is deactivated, please contact admin.');
          return;
        }

        // Only store token if status is active
        localStorage.setItem('accToken', accessToken);
        localStorage.setItem('refToken', refreshToken);
        localStorage.setItem('firstname', tenantResponse?.result?.firstName);
        localStorage.setItem('userId', tenantResponse?.result?.userId);
        localStorage.setItem('name', tenantResponse?.result?.username);

        const tenantIdToCompare =
          tenantResponse?.result?.tenantData?.[0]?.tenantId;
        if (tenantIdToCompare) {
          localStorage.setItem(
            'headers',
            JSON.stringify({ 'org-id': tenantIdToCompare })
          );

          const tenantData = await fetchTenantData({ token: accessToken });
          const matchedTenant = tenantData?.result?.find(
            (tenant) => tenant.tenantId === tenantIdToCompare
          );

          localStorage.setItem('channelId', matchedTenant?.channelId);
          localStorage.setItem(
            'frameworkname',
            matchedTenant?.contentFramework
          );

          if (tenantIdToCompare === process.env.NEXT_PUBLIC_ORGID) {
            router.push('/home');
          } else {
            setShowError(true);
            setErrorMessage(
              'The user does not belong to the same organization.'
            );
          }
        }
      } else {
        setShowError(true);
        setErrorMessage('Login failed. Invalid Username or Password.');
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  const handlePasswordClick = () => {
    router.push('/forgetpassword');
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
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={50} color="primary" />
        </Box>
      )}
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
              width: '100%',
              height: '100%',
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

        <TextField
          fullWidth
          label="Username"
          value={formData.userName}
          onChange={handleChange('userName')}
          error={error.userName}
          helperText={error.userName ? 'Username is required' : ''}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Password"
          value={formData.password}
          onChange={handleChange('password')}
          type={showPassword ? 'text' : 'password'}
          error={error.password}
          helperText={
            error.password
              ? 'Password must be at least 8 characters long, include numerals, uppercase, lowercase, and special characters.'
              : ''
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {!showPassword ? (
                  <VisibilityOffIcon
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <VisibilityIcon
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <Typography variant="body2" textAlign="center" mt={2} color="#6B6B6B">
          <ButtonBase
            onClick={handlePasswordClick}
            sx={{
              color: '#6750A4',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
              marginTop: '-10px',
              textDecoration: 'underline',
            }}
          >
            Forgot Password?
          </ButtonBase>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Button
            onClick={handleButtonClick}
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
            Login
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" mt={2} color="#6B6B6B">
          Don’t have an account?{' '}
          <ButtonBase
            onClick={handleRegisterClick}
            sx={{
              color: '#6750A4',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '15px',
            }}
          >
            Register
          </ButtonBase>
        </Typography>

        <Grid container justifyContent="center" alignItems="center">
          {showError && (
            <Alert severity="error">
              {typeof errorMessage === 'object'
                ? JSON.stringify(errorMessage)
                : errorMessage}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
