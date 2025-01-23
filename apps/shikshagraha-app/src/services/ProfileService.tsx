// src/services/profileService.ts

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

export const sendOtp = async (email) => {
  // try {
  //   const response = await axios.post(`${API_URL}/account/send-otp`, {
  //     email,
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error sending OTP:', error);
  //   throw new Error('Failed to send OTP');
  // }
};

// Delete Account
export const deleteAccount = async (emailOrPhone, isOtp = false) => {
  // try {
  //   if (isOtp) {
  //     // If OTP is being verified, we assume OTP is passed along with the request
  //     const response = await axios.post(`${API_URL}/account/delete/verify`, {
  //       otp: emailOrPhone,
  //     });
  //     return response.data;
  //   } else {
  //     // Initiating account deletion process, passing email or phone for verification
  //     const response = await axios.post(`${API_URL}/account/delete`, {
  //       emailOrPhone,
  //     });
  //     return response.data;
  //   }
  // } catch (error) {
  //   console.error('Error deleting account:', error);
  //   throw new Error('Failed to delete account');
  // }
};