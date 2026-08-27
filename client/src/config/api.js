// Centralized API and WebSocket backend connection config
// In production (e.g. Vercel), uses import.meta.env.VITE_API_URL (e.g. 'https://queuewise-hdfw.onrender.com')
// In local development, falls back safely to http://${window.location.hostname}:5000

const fallbackHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const rawBackendUrl = (import.meta.env.VITE_API_URL || `http://${fallbackHost}:5000`).trim().replace(/\/+$/, "");

// Normalize root backend origin for Socket.IO (stripping any accidental trailing /api)
export const SOCKET_URL = rawBackendUrl.endsWith("/api")
  ? rawBackendUrl.slice(0, -4).replace(/\/+$/, "")
  : rawBackendUrl;

// Standardized API Base URL (always exactly ${SOCKET_URL}/api with no duplicate /api/api)
export const API_BASE = `${SOCKET_URL}/api`;
export const BACKEND_URL = SOCKET_URL;

export default API_BASE;
