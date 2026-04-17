import axios, { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4500/letsellr",
  withCredentials: true,
});


// Add response interceptor to handle authentication errors
instance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response) {
      const { status, data } = error.response;

      // Only handle 401 (Unauthorized) and 403 (Forbidden) as definitive auth failures
      // 404 should usually not trigger a logout unless it's explicitly an auth-related 404 (rare)
      if (status === 401 || status === 403) {
        const message = data?.message?.toLowerCase() || "";
        const isAuthError = 
          message.includes('not logged in') ||
          message.includes('unauthorized') ||
          message.includes('not authenticated') ||
          message.includes('login required') ||
          message.includes('no token') ||
          message.includes('invalid token') ||
          message.includes('token expired') ||
          message.includes('admin not logged in');

        if (isAuthError) {
          // Remove token from localStorage to sync frontend state
          localStorage.removeItem("adminToken");

          // Only redirect if we're on an admin page (avoid logging out public users)
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            console.warn("Auth failure detected, redirecting to login:", message);
            window.location.href = '/admin/login';
          }
        }
      }
    }

    // Return the error for further handling
    return Promise.reject(error);
  }
);

export default instance;
