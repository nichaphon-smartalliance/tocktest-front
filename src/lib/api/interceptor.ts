import { mainClient } from "./client";

let initialized = false;

export function setupInterceptors() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  mainClient.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}
