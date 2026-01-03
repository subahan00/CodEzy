
//LoginService.js
import axios from 'axios'
const url= "http://localhost:9999/api"

const LoginService =
{  
        Test_Reg: async (creds)=>{
    try
    {const response = await axios.post(`${url}/register`,creds);
    return response;  
}
    catch(e){
        throw e;    
    }
},
Test_login : async (email,password)=>{

    try{
        const response=await axios.post(`${url}/login`,{email,password});
        return response;
    }
    catch(e){
        throw e;
    }
}
,
getUsername: async ()=>{
    try{
        const token= localStorage.getItem("token");
        const response= await axios.get(`${url}/profile`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        return response;
    }
    catch(e){
        throw e;
    }
}
};
export default LoginService;
