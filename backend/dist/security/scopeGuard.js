export function hasScope(granted, required) {
    if (!granted)
        return false;
    return granted.includes("*") || granted.includes(required);
}
export function requireScope(granted, required) {
    if (!hasScope(granted, required)) {
        const error = new Error(`Missing required scope: ${required}`);
        error.statusCode = 403;
        throw error;
    }
}
