'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  TextField,
  Box,
  Grid,
  IconButton,
  fabClasses,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtpService, registerUserService } from '../service'; // Adjust the import path
import Alert from '@mui/material/Alert';
const Otp = () => {
  const [otp, setOtp] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [enableResend, setEnableResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [userData, setUserData] = useState({
    name: '',
    yearOfBirth: '',
    locationData: {
      state: { name: '' },
      district: { name: '' },
      block: { name: '' },
      cluster: { name: '' },
      school: { name: '' },
    },
  });
  const [resendCount, setResendCount] = useState(0); // Track resend attempts
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    // Fetch data from localStorage
    const name = localStorage.getItem('Name');
    const yearOfBirth = localStorage.getItem('yearOfBirth');
    const locationData = JSON.parse(localStorage.getItem('locationData')); // Assuming location is stored as a JSON string

    if (name && yearOfBirth && locationData) {
      setUserData({
        name: name || 'John Doe',
        yearOfBirth: yearOfBirth || '1990',
        locationData: {
          state: { name: locationData?.state?.name || 'State Name' },
          district: { name: locationData?.district?.name || 'District Name' },
          block: { name: locationData?.block?.name || 'Block Name' },
          cluster: { name: locationData?.cluster?.name || 'Cluster Name' },
          school: { name: locationData?.school?.name || 'School Name' },
        },
      });
    }

    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setEnableResend(true);
    }
  }, [timer]);

  const handleOtpChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      // Allow up to 6 digits
      setOtp(value);
    }
    setShowError(false);
  };

  const handleResendOtp = () => {
    if (resendCount < 2) {
      setResendCount(resendCount + 1); // Increment resend attempts
      setEnableResend(false);
      setTimer(60);
      // Logic to resend OTP
      console.log('OTP resent');
    } else {
      alert('You can only resend OTP twice.');
    }
  };

  const handleSubmit = async () => {
    if (otp.length < 5 || otp.length > 6) {
      setInvalidOtp(true);
      setRemainingAttempts((prev) => prev - 1);
      return;
    }

    try {
      // Fetch and prepare data
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('Name');
      const yearOfBirth = localStorage.getItem('yearOfBirth');
      const locationData = JSON.parse(localStorage.getItem('locationData'));
      const profileUserTypes = JSON.parse(
        localStorage.getItem('profileUserTypes')
      );

      const { firstName, lastName } = parseName(name);
      const dob = yearOfBirth ? yearOfBirth.split('-')[0] : '';
      const profileLocation = prepareLocationData(locationData);

      const requestData = buildRequestData(
        firstName,
        lastName,
        email,
        dob,
        profileLocation,
        profileUserTypes
      );

      console.log('Request data prepared:', requestData);

      // Verify OTP
      const otpResponse = await verifyOtpService(email, otp);

      if (otpResponse?.result?.response !== 'SUCCESS') {
        console.error('OTP verification failed:', otpResponse);
        setShowError(true);
        return;
      }

      console.log('OTP verified successfully:', otpResponse);

      // Register user
      await handleUserRegistration(requestData);
    } catch (error) {
      console.error('Error processing OTP or Registration:', error);
      setShowError(true);
      setErrorMessage(error.message || 'An error occurred');
    }
  };

  const handleUserRegistration = async (requestData) => {
    try {
      const registrationResponse = await registerUserService(requestData);

      if (registrationResponse.success === false) {
        console.log('User registration failed:', registrationResponse.message);
        setShowError(true);
        setErrorMessage(registrationResponse.message);
      } else if (registrationResponse.success === true) {
        console.log(
          'User registered successfully:',
          registrationResponse.message
        );
        // Redirect to login or handle success
        router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
        localStorage.clear();
      } else if (registrationResponse.response?.status === 500) {
        const error =
          registrationResponse.response?.data?.error?.params?.errmsg ||
          'Unknown error';
        console.log('Server error during registration:', error);
        setShowError(true);
        setErrorMessage(error);
      }
    } catch (registrationError) {
      console.error('Error during registration:', registrationError);
      setShowError(true);
      setErrorMessage(
        registrationError.response?.data?.message ||
          registrationError.message ||
          'Registration failed'
      );
    }
  };

  // Helper function to parse name into first and last name
  const parseName = (name) => {
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
    };
  };

  // Helper function to format names (convert to lowercase)
  const formatNames = (firstName, lastName) => {
    const firstNameLower = firstName.toLowerCase();
    const lastNameLower = lastName
      .split(' ')
      .map((part) => part.charAt(0).toLowerCase() + part.slice(1).toLowerCase())
      .join('');

    return {
      userName: `${firstNameLower}_${lastNameLower}`,
    };
  };

  // Helper function to prepare location data
  const prepareLocationData = (locationData) => {
    return [
      { ...locationData?.state },
      { ...locationData?.district },
      { ...locationData?.block },
      { ...locationData?.cluster },
      { ...locationData?.school },
    ].filter(Boolean);
  };

  // Helper function to build the requestData object
  const buildRequestData = (
    firstName,
    lastName,
    email,
    dob,
    profileLocation,
    profileUserTypes
  ) => {
    const { userName } = formatNames(firstName, lastName);

    return {
      usercreate: {
        request: {
          firstName,
          lastName,
          organisationId: process.env.NEXT_PUBLIC_ORGID,
          email,
          emailVerified: true,
          userName,
          password: searchParams.get('password'),
          dob,
          roles: ['PUBLIC'],
        },
      },
      profileLocation,
      profileUserTypes,
    };
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: '#FF9911',
          padding: '10px',
          color: '#FFF',
          borderBottom: '2px solid #FF9911',
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Button
              onClick={() => {
                localStorage.getItem('email');

                router.back();
              }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowBackIcon sx={{ color: '#572E91', mr: 1 }} />
            </Button>
          </Grid>
          <Grid item xs={8} sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: '#572E91' }}
            >
              Step 4/4
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          padding: '20px',
          textAlign: 'center',
          paddingBottom: '60px',
          marginTop: '-10px',
        }}
      >
        {/* User Details */}
        <Box sx={{ mt: 4, marginTop:'10px' }}>
          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: 3,
              p: 3,
            }}
          >
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Name: </span>
                  {userData?.name}
                </Typography>
              </Grid>

              {/* Year */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Year of Birth: </span>
                  {userData?.yearOfBirth}
                </Typography>
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>State: </span>
                  {userData?.locationData?.state?.name}
                </Typography>
              </Grid>

              {/* District */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>District: </span>
                  {userData?.locationData?.district?.name}
                </Typography>
              </Grid>

              {/* Block */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Block: </span>
                  {userData?.locationData?.block?.name}
                </Typography>
              </Grid>

              {/* Cluster */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Cluster: </span>
                  {userData?.locationData?.cluster?.name}
                </Typography>
              </Grid>

              {/* School */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>School: </span>
                  {userData?.locationData?.school?.name}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      
        <Typography sx={{ color: 'black', marginBottom: '10px', fontSize:'15px' }}>
          OTP is send to : {localStorage.getItem('email')}
          <Typography>it is valid for 30 min</Typography>
        </Typography>
        {/* OTP Section */}
        {invalidOtp && (
          <Typography sx={{ color: 'red', marginBottom: '10px' }}>
            Invalid OTP. Remaining attempts: {remainingAttempts}
          </Typography>
        )}
        <TextField
          label="Enter OTP"
          variant="outlined"
          fullWidth
          value={otp}
          onChange={handleOtpChange}
          sx={{
            marginBottom: '20px',
          }}
        />
        <Button
          onClick={handleSubmit}
          sx={{
            bgcolor: otp.length >= 5 && otp.length <= 6 ? '#572e91' : '#ddd',
            color: otp.length >= 5 && otp.length <= 6 ? '#FFFFFF' : '#999',
            width: '100%',
            height: '40px',
            borderRadius: '16px',
            mt: 2,
            fontWeight: 'bold',
          }}
          disabled={otp.length < 5 || remainingAttempts <= 0} // Enable only for 5 or 6 digits
        >
          Verify OTP
        </Button>
        {showError && (
          <Alert variant="filled" severity="error">
            <Typography>{errorMessage}</Typography>
          </Alert>
        )}
        <Box sx={{ marginTop: '20px' }}>
          <Typography>
            Didn’t receive the OTP?{' '}
            <Button
              onClick={handleResendOtp}
              disabled={!enableResend || resendCount >= 2} // Disable if resend count exceeds 2
              sx={{ textTransform: 'none', color: '#572E91' }}
            >
              Resend OTP
            </Button>
          </Typography>
          {!enableResend && (
            <Typography sx={{ color: '#999' }}>{timer} seconds.</Typography>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#F8FAFC',
          padding: '10px',
          borderTop: '1px solid #FF9911',
          textAlign: 'center',
          zIndex: 1, // Optional: to ensure it stays above other content
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

export default Otp;
