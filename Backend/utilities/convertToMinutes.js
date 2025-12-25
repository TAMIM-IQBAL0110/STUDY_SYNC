export const convertToMinutes = (timeStr)=>{
    if(!timeStr) return null;
    let [time,modifier] = timeStr.split(' ');// ["10:30", "AM"]
    if(!modifier) return null;
    
    let [hours,minutes] = time.split(':').map(Number);
    
    if(modifier.toUpperCase() === 'PM' && hours !== 12) hours+=12;
    if(modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

    return hours*60+minutes;
};