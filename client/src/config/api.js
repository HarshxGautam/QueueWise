// Centralized API and WebSocket backend connection config
// 1. Uses import.meta.env.VITE_API_URL if provided at build time (e.g. on Vercel)
// 2. Automatically falls back to the live Render backend on production/cloud domains (e.g. *.vercel.app)
// 3. Defaults to http://localhost:5000 for local development on localhost / 127.0.0.1 / LAN IPs

const isBrowser = typeof window !== "undefined";
const hostname = isBrowser ? window.location.hostname : "localhost";
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname === "[::1]";

const defaultProductionBackend = "https://queuewise-hdfw.onrender.com";
const defaultLocalBackend = `http://${hostname}:5000`;

const envUrl = (import.meta.env.VITE_API_URL || "").trim();
const rawBackendUrl = (envUrl || (isLocalhost ? defaultLocalBackend : defaultProductionBackend)).replace(/\/+$/, "");

// Normalize root backend origin for Socket.IO (stripping any accidental trailing /api)
export const SOCKET_URL = rawBackendUrl.endsWith("/api")
  ? rawBackendUrl.slice(0, -4).replace(/\/+$/, "")
  : rawBackendUrl;

// Standardized API Base URL (always exactly ${SOCKET_URL}/api with no duplicate /api/api)
export const API_BASE = `${SOCKET_URL}/api`;
export const BACKEND_URL = SOCKET_URL;

export default API_BASE;

