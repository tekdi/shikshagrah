'use client';

import { useEffect, useState } from 'react';
import {
  fetchProfileData,
  fetchLocationDetails,
  sendOtp,
  deleteAccount,
} from '../../services/ProfileService';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const token = localStorage.getItem('accToken') || '';
        const userId = localStorage.getItem('userId') || '';
        const data = await fetchProfileData(userId, token);
        setProfileData(data);

        const locations = data.profileLocation || [];
        const flattenedLocationData = await fetchLocationDetails(locations);

        const order = ['state', 'district', 'block', 'cluster'];
        const sortedLocations = flattenedLocationData.sort(
          (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
        );

        setLocationDetails(sortedLocations);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        // setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  const handleAccountClick = () => {
    console.log('Account clicked');
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    localStorage.removeItem('accToken');
    localStorage.clear();
  };

  const handleDeleteAccountClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmation = () => {
    setOpenDeleteDialog(false);
    setOpenEmailDialog(true);
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    let type: 'email' | 'phone';

    if (emailRegex.test(email)) {
      type = 'email';
    } else if (mobileRegex.test(email)) {
      type = 'phone';
    } else {
      setError('Please enter a valid Email or Mobile Number');
      return;
    }

    try {
      console.log(`Sending OTP to ${email} as ${type}`);
      await sendOtp(email, type);
      setOpenEmailDialog(false);
      setOpenOtpDialog(true);
    } catch (error) {
      setError('Failed to send OTP');
      console.error(error);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      if (!otp) {
        setError('Please enter OTP');
        return;
      }

      const storedUserId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('accToken');

      if (!storedUserId || !authToken) {
        setError('User authentication failed. Please log in again.');
        return;
      }

      const emailOrPhone = email; // Use the entered email/phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const type = emailRegex.test(emailOrPhone) ? 'email' : 'phone';

      await deleteAccount(emailOrPhone, type, otp, storedUserId, authToken);

      setOpenOtpDialog(false);
      console.log('Account successfully deleted');
      // router.push('http://localhost:3000'); // Redirect if needed
    } catch (error) {
      setError('Invalid OTP');
      console.error(error);
    }
  };

  const roleTypes =
    [...new Set(profileData?.profileUserTypes?.map((role) => role.type))] || [];
  const subRoles =
    [
      ...new Set(
        profileData?.profileUserTypes
          ?.filter((role) => role.subType)
          .map((role) => role.subType)
      ),
    ] || [];

  const organisationRoles =
    profileData?.organisations
      ?.flatMap((org) => org.roles)
      ?.filter((role) => role !== null) || [];

  const displayRole = roleTypes.length ? roleTypes.join(', ') : 'N/A';
  const displaySubRole = subRoles.length ? subRoles.join(', ') : 'N/A';

  const framework = profileData?.framework || {};
  const displayBoard = framework.board?.join(', ') || 'N/A';
  const displayMedium = framework.medium?.join(', ') || 'N/A';
  const displayGradeLevel = framework.gradeLevel?.join(', ') || 'N/A';
  const displaySubject = framework.subject?.join(', ') || 'N/A';
  // localStorage.setItem('frameworkname', framework?.id);
  useEffect(() => {
    if (typeof window !== 'undefined' && profileData?.framework?.id) {
      localStorage.setItem('frameworkname', profileData.framework.id);
    }
  }, [profileData]);

  const handleEditClick = () => {
    router.push('/profile-edit');
    localStorage.setItem('selectedBoard', displayBoard);
    localStorage.setItem('selectedMedium', displayMedium);
    localStorage.setItem('selectedGradeLevel', displayGradeLevel);
    localStorage.setItem('selectedSubject', displaySubject);
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" textAlign="center" sx={{ mt: 5 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Layout
      showTopAppBar={{
        title: 'Profile',
        showMenuIcon: true,
        profileIcon: [
          {
            icon: <LogoutIcon />,
            ariaLabel: 'Account',
            onLogoutClick: handleAccountClick,
          },
        ],
      }}
      isFooter={true}
    >
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          overflowY: 'auto',
          paddingTop: '10%',
          paddingBottom: '56px',
        }}
      >
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 3, p: 2 }}>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={profileData?.avatar || ''}
              >
                {profileData?.firstName?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <br></br>
            <Grid item>
              <Typography
                variant="h5"
                textAlign="center"
                color="#582E92"
                fontWeight="bold"
              >
                Welcome, {profileData?.firstName || 'User'}
              </Typography>
            </Grid>
          </Grid>

          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: 3,
              p: 3,
              mt: 3,
            }}
          >
            <Grid container spacing={1}>
              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Role: </span>
                  {displayRole}
                </Typography>
              </Grid>

              {/* Sub-role */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Sub-role: </span>
                  {displaySubRole || 'N/A'}
                </Typography>
              </Grid>

              {/* Dynamic Location Details */}
              {locationDetails.map((loc, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 'bold', color: '#333' }}
                  >
                    <span style={{ color: '#FF9911' }}>
                      {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}:
                    </span>{' '}
                    {loc.name || 'N/A'}
                  </Typography>
                </Grid>
              ))}

              {/* School */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>School: </span>
                  {profileData?.externalIds?.find(
                    (id) => id.idType === 'declared-school-name'
                  )?.id || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: 3,
              p: 3,
              mt: 3,
              position: 'relative',
            }}
          >
            <EditIcon
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                cursor: 'pointer',
                color: '#582E92',
              }}
              onClick={handleEditClick}
            />
            <Grid container spacing={1}>
              {/* Board */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Board: </span>
                  {displayBoard}
                </Typography>
              </Grid>

              {/* Medium */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Medium: </span>
                  {displayMedium}
                </Typography>
              </Grid>

              {/* Classes */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Classes: </span>
                  {displayGradeLevel}
                </Typography>
              </Grid>

              {/* Subjects */}
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  <span style={{ color: '#FF9911' }}>Subjects: </span>
                  {displaySubject}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              onClick={handleDeleteAccountClick}
              variant="contained"
              sx={{
                bgcolor: '#582E92',
                color: 'white',
                ':hover': { bgcolor: '#461B73' },
              }}
            >
              Delete Account
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: '#582E92' }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmation} color="error">
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Input Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
        <DialogTitle>Enter Your Email/Mobile Number</DialogTitle>
        <DialogContent>
          <TextField
            label="Email/Mobile Number"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEmailDialog(false)}
            sx={{ color: '#582E92' }}
          >
            Cancel
          </Button>
          <Button onClick={handleSendOtp} sx={{ color: '#582E92' }}>
            Send OTP
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Input Dialog */}
      <Dialog open={openOtpDialog} onClose={() => setOpenOtpDialog(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <TextField
            label="OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenOtpDialog(false)}
            sx={{ color: '#582E92' }}
          >
            Cancel
          </Button>
          <Button onClick={handleOtpSubmit} color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
