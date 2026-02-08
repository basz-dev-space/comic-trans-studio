export class AppError extends Error {
  code: string;
  status?: number;
  cause?: unknown;

  constructor(message: string, options?: { code?: string; status?: number; cause?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.code = options?.code ?? 'UNKNOWN_ERROR';
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

export function normalizeError(error: unknown, fallbackMessage = 'Something went wrong') {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError(error.message || fallbackMessage, { cause: error });
  }

  return new AppError(fallbackMessage, { cause: error });
}

type RetryOptions = {
  retries?: number;
  delayMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 400;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      const normalizedError = normalizeError(error);
      const canRetry = attempt <= retries;

      if (!canRetry) throw normalizedError;
      await sleep(delayMs * attempt);
    }
  }
}
