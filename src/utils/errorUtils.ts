/**
 * Utility functions for handling API errors
 */

/**
 * Extracts error message from various error formats
 * @param error - The error object from catch block
 * @param fallbackMessage - Default message if no specific error is found
 * @returns Formatted error message
 */
export const extractErrorMessage = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  // Handle Axios/HTTP errors with backend response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle Axios/HTTP errors with status text
  if (error?.response?.statusText) {
    return error.response.statusText;
  }
  
  // Handle general error messages
  if (error?.message) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback to default message
  return fallbackMessage;
};

/**
 * Extracts error message with prefix
 * @param error - The error object from catch block
 * @param prefix - Prefix to add before the error message
 * @param fallbackMessage - Default message if no specific error is found
 * @returns Formatted error message with prefix
 */
export const extractErrorMessageWithPrefix = (
  error: any, 
  prefix: string, 
  fallbackMessage: string = 'An error occurred'
): string => {
  const errorMessage = extractErrorMessage(error, fallbackMessage);
  return `${prefix}${errorMessage}`;
};

/**
 * Logs error to console and returns formatted message
 * @param error - The error object from catch block
 * @param context - Context where the error occurred (for logging)
 * @param fallbackMessage - Default message if no specific error is found
 * @returns Formatted error message
 */
export const handleError = (
  error: any, 
  context: string, 
  fallbackMessage: string = 'An error occurred'
): string => {
  console.error(`${context}:`, error);
  return extractErrorMessage(error, fallbackMessage);
};

/**
 * Handles error with prefix and logging
 * @param error - The error object from catch block
 * @param context - Context where the error occurred (for logging)
 * @param prefix - Prefix to add before the error message
 * @param fallbackMessage - Default message if no specific error is found
 * @returns Formatted error message with prefix
 */
export const handleErrorWithPrefix = (
  error: any, 
  context: string, 
  prefix: string, 
  fallbackMessage: string = 'An error occurred'
): string => {
  console.error(`${context}:`, error);
  return extractErrorMessageWithPrefix(error, prefix, fallbackMessage);
};
