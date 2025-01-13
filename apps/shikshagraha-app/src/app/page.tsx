'use client';
import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken } from '../services/LoginService';
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
  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setShowError(false);
      const value = event.target.value;
      setFormData({
        ...formData,
        [field]: value,
      });
      setError({
        ...error,
        [field]: value.trim() === '',
      });
    };

  const handleButtonClick = async () => {
    if (!formData.userName || !formData.password) {
      setError({
        userName: !formData.userName,
        password: !formData.password,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await getToken({
        username: formData.userName,
        password: formData.password,
      });

      if (response?.access_token) {
        localStorage.setItem('accToken', response?.access_token);
        localStorage.setItem('refToken', response?.refresh_token);
        const redirectUrl = process.env.NEXT_PUBLIC_PWA;
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
    <Box>
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
          <CircularProgress size={50} />
        </Box>
      )}
      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
          width: '100%',
          borderRadius: 1,
          bgcolor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          mx: 'auto',
        }}
      >
        <Grid
          size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: '20px 20px 0 0',
            padding: '15px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box
            component="img"
            src="/assets/images/SG_Logo.jpg"
            alt="logo"
            sx={{
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: 2,
            }}
          />
          <TextField
            label="Username"
            value={formData.userName}
            onChange={handleChange('userName')}
            type="text"
            variant="outlined"
            helperText={error.userName ? `Required username ` : ''}
            error={error.userName}
          />
          <TextField
            label="Password"
            value={formData.password}
            onChange={handleChange('password')}
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            helperText={error.password ? `Required password ` : ''}
            error={error.password}
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
          />

          <Button
            onClick={handleButtonClick}
            sx={{
              color: '#FFFFFF',
              width: '100%',
              height: '40px',
              bgcolor: '#6750A4',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Login
          </Button>
          <Typography
            variant="h1"
            fontSize={'16px'}
            color="#3B383E"
            fontWeight={500}
            textAlign={'center'}
          >
            Don’t Have An Account?{' '}
            <Link href={process.env.NEXT_PUBLIC_REGISTRATION ?? '/'}>
              Register
            </Link>
          </Typography>
        </Grid>
      </Grid>
      {showError && (
        <Alert variant="filled" severity="error">
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
}
