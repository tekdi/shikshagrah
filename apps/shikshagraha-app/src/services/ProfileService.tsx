// src/services/profileService.ts
import axios from 'axios';

export const fetchProfileData = async (userId: string, token: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_READ_USER}/${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: process.env.NEXT_PUBLIC_AUTH,
          'x-authenticated-user-token': token,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }

    const data = await response.json();
    return data.result.response;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};
export const fetchLocationDetails = async (locations) => {
  try {
    const responses = await Promise.all(
      locations.map(async (location) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_LOCATION_SEARCH}`,
          {
            method: 'POST',
            headers: {
              Authorization: process.env.NEXT_PUBLIC_AUTH,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              request: {
                filters: {
                  id: location.id,
                },
              },
            }),
          }
        );

        const result = await response.json();

        // Extract the first item from the response array
        return result.result.response && result.result.response.length > 0
          ? result.result.response[0]
          : null;
      })
    );

    // Filter out any null responses
    return responses.filter((item) => item !== null);
  } catch (error) {
    console.error('Error fetching location details:', error);
    return [];
  }
};

export const sendOtp = async (key: string, type: 'email' | 'phone') => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_SEND_OTP}`,
      {
        request: {
          type: type,
          key: key,
          templateId: 'otpContactUpdateTemplate',
        },
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${process.env.NEXT_PUBLIC_AUTH}`, // Replace with a valid token
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Delete Account
export const deleteAccount = async (
  key: string,
  type: 'email' | 'phone',
  otp?: string,
  userId?: string,
  authToken?: string
) => {
  try {
    if (otp) {
      // Step 1: Verify OTP
      const verifyResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_VERIFY_OTP}`,
       
        {
          request: {
            key: key,
            type: type,
            otp: otp,
            userId: userId,
          },
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `${process.env.NEXT_PUBLIC_AUTH}`, // Replace with a valid token
          },
        }
      );
      console.log('verifyResponse', verifyResponse);
      if (verifyResponse.data?.result !== 'SUCCESS') {
        throw new Error('OTP verification failed');
      }

      console.log('OTP Verified Successfully');

      // Step 2: Delete Account
      const deleteResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_DELETE_USER}`,

        {
          request: {
            userId: localStorage.getItem('userId'),
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${process.env.NEXT_PUBLIC_AUTH}`, // Replace with a valid token
            'x-authenticated-user-token': localStorage.getItem('accToken'),
          },
        }
      );

      return deleteResponse.data;
    } else {
      throw new Error('OTP is required to delete account');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    return new Error(
      error.response?.data?.message || 'Failed to delete account'
    );
  }
};

export const updateProfile = async (userId, selectedValues) => {
  const { board, medium, gradeLevel, subject } = selectedValues;

  const requestData = {
    request: {
      userId,
      framework: {
        board: board || [],
        gradeLevel: gradeLevel || [],
        id: localStorage.getItem('frameworkname'), // Update with actual ID if dynamic
        medium: medium || [],
        subject: subject || [],
      },
    },
  };
  console.log('requestData', requestData);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_UPDATE_USER}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${process.env.NEXT_PUBLIC_AUTH}`, // Replace with actual token
          'x-authenticated-user-token': localStorage.getItem('accToken'), // Replace with actual user token
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
