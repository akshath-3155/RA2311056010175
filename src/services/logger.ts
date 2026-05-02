/**
 * logger.ts  Logging Middleware
 *
 * Signature: Log(stack, level, package, message)
 *
 * Sends structured log entries to the evaluation-service /logs endpoint
 * AND mirrors output to the browser console for local debugging.
 *
 * Uses getToken() for automatic token refresh.
 */

import axios from 'axios';
import type { LogLevel } from '../types/notification';
import { getToken } from './tokenManager';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Log a structured message.
 *
 * @param stack   Originating runtime layer  always "frontend" for this app.
 * @param level   Severity: "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     Component or function name where the log originates.
 * @param message Human-readable description of the event.
 */
export const Log = async (
  stack: 'frontend',
  level: LogLevel,
  pkg: string,
  message: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();

  //  Console mirror 
  const formatted = `[${timestamp}] [${level.toUpperCase()}] [${pkg}] [${stack}]  ${message}`;
  switch (level) {
    case 'debug': console.debug(formatted); break;
    case 'info':  console.info(formatted);  break;
    case 'warn':  console.warn(formatted);  break;
    case 'error': console.error(formatted); break;
    case 'fatal': console.error(` FATAL: ${formatted}`); break;
  }

  //  Remote log API 
  // Fire-and-forget; never throw so logging never breaks the UI.
  try {
    const token = await getToken();
    await axios.post(
      `${BASE_URL}/logs`,
      { stack, level, package: pkg, message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      },
    );
  } catch {
    // Silently swallow errors from the logging endpoint itself
    console.warn(`[logger] Failed to send log to remote endpoint (level=${level})`);
  }
};

