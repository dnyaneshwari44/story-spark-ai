import axios, { AxiosResponse } from "axios";
import { getFromLocalStorage } from "../../utils/local-storage";
import { AUTH_KEY } from "../../constants/storage-key";
import { IMeta, ResponseErrorType } from "../../types";
const instance = axios.create();
instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers["Accept"] = "application/json";
instance.defaults.timeout = 60000;
export interface ApiResponseData<T = unknown> {
  data: T;
  meta?: IMeta | undefined;
}
instance.interceptors.request.use(
  function (config) {
    const accessToken = getFromLocalStorage(AUTH_KEY);
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponseData>) => {
    return response;
  },
  function (error) {
    let errorObject: ResponseErrorType;
    if (error.code === "ERR_NETWORK") {
      errorObject = {
        statusCode: 503,
        message: "Service Unavailable - The server is currently unreachable",
        errorMessages: [
          {
            path: "",
            message:
              "The server is currently unavailable. Please try again later.",
          },
        ],
      };
    } else if (error.code === "ECONNABORTED") {
      errorObject = {
        statusCode: 408,
        message: "Request Timeout",
        errorMessages: [
          {
            path: "",
            message: "The request timed out. Please try again.",
          },
        ],
      };
    } else if (error.response) {
      const errorMessages =
        error.response.data?.errorMessages ||
        error.response.data?.errorMessage ||
        (error.response.data?.message
          ? [{ path: "", message: error.response.data.message }]
          : [{ path: "", message: "Something went wrong!" }]);
      errorObject = {
        statusCode: error.response.data?.statusCode || error.response.status || 500,
        message: error.response.data?.message || "Something went wrong!",
        errorMessages,
      };
    } else {
      errorObject = {
        statusCode: 500,
        message: error.message || "Something went wrong!",
        errorMessages: [
          {
            path: "",
            message: "An unexpected error occurred. Please try again.",
          },
        ],
      };
    }
    return Promise.reject(errorObject);
  }
);
export { instance };
