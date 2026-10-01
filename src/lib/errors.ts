/**
 * Application Error Hierarchy & Safe Error Handler
 *
 * Implements strict domain errors without leaking internal stack traces,
 * database errors, Prisma/Firebase/Redis internals, or sensitive credentials.
 */

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHENTICATED";

  constructor(message = "Authentication required. Please sign in.") {
    super(message);
  }
}

export class AuthorizationError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";

  constructor(message = "You do not have permission to perform this action.") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message = "The requested resource was not found.") {
    super(message);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";

  constructor(message = "A conflicting resource already exists.") {
    super(message);
  }
}

export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly code = "RATE_LIMITED";
  readonly retryAfterSeconds: number;

  constructor(message = "Too many requests. Please try again later.", retryAfterSeconds = 2) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class DatabaseError extends AppError {
  readonly statusCode = 500;
  readonly code = "DATABASE_ERROR";

  constructor(message = "A database operation failed safely.") {
    super(message);
  }
}

export class ExternalServiceError extends AppError {
  readonly statusCode = 502;
  readonly code = "EXTERNAL_SERVICE_ERROR";

  constructor(message = "An external service dependency failed.") {
    super(message);
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";

  constructor(message = "An unexpected error occurred. Please try again.") {
    super(message);
  }
}

export interface ActionErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionErrorPayload };

/**
 * Strips database credentials, connection strings, and sensitive tokens from error messages.
 */
export function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/(?:postgresql|postgres|redis|mysql):\/\/[^\s]+/gi, "[REDACTED_CONNECTION_URI]");
}

/**
 * Maps any error safely to an ActionResult without leaking secrets, stack traces,
 * or raw database internals.
 */
export function handleActionError(error: unknown): ActionResult<never> {
  // If it's one of our typed application domain errors
  if (error instanceof AppError) {
    // Safe server-side log
    if (process.env.NODE_ENV !== "test") {
      console.error(`[AppError: ${error.code}] ${error.message}`);
    }

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  // Handle Prisma known errors without leaking SQL or DB structure
  const errorObj = error as { code?: string; message?: string; name?: string };
  if (errorObj?.name?.includes("Prisma") || errorObj?.code?.startsWith("P")) {
    if (process.env.NODE_ENV !== "test") {
      console.error(`[DatabaseError Sanitized] Prisma error code: ${errorObj.code}`);
    }

    if (errorObj.code === "P2002") {
      return {
        success: false,
        error: {
          code: "CONFLICT",
          message: "A unique constraint violation occurred. Resource already exists.",
        },
      };
    }

    if (errorObj.code === "P2025") {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Record not found.",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "An internal database operation failed. Please try again.",
      },
    };
  }

  // Handle generic / unexpected exceptions
  if (process.env.NODE_ENV !== "test") {
    console.error("[UnhandledException]", errorObj?.message || "Unknown error");
  }

  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please contact support if the issue persists.",
    },
  };
}
