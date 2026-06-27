import { clientEnv } from './env';

/**
 * Tiny structured logger.
 *
 * WHY a wrapper instead of raw console: a single choke point lets us (a) gate by
 * level, (b) attach a `scope` for grep-able output, and (c) swap the sink later
 * (Sentry, Logflare, Supabase logs) WITHOUT touching call sites. Do not call
 * `console.*` directly in feature code — use `logger`.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const threshold = LEVEL_WEIGHT[clientEnv.NEXT_PUBLIC_LOG_LEVEL];

type LogFields = Record<string, unknown>;

function emit(level: LogLevel, scope: string, message: string, fields?: LogFields) {
  if (LEVEL_WEIGHT[level] < threshold) return;

  const payload = {
    level,
    scope,
    message,
    ...(fields ?? {}),
    // No Date.now() in some sandboxes; in app runtime this is fine.
    ts: new Date().toISOString(),
  };

  // Single sink. Replace this block to forward to an external service.
  const line = `[${level.toUpperCase()}] (${scope}) ${message}`;
  if (level === 'error') console.error(line, payload);
  else if (level === 'warn') console.warn(line, payload);
  else console.log(line, payload);
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(scope: string): Logger;
}

/** Create a scoped logger, e.g. `createLogger('auth')` → `(auth) ...`. */
export function createLogger(scope: string): Logger {
  return {
    debug: (m, f) => emit('debug', scope, m, f),
    info: (m, f) => emit('info', scope, m, f),
    warn: (m, f) => emit('warn', scope, m, f),
    error: (m, f) => emit('error', scope, m, f),
    child: (sub) => createLogger(`${scope}:${sub}`),
  };
}

export const logger = createLogger('app');
