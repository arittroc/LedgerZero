export type LogLevel = "info" | "error" | "warn";

export function log(level: LogLevel, message: string, meta?: any) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  // Output to process.stderr for Docker log aggregation
  process.stderr.write(JSON.stringify(entry) + "\n");
}

export const logger = {
  info: (message: string, meta?: any) => log("info", message, meta),
  error: (message: string, meta?: any) => log("error", message, meta),
  warn: (message: string, meta?: any) => log("warn", message, meta),
};
