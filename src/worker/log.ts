// src\worker\log.ts

/** Formats the current local time as HH:mm:ss. */
const stamp = (): string => new Date().toLocaleTimeString('en-GB', { hour12: false });

/** Timestamped console logger for the worker terminal. */
export const log = {
  info: (...args: unknown[]): void => console.log(`[${stamp()}]`, ...args),
  warn: (...args: unknown[]): void => console.warn(`[${stamp()}] WARN`, ...args),
  error: (...args: unknown[]): void => console.error(`[${stamp()}] ERROR`, ...args),
};
