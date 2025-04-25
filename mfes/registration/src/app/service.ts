import axios from 'axios';

export const searchLocation = async (id, type = 'school') => {
  try {
    const headers = {
      Authorization: process.env.NEXT_PUBLIC_AUTH,
      'Content-Type': 'application/json',
    };

    // Set the filter based on type
    const filters = {
      type: type,
    };

    // Use `code` for 'school' and `id` for other types (cluster, block, district, state)
    if (type === 'school') {
      filters.code = id; // For school, we use `code` as the identifier
    } else {
      filters.id = id; // For cluster, block, district, state, use `id`
    }

    const payload = {
      filters: filters,
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_SEARCH_LOCATION}`,
      payload,
      { headers }
    );
    console.log('response', response?.data?.result);
    return response?.data?.result;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return error;
  }
};

export const fetchLocationData = async (udisecode) => {
  try {
    const locationData = { school: {} };

    // First API call to validate UDISE code (school)
    const firstResponse = await searchLocation(udisecode, 'school');
    console.log('firstResponse--', firstResponse);

    if (firstResponse.length === 0) {
      throw new Error('INVALID UDISE CODE');
    }

    const school = firstResponse;
    locationData.school = {
      ...school,
      // type: 'school',
      // code: school.code,
    };

    // Define a helper function to handle the recursive fetching for cluster, block, district, and state
    const fetchParentData = async (parentid, type) => {
      const response = await searchLocation(parentid, type);
      if (response.length === 0) {
        throw new Error(
          `${type.charAt(0).toUpperCase() + type.slice(1)} data not found`
        );
      }
      const data = response;
      console.log(data)
      return {
        ...data,
        type: type,
        id: data.parentid, // Use `parentId` as `id` for cluster, block, district, state
      };
    };
    console.log('school.parentid--', school);
    // Fetch parent data recursively based on the hierarchy
    if (school[0].parentid) {
      const cluster = await fetchParentData(school[0].parentid, 'cluster');
      locationData.cluster = cluster;

      if (cluster[0].parentid) {
        const block = await fetchParentData(cluster[0].parentid, 'block');
        locationData.block = block;

        if (block[0].parentid) {
          const district = await fetchParentData(block[0].parentid, 'district');
          locationData.district = district;

          if (district[0].parentid) {
            const state = await fetchParentData(district[0].parentid, 'state');
            locationData.state = state;
          } else {
            throw new Error('District does not have parentId');
          }
        } else {
          throw new Error('Block does not have parentId');
        }
      } else {
        throw new Error('Cluster does not have parentId');
      }
    } else {
      throw new Error('School does not have parentId');
    }

    return locationData;
  } catch (error) {
    console.error('Error in location fetching process:', error);
    return error;
  }
};

export const generateOTP = async (key, type) => {
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_AUTH,
    'Content-Type': 'application/json',
  };
  let req = {};
  console.log('type', type);
  if (type === 'email') {
    req = {
      request: {
        key,
        type,
      },
    };
  } else {
    req = {
      request: {
        key,
        type,
        templateId: 'otpContactUpdateTemplate',
      },
    };
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_GENRATE_OTP}`,
      req,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const verifyOtpService = async (email, otp, contactType) => {
  console.log('contactType', contactType);
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_AUTH,
    'Content-Type': 'application/json',
  };
  const req = {
    request: {
      key: email,
      type: contactType,
      otp: String(otp),
    },
  };

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_VERIFT_OTP}`,
      req,
      { headers }
    );
    return response.data; // Return response to be handled in the component
  } catch (error) {
    return error || 'Error verifying OTP';
  }
};

export const registerUserService = async (requestData) => {
  const modifiedRequestData = requestData?.requestData || requestData;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_NEW_REGISTRATION}`,
      modifiedRequestData
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting registration data:', error);
    return error.response;
  }
};
