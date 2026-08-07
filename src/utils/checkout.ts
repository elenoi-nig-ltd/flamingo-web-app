export const NIGERIAN_PHONE_PATTERN = /^(?:\+234|0)[789][01]\d{8}$/;

export const NIGERIAN_PHONE_MESSAGE =
  'Enter a valid Nigerian phone number, such as 08012345678 or +2348012345678.';

export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (Array.isArray(error)) {
    const messages = error.map((item) => getErrorMessage(item, '')).filter(Boolean);
    return messages.join(', ') || fallback;
  }
  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>;
    if (value.message !== undefined) return getErrorMessage(value.message, fallback);
    if (value.error !== undefined) return getErrorMessage(value.error, fallback);
  }
  return fallback;
}
