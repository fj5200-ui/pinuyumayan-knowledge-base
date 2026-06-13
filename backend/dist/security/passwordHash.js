import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
const KEY_LEN = 64;
export function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
    return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(password, encoded) {
    const [scheme, salt, expectedHex] = encoded.split("$");
    if (scheme !== "scrypt" || !salt || !expectedHex)
        return false;
    const actual = Buffer.from(scryptSync(password, salt, KEY_LEN).toString("hex"), "hex");
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function assertStrongPassword(password) {
    const failures = [];
    if (password.length < 14)
        failures.push("at least 14 characters");
    if (!/[A-Z]/.test(password))
        failures.push("uppercase letter");
    if (!/[a-z]/.test(password))
        failures.push("lowercase letter");
    if (!/[0-9]/.test(password))
        failures.push("number");
    if (!/[^A-Za-z0-9]/.test(password))
        failures.push("symbol");
    if (failures.length)
        throw new Error(`Weak password: missing ${failures.join(", ")}`);
}
