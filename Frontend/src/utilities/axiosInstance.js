import axios from "axios";
import { baseUrl } from "./apiPath.js";  

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout:30000, //30 seconds timeout for production (backend wake-up time)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  }
});
// Request Interceptor
axiosInstance.interceptors.request.use(
  (config)=>{
    const token = localStorage.getItem("token")
    if(token){
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error)=>{
    return Promise.reject(error);
  }
)
// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Data fetched successfully`);
    return response;
  },
  (error)=>{
    // Handle common error globally
    if(error.response){
      console.error(`❌ Error: ${error.response.status}`);
      if(error.response.status === 401){
        // Unauthorized → redirect to login
        console.warn("⚠️ Session expired - Redirecting to login");
        window.location.href = "/login";
      }
    } 
    else if (error.code === "ECONNABORTED") {
      console.error(`❌ Request timeout`);
    } 
    else {
      console.error(`❌ Network error`);
    }

    return Promise.reject(error);
  }
)



export default axiosInstance;