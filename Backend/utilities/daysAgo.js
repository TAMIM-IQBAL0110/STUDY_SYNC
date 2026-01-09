export const daysAgo = (n)=>{
    // Create a date in the user's local timezone
    // by using the numeric Date constructor to avoid UTC parsing
    const today = new Date();
    
    // Get current date and subtract n days using local time
    const refDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
    
    // Convert to YYYY-MM-DD string
    const year = refDate.getFullYear();
    const month = String(refDate.getMonth() + 1).padStart(2, '0');
    const date = String(refDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${date}`;
};