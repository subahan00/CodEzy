import axios from 'axios';

const BASE_URL = 'http://localhost:9999/api/users';

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
};
export default profileService;