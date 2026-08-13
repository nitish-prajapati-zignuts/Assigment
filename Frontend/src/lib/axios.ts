import axios, { AxiosError, AxiosInstance } from "axios";
import { logger } from "./logger";
import { isAPIError, getErrorMessage } from "./apiTypes";

/**
 * Create API instance with interceptors
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Request Interceptor
 * Injects JWT token from localStorage
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Inject CSRF token if available
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("_csrf="))
        ?.split("=")[1];

      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    logger.debug("API Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
    });

    return config;
  },
  (error) => {
    logger.error("Request interceptor error", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and validates responses
 */
api.interceptors.response.use(
  (response) => {
    logger.debug("API Response", {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    // Handle 401 Unauthorized - redirect to login
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login (handle in app-level catch)
      }
    }

    // Handle 429 Rate Limit Exceeded - Toast notification
    if (status === 429 || (errorData && (errorData as any).code === "RATE_LIMIT_EXCEEDED")) {
      if (typeof window !== "undefined") {
        const rateLimitMessage =
          (errorData as any)?.message ||
          "API rate limit exceeded. Please try again later.";
        window.dispatchEvent(
          new CustomEvent("app-notification", {
            detail: {
              type: "error",
              title: "Rate Limit Exceeded",
              message: rateLimitMessage,
            },
          })
        );
      }
    }

    // Log the error with context
    logger.error("API Error", error, {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status,
      errorType: isAPIError(errorData) ? errorData.error : "UNKNOWN",
    });

    // Return error with enhanced message
    const message = isAPIError(errorData)
      ? getErrorMessage(errorData)
      : error.message || "An unexpected error occurred";

    return Promise.reject({
      ...error,
      message,
      data: errorData,
    });
  }
);

/**
 * Helper function for typed API calls with error handling
 */
export async function apiCall<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  config?: any
): Promise<{ data: T; status: number }> {
  try {
    const response = await api[method]<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    logger.error(`API ${method.toUpperCase()} failed`, error as Error, { url });
    throw error;
  }
}

export default api;
