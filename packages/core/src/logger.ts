import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
});

Reflect.set(globalThis, "logger", logger);

export default logger;
