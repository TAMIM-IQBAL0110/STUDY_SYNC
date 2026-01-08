export const daysAgo = (n)=>{
    // Create a date in the user's local timezone (or system timezone)
    // by creating the date object and then getting its components
    const today = new Date();
    
    // Get the date components (these are in local time by default)
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    
    // Create reference date string for today in YYYY-MM-DD format
    let refDate = new Date(`${year}-${month}-${date}`);
    
    // Subtract n days
    refDate.setDate(refDate.getDate() - n);
    
    // Convert back to YYYY-MM-DD string
    const year2 = refDate.getFullYear();
    const month2 = String(refDate.getMonth() + 1).padStart(2, '0');
    const date2 = String(refDate.getDate()).padStart(2, '0');
    
    return `${year2}-${month2}-${date2}`;
};