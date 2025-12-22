/**
 * API Configuration
 * 
 * In development mode, uses relative paths that go through Vite proxy
 * In production mode, uses the full API URL from environment variables
 */
const getApiUrl = (): string => {
  // Use relative path in development (via Vite proxy) to avoid CORS issues
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  
  // Use full URL in production
  return import.meta.env.VITE_APP_API_URL || 'https://ancellor.duckdns.org/api/v1';
};

export const API_URL = getApiUrl();


