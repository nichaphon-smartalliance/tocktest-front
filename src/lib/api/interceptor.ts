import { mainClient } from "./client";
import { getSession } from "next-auth/react";

let initialized = false;

export function setupInterceptors() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  mainClient.interceptors.request.use(async (config) => {
    const session = await getSession();
    const token = session?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

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
