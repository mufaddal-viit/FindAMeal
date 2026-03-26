export const SEARCH_QUERY_MAX_LENGTH = 80;

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/g;
const MULTIPLE_WHITESPACE_REGEX = /\s+/g;
const ALLOWED_SEARCH_CHARACTERS_REGEX = /^[\p{L}\p{N}\s&'.,()/-]*$/u;

export interface SearchQueryValidationResult {
  normalized: string;
  error: string | null;
}

function stripControlCharacters(value: string) {
  return value.replace(CONTROL_CHAR_REGEX, "");
}

export function sanitizeSearchQueryInput(value: string) {
  return stripControlCharacters(value).slice(0, SEARCH_QUERY_MAX_LENGTH);
}

export function normalizeSearchQuery(value: string) {
  return stripControlCharacters(value)
    .replace(MULTIPLE_WHITESPACE_REGEX, " ")
    .trim();
}

export function validateSearchQuery(value: string): SearchQueryValidationResult {
  const normalized = normalizeSearchQuery(value);

  if (normalized.length > SEARCH_QUERY_MAX_LENGTH) {
    return {
      normalized,
      error: `Search must be ${SEARCH_QUERY_MAX_LENGTH} characters or fewer.`
    };
  }

  if (normalized && !ALLOWED_SEARCH_CHARACTERS_REGEX.test(normalized)) {
    return {
      normalized,
      error:
        "Use letters, numbers, spaces, and only these symbols: & ' . , ( ) / -"
    };
  }

  return {
    normalized,
    error: null
  };
}

