import axios from "axios";

export const mainClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.33.65:4004",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});
