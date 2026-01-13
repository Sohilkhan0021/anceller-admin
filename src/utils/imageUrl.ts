/**
 * Image URL Utility
 * 
 * Constructs full image URLs from relative paths returned by the API
 */

/**
 * Get the base URL for image requests (without /api/v1)
 * Always returns a full URL when possible
 * Uses the same domain as the API to ensure images are served correctly
 */
const getBaseUrl = (): string => {
  // Get the environment variable value and clean it
  let apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || '';
  
  // Handle case where env var might contain the variable name (e.g., "VITE_APP_API_URL=https://...")
  if (apiUrl.includes('=')) {
    apiUrl = apiUrl.split('=')[1] || '';
  }
  
  // If we have an API URL, extract the base domain (remove /api/v1 suffix and trailing slashes)
  if (apiUrl) {
    apiUrl = apiUrl.replace('/api/v1', '').replace(/\/$/, '');
    // Extract just the protocol and domain (e.g., https://api.anceller.com)
    const urlMatch = apiUrl.match(/^(https?:\/\/[^/]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    return apiUrl;
  }
  
  // Fallback: In development, we can use relative paths with Vite proxy
  // But since the user wants full URLs, we'll use the API domain
  // The vite.config.ts proxy for /uploads points to https://ancellor.duckdns.org
  // However, images are actually served from https://api.anceller.com/uploads
  // So we should use the API domain for consistency
  if (import.meta.env.DEV) {
    // In development, use the API domain (same as production)
    // This ensures images load correctly regardless of proxy configuration
    return 'https://api.anceller.com';
  }
  
  // Production fallback - use the default API domain
  return 'https://api.anceller.com';
};

/**
 * Construct a full image URL from a relative path
 * 
 * @param imagePath - The image path from the API (e.g., "/uploads/admin/catalog/categories/image.jpg")
 * @returns Full URL to the image
 * 
 * @example
 * getImageUrl("/uploads/admin/catalog/categories/image.jpg")
 * // Returns: "https://api.example.com/uploads/admin/catalog/categories/image.jpg"
 * 
 * @example
 * getImageUrl("https://example.com/image.jpg")
 * // Returns: "https://example.com/image.jpg" (already a full URL)
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) {
    return null;
  }

  // Clean the image path - remove any environment variable strings that might have been accidentally included
  let cleanedPath = imagePath.trim();
  
  // Remove any environment variable patterns that might be in the path
  // Handles cases like: "path- VITE_APP_API_URL=https://api.anceller.com/api/v1filename.jpg"
  // This regex matches: optional whitespace + VITE_* + = + URL (with optional path) + any non-whitespace
  cleanedPath = cleanedPath.replace(/\s*VITE_[A-Z_]+=https?:\/\/[^\s]+/g, '');
  // Also handle cases without http:// prefix
  cleanedPath = cleanedPath.replace(/\s*VITE_[A-Z_]+=[^\s/]+/g, '');
  
  // If it's already a full URL (http/https), return as-is
  if (cleanedPath.startsWith('http://') || cleanedPath.startsWith('https://')) {
    return cleanedPath;
  }

  // Skip local file paths (Windows: C:/, D:/, etc.)
  if (cleanedPath.match(/^[A-Z]:[\\/]/)) {
    return null;
  }

  // Skip absolute Unix paths that aren't web paths
  // Allow /uploads, /static, /images paths
  if (cleanedPath.startsWith('/') && 
      !cleanedPath.startsWith('/uploads') && 
      !cleanedPath.startsWith('/static') && 
      !cleanedPath.startsWith('/images')) {
    return null;
  }

  // Get base URL and construct full path
  const baseUrl = getBaseUrl();
  
  // Ensure the path starts with / and clean up any double slashes
  let normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
  normalizedPath = normalizedPath.replace(/\/+/g, '/'); // Remove multiple slashes
  
  // Always construct a full URL - never return relative paths
  // This prevents the backend from treating image requests as API routes
  if (!baseUrl) {
    // If no base URL is available, use the default API domain
    return `https://api.anceller.com${normalizedPath}`;
  }
  
  const finalUrl = `${baseUrl}${normalizedPath}`;
  
  return finalUrl;
};

