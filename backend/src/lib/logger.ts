export type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const payload = { level, message, time: new Date().toISOString(), ...meta };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
