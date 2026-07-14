import axios from "axios";

export const mainClient = axios.create({
  baseURL: "/api/backend",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});
