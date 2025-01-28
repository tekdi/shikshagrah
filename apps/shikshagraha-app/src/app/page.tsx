'use client';
import React, { useState } from 'react';
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

        const redirectUrl = '/home';
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      } else {
        setShowError(true);
        setErrorMessage(response);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setShowError(true);
      setErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6750A4, #9C27B0)',
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
          label="Username"
          value={formData.userName}
          onChange={handleChange('userName')}
          type="text"
          variant="outlined"
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
          variant="outlined"
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
          <Link href="/forgetpassword" passHref>
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
              bgcolor: '#6750A4',
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
