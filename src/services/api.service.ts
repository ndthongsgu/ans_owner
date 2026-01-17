import { useAuthStore } from "@/hooks/auth/useAuthStore";
import API_ENDPOINTS, { API_ROUTES } from "./api-route";
import axiosInstance from "./axios";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: any;
  body?: any;
  timeout?: number;
  skipAuth?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const handleTimeout = (timeout: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), timeout)
  );

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const authStore = useAuthStore.getState();
  const refreshToken = authStore.refreshToken;

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  refreshPromise = request<{ accessToken: string; refreshToken: string }>(
    API_ENDPOINTS.AUTH.REFRESH,
    "POST",
    {
      skipAuth: true,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  )
    .then((response) => {
      authStore.setTokens(response.accessToken, response.refreshToken);
      return response.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const request = async <T>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    headers = {},
    params,
    body,
    timeout = API_ROUTES.TIMEOUT,
    skipAuth = false,
  } = options;

  if (params && method === "GET") {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    url = `${url}?${queryParams.toString()}`;
  }

  const finalHeaders = { ...API_ROUTES.HEADERS, ...headers };
  if (!skipAuth) {
    const authStore = useAuthStore.getState();
    const token = authStore.getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const fetchPromise = fetch(`${API_ROUTES.BASE_URL}${url}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
      if (res.status === 401 && !skipAuth && !url.includes("/auth/refresh")) {
        try {
          const newToken = await refreshAccessToken();
          // Retry the original request with new token
          return request<T>(url, method, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        } catch (refreshError) {
          // Refresh failed, redirect to login but only if we're not already on login page
          useAuthStore.getState().clearTokens();
          if (!window.location.pathname.includes("/login")) {
            window.location.href = `/login?message=${encodeURIComponent(
              "Session expired. Please login again."
            )}`;
          }
          throw new Error("Session expired");
        }
      }

      const errorText = await res.text();
      throw new Error(errorText || res.statusText);
    }

    if (res.status === 204) {
      return {} as T;
    }

    const text = await res.text();
    if (!text) return {} as T;

    try {
      return JSON.parse(text) as T;
    } catch (_) {
      return text as unknown as T;
    }
  });

  return Promise.race([fetchPromise, handleTimeout(timeout)]);
};

export const rootApiServiceOld = {
  get: <T>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => request<T>(url, "GET", { params, headers, ...options }),

  post: <T>(
    url: string,
    body?: any,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => request<T>(url, "POST", { body, headers, ...options }),

  put: <T>(
    url: string,
    body?: any,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => request<T>(url, "PUT", { body, headers, ...options }),

  delete: <T>(
    url: string,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => request<T>(url, "DELETE", { headers, ...options }),

  patch: <T>(
    url: string,
    body?: any,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => request<T>(url, "PATCH", { body, headers, ...options }),
};

export const requestAxios = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    headers = {},
    params,
    body,
    timeout = API_ROUTES.TIMEOUT,
    skipAuth = false,
  } = options;

  const finalHeaders = {
    ...headers,
    ...(skipAuth ? { "x-skip-auth": "true" } : {}),
  };

  try {
    const response = await axiosInstance.request<T>({
      url,
      method,
      headers: finalHeaders,
      params,
      data: body,
      timeout,
    });

    return response.data;
  } catch (error: any) {
    // Extract meaningful error message from response
    if (error.response?.data) {
      const errorData = error.response.data;

      // Use the server-provided message if available
      if (errorData.message) {
        throw new Error(errorData.message);
      }

      // Fallback to status text
      if (error.response.statusText) {
        throw new Error(error.response.statusText);
      }
    }

    // Fallback to generic error
    throw new Error(error.message || "Request failed");
  }
};

const rootApiService = {
  get: <T>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => requestAxios<T>("GET", url, { params, headers, ...options }),

  post: <T>(
    url: string,
    body?: any,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => requestAxios<T>("POST", url, { body, headers, ...options }),

  put: <T>(
    url: string,
    body?: any,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => requestAxios<T>("PUT", url, { body, headers, ...options }),

  delete: <T>(
    url: string,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => requestAxios<T>("DELETE", url, { headers, ...options }),

  patch: <T>(
    url: string,
    body?: any,
    headers?: Record<string, string>,
    options?: RequestOptions
  ) => requestAxios<T>("PATCH", url, { body, headers, ...options }),
};

export default rootApiService;
