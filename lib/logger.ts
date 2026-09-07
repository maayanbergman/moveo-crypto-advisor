type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Keep stack server-side only; never forward to clients.
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
  return { message: String(error) };
}

function write(level: LogLevel, event: string, context?: LogContext, error?: unknown) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export const logger = {
  info(event: string, context?: LogContext) {
    write("info", event, context);
  },
  warn(event: string, context?: LogContext) {
    write("warn", event, context);
  },
  error(event: string, error: unknown, context?: LogContext) {
    write("error", event, context, error);
  },
};
