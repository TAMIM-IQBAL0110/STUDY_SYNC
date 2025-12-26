export const baseUrl = import.meta.env.VITE_BASE_URL;

export const API_PATH = {
    AUTH:{
        LOGIN: "/api/v1/auth/login",
        REGISTER:"/api/v1/auth/register",
        VERIFY:"/api/v1/auth/verify",
        GET_USER_INFO: "/api/v1/auth/getUser",
        UPDATE_PROFILE: "/api/v1/auth/updateProfile",
        UPLOAD_PROFILE_IMAGE: "/api/v1/auth/uploadProfileImage",
    },
    TASK:{
        ADD:"/api/v1/task/add",
        GET_ALL_TASK:"/api/v1/task/get",
        UPDATE_TASK:(taskId)=>`/api/v1/task/update/${taskId}`,
        DELETE_TASK:(taskId)=>`/api/v1/task/${taskId}`,
    },
    DASHBOARD:{
        GET_DATA:"/api/v1/dashboard/",
    }
}
