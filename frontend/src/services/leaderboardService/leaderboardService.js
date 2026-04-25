import axios from "axios";
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/leaderboard`;
 export const leaderboardService ={
    getLeaderboard: async(category)=>{
        try{
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params:{
                    category:category
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