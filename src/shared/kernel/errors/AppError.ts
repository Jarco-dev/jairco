export enum AppErrorCodes {
  ValidationFailed = "ValidationFailed",
  NotFound = "NotFound",
  Unauthorized = "Unauthorized",
  Conflict = "Conflict",
  InternalError = "InternalError",
}

export class AppError {
  constructor(
    public readonly code: AppErrorCodes | AppErrorCodes[keyof AppErrorCodes],
    public readonly message: string,
    public readonly details?: Record<string, unknown>,
  ) {}

  static validation(
    message: string,
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError("ValidationFailed", message, details);
  }

  static notFound(
    message: string,
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError("NotFound", message, details);
  }

  static conflict(
    message: string,
    details?: Record<string, unknown>,
  ): AppError {
    return new AppError("Conflict", message, details);
  }

  static unauthorized(message: string = "Unauthorized"): AppError {
    return new AppError("Unauthorized", message);
  }

  static internal(message: string = "Something went wrong"): AppError {
    return new AppError("InternalError", message);
  }
}
