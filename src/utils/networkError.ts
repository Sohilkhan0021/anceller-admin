/**
 * Network Error Detection Utility
 * 
 * Detects network connectivity issues and provides user-friendly error messages
 */

/**
 * Check if an error is a network connectivity error
 * @param error - The error object to check
 * @returns true if it's a network error, false otherwise
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Check for axios network errors
  if (error.isAxiosError) {
    // Network error (no response from server)
    if (!error.response) {
      // Check common network error messages
      const networkErrorMessages = [
        'Network Error',
        'network error',
        'ERR_NETWORK',
        'ERR_INTERNET_DISCONNECTED',
        'ERR_CONNECTION_REFUSED',
        'ERR_CONNECTION_TIMED_OUT',
        'ERR_CONNECTION_RESET',
        'ERR_NAME_NOT_RESOLVED',
        'ERR_FAILED',
        'timeout',
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
      ];

      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code?.toLowerCase() || '';

      return (
        networkErrorMessages.some(msg => errorMessage.includes(msg.toLowerCase())) ||
        networkErrorMessages.some(msg => errorCode.includes(msg.toLowerCase())) ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ERR_INTERNET_DISCONNECTED' ||
        error.code === 'ERR_CONNECTION_REFUSED' ||
        error.code === 'ERR_CONNECTION_TIMED_OUT'
      );
    }
  }

  // Check for generic network errors
  if (error.message) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('load failed')
    );
  }

  return false;
};

/**
 * Get a user-friendly error message for network errors
 * @param error - The error object
 * @returns User-friendly error message
 */
export const getNetworkErrorMessage = (error: any): string => {
  if (!isNetworkError(error)) {
    return '';
  }

  // Check if it's a timeout error
  if (
    error.code === 'ERR_CONNECTION_TIMED_OUT' ||
    error.code === 'ETIMEDOUT' ||
    error.message?.toLowerCase().includes('timeout')
  ) {
    return 'Connection timeout. Please check your internet connection and try again.';
  }

  // Check if it's a connection refused error
  if (
    error.code === 'ERR_CONNECTION_REFUSED' ||
    error.code === 'ECONNREFUSED'
  ) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Check if it's a DNS resolution error
  if (
    error.code === 'ERR_NAME_NOT_RESOLVED' ||
    error.code === 'ENOTFOUND'
  ) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  // Check if internet is disconnected
  if (error.code === 'ERR_INTERNET_DISCONNECTED') {
    return 'No internet connection. Please check your network settings and try again.';
  }

  // Generic network error
  return 'No internet connection or network error. Please check your network settings and try again.';
};

/**
 * Check if browser is online
 * @returns true if online, false if offline
 */
export const isOnline = (): boolean => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Assume online if we can't check
};

/**
 * Get a comprehensive error message that includes network status
 * @param error - The error object
 * @param defaultMessage - Default error message if not a network error
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: any, defaultMessage?: string): string => {
  // First check if it's a network error
  const networkMessage = getNetworkErrorMessage(error);
  if (networkMessage) {
    return networkMessage;
  }

  // Check if browser is offline
  if (!isOnline()) {
    return 'You are currently offline. Please check your internet connection and try again.';
  }

  // Return default message or extract from error
  if (defaultMessage) {
    return defaultMessage;
  }

  // Try to extract error message from axios response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
