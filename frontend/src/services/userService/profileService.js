import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users`;

export const profileService = {

    fetchHistory: async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.get(`${BASE_URL}/my-submissions`, config);
            return response.data;
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    },
    updateProfile: async (userData) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.put(`${BASE_URL}/profile`, userData, config);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },
    fetchAnalytics: async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    },
};
export default profileService;