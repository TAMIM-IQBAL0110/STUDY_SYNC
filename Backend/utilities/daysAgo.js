export const daysAgo = (n)=>{
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const day = new Date(today);
    day.setDate(day.getDate()-n);
    day.setHours(0,0,0,0);
    
    // Return YYYY-MM-DD string format instead of Date object
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
};