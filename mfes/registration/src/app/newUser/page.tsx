'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Box,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  fetchLocationData,
  generateOTP,
  verifyOtpService,
  registerUserService,
} from '../service'; // Import OTP verify service
import { useRouter } from 'next/navigation';

const NewUserWithStepper: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    yearOfBirth: '',
    contact: '',
    password: '',
    contactType: 'email',
  });
  const [error, setError] = useState({
    username: false,
    yearOfBirth: false,
    contact: false,
    password: false,
    otp: false,
  });
  const [birthYearOptions, setBirthYearOptions] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSubRole, setSelectedSubRole] = useState<string[]>([]);
  const [udisecode, setUdisecode] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [locationData, setLocationData] = useState<any>({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValid, setOtpValid] = useState(false);
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const router = useRouter();
  const [resendCount, setResendCount] = useState(0); // Track resend attempts
  const [enableResend, setEnableResend] = useState(false);

  const [userData, setUserData] = useState<any>({});
  const [timer, setTimer] = useState(60);
  const [requestData, setRequestData] = useState<any>({});
  const steps = [
    'Personal Details',
    'Location Details',
    'Email/Password',
    'OTP',
  ];
  const [contactType, setContactType] = useState('email');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [formValid, setFormValid] = useState(null);

  // Email/Password regex
  const emailRegex = /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}:":;'<>?,./\\]).{8,}$/;

  // Generate Year Options
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 1920 + 1 },
      (_, i) => currentYear - i
    );
    setBirthYearOptions(years);
  }, []);

  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = String(event.target.value).trim();
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError((prev) => ({ ...prev, [field]: value === '' }));
    };

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRole(event.target.value as string);
    if (event.target.value !== 'administrator') setSelectedSubRole([]);
  };

  const handleSubRoleChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const { value } = event.target;
    setSelectedSubRole(
      typeof value === 'string' ? value.split(',') : (value as string[])
    );
  };

  const handleUdiseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUdisecode(event.target.value);
    setButtonDisabled(false);
    setShowError(false);
  };

  // Step 1 Validation
  const handleStep1Continue = () => {
    const isFormValid =
      formData.username.trim() &&
      birthYearOptions.includes(Number(formData.yearOfBirth));
    if (isFormValid) {
      setActiveStep(1);
    } else {
      setError({
        username: formData.username.trim() === '',
        yearOfBirth: !birthYearOptions.includes(Number(formData.yearOfBirth)),
      });
    }
  };

  // Step 2: Fetch Location Data
  const handleFetchLocation = async () => {
    if (!udisecode) {
      setShowError(true);
      setErrorMessage('Please enter a valid UDISE Code');
      setButtonDisabled(true);
      return;
    }

    try {
      setButtonDisabled(false);
      const newLocationData = await fetchLocationData(udisecode);

      if (newLocationData?.state) {
        setLocationData(newLocationData);
        setShowError(false);
      } else {
        setShowError(true);
        setErrorMessage('Invalid UDISE Code');
        setButtonDisabled(true);
      }
    } catch (error: any) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  };

  // Step 3 Validation
  const handleEmailPasswordChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      setFormData((prev) => ({ ...prev, [field]: value }));

      handleValidation();

      if (field === 'contact') {
        setError((prev) => ({
          ...prev,
          contact:
            formData.contactType === 'email'
              ? !emailRegex.test(value)
              : !phoneRegex.test(value),
        }));
      }

      if (field === 'password') {
        setError((prev) => ({
          ...prev,
          password: !passwordRegex.test(value),
        }));
      }
    };

  const handleValidation = () => {
    const contactValid =
      contactType === 'email'
        ? emailRegex.test(contact)
        : phoneRegex.test(contact);
    const passwordValid = passwordRegex.test(password);
    setError({ contact: !contactValid, password: !passwordValid });
    setFormValid(contactValid && passwordValid);
  };

  const handleStep3Continue = async () => {
    // e.preventDefault();
    handleValidation();
    console.log('contact', contact);
    if (contact && !error.contact) {
      try {
        console.log('formData', formData);
        formData.contact = contact;
        const response = await generateOTP(
          formData.contact,
          formData.contactType
        );
        console.log('OTP generated successfully:', response);
        if (response.success == false) {
          setError(response.message);
          setShowError(true);
          setErrorMessage(response.message);
        } else {
          setOtpSent(true);
          setActiveStep(3);

          // Prepare request data
          const name = formData.username || '';
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          const firstNameLower = firstName.toLowerCase();
          const lastNameLower = lastName
            .split(' ')
            .map(
              (part) =>
                part.charAt(0).toLowerCase() + part.slice(1).toLowerCase()
            )
            .join('');

          const userName = `${firstNameLower}_${lastNameLower}`;
          const dob = formData.yearOfBirth; // Assuming this is in YYYY format

          const profileLocation = [
            locationData.state,
            locationData.district,
            locationData.block,
            locationData.cluster,
            locationData.school,
          ].filter(Boolean);

          let userTypes = [];
          console.log('formData', selectedSubRole);
          const userRole = selectedRole || '';

          if (userRole === 'administrator') {
            selectedSubRole.forEach((role) => {
              userTypes.push({
                type: userRole,
                subType: role.toLowerCase(),
              });
            });
          } else if (userRole === 'youth' || userRole === 'teacher') {
            userTypes.push({
              type: userRole,
              subType: '',
            });
          }
          console.log('userTypes', userTypes);
          setRequestData({
            usercreate: {
              request: {
                firstName,
                lastName,
                organisationId: process.env.REACT_APP_ORG_ID, // Update to match your env variable
                email: contact,
                emailVerified: true,
                userName,
                password: formData.password,
                dob,
                roles: ['PUBLIC'],
              },
            },
            profileLocation,
            profileUserTypes: userTypes,
          });

          setUserData({
            ...formData,
            locationData,
          });
          localStorage.setItem('contact', contact);
        }
      } catch (error) {
        console.error('Error generating OTP:', error);
      }
    }
  };

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value);
    setShowError(false);
    setError((prev) => ({ ...prev, otp: event.target.value === '' }));
  };

  const handleSubmit = async () => {
    if (otp.length < 5 || otp.length > 6) {
      setInvalidOtp(true);
      setRemainingAttempts((prev) => prev - 1);
      return;
    }

    try {
      const email = contact;
      console.log('contact', contact);
      const otpResponse = await verifyOtpService(email, otp);
      console.log('otpResponse', otpResponse);
      if (
        otpResponse ==
          'OTP verification failed. Remaining attempt count is 0.' ||
        otpResponse == 'OTP verification failed. Remaining attempt count is 1.'
      ) {
        // setShowError(true);
        setShowError(true);
        setErrorMessage(otpResponse);
        setInvalidOtp(true);
        setRemainingAttempts((prev) => prev - 1);
        return;
      } else {
        console.log('OTP verified successfully');
        console.log('Prepared Request Data:', requestData);

        const registrationResponse = await registerUserService({ requestData });
        console.log('registrationResponse', registrationResponse);
        if (registrationResponse.data.success == false) {
          setShowError(true);
          setErrorMessage(registrationResponse.data.message);
        } else {
          // router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
          // localStorage.clear();
        }
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message || 'An error occurred');
    }
  };
  const handleResendOtp = () => {
    if (resendCount < 2) {
      setResendCount(resendCount + 1); // Increment resend attempts
      setEnableResend(false);
      setTimer(60);
      // Logic to resend OTP
      console.log('OTP resent');
      handleStep3Continue();
    } else {
      alert('You can only resend OTP twice.');
    }
  };
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setEnableResend(true);
    }
  }, [timer]);
  const handleChangecontact = (field) => (event) => {
    const value = event.target.value;
    console.log('value', value);
    if (field === 'contact') {
      setContact(value);
      setError((prev) => ({
        ...prev,
        contact:
          contactType === 'email'
            ? !emailRegex.test(value)
            : !phoneRegex.test(value),
      }));
    }

    if (field === 'password') {
      setPassword(value);
      setError((prev) => ({
        ...prev,
        password: !passwordRegex.test(value),
      }));
    }

    setFormValid(null);
    setShowError(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        // Allow scrolling if content is large
        paddingBottom: '60px',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#FF9911',
          p: 2,
          borderBottom: '2px solid #FF9911',
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Button onClick={handleBack} sx={{ color: '#572E91' }}>
              <ArrowBackIcon />
            </Button>
          </Grid>
          <Grid item xs={8} textAlign="center">
            <Typography
              variant="h6"
              sx={{ color: '#572E91', fontWeight: 'bold' }}
            >
              Step {activeStep + 1}/4
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Step Content */}
      <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
        {/* Step 1: Personal Details */}
        {activeStep === 0 && (
          <Box>
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
            <Typography
              variant="h5"
              sx={{
                color: '#572E91',
                fontWeight: 'bold',
                mb: 1,
                textAlign: 'center',
              }}
            >
              Welcome to Shikshagraha
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#333', mb: 3, textAlign: 'center' }}
            >
              Register
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                label="Name"
                value={formData.username}
                onChange={handleChange('username')}
                error={error.username}
                helperText={error.username ? 'Name is required' : ''}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Year of Birth</InputLabel>
              <Select
                value={formData.yearOfBirth}
                onChange={handleChange('yearOfBirth')}
                error={error.yearOfBirth}
              >
                <MenuItem value="" disabled>
                  Select Year
                </MenuItem>
                {birthYearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
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

                  width: '50%', // Ensures it spans the width of its container
                }}
                variant="contained"
                onClick={handleStep1Continue}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Location Details */}
        {activeStep === 1 && (
          <Box sx={{ height: '70vh', overflowY: 'scroll' }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Role</InputLabel>
              <Select value={selectedRole} onChange={handleRoleChange}>
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="administrator">Administrator</MenuItem>
                <MenuItem value="youth">Youth</MenuItem>
              </Select>
            </FormControl>
            {selectedRole === 'administrator' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Sub Role</InputLabel>
                <Select
                  multiple
                  value={selectedSubRole}
                  onChange={handleSubRoleChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {[
                    'HM',
                    'CRP',
                    'Complex HM',
                    'MEO',
                    'DyEO',
                    'ATWO',
                    'DTWO',
                    'GCDO PMRC',
                    'CMO PMRC',
                    'AMO PMRC',
                    'DDTW',
                    'ASO DPO',
                    'Asst ALS Coordinator',
                    'Asst IE Coordinator',
                    'ALS Coordinator',
                    'IE Coordinator',
                    'CMO',
                    'AAMO',
                    'AMO',
                    'APC',
                    'DIET Lecturer',
                    'DIET Principal',
                    'DEO',
                    'RJD',
                    'SLCC',
                    'SLMO',
                    'SPPD',
                    'Director Adult Education',
                    'Director Public Libraries',
                    'Director SCERT',
                    'Secretary KGBV',
                    'Secretary Public Libraries',
                    'Deputy Director Adult Education',
                    'Librarian Public Libraries/ Book Deposit Center',
                    'Instructor/ Volunteer Adult Education',
                    'BDC Incharge',
                  ].map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="UDISE Code"
              value={udisecode}
              onChange={handleUdiseChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                onClick={handleFetchLocation}
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
                disabled={!udisecode}
              >
                Fetch Location
              </Button>
            </Box>
            {showError && <Alert severity="error">{errorMessage}</Alert>}
            {locationData.state && (
              <Box sx={{ margin: '10px' }}>
                {/* Location Info Card */}
                <Box
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: 3,
                    p: 3,
                  }}
                >
                  <Grid container spacing={1}>
                    {/* State */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        <span style={{ color: '#FF9911' }}>State: </span>
                        {locationData.state.name}
                      </Typography>
                    </Grid>

                    {/* District */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        <span style={{ color: '#FF9911' }}>District: </span>
                        {locationData.district.name}
                      </Typography>
                    </Grid>

                    {/* Block */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        <span style={{ color: '#FF9911' }}>Block: </span>
                        {locationData.block.name}
                      </Typography>
                    </Grid>

                    {/* Cluster */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        <span style={{ color: '#FF9911' }}>Cluster: </span>
                        {locationData.cluster.name}
                      </Typography>
                    </Grid>

                    {/* School */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        <span style={{ color: '#FF9911' }}>School: </span>
                        {locationData.school.name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            {/* Continue Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
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
                  width: '50%',
                }}
                disabled={!locationData?.state}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Email/Password */}
        {activeStep === 2 && (
          <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
            <Typography
              variant="h5"
              align="center"
              sx={{ color: '#572E91', fontWeight: 'bold', fontSize: '1rem' }}
            >
              Enter your Email or Mobile Number*
            </Typography>
            <RadioGroup
              sx={{ color: 'black', fontWeight: 'bold', fontSize: '10px' }}
              row
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              <FormControlLabel
                value="email"
                control={<Radio />}
                label="Email"
              />
              <FormControlLabel
                value="phone"
                control={<Radio />}
                label="Mobile Number"
              />
            </RadioGroup>
            <TextField
              label={contactType === 'email' ? 'Email ID' : 'Mobile Number'}
              variant="outlined"
              fullWidth
              value={contact}
              onChange={handleChangecontact('contact')}
              helperText={
                error.contact
                  ? `Invalid ${contactType}. Please enter a valid ${contactType}.`
                  : ''
              }
              error={error.contact}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              value={password}
              onChange={handleChangecontact('password')}
              helperText={
                error.password
                  ? 'Password must be at least 8 characters long, include numerals, uppercase, lowercase, and special characters.'
                  : ''
              }
              error={error.password}
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                onClick={handleStep3Continue}
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
                disabled={
                  !contact || !password || error.contact || error.password
                }
              >
                Submit
              </Button>
              {showError && <Alert severity="error">{errorMessage}</Alert>}
            </Box>
          </Box>
        )}

        {/* Step 4: OTP Verification */}
        {activeStep === 3 && (
          <Box sx={{ height: '70vh', overflowY: 'scroll' }}>
            {/* User Details */}
            <Box sx={{ marginTop: '10px' }}>
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
                      {userData?.username}
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

            <Typography
              sx={{ color: 'black', marginBottom: '10px', fontSize: '15px' }}
            >
              OTP is send to : {userData?.contact}
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                onClick={handleSubmit}
                sx={{
                  bgcolor:
                    otp.length >= 5 && otp.length <= 6 ? '#572e91' : '#ddd',
                  color:
                    otp.length >= 5 && otp.length <= 6 ? '#FFFFFF' : '#999',
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
                disabled={otp.length < 5 || remainingAttempts <= 0}
              >
                Verify OTP
              </Button>
            </Box>

            {showError && <Alert severity="error">{errorMessage}</Alert>}
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
        )}
      </Box>
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #FF9911',
          py: 2,
          textAlign: 'center',
          zIndex: 1000, // Ensure the footer stays on top
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          Have an Account?{' '}
          <Button
            sx={{
              textTransform: 'uppercase',
              color: '#582E92',
              fontWeight: 'bold',
            }}
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`)}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default NewUserWithStepper;
