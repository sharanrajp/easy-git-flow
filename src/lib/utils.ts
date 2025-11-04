import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return ''
  
  // Handle YYYY-MM-DD format directly to avoid timezone issues
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const [year, month, day] = dateString.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Converts a Date object or date string to UTC datetime format with milliseconds
 * @param date - Date object or date string
 * @returns Formatted date string in "YYYY-MM-DDT00:00:00.000Z" format
 */
export function toUTCDateString(date: Date | string): string {
  let dateObj: Date
  
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided')
  }
  
  // Extract local date components to preserve the user-selected date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  
  // Return UTC datetime string with milliseconds for consistent DB format
  return `${year}-${month}-${day}T00:00:00.000Z`
}

/**
 * Normalizes date strings from various formats to standard UTC format
 * Handles formats: "YYYY-MM-DDT00:00:00Z" and "YYYY-MM-DDT00:00:00.000Z"
 * @param dateString - Date string in various formats
 * @returns Normalized date string in "YYYY-MM-DDT00:00:00.000Z" format
 */
export function normalizeDateString(dateString: string): string {
  if (!dateString) return dateString
  
  // If already in correct format with milliseconds, return as-is
  if (/^\d{4}-\d{2}-\d{2}T00:00:00\.\d{3}Z$/.test(dateString)) {
    return dateString
  }
  
  // If in format without milliseconds, add them
  if (/^\d{4}-\d{2}-\d{2}T00:00:00Z$/.test(dateString)) {
    return dateString.replace('T00:00:00Z', 'T00:00:00.000Z')
  }
  
  // For other formats, parse and convert
  try {
    return toUTCDateString(dateString)
  } catch {
    return dateString
  }
}

/**
 * Formats a timestamp to IST (Indian Standard Time) in YYYY-MM-DD HH:mm:ss format
 * @param timestamp - Date string or timestamp to format
 * @returns Formatted date string in IST timezone
 */
export function formatToIST(timestamp: string | Date): string {
  if (!timestamp) return ''
  
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''
    
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000 // IST offset in milliseconds
    const istDate = new Date(date.getTime() + istOffset)
    
    // Format as YYYY-MM-DD hh:mm:ss AM/PM
    const year = istDate.getUTCFullYear()
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(istDate.getUTCDate()).padStart(2, '0')
    const hours24 = istDate.getUTCHours()
    const hours12 = hours24 % 12 || 12
    const period = hours24 >= 12 ? 'PM' : 'AM'
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0')
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours12}:${minutes}:${seconds} ${period}`
  } catch {
    return ''
  }
}
