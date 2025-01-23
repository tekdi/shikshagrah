'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  TextField,
  Box,
  Grid,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import { generateOTP } from '../service'; // Adjust the import path
import Alert from '@mui/material/Alert';

const EmailPassword = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formValid, setFormValid] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./\\]).{8,}$/;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (field === 'email') {
        setEmail(value);
        setError((prev) => ({
          ...prev,
          email: !emailRegex.test(value),
        }));
      }

      if (field === 'password') {
        setPassword(value);
        setError((prev) => ({
          ...prev,
          password: !passwordRegex.test(value),
        }));
      }

      setFormValid(null); // Reset form validation status
      setShowError(false);
    };

  const handleValidation = () => {
    const emailValid = emailRegex.test(email);
    const passwordValid = passwordRegex.test(password);
    setError({ email: !emailValid, password: !passwordValid });
    setFormValid(emailValid && passwordValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleValidation();

    if (email && !error.email) {
      setLoading(true);
      try {
        const response = await generateOTP(email);
        console.log('OTP generated successfully:', response);
        localStorage.setItem('email', email);
        // router.push('/otp'); // Replace with your OTP page route
        router.push(`/otp?password=${encodeURIComponent(password)}`);
      } catch (error) {
        console.error('Error generating OTP:', error);
        setShowError(true);
        setErrorMessage(error?.responseCode);
        // alert('Failed to generate OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // If there is any email saved in localStorage, set it to the email state
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        bgcolor: '#f5f5f5', // Ensures that content fills the full height
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{ backgroundColor: '#FF9911', borderBottom: '1px solid #FF9911' }}
      >
        <Grid container alignItems="center" sx={{ p: 2 }}>
          <Grid item xs={2}>
            <IconButton
              onClick={() => {
                const locationData = localStorage.getItem('locationData');
                const profileUserTypes =
                  localStorage.getItem('profileUserTypes');
                const roles = localStorage.getItem('roles'); // Saving roles
                const subRoles = localStorage.getItem('subRoles'); // Saving sub-roles
                const udiseCode = localStorage.getItem('udiseCode'); // Saving UDISE code

                // Ensure the necessary data is stored
                if (locationData) {
                  localStorage.setItem('locationData', locationData); // Ensuring data persists
                }

                if (profileUserTypes) {
                  localStorage.setItem('profileUserTypes', profileUserTypes);
                }

                if (roles) {
                  localStorage.setItem('roles', roles); // Store roles in local storage
                }

                if (subRoles) {
                  localStorage.setItem('subRoles', subRoles); // Store sub-roles
                }

                if (udiseCode) {
                  localStorage.setItem('udiseCode', udiseCode); // Store UDISE code
                }

                router.back(); // Navigate back
              }}
            >
              <ArrowBackIcon sx={{ color: '#572E91' }} />
            </IconButton>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#572E91' }}
            >
              Step 3/4
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Form */}
      <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'black', fontWeight: 'bold' }}
        >
          Enter email address of your parent or guardian*
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ color: 'gray', fontWeight: 'bold', fontSize: '14px' }}
        >
          (An OTP will be sent to verify your email address)
        </Typography>
        <br></br>
        <TextField
          label="Email ID"
          variant="outlined"
          fullWidth
          value={email}
          onChange={handleChange('email')}
          helperText={
            error.email
              ? 'Invalid email format. Please enter a valid email.'
              : ''
          }
          error={error.email}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Password"
          type={passwordVisible ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          value={password}
          onChange={handleChange('password')}
          helperText={
            error.password
              ? 'Password must be at least 8 characters long, include numerals, uppercase, lowercase, and special characters.'
              : ''
          }
          error={error.password}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: passwordVisible ? (
              <VisibilityIcon
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <VisibilityOffIcon
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer' }}
              />
            ),
          }}
        />

        {formValid === true && (
          <Typography
            variant="body2"
            sx={{ color: 'green', fontSize: '11px', mb: 2 }}
          >
            All inputs are valid. You can proceed.
          </Typography>
        )}

        <Button
          onClick={handleSubmit}
          sx={{
            bgcolor: '#572e91',
            color: '#FFFFFF',
            width: '100%',
            height: '40px',
            borderRadius: '16px',
            mt: 2,
            fontWeight: 'bold',
          }}
          disabled={
            loading || !email || !password || error.email || error.password
          }
        >
          {loading ? 'Sending...' : 'Submit'}
        </Button>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#F8FAFC',
          padding: '10px',
          borderTop: '1px solid #FF9911',
          textAlign: 'center',
        }}
      >
        <Typography>
          Already have an account?{' '}
          <Button
            sx={{
              color: '#572E91',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`)}
          >
            Login
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default EmailPassword;
