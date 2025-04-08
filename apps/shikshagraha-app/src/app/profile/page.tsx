/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import {
  fetchProfileData,
  fetchLocationDetails,
  sendOtp,
  verifyOtp,
  deleteUser,
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
  Grid,
  Avatar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  DialogContentText,
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
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const getProfileData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accToken') || '';
        const userId = localStorage.getItem('userId') || '';
        const data = await fetchProfileData(userId, token);
        setProfileData(data?.content[0]);

        const locations = data?.content[0]?.profileLocation || [];
        const flattenedLocationData = await fetchLocationDetails(locations);
        const order = ['state', 'district', 'block', 'cluster'];
        const sortedLocations = flattenedLocationData.sort(
          (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
        );
        setLocationDetails(sortedLocations);
      } catch (err) {
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, [router]);

  console.log('profileData', profileData);
  const handleAccountClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('accToken');
    localStorage.clear();
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };
  const handleDeleteAccountClick = () => {
    setOpenDeleteDialog(true);
  };
  const handleDeleteConfirmation = () => {
    setOpenDeleteDialog(false);
    setOpenEmailDialog(true);
  };
  const handleOptionChange = (event) => {
    const selectedValue = event.target.value;
    console.log('Selected option:', selectedValue);
    setSelectedOption(selectedValue);
    setValue(selectedValue === 'email' ? profileData.email : profileData.phone);
  };

  const handleSendOtp = async () => {
    console.log('selectedOption', selectedOption);
    const contactValue = selectedOption === 'email' ? newEmail : newPhone;
    const type = selectedOption; // 'email' or 'phone'
    console.log('contactValue', contactValue);
    if (!contactValue) {
      setError(`Please enter a valid ${type}`);
      return;
    }

    try {
      console.log('', contactValue);
      setEmail(newEmail);
      setNewPhone(newPhone);
      sendOtp(contactValue, type);
      setOpenEmailDialog(false);
      setOpenOtpDialog(true);
    } catch (error) {
      setError('Failed to send OTP');
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
      const emailOrPhone = newEmail || newPhone; // Use the entered email/phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      console.log('emailOrPhone', emailOrPhone);
      const type = emailRegex.test(emailOrPhone) ? 'email' : 'phone';
      const otpResponse = await verifyOtp(emailOrPhone, otp, type);
      console.log('otpResponse', otpResponse);
      const err = otpResponse?.response;
      if (
        otpResponse ==
          'OTP verification failed. Remaining attempt count is 0.' ||
        otpResponse ==
          'OTP verification failed. Remaining attempt count is 1.' ||
        err?.data?.params?.status === 'FAILED'
      ) {
        // setShowError(true);
        setShowError(true);
        setErrorMessage(err.data.params.errmsg);
        setInvalidOtp(true);
        setRemainingAttempts((prev) => prev - 1);
        return;
      } else if (otpResponse.params.status == 'SUCCESS') {
        const registrationResponse = await deleteUser({});
        console.log(registrationResponse);
        if (registrationResponse.result.response == 'SUCCESS') {
          setOpenOtpDialog(false);
          setOpenConfirmDeleteDialog(true);
          console.log('Account successfully deleted');
          // setShowError(true);
          // setErrorMessage('Account successfully deleted');
        } else {
          setShowError(true);
          setErrorMessage(err.data.params.errmsg);
        }
      }
    } catch (error) {
      setError('Invalid OTP');
      console.error(error);
    }
  };

  const confirm = () => {
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    localStorage.removeItem('accToken');
    localStorage.clear();
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
  const [value, setValue] = useState(profileData?.email || '');
  const handleEditClick = () => {
    router.push('/profile-edit');
    localStorage.setItem('selectedBoard', displayBoard);
    localStorage.setItem('selectedMedium', displayMedium);
    localStorage.setItem('selectedGradeLevel', displayGradeLevel);
    localStorage.setItem('selectedSubject', displaySubject);
  };
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
  // if (error) {
  //   return (
  //     <Typography variant="h6" color="error" textAlign="center" sx={{ mt: 5 }}>
  //       {error}
  //     </Typography>
  //   );
  // }
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
          // backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          overflowY: 'auto',
          paddingTop: '10%',
          paddingBottom: '56px',
        }}
      >
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 3, p: 2 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: '12px',
              p: 3,
              mt: 3,
              transform: 'translateY(-5px)',
              boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'inherit',
                padding: '1px',
                background:
                  'linear-gradient(to right, #FFC857 50%, #024F9D 50%)',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              },
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
              direction="column"
            >
              <Grid item>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  src={profileData?.avatar || ''}
                >
                  {profileData?.firstName?.charAt(0) || 'U'}
                </Avatar>
              </Grid>
              <Grid item>
                <Typography
                  variant="h5"
                  textAlign="center"
                  color="#024F9D"
                  fontWeight="bold"
                >
                  {profileData?.firstName || 'User'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          {/* Profile Card */}
          <Box
            sx={{
              // background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
              borderRadius: '12px',
              p: 3,
              mt: 3,
              transform: 'translateY(-5px)',
              boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'inherit', // Inherit borderRadius for rounded corners
                padding: '1px', // Thickness of the border line
                background:
                  'linear-gradient(to right, #FFC857 50%, #024F9D 50%)', // Gradient effect
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', // Mask to create border-only effect
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude', // Ensures only the border is visible
              },
            }}
          >
            <Grid container spacing={2}>
              {/* Role */}
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '10px',
                  }}
                >
                  <span style={{ color: '#FFC857' }}>Role: </span>
                  {displayRole === 'administrator'
                    ? 'HT & Officials'
                    : toCamelCase(displayRole)}
                </Typography>
                {displayRole === 'administrator' && (
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: '#333',
                      paddingBottom: '10px',
                    }}
                  >
                    <span style={{ color: '#FFC857' }}>Sub-role: </span>
                    {displaySubRole || 'N/A'}
                  </Typography>
                )}
                {locationDetails.map((loc, index) => (
                  <>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        paddingBottom: '10px',
                      }}
                    >
                      <span style={{ color: '#FFC857' }}>
                        {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}:
                      </span>{' '}
                      {loc.name || 'N/A'}
                    </Typography>
                  </>
                ))}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '10px',
                  }}
                >
                  <span style={{ color: '#FFC857' }}>School: </span>
                  {profileData?.organisations[1]?.orgName === 'demotenant1'
                    ? profileData?.organisations[0]?.orgName || 'N/A'
                    : profileData?.organisations[0]?.orgName ||
                      profileData?.organisations[1]?.orgName ||
                      'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          {/* Framework Card */}
          <Box
            sx={{
              // background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
              borderRadius: '12px',
              p: 3,
              mt: 3,
              transform: 'translateY(-5px)',
              boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.3)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'inherit', // Inherit borderRadius for rounded corners
                padding: '1px', // Thickness of the border line
                background:
                  'linear-gradient(to right, #FFC857 50%, #024F9D 50%)', // Gradient effect
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', // Mask to create border-only effect
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude', // Ensures only the border is visible
              },
            }}
          >
            <EditIcon
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                cursor: 'pointer',
                color: '#024F9D',
              }}
              onClick={handleEditClick}
            />
            <Grid container spacing={2}>
              {/* Board */}
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '10px',
                  }}
                >
                  <span style={{ color: '#FFC857' }}>Board: </span>
                  {displayBoard}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '10px',
                  }}
                >
                  <span style={{ color: '#FFC857' }}>Medium: </span>
                  {displayMedium}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '10px',
                  }}
                >
                  <span style={{ color: '#FFC857' }}>Classes: </span>
                  {displayGradeLevel}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    paddingBottom: '10px',
                  }}
                >
                  <span style={{ color: '#FFC857' }}>Subjects: </span>
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
                bgcolor: '#024F9D',
                color: 'white',
                ':hover': { bgcolor: '#461B73' },
              }}
            >
              Delete Account
            </Button>
          </Box>
        </Box>
      </Box>
      {showError && (
        <Alert severity="error" sx={{ marginTop: '15px' }}>
          {errorMessage}
        </Alert>
      )}
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: '#024F9D' }}
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
          <RadioGroup value={selectedOption} onChange={handleOptionChange}>
            {profileData?.email && (
              <>
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label={`Email: ${profileData.email}`}
                />
                {selectedOption === 'email' && (
                  <TextField
                    label="Update Email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}

            {profileData?.phone && (
              <>
                <FormControlLabel
                  value="phone"
                  control={<Radio />}
                  label={`Mobile: ${profileData.phone}`}
                />
                {selectedOption === 'phone' && (
                  <TextField
                    label="Update Phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEmailDialog(false)}
            sx={{ color: '#024F9D' }}
          >
            Cancel
          </Button>
          <Button onClick={handleSendOtp} sx={{ color: '#024F9D' }}>
            Send OTP
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Input Dialog */}
      <Dialog open={openOtpDialog} onClose={() => setOpenOtpDialog(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Enter Otp"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenOtpDialog(false)}
            sx={{ color: '#024F9D' }}
          >
            Cancel
          </Button>
          <Button onClick={handleOtpSubmit} color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConfirmDeleteDialog}
        onClose={() => setOpenConfirmDeleteDialog(false)}
      >
        <DialogTitle>Your account has been successfully deleted!!</DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={confirm} sx={{ color: '#024F9D' }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showLogoutModal} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            No
          </Button>
          <Button onClick={handleLogoutConfirm} color="secondary">
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
