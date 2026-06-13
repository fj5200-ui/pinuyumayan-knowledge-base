export function log(level, message, meta = {}) {
    const payload = { level, message, time: new Date().toISOString(), ...meta };
    const line = JSON.stringify(payload);
    if (level === "error")
        console.error(line);
    else if (level === "warn")
        console.warn(line);
    else
        console.log(line);
}
