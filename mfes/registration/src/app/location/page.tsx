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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { fetchLocationData } from '../service'; // Import the API service
import Alert from '@mui/material/Alert';

const Location = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedSubRole, setSelectedSubRole] = useState([]);
  const [udisecode, setUdisecode] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [locationData, setLocationData] = useState({});
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Subrole options
  const subroles = [
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
  ];

  const handleRoleChange = (event) => {
    const selectedRoleValue = event.target.value;
    setSelectedRole(selectedRoleValue);

    if (selectedRoleValue === 'teacher' || selectedRoleValue === 'youth') {
      setSelectedSubRole([]); // Clear selected subroles if the role is teacher or youth
    }
  };

  const handleSubRoleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedSubRole(typeof value === 'string' ? value.split(',') : value);
  };

  const handleUdiseChange = (event) => {
    setUdisecode(event.target.value);
    setShowError(false);
  };

  useEffect(() => {
    const isValid =
      selectedRole &&
      ((selectedRole === 'administrator' && selectedSubRole.length > 0) ||
        (selectedRole !== 'administrator' && udisecode));
    setButtonDisabled(!isValid);
  }, [selectedRole, selectedSubRole, udisecode]);

  useEffect(() => {
    const locationData = localStorage.getItem('locationData');
    const roles = localStorage.getItem('selectedRole');
    const subRoles = localStorage.getItem('selectedSubRole');
    const udiseCode = localStorage.getItem('udisecode');

    console.log('Location Data:', locationData);
    console.log('Roles:', roles);
    console.log('SubRoles:', subRoles);
    console.log('UDISE Code:', udiseCode);

    if (locationData) {
      setLocationData(JSON.parse(locationData));
      setShowSubmitButton(true);
    }
    if (roles) {
      setSelectedRole(roles);
    }
    if (subRoles) {
      setSelectedSubRole(JSON.parse(subRoles));
    }
    if (udiseCode) {
      setUdisecode(udiseCode);
    }
  }, []);

  const handleSubmit = async () => {
    if (!udisecode) {
      console.log('Please enter a valid UDISE Code');
      return;
    }

    try {
      const newLocationData = await fetchLocationData(udisecode);

      if (newLocationData.state) {
        setLocationData(newLocationData);
        setButtonDisabled(false);
        setShowSubmitButton(true);
        localStorage.setItem('locationData', JSON.stringify(newLocationData));

        const profileUserTypes =
          selectedRole === 'teacher' || selectedRole === 'youth'
            ? [{ type: selectedRole }]
            : selectedRole === 'administrator'
            ? selectedSubRole.map((subRole) => ({
                type: 'administrator',
                subType: subRole.toLowerCase(),
              }))
            : [];

        localStorage.setItem(
          'profileUserTypes',
          JSON.stringify(profileUserTypes)
        );
        localStorage.setItem('selectedRole', selectedRole);
        localStorage.setItem(
          'selectedSubRole',
          JSON.stringify(selectedSubRole)
        );
        localStorage.setItem('udisecode', udisecode);
      } else {
        setButtonDisabled(true);
        setShowError(true);
        setErrorMessage('Invalid UDISE Code');
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
      setButtonDisabled(true);
    }
  };

  const handleSubmitdetails = () => {
    router.push('/emailPassword');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        overflowY: 'auto', // Allow scrolling if content is large
        paddingBottom: '60px', // Space for fixed footer
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{ backgroundColor: '#FF9911', borderBottom: '1px solid #FF9911' }}
      >
        <Grid container alignItems="center" sx={{ p: 2 }}>
          <Grid item xs={2}>
            <Button
              onClick={() => {
                const savedData = localStorage.getItem('newUserFormData');
                if (savedData) {
                  localStorage.setItem('newUserFormData', savedData);
                }
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
              Step 2/4
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Form */}
      <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel htmlFor="role">Select Role</InputLabel>
          <Select
            value={selectedRole || ''}
            onChange={handleRoleChange}
            label="Select Role"
            fullWidth
          >
            <MenuItem value="">Select Role</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="administrator">Administrator</MenuItem>
            <MenuItem value="youth">Youth</MenuItem>
          </Select>
        </FormControl>

        {/* For Sub Role */}
        {selectedRole === 'administrator' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel htmlFor="subrole">Select Sub Role</InputLabel>
            <Select
              multiple
              value={selectedSubRole || []}
              onChange={handleSubRoleChange}
              label="Select Sub Role"
              fullWidth
              renderValue={(selected) => selected.join(', ')}
            >
              {subroles.map((subrole) => (
                <MenuItem key={subrole} value={subrole}>
                  {subrole}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* For UDISE Code */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            id="udisecode"
            label="UDISE Code"
            placeholder="Enter UDISE Code"
            value={udisecode || ''}
            onChange={handleUdiseChange}
            fullWidth
          />
        </FormControl>

        <Button
          onClick={handleSubmit}
          sx={{
            bgcolor: '#582E92',
            color: '#FFFFFF',
            width: '100%',
            height: '40px',
            borderRadius: '16px',
            mt: 2,
          }}
          disabled={buttonDisabled}
        >
          Continue
        </Button>

        {/* Location Details */}
        {locationData.state && (
          <Box sx={{ mt: 4 }}>
            {/* Location Info Card */}
            <Box
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: 3,
                p: 3,
              }}
            >
              <Grid container spacing={2}>
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

        {showError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Submit Button for School Data */}
        {showSubmitButton && (
          <Button
            onClick={handleSubmitdetails}
            sx={{
              bgcolor: '#582E92',
              color: '#FFFFFF',
              width: '100%',
              height: '40px',
              borderRadius: '16px',
              mt: 2,
            }}
          >
            Submit
          </Button>
        )}
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

export default Location;
