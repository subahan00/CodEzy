import axios from 'axios';
const BASE_URL = 'http://localhost:9999/api/problems';
const problemService = {
    getProblemBySlug: async (slug) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.get(`${BASE_URL}/${slug}`, config);
            return response;
        } catch (error) {
            throw error;
        }
    },
    getAllProblems: async()=> {
    try {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response= await axios.get(`${BASE_URL}`,config);
        return response;
    } catch(error){
        throw error;
    }
    },
    createProblem: async(problemData)=>{
        try{
           const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const repsonse=await axios.post(`${BASE_URL}`,problemData,config) ;
     
        return repsonse;
        
        } catch (error){
            throw error;
        }
    },
    deleteProblem: async(id)=>{
        try{
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response= await axios.delete(`${BASE_URL}/${id}`,config);
            return response;
        } catch (error){
            throw error;
        }   
   
},
 updateProblem: async(id,problemData)=>{
    try{
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response= await axios.put(`${BASE_URL}/${id}`,problemData,config);
        return response;
    } catch (error){
        throw error;
    }

},
publishProblem: async(id)=>{
    try{
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response= await axios.put(`${BASE_URL}/publish/${id}`,{},config);
        return response;
    } catch (error){
        throw error;
       }

},
 getRandomProblem: async () => {
    try {
        const token = localStorage.getItem("token");
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get(`${BASE_URL}/random`, config);
        return response;
    } catch (error) {
        throw error;
    }
}
};

   
export default problemService;

