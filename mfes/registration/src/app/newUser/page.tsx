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
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NewUser: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    yearOfBirth: '',
  });
  const [error, setError] = useState({
    username: false,
    yearOfBirth: false,
  });
  const [birthYearOptions, setBirthYearOptions] = useState<number[]>([]);
  const router = useRouter();

  // Generate Year Options
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 1920 + 1 },
      (_, i) => currentYear - i
    );
    setBirthYearOptions(years);
  }, []);

  // Load saved form data
  useEffect(() => {
    const savedFormData = localStorage.getItem('newUserFormData');
    if (savedFormData) setFormData(JSON.parse(savedFormData));
  }, []);

  // Handle field changes
  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = String(event.target.value).trim();
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError((prev) => ({ ...prev, [field]: value === '' }));
    };

  // Form submission
  const handleContinue = () => {
    const isFormValid =
      formData.username.trim() &&
      birthYearOptions.includes(Number(formData.yearOfBirth));
    if (isFormValid) {
      localStorage.setItem('newUserFormData', JSON.stringify(formData));
      router.push('/location');
    } else {
      setError({
        username: formData.username.trim() === '',
        yearOfBirth: !birthYearOptions.includes(Number(formData.yearOfBirth)),
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#FF9911',
          p: 2,
          borderBottom: '2px solid #FF9911',
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Button onClick={() => router.back()} sx={{ color: '#572E91' }}>
              <ArrowBackIcon />
            </Button>
          </Grid>
          <Grid item xs={8} textAlign="center">
            <Typography
              variant="h6"
              sx={{ color: '#572E91', fontWeight: 'bold' }}
            >
              Step 1/4
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Form */}
      <Box sx={{ p: 3, maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
        <Box
          component="img"
          src="/assets/images/SG_Logo.jpg"
          alt="Shikshagraha Logo"
          sx={{ width: 80, height: 80, borderRadius: '50%', mb: 2 }}
        />
        <Typography
          variant="h5"
          sx={{ color: '#572E91', fontWeight: 'bold', mb: 1 }}
        >
          Welcome to Shikshagraha
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
          Register
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Name"
            value={formData.username}
            onChange={handleChange('username')}
            error={error.username}
            helperText={error.username ? 'Name is required' : ''}
            variant="outlined"
            placeholder="Enter your name"
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Year of Birth</InputLabel>
          <Select
            value={formData.yearOfBirth}
            onChange={handleChange('yearOfBirth')}
            error={error.yearOfBirth}
            fullWidth
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  textAlign: 'left', // Ensures dropdown content aligns to the left
                },
              },
            }}
            sx={{
              textAlign: 'left', // Ensures selected text aligns to the left
              '.MuiSelect-select': {
                textAlign: 'left', // Applies to the displayed value in the Select box
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Year
            </MenuItem>
            {birthYearOptions.map((year) => (
              <MenuItem
                key={year}
                value={year}
                sx={{
                  textAlign: 'left', // Aligns the year text in the dropdown to the left
                }}
              >
                {year}
              </MenuItem>
            ))}
          </Select>
          {error.yearOfBirth && (
            <Typography color="error" variant="body2">
              Please select a valid year.
            </Typography>
          )}
        </FormControl>

        <Button
          variant="contained"
          onClick={handleContinue}
          fullWidth
          sx={{
            bgcolor: '#572E91',
            color: '#FFFFFF',
            py: 1.5,
            borderRadius: 2,
            '&:hover': { bgcolor: '#451d7e' },
          }}
          disabled={!formData.username || !formData.yearOfBirth}
        >
          Continue
        </Button>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid #FF9911',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Typography variant="body2">
          Have an account?{' '}
          <Button
            variant="text"
            onClick={() => router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`)}
            sx={{ color: '#572E91', fontWeight: 'bold' }}
          >
            Sign In
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default NewUser;
