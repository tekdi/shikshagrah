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
      setProfileData(data);
      if (data?.rootOrgId === process.env.NEXT_PUBLIC_ORGID) {
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
    }
  }, [profileData]);
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f5f5, #f5f5f5)',
        // boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)', // Subtle shadow
        // backgroundColor: '#FFF7E6',
        overflow: 'hidden',
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
          maxWidth: '320px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          borderRadius: '16px',
          padding: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          <Box
            component="img"
            src="/assets/images/SG_Logo.jpg"
            alt="logo"
            sx={{
              width: '100px',
              height: '100px',
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
            endAdornment: !showPassword ? (
              <VisibilityOffIcon
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <VisibilityIcon
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              />
            ),
          }}
          sx={{
            mb: 1,
          }}
        />
        <Typography
          variant="body2"
          textAlign="right"
          sx={{ mb: 2 }}
          color="#6B6B6B"
        >
          <Link href={`${process.env.NEXT_PUBLIC_FORGOT_PASSWORD}`}>
            <Typography
              component="span"
              sx={{
                color: '#6750A4',
                fontWeight: 'bold',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </Typography>
          </Link>
        </Typography>

        {/* Add a new Box to ensure the button moves to the next line */}
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
              width: '50%', // Ensures it spans the width of its container
            }}
          >
            Login
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" mt={2} color="#6B6B6B">
          Don’t have an account?{' '}
          <Link href={process.env.NEXT_PUBLIC_REGISTRATION ?? '/'} passHref>
            <Typography
              component="span"
              sx={{
                color: '#6750A4',
                fontWeight: 'bold',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Register
            </Typography>
          </Link>
        </Typography>
        {showError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Grid>
    </Box>
  );
}
