/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import {
  fetchProfileData,
  fetchLocationDetails,
  verifyOtp,
  deleteUser,
  myCourseDetails,
  renderCertificate,
  deactivateUser,
} from '../../services/ProfileService';
import {
  sendOtp,
  verifyOtpService,
  authenticateUser,
} from '../../services/LoginService';
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
  Card,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import OTPDialog from '../../Components/OTPDialog';
export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);

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
  const [userDataProfile, setUserDataProfile] = useState([
    { label: 'First Name', value: '' },
    { label: 'Middle Name', value: '' },
    { label: 'Last Name', value: '' },
    { label: 'Profile Type', value: '' },
  ]);
  const [userCustomFields, setUserCustomFields] = useState([]);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hashCode, setHashCode] = useState('');
  const [isOpenOTP, setIsOpenOTP] = useState(false);

  useEffect(() => {
    const getProfileData = async () => {
      setLoading(true);
      try {
        const acc_token = localStorage.getItem('accToken');
        const userId = localStorage.getItem('userId');
        const tenantResponse = await authenticateUser({
          token: acc_token,
          userId: userId,
        });
        if (tenantResponse?.result) {
          // No .result.userData → directly tenantResponse
          setUserData(tenantResponse?.result?.userData);

          const { firstName, middleName, lastName, tenantData } =
            tenantResponse?.result?.userData ?? {};

          const mappedProfile = [
            // { label: 'First Name', value: firstName ?? '-' },
            // // { label: 'Middle Name', value: middleName ?? '-' },
            // { label: 'Last Name', value: lastName ?? '-' },
            // {
            //   label: 'Profile Type',
            //   value: tenantData?.[0]?.roleName ?? '-',
            // },
          ];

          setUserDataProfile(mappedProfile);

          const customFields = tenantResponse?.result?.userData?.customFields;
          const desiredOrder = [
            'Roles',
            'subRoles',
            'State',
            'District',
            'Block',
            'Cluster',
            'School',
          ];
          const cleanValue = (value: any) => {
            if (Array.isArray(value)) {
              return value
                .map((v) => v.value)
                .join(', ')
                .replace(/\\$/, '');
            }

            if (typeof value === 'string') {
              try {
                const firstParse = JSON.parse(value);
                if (typeof firstParse === 'string') {
                  const secondParse = JSON.parse(firstParse);
                  return (
                    secondParse?.name || JSON.stringify(secondParse)
                  ).replace(/\\$/, '');
                }
                return (firstParse?.name || JSON.stringify(firstParse)).replace(
                  /\\$/,
                  ''
                );
              } catch {
                const match = value.match(/"name":"([^"]+)"/);
                if (match) return match[1].replace(/\\$/, '');

                const fallbackMatch = value.match(/"([^"]+)"}/);
                return fallbackMatch
                  ? fallbackMatch[1].replace(/\\$/, '')
                  : value.replace(/\\$/, '');
              }
            }

            return value;
          };
          const fieldMap = new Map(
            customFields.map((field: any) => [
              field?.label,
              { label: field?.label, value: cleanValue(field?.selectedValues) },
            ])
          );

          const sortedData = desiredOrder
            .map((label) => fieldMap.get(label))
            .filter(Boolean);

          const combinedProfileData = [...sortedData];

          const formattedProfileData = sortedData.map((item) => {
            if (item.label === 'Roles') {
              // Convert to Title Case (CamelCase)
              return {
                ...item,
                value: item.value
                  .toLowerCase()
                  .replace(/(^\w|\s\w|&\s*\w)/g, (m) => m.toUpperCase()),
              };
            } else if (item.label.toLowerCase() === 'subroles') {
              // Convert each comma-separated value to UPPERCASE
              return {
                ...item,
                value: item.value
                  .split(',')
                  .map((role) => role.trim().toUpperCase())
                  .join(', '),
              };
            }
            return item;
          });

          setUserDataProfile(formattedProfileData);

          //  setUserCustomFields(sortedData);
          console.log(
            'sortedData',

            combinedProfileData
          );
        }
      } catch (err) {
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
    handleMyCourses();
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, [router]);

  const handleMyCourses = async () => {
    const token = localStorage.getItem('accToken');
    if (token) {
      const userId = localStorage.getItem('userId');
      const detailsResponse = await myCourseDetails({
        token,
        userId,
      });
      setCourseDetails(detailsResponse?.result);
    }
  };
  const handleViewTest = async (certificateId: string) => {
    try {
      const response = await renderCertificate(certificateId);
      const responseData = JSON.parse(response);
      const certificateHtml = responseData?.result; // <-- grab HTML from the 'result' field

      const blob = new Blob([certificateHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error rendering certificate:', err);
    }
  };

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
    let otpPayload;
    if (userData.email) {
      otpPayload = {
        email: userData.email,
        reason: 'signup',
        firstName: userData.firstName,
        key: 'SendOtpOnMail',
        replacements: {
          '{eventName}': 'Shiksha Graha OTP',
          '{programName}': 'Shiksha Graha',
        },
      };
    } else if (userData.mobile) {
      console.log('userData.mobile', String(userData?.mobile ?? ''));
      otpPayload = {
        mobile: String(userData?.mobile ?? ''), // Ensure fallback to empty string if undefined
        reason: 'signup',
      };
    } else {
      setShowError(true);
      setErrorMessage('Either email or mobile must be provided');
      return;
    }

    const registrationResponse = await sendOtp(otpPayload);
    if (
      registrationResponse?.params?.successmessage === 'OTP sent successfully'
    ) {
      setHashCode(registrationResponse?.result?.data?.hash);
      setErrorMessage(registrationResponse.message);
      setIsOpenOTP(true);
    } else {
      setShowError(true);
      setErrorMessage(
        registrationResponse.data && registrationResponse.data.params.err
      );
    }
  };
  const handleVerifyOTP = async (otp: string) => {
    let verifyOTPpayload;
    if (userData.email) {
      verifyOTPpayload = {
        email: userData.email,
        reason: 'signup',
        otp: otp,
        hash: hashCode,
      };
    } else {
      verifyOTPpayload = {
        mobile: String(userData?.mobile ?? ''),
        reason: 'signup',
        otp: otp,
        hash: hashCode,
      };
    }

    const verifyOtpResponse = await verifyOtpService(verifyOTPpayload);
    if (
      verifyOtpResponse?.params?.successmessage === 'OTP validation Sucessfully'
    ) {
      handleUserDeactivation();
    }
  };
  const handleUserDeactivation = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('accToken');

      if (!userId || !token) {
        console.error('Missing userId or token');
        return;
      }

      const response = await deactivateUser(userId, token);

      const userStatus = response?.result?.basicDetails?.status;
      if (userStatus === 'archived') {
        setOpenConfirmDeleteDialog(true); // Open the dialog
      } else {
        console.warn('User status is not inactive:', userStatus);
      }
    } catch (error) {
      console.error('Error during OTP submission or user deactivation:', error);
      // You can show an error dialog or snackbar here
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
  const displaySubRole = subRoles.length
    ? toCamelCase(subRoles).join(', ')
    : 'N/A';
  const framework = profileData?.framework || {};
  const displayBoard = framework.board?.join(', ') || 'N/A';
  const displayMedium = framework.medium?.join(', ') || 'N/A';
  const displayGradeLevel = framework.gradeLevel?.join(', ') || 'N/A';
  const displaySubject = framework.subject?.join(', ') || 'N/A';
  // localStorage.setItem('frameworkname', framework?.id);

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
  if (isAuthenticated) {
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
            paddingTop: '3%',
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
                    'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
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
                justifyContent="left"
                direction="row"
              >
                <Grid item>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    src={profileData?.avatar ?? ''}
                  >
                    {(userData?.firstName?.charAt(0) ?? 'U').toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid item>
                  <Typography
                    variant="h5"
                    textAlign="left"
                    color="#582E92"
                    fontWeight="bold"
                  >
                    {userData?.firstName + ' ' + userData?.lastName ?? 'User'}
                  </Typography>
                  <Typography variant="subtitle1" textAlign="left" color="gray">
                    {userData?.role}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    textAlign="left"
                    color="darkslategray"
                  >
                    @{userData.username}
                  </Typography>
                </Grid>
              </Grid>
              <br></br>
              <br></br>
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="center"
                direction="row"
              >
                <Grid item xs={12}>
                  {[
                    ...userDataProfile,
                    displayRole === 'HT & Officials' && {
                      label: 'Sub-role',
                      value: displaySubRole || 'N/A',
                    },
                  ]
                    .filter(Boolean) // Remove any falsy values (like the 'Sub-role' when not applicable)
                    .reverse()
                    .map((item) => (
                      <Typography
                        variant="body1"
                        key={item.label}
                        sx={{
                          fontWeight: 'bold',
                          color: '#333',
                          paddingBottom: '10px',
                        }}
                        style={{ display: 'flex', width: '100%' }}
                      >
                        <span
                          style={{
                            width: '25%',
                            textAlign: 'left',
                            color: '#FF9911',
                          }}
                        >
                          {toCamelCase(item.label)}
                        </span>
                        <span style={{ width: '70%' }}>
                          {Array.isArray(item.value)
                            ? ': ' +
                              item.value
                                .map((val) =>
                                  val.value === 'HT & Officials'
                                    ? 'HT & Officials'
                                    : toCamelCase(val.value)
                                )
                                .join(', ') // show list values
                            : ': ' + item.value}
                        </span>
                      </Typography>
                    ))}
                </Grid>
              </Grid>
            </Box>

            {/* Courses Card */}
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: 3,
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
                    'linear-gradient(to right, #FF9911 50%, #582E92 50%)', // Gradient effect
                  WebkitMask:
                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', // Mask to create border-only effect
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude', // Ensures only the border is visible
                },
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="black"
              >
                📘 My Courses
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {courseDetails?.data?.length > 0 ? (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Course ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>View</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseDetails?.data
                        ?.filter(
                          (course: any) => course.status === 'viewCertificate'
                        )
                        .map((course: any) => (
                          <TableRow
                            key={course.usercertificateId}
                            hover
                            sx={{
                              transition: '0.3s',
                              '&:hover': { backgroundColor: '#f9f9f9' },
                            }}
                          >
                            <TableCell>{course.courseId}</TableCell>
                            <TableCell>{course.status}</TableCell>
                            <TableCell>
                              <Link
                                component="button"
                                variant="body2"
                                underline="hover"
                                onClick={() =>
                                  handleViewTest(course.certificateId)
                                }
                              >
                                View Certificate
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No course data found.
                </Typography>
              )}
            </Box>
            {/* Framework Card */}
            {/* <Box
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
                    'linear-gradient(to right, #FF9911 50%, #582E92 50%)', // Gradient effect
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
                  color: '#582E92',
                }}
                onClick={handleEditClick}
              />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: '#333',
                      paddingBottom: '10px',
                    }}
                  >
                    <span style={{ color: '#FF9911' }}>Board: </span>
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
                    <span style={{ color: '#FF9911' }}>Medium: </span>
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
                    <span style={{ color: '#FF9911' }}>Classes: </span>
                    {displayGradeLevel}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={
                      fontWeight: 'bold',
                      color: '#333',
                      paddingBottom: '10px',
                    }}
                  >
                    <span style={{ color: '#FF9911' }}>Subjects: </span>
                    {displaySubject}
                  </Typography>
                </Grid>
              </Grid>
            </Box> */}
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
        <OTPDialog
          open={isOpenOTP}
          onClose={() => setIsOpenOTP(false)}
          onSubmit={handleVerifyOTP}
        />
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
              sx={{ color: '#582E92' }}
            >
              Cancel
            </Button>
            <Button
              // onClick={handleUserDeactivation}
              onClick={handleSendOtp}
              color="error"
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
        {/* Email Input Dialog */}

        <Dialog
          open={openConfirmDeleteDialog}
          onClose={() => setOpenConfirmDeleteDialog(false)}
        >
          <DialogTitle>
            Your account has been successfully deleted!!
          </DialogTitle>
          <DialogContent></DialogContent>
          <DialogActions>
            <Button onClick={confirm} sx={{ color: '#582E92' }}>
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
  } else {
    handleLogoutConfirm();
  }
}
