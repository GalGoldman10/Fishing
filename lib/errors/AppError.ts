export type AppErrorCode =
  | 'NO_INTERNET'
  | 'PERMISSION_DENIED'
  | 'LOCATION_UNAVAILABLE'
  | 'SPOT_NOT_FOUND'
  | 'AI_TIMEOUT'
  | 'AI_MALFORMED'
  | 'WEATHER_UNAVAILABLE'
  | 'RATE_LIMIT'
  | 'AUTH_EXPIRED'
  | 'UPLOAD_FAILED'
  | 'DATABASE_ERROR'
  | 'UNSUPPORTED_LOCATION'
  | 'MISSING_REGULATION_DATA'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessageKey: string;
  readonly technicalDetails?: string;

  constructor(
    code: AppErrorCode,
    userMessageKey: string,
    technicalDetails?: string,
  ) {
    super(userMessageKey);
    this.name = 'AppError';
    this.code = code;
    this.userMessageKey = userMessageKey;
    this.technicalDetails = technicalDetails;
  }
}

export function mapErrorToAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('network') || message.includes('fetch')) {
    return new AppError('NO_INTERNET', 'errors.noInternet', message);
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return new AppError('RATE_LIMIT', 'errors.rateLimit', message);
  }
  if (message.includes('401') || message.includes('JWT')) {
    return new AppError('AUTH_EXPIRED', 'errors.authExpired', message);
  }
  if (message.includes('timeout')) {
    return new AppError('AI_TIMEOUT', 'errors.aiTimeout', message);
  }

  return new AppError('UNKNOWN', 'common.error', message);
}
