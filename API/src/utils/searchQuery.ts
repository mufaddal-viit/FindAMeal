import { HttpError } from "./httpError";

export const SEARCH_QUERY_MAX_LENGTH = 80;

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/g;
export const HAS_CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/;
const MULTIPLE_WHITESPACE_REGEX = /\s+/g;
export const ALLOWED_SEARCH_CHARACTERS_REGEX = /^[\p{L}\p{N}\s&'.,()/-]*$/u;

export function normalizeSearchQuery(value: string) {
  return value
    .replace(CONTROL_CHAR_REGEX, "")
    .replace(MULTIPLE_WHITESPACE_REGEX, " ")
    .trim();
}

export function validateSearchQuery(value: string) {
  if (HAS_CONTROL_CHAR_REGEX.test(value)) {
    throw new HttpError(400, "Search query contains unsupported control characters.");
  }

  const normalized = normalizeSearchQuery(value);

  if (normalized.length > SEARCH_QUERY_MAX_LENGTH) {
    throw new HttpError(
      400,
      `Search query must be ${SEARCH_QUERY_MAX_LENGTH} characters or fewer.`
    );
  }

  if (normalized && !ALLOWED_SEARCH_CHARACTERS_REGEX.test(normalized)) {
    throw new HttpError(
      400,
      "Use letters, numbers, spaces, and only these symbols: & ' . , ( ) / -"
    );
  }

  return normalized;
}
