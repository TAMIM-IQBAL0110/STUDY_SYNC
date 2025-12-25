export const minutesToTime = (minutes) => {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    const modifier = hh >= 12 ? 'PM' : 'AM';
    const hours = hh % 12 || 12; // convert 0-23 to 12-hour format
    return `${hours}:${mm.toString().padStart(2, '0')} ${modifier}`;
}
