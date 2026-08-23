type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = [
  "password",
  "apikey",
  "api_key",
  "secret",
  "token",
  "authorization",
  "b2_application_key",
  "applicationkey",
  "privatekey",
  "credentials",
];

function sanitize(data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, meta?: any) {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[SCENTLAB INFO] ${message}`, meta ? sanitize(meta) : "");
    }
  },
  warn(message: string, meta?: any) {
    console.warn(`[SCENTLAB WARN] ${message}`, meta ? sanitize(meta) : "");
  },
  error(message: string, error?: any) {
    console.error(`[SCENTLAB ERROR] ${message}`, error ? sanitize(error) : "");
  },
  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[SCENTLAB DEBUG] ${message}`, meta ? sanitize(meta) : "");
    }
  },
};
