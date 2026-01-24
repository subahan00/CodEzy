import axios from "axios";
const BASE_URL = 'http://localhost:9999/api/leaderboard';
 export const leaderboardService ={
    getLeaderboard: async()=>{
        try{
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response= await axios.get(`${BASE_URL}`,config);
            return response;
        } catch (error){
            throw error;
        }
    }
 }
 export default leaderboardService;