export function getUtcDayAndHour(date = new Date()) {
    const day = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const hour = date.getUTCHours(); // 0–23
    return { day, hour };
}
