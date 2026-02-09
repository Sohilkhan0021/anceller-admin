/**
 * Currency formatting utilities
 * Ensures consistent use of ₹ symbol throughout the application
 */

/**
 * Format a number as Indian Rupee currency with ₹ symbol
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string with ₹ symbol
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  if (amount === null || amount === undefined || amount === '') {
    return showSymbol ? '₹0' : '0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return showSymbol ? '₹0' : '0';
  }

  // Use Intl.NumberFormat with INR currency code
  // It will automatically display ₹ symbol for en-IN locale
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits,
    currencyDisplay: 'symbol', // Ensure symbol (₹) is displayed
  }).format(numAmount);

  // Fallback: Replace "INR" or "Rs" with "₹" if browser doesn't respect currencyDisplay
  // This ensures we never show "INR" or "Rs" to users
  return formatted
    .replace(/\bINR\s*/gi, '₹')
    .replace(/\bRs\.?\s*/gi, '₹')
    .replace(/\bRs\s+/gi, '₹');
};

/**
 * Format currency without symbol (just the number)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export const formatCurrencyNumber = (
  amount: number | string | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  if (amount === null || amount === undefined || amount === '') {
    return '0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numAmount);
};

/**
 * Parse currency string to number
 * @param currencyString - Currency string (e.g., "₹1,234.56" or "1234.56")
 * @returns Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  // Remove ₹ symbol, commas, and whitespace
  const cleaned = currencyString
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Get currency symbol from currency code
 * Converts currency codes like "INR" to their display symbols like "₹"
 * @param currencyCode - Currency code (e.g., "INR", "USD")
 * @returns Currency symbol (e.g., "₹", "$")
 */
export const getCurrencySymbol = (currencyCode: string | null | undefined): string => {
  if (!currencyCode) return '₹'; // Default to ₹ for INR
  
  const currencyMap: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
  };
  
  return currencyMap[currencyCode.toUpperCase()] || currencyCode;
};

/**
 * Format currency code for display
 * Replaces currency codes with their symbols (e.g., "INR" -> "₹")
 * @param currencyCode - Currency code or text that might contain currency codes
 * @returns Formatted string with currency symbol
 */
export const formatCurrencyCode = (currencyCode: string | null | undefined): string => {
  if (!currencyCode) return '₹';
  
  // Replace common currency code patterns with symbols
  return currencyCode
    .replace(/\bINR\b/gi, '₹')
    .replace(/\bRs\.?\b/gi, '₹')
    .replace(/\bRs\s+/gi, '₹')
    .replace(/\bUSD\b/gi, '$')
    .replace(/\bEUR\b/gi, '€')
    .replace(/\bGBP\b/gi, '£');
};
