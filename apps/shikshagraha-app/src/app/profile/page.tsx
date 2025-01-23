'use client';

import { useEffect, useState } from 'react';
import {
  fetchProfileData,
  fetchLocationDetails,
  sendOtp, // new function to send OTP
  deleteAccount,
} from '../../services/ProfileService';
import { Layout } from '@shared-lib';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoreRoles, setShowMoreRoles] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For confirming account deletion
  const [openEmailDialog, setOpenEmailDialog] = useState(false); // For email input
  const [openOtpDialog, setOpenOtpDialog] = useState(false); // For OTP input
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleAccountClick = () => {
    router.push('http://localhost:3000');
    localStorage.removeItem('accToken');
  };

  const handleEditClick = () => {
    router.push('/profile-edit');
  };

  const handleDeleteAccountClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmation = () => {
    // Show the email input dialog
    setOpenDeleteDialog(false);
    setOpenEmailDialog(true);
  };

  const handleSendOtp = async () => {
    try {
      // Send OTP to the provided email
      await sendOtp(email);
      setOpenEmailDialog(false);
      setOpenOtpDialog(true); // Show OTP input after sending email
    } catch (error) {
      setError('Failed to send OTP');
      console.error(error);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      // Submit OTP and delete the account if valid
      await deleteAccount(otp, true); // Assuming deleteAccount accepts OTP for validation
      setOpenOtpDialog(false);
      router.push('/goodbye'); // Navigate to a goodbye page or log out
    } catch (error) {
      setError('Invalid OTP');
      console.error(error);
    }
  };

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
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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

  const handleShowMoreClick = () => {
    setShowMoreRoles(!showMoreRoles);
  };

  return (
    <Layout
      showTopAppBar={{
        title: 'Profile Details',
        showMenuIcon: false,
        actionIcons: [
          {
            icon: <LogoutIcon />,
            ariaLabel: 'Logout',
            onClick: handleAccountClick,
          },
        ],
      }}
      isFooter={true}
      showLogo={true}
      showBack={true}
    >
      <div style={{ padding: '20px', overflowX: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          
          <p>Shikshagraha ID: {profileData?.userName || 'N/A'}</p>
        </div>

        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <h3>Content Preference</h3>
          <p>
            <strong>Role:</strong> {displayRole}
          </p>
          {roleTypes.includes('administrator') && (
            <p>
              <strong>Sub-role:</strong> {displaySubRole}
            </p>
          )}
          {locationDetails.length > 0 ? (
            locationDetails.map((loc, index) => (
              <p key={index}>
                <strong>
                  {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}:
                </strong>{' '}
                {loc.name || 'N/A'}
              </p>
            ))
          ) : (
            <p>No location details available.</p>
          )}
          <p>
            <strong>School:</strong>{' '}
            {profileData?.externalIds?.find(
              (id) => id.idType === 'declared-school-name'
            )?.id || 'N/A'}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <p>
            <strong>Board:</strong> {displayBoard}
          </p>
          <p>
            <strong>Medium:</strong> {displayMedium}
          </p>
          <p>
            <strong>Classes:</strong> {displayGradeLevel}
          </p>
          <p>
            <strong>Subjects:</strong> {displaySubject}
          </p>
        </div>
        <div>
          <Button
            onClick={handleDeleteAccountClick}
            variant="outlined" // Use 'outlined' for no background
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              color: '#582E92', // Text color
              borderColor: '#582E92', // Border color
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteConfirmation} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Input Dialog for OTP */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)}>
        <DialogTitle>Enter your Email to Receive OTP</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: '15px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendOtp} color="primary">
            Send OTP
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Input Dialog */}
      <Dialog open={openOtpDialog} onClose={() => setOpenOtpDialog(false)}>
        <DialogTitle>Enter OTP to Delete Account</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ marginBottom: '15px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOtpSubmit} color="primary">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
