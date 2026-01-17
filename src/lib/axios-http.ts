import { API_ROUTES } from "./api-route";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: any;
  body?: any;
  timeout?: number;
}

const handleTimeout = (timeout: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), timeout)
  );

const request = async <T>(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {}
): Promise<T> => {
  const { headers = {}, params, body, timeout = API_ROUTES.TIMEOUT } = options;

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

  const fetchPromise = fetch(`${API_ROUTES.BASE_URL}${url}`, {
    method,
    headers: {
      ...API_ROUTES.HEADERS,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
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

const rootApiService = {
  get: <T>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ) => request<T>(url, "GET", { params, headers }),
  post: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, "POST", { body, headers }),
  put: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, "PUT", { body, headers }),
  delete: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, "DELETE", { headers }),
  patch: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, "PATCH", { headers }),
};

export default rootApiService;
