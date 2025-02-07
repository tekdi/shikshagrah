import axios, { AxiosRequestConfig } from 'axios';

export const trackingData = (subIds: string[], courseIds: string[]) => {
  const data = JSON.stringify({
    userId: subIds,
    courseId: courseIds,
  });

  const trackingApiUrl = process.env.NEXT_PUBLIC_TRACKING_BASE_URL;

  if (!trackingApiUrl) {
    console.error('Tracking API URL is not defined in environment variables.');
    return;
  }

  const config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${trackingApiUrl}/v1/tracking/content/course/status`,
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  };

  return axios
    .request(config)
    .then((response) => {
      console.log('Tracking Response:', response.data);
      return response.data;
    })
    .catch((error) => {
      console.error('Error in tracking API:', error);
      throw error;
    });
};
