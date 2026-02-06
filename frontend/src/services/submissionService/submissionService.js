import axios from 'axios';

const BASE_URL = 'http://localhost:9999/api/submissions';
const submissionService = {
  createSubmission: async (contentId, language, sourceCode) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(`${BASE_URL}`, {
        contentId,
        language,
        sourceCode
      }, config);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getSubmissionById: async (submissionId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.get(`${BASE_URL}/${submissionId}`, config);
      return response;
    } catch (error) {
      throw error;
    }
  },
  runCode: async (language, sourceCode, problemId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(`${BASE_URL}/run`, {
        language,
        code: sourceCode,
        problemId
      }, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

};

export default submissionService;