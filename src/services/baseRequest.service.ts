import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuthHeader, removeToken } from "../utils/tokenUtils";

type Flags = {
  fullResponse?: boolean;
  errorsRedirect?: boolean;
};

type RequestFunction = Promise<AxiosResponse<any>>;

type ErrorType = {
  response?: {
    status: number;
  };
};

const errorsRedirectHandler = (error: any): void => {
  if (!error.response) {
    console.error("Unknown error", error);
    return;
  }

  const { status } = error.response;

  if (status === 401) {
    // Token expired or invalid, clear tokens and redirect to login
    removeToken();
    document.location.href = "/login";
  } else if ([400, 404, 409, 500].includes(status)) {
    throw error;
  } else if (status === 403) {
    document.location.href = "/";
  } else {
    console.log(error);
  }
};

export default class BaseRequestService {
  async request(fn: RequestFunction, flags: Flags = {}): Promise<any> {
    try {
      const result = await fn;

      if (!result.status && flags.errorsRedirect) {
        return errorsRedirectHandler(result);
      }

      return flags.fullResponse ? result : result.data;
    } catch (error) {
      if (flags.errorsRedirect) {
        errorsRedirectHandler(error as ErrorType);
      }
      throw error;
    }
  }

  async get(
    url: string,
    config?: AxiosRequestConfig,
    flags: Flags = {}
  ): Promise<any> {
    const authHeaders = getAuthHeader();
    const defaultConfig = {
      ...config,
      headers: {
        ...authHeaders,
        ...config?.headers,
      },
    };
    const promise = axios.get(url, defaultConfig);
    return this.request(promise, flags);
  }

  async post(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    flags: Flags = {}
  ): Promise<any> {
    const authHeaders = getAuthHeader();
    const defaultConfig = {
      ...config,
      headers: {
        ...authHeaders,
        ...config?.headers,
      },
    };
    const promise = axios.post(url, data, defaultConfig);
    return this.request(promise, flags);
  }

  async delete(
    url: string,
    config?: AxiosRequestConfig,
    flags: Flags = {}
  ): Promise<any> {
    const authHeaders = getAuthHeader();
    const defaultConfig = {
      ...config,
      headers: {
        ...authHeaders,
        ...config?.headers,
      },
    };
    const promise = axios.delete(url, defaultConfig);
    return this.request(promise, flags);
  }

  async patch(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    flags: Flags = {}
  ): Promise<any> {
    const authHeaders = getAuthHeader();
    const defaultConfig = {
      ...config,
      headers: {
        ...authHeaders,
        ...config?.headers,
      },
    };
    const promise = axios.patch(url, data, defaultConfig);
    return this.request(promise, flags);
  }

  async put(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    flags: Flags = {}
  ): Promise<any> {
    const authHeaders = getAuthHeader();
    const defaultConfig = {
      ...config,
      headers: {
        ...authHeaders,
        ...config?.headers,
      },
    };
    const promise = axios.put(url, data, defaultConfig);
    return this.request(promise, flags);
  }
}
