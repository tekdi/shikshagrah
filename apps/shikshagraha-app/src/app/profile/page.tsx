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
  localStorage.setItem('frameworkname', framework?.id);
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
      showLogo={true}
      showBack={true}
    >
      <Box
        sx={{
          paddingTop: '20px',
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Typography
          variant="h5"
          color="#582E92"
          fontWeight="bold"
          sx={{ textAlign: 'center', mb: 2 }}
        >
          Welcome, {profileData?.firstName || 'User'}
        </Typography>

        <Card
          sx={{
            mb: 3,
            boxShadow: 3,
            borderRadius: 3,
            padding: 2,
            mb: 3, // margin bottom
            mt: 2, // margin top
            ml: 2, // margin left
            mr: 2,
          }}
        >
          <CardContent>
            <Typography>
              <strong>Role:</strong> {displayRole}
            </Typography>
            <Typography>
              <strong>Sub-role:</strong> {displaySubRole || 'N/A'}
            </Typography>
            {locationDetails.map((loc, index) => (
              <Typography key={index}>
                <strong>
                  {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}:
                </strong>{' '}
                {loc.name || 'N/A'}
              </Typography>
            ))}
            <Typography>
              <strong>School:</strong>{' '}
              {profileData?.externalIds?.find(
                (id) => id.idType === 'declared-school-name'
              )?.id || 'N/A'}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            boxShadow: 3,
            borderRadius: 3,
            padding: 2,
            position: 'relative', // Add relative positioning to the card
            mb: 3, // margin bottom
            mt: 2, // margin top
            ml: 2, // margin left
            mr: 2, // Margin at the bottom of the card
          }}
        >
          {/* Pencil icon positioned at the top-right corner */}
          <EditIcon
            sx={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#582E92',
            }}
            onClick={handleEditClick}
          />

          <CardContent>
            <Typography>
              <strong>Board:</strong> {displayBoard}
            </Typography>
            <Typography>
              <strong>Medium:</strong> {displayMedium}
            </Typography>
            <Typography>
              <strong>Classes:</strong> {displayGradeLevel}
            </Typography>
            <Typography>
              <strong>Subjects:</strong> {displaySubject}
            </Typography>
          </CardContent>
        </Card>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            onClick={handleDeleteAccountClick}
            variant="outlined"
            style={{
              backgroundColor: '#582E92',
              color: 'white',
              border: '1px solid #582E92',
            }}
          >
            Delete Account
          </Button>
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
            style={{
              color: '#582E92',
            }}
            onClick={() => setOpenDeleteDialog(false)}
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
            style={{
              color: '#582E92',
            }}
            onClick={() => setOpenEmailDialog(false)}
          >
            Cancel
          </Button>
          <Button
            style={{
              color: '#582E92',
            }}
            onClick={handleSendOtp}
          >
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
            style={{
              color: '#582E92',
            }}
            onClick={() => setOpenOtpDialog(false)}
          >
            Cancel
          </Button>
          <Button
            style={{
              color: 'red',
            }}
            onClick={handleOtpSubmit}
            color="error"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
