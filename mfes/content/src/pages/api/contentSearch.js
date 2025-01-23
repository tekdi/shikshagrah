import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { identifier } = req.query; // Get identifier from the query params

    // Ensure the environment variable is defined
    const searchApiUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!searchApiUrl) {
      return res.status(500).json({
        error: 'Search API URL environment variable is not configured',
      });
    }

    const data = {
      request: {
        filters: identifier
          ? { identifier }
          : {
              // identifier: 'do_1141652605790289921389',
              primaryCategory: [
                'Collection',
                'Resource',
                'Content Playlist',
                'Course',
                'Course Assessment',
                'Digital Textbook',
                'eTextbook',
                'Explanation Content',
                'Learning Resource',
                'Lesson Plan Unit',
                'Practice Question Set',
                'Teacher Resource',
                'Textbook Unit',
                'LessonPlan',
                'FocusSpot',
                'Learning Outcome Definition',
                'Curiosity Questions',
                'MarkingSchemeRubric',
                'ExplanationResource',
                'ExperientialResource',
                'Practice Resource',
                'TVLesson',
                'Course Unit',
                'Exam Question',
                'Question paper',
              ],
            },
      },
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${searchApiUrl}/api/content/v1/search`,
      data: data,
    };

    // Execute the request
    const response = await axios.request(config);
    const resData = response?.data?.result?.content;

    return res.status(200).json(resData); // Send back the result in the response
  } catch (error) {
    console.error('Error in ContentSearch API:', error);
    return res.status(500).json({ error: 'Failed to fetch content' });
  }
}
