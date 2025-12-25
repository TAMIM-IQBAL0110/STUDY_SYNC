export const daysAgo = (n)=>{
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize
    
    const day = new Date(today);
    day.setDate(day.getDate()-n);
    day.setHours(0,0,0,0);
    return day;
};