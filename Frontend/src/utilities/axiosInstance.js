import axios from "axios";
import { baseUrl } from "./apiPath.js";  

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout:10000, //10 seconds timeout
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
  (response) => response,
  (error)=>{
    // Handle common error globally
    if(error.response){
      if(error.response.status === 401){
        // Unauthorized → redirect to login
        window.location.href = "/login";
      } 
      else if(error.response.status === 500){
        console.error("Server error, Please try again later");
      }
    } 
    else if (error.code === "ECONNABORTED") {
      console.error("Request timeout, Please try again.");
    } 
    else {
      console.error("Network error, please check your connection.");
    }

    return Promise.reject(error);
  }
)



export default axiosInstance;