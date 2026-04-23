import axios from 'axios'

// BASE Instance - all req goes through this

const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
})

//── Request Interceptor ──────────────────────────────
// Runs BEFORE every request is sent
// Reads token from localStorage and attaches it to header

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem('token')
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Rsponse Interceptor
// Runs AFTER every response is received
// Checks for 401 Unauthorized status and handles it

api.interceptors.response.use(
    (response) => response,
    (error) =>{
        if(error.response?.status === 401){
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api