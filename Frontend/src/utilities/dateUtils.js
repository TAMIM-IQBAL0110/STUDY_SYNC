/**
 * Parse "YYYY-MM-DD" string as a local date at midnight
 * Avoids UTC timezone shift that occurs with new Date("YYYY-MM-DD")
 * 
 * Example:
 *   parseDateOnlyLocal("2025-01-09") → Date at local midnight Jan 9
 *   parseDateOnlyLocal("2025-01-09T00:00:00.000Z") → Date at local midnight Jan 9 (extracts date part)
 *   NOT interpreted as UTC which would shift timezone
 */
export const parseDateOnlyLocal = (dateStr) => {
  if (!dateStr) return null;
  
  // If already a Date object
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }
  
  // Convert to string and trim
  let dateString = String(dateStr).trim();
  
  // Handle ISO format strings (e.g., "2025-01-09T00:00:00.000Z")
  // Extract just the date part before the T
  if (dateString.includes('T')) {
    dateString = dateString.split('T')[0];
  }
  
  // Match YYYY-MM-DD format
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    // Use numeric constructor → creates date at local midnight (NOT UTC)
    return new Date(year, month - 1, day);
  }
  
  // Fallback for other formats
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Convert Date object to "YYYY-MM-DD" string (local time)
 * Ensures backend receives dates in expected format without timezone shift
 */
export const toYYYYMMDD = (dateInput) => {
  let d = dateInput;
  if (!(d instanceof Date)) {
    d = parseDateOnlyLocal(dateInput);
  }
  
  if (!d || isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
