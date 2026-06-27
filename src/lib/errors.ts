/**
 * Error taxonomy.
 *
 * WHY: services should throw typed, intentional errors so the UI/route layer can
 * map them to HTTP codes or toasts WITHOUT string-matching messages. Anything
 * unexpected stays a raw Error and is treated as a 500 / "something went wrong".
 */

export type AppErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

const HTTP_STATUS: Record<AppErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UNKNOWN: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  /** Safe to show the user. Internal detail goes in `cause`/logs only. */
  readonly isPublic: boolean;

  constructor(
    code: AppErrorCode,
    message: string,
    options?: { cause?: unknown; isPublic?: boolean },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
    this.status = HTTP_STATUS[code];
    this.isPublic = options?.isPublic ?? true;
  }

  static unauthenticated(msg = 'You must be signed in.') {
    return new AppError('UNAUTHENTICATED', msg);
  }
  static forbidden(msg = 'You do not have access to this resource.') {
    return new AppError('FORBIDDEN', msg);
  }
  static notFound(msg = 'Resource not found.') {
    return new AppError('NOT_FOUND', msg);
  }
}

/** Narrow an unknown caught value to AppError. */
export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}

/** Normalize any thrown value into a user-safe shape for API responses. */
export function toErrorResponse(e: unknown) {
  if (isAppError(e)) {
    return {
      status: e.status,
      body: { error: { code: e.code, message: e.isPublic ? e.message : 'Request failed.' } },
    };
  }
  return {
    status: 500,
    body: { error: { code: 'UNKNOWN' as const, message: 'Something went wrong.' } },
  };
}
