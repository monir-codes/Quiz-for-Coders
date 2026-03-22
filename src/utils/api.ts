export const getApiUrl = (path: string) => {
  // Use process.env.APP_URL if set, otherwise fallback to current window origin
  const baseUrl = process.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  // If baseUrl is set, ensure it doesn't have a trailing slash
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${normalizedBaseUrl}${normalizedPath}`;
};
