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
      request: {
        filters: filters,
      },
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_SEARCH_LOCATION}`,
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return error;
  }
};

export const fetchLocationData = async (udisecode) => {
  try {
    const locationData = {};

    // First API call to validate UDISE code (school)
    const firstResponse = await searchLocation(udisecode, 'school');
    if (firstResponse.result.count === 0) {
      throw new Error('INVALID UDISE CODE');
    }

    const school = firstResponse.result.response[0];
    locationData.school = {
      ...school,
      type: 'school',
      code: school.code,
    };

    // Define a helper function to handle the recursive fetching for cluster, block, district, and state
    const fetchParentData = async (parentId, type) => {
      const response = await searchLocation(parentId, type);
      if (response.result.count === 0) {
        throw new Error(
          `${type.charAt(0).toUpperCase() + type.slice(1)} data not found`
        );
      }
      const data = response.result.response[0];
      return {
        ...data,
        type: type,
        id: data.parentId, // Use `parentId` as `id` for cluster, block, district, state
      };
    };

    // Fetch parent data recursively based on the hierarchy
    if (school.parentId) {
      const cluster = await fetchParentData(school.parentId, 'cluster');
      locationData.cluster = cluster;

      if (cluster.parentId) {
        const block = await fetchParentData(cluster.parentId, 'block');
        locationData.block = block;

        if (block.parentId) {
          const district = await fetchParentData(block.parentId, 'district');
          locationData.district = district;

          if (district.parentId) {
            const state = await fetchParentData(district.parentId, 'state');
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

export const verifyOtpService = async (email, otp) => {
  const headers = {
    Authorization: process.env.NEXT_PUBLIC_AUTH,
    'Content-Type': 'application/json',
  };
  const req = {
    request: {
      key: email,
      type: 'email',
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
    return error.response?.data?.error?.params?.errmsg || 'Error verifying OTP';
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
