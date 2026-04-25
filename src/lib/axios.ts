import axios, { AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4500/letsellr";

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/**
 * Whether a logout redirect is already in-flight.
 * Prevents multiple simultaneous 401s from triggering multiple redirects.
 */
let isLoggingOut = false;

/**
 * Two-step logout guard:
 * 1. A single 401/403 on a data endpoint does NOT immediately log the user out —
 *    that could be a transient Render cold-start drop or a per-route permission issue.
 * 2. We verify by calling /admin/check-session (the session health endpoint).
 * 3. Only if *that* call also returns 401 do we actually redirect to login.
 *
 * This prevents the reviews page (or any protected page) from kicking the admin
 * out just because one API call temporarily failed.
 */
const verifyAndLogout = async () => {
  if (isLoggingOut) return;
  if (!window.location.pathname.startsWith("/admin")) return;
  if (window.location.pathname === "/admin/login") return;

  isLoggingOut = true;
  
  // Wait 1.5s before checking session — helps with transient drops or Render restarts
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Use a raw axios call (not the intercepted instance) to avoid recursion
    await axios.get(`${BASE_URL}/admin/check-session`, { 
      withCredentials: true,
      timeout: 5000 // Don't wait forever
    });
    
    // Session is still valid! The original 401 was likely transient or a cold-start artifact.
    console.log("Session verified as active. Cancelling auto-logout.");
    isLoggingOut = false;
  } catch (err: any) {
    const status = err?.response?.status;
    
    // Only logout if the check-session call explicitly returns 401/403
    // If it's a network error (no response), the server might be restarting - we wait.
    if (status === 401 || status === 403) {
      localStorage.removeItem("adminToken");
      console.error("Session dead. Redirecting to login.");
      window.location.href = "/admin/login";
    } else {
      console.warn("Check-session failed but not with 401/403. Server might be cold-starting.");
      isLoggingOut = false;
    }
  }
};

// Add response interceptor to handle authentication errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Only react to 401 Unauthorized on admin pages
      if (status === 401) {
        verifyAndLogout();
      }
    }
    // Always propagate the error so individual pages can handle it too
    return Promise.reject(error);
  }
);

export default instance;
