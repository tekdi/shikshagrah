/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken } from '../services/LoginService';
import { jwtDecode } from 'jwt-decode';
import { fetchProfileData } from '../services/ProfileService';
import { ButtonBase } from '@mui/material';
import AppConst from '../utils/AppConst/AppConst';
import InputAdornment from '@mui/material/InputAdornment';

export default function Login() {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });
  const [error, setError] = useState({
    userName: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const basePath = AppConst?.BASEPATH;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+\-={}:";'<>?,./\\]).{8,}$/;

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
            ? !passwordRegex.test(value) // Validate password
            : value.trim() === '', // Validate username for non-emptiness
      }));
    };

  const handleButtonClick = async () => {
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
      const response = await getToken({
        username: formData.userName,
        password: formData.password,
      });

      if (response?.access_token) {
        const decoded = jwtDecode(response?.access_token);
        const subValue = decoded?.sub?.split(':')[2];
        localStorage.setItem('userId', subValue);
        localStorage.setItem('accToken', response?.access_token);
        localStorage.setItem('refToken', response?.refresh_token);

        // Fetch profile data
        await getProfileData();

        // Check rootOrgId and route or show error
      } else {
        setShowError(true);
        setErrorMessage(response);
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileData = async () => {
    try {
      const token = localStorage.getItem('accToken') || '';
      const userId = localStorage.getItem('userId') || '';

      const data = await fetchProfileData(userId, token);

      setProfileData(data?.content[0]);
      localStorage.setItem('name', data?.content[0]?.userName);
      if (data?.content[0]?.rootOrgId === process.env.NEXT_PUBLIC_ORGID) {
        const redirectUrl = '/home';
        router.push(redirectUrl);
      } else {
        setShowError(true);
        setErrorMessage('The user does not belong to the same organization.');
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileData) {
      console.log('Updated Profile Data:', profileData);
      localStorage.setItem(
        'headers',
        JSON.stringify({ 'org-id': profileData?.rootOrgId })
      );
    }
  }, [profileData]);
  const handleRegisterClick = () => {
    console.log('Registration clicked');
    console.log(process.env.NEXT_PUBLIC_REGISTRATION);

    const registrationUrl = process.env.NEXT_PUBLIC_REGISTRATION ?? '/';
    router.push(registrationUrl);
  };

  const handlePasswordClick = () => {
    console.log('Password clicked');
    console.log(process.env.NEXT_PUBLIC_FORGOT_PASSWORD);

    const registrationUrl = process.env.NEXT_PUBLIC_FORGOT_PASSWORD ?? '/';
    router.push(registrationUrl);
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
            background: 'linear-gradient(to right, #FFC857 50%, #073763 50%)',
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
        </Box>
        <TextField
          fullWidth
          label="Username/Email"
          value={formData.userName}
          onChange={handleChange('userName')}
          error={error.userName}
          helperText={error.userName ? 'Username is required' : ''}
          sx={{
            mb: 2,
          }}
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
          sx={{
            mb: 1,
            '& .MuiInputBase-root': {
              backgroundColor: 'inherit',
            },
            '& .MuiInputAdornment-root': {
              backgroundColor: 'inherit',
            },
          }}
        />

        {/* <Typography variant="body2" textAlign="center" mt={2} color="#6B6B6B">
          <ButtonBase
            onClick={handlePasswordClick}
            sx={{
              color: '#073763',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
              marginTop: '-10px',
              textDecoration: 'underline',
            }}
          >
            Forgot Password?
          </ButtonBase>
        </Typography> */}

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
              bgcolor: '#073763',
              color: '#FFFFFF',
              borderRadius: '30px',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              padding: '8px 16px',
              '&:hover': {
                bgcolor: '#FFC857',
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
              color: '#073763',
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
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
