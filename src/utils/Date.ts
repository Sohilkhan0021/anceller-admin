/**
 * Date utilities for IST (Indian Standard Time)
 * All dates throughout the application should use these functions
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert date to IST
 * @param date - Date string or Date object
 * @returns Date object in IST
 */
const toIST = (date: string | Date): Date => {
  if (!date) return new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
};

/**
 * Format ISO date string to IST display format
 * @param isoDate - ISO date string
 * @returns Formatted date string in IST
 */
export const formatIsoDate = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const istDate = toIST(isoDate);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const day = istDate.getDate();
  const month = monthNames[istDate.getMonth()];
  const year = istDate.getFullYear();
  return `${day} ${month}, ${year}`;
};

/**
 * Format date time to IST display format
 * @param dateTime - Date string or Date object
 * @param format - Format string (default: 'MMM DD, YYYY h:mm a')
 * @returns Formatted date time string in IST
 */
export const formatDateTimeIST = (dateTime: string | Date, format: string = 'MMM DD, YYYY h:mm a'): string => {
  if (!dateTime) return '';
  
  const istDate = toIST(dateTime);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = istDate.getDate();
  const month = monthNames[istDate.getMonth()];
  const year = istDate.getFullYear();
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  if (format.includes('h:mm a')) {
    return format.replace('MMM DD, YYYY', `${month} ${day}, ${year}`).replace('h:mm a', `${displayHours}:${displayMinutes} ${ampm}`);
  }
  
  return `${month} ${day}, ${year}`;
};

/**
 * Format time to IST display format (h:mm a)
 * @param dateTime - Date string or Date object
 * @returns Formatted time string in IST
 */
export const formatTimeIST = (dateTime: string | Date): string => {
  if (!dateTime) return '';
  
  const istDate = toIST(dateTime);
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Format date to IST display format (MMM DD, YYYY)
 * @param date - Date string or Date object
 * @returns Formatted date string in IST
 */
export const formatDateIST = (date: string | Date): string => {
  if (!date) return '';
  
  const istDate = toIST(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = istDate.getDate();
  const month = monthNames[istDate.getMonth()];
  const year = istDate.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

/**
 * Get current date/time in IST
 * @returns Current Date object in IST
 */
export const getNowIST = (): Date => {
  return toIST(new Date());
};

/**
 * Check if date is today in IST
 * @param date - Date string or Date object
 * @returns True if date is today
 */
export const isTodayIST = (date: string | Date): boolean => {
  if (!date) return false;
  const istDate = toIST(date);
  const today = getNowIST();
  return istDate.getDate() === today.getDate() &&
         istDate.getMonth() === today.getMonth() &&
         istDate.getFullYear() === today.getFullYear();
};

/**
 * Check if date is in the past (IST)
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export const isPastIST = (date: string | Date): boolean => {
  if (!date) return false;
  return toIST(date) < getNowIST();
};

/**
 * Check if date is in the future (IST)
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export const isFutureIST = (date: string | Date): boolean => {
  if (!date) return false;
  return toIST(date) > getNowIST();
};
