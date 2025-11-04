import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Formats a timestamp to IST (Indian Standard Time) in YYYY-MM-DD hh:mm AM/PM format
 * @param timestamp - Date string or timestamp to format
 * @returns Formatted date string in IST timezone with 12-hour format
 */
export function formatToIST(timestamp: string | Date): string {
  if (!timestamp) return ''
  
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''
    
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000 // IST offset in milliseconds
    const istDate = new Date(date.getTime() + istOffset)
    
    // Get date components
    const year = istDate.getUTCFullYear()
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(istDate.getUTCDate()).padStart(2, '0')
    
    // Convert to 12-hour format
    let hours24 = istDate.getUTCHours()
    const period = hours24 >= 12 ? 'PM' : 'AM'
    let hours12 = hours24 % 12
    if (hours12 === 0) hours12 = 12 // Convert 0 to 12
    
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours12}:${minutes} ${period}`
  } catch {
    return ''
  }
}
