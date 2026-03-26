"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useId, useState } from "react";
import {
  SEARCH_QUERY_MAX_LENGTH,
  sanitizeSearchQueryInput,
  validateSearchQuery,
} from "@/lib/searchQuery";

interface SearchFormProps {
  initialValue?: string;
  compact?: boolean;
}

export default function SearchForm({
  initialValue = "",
  compact = false,
}: SearchFormProps) {
  const helpTextId = useId();
  const errorTextId = useId();
  const initialSanitizedValue = sanitizeSearchQueryInput(initialValue);
  const [query, setQuery] = useState(initialSanitizedValue);
  const [error, setError] = useState<string | null>(
    validateSearchQuery(initialSanitizedValue).error,
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = sanitizeSearchQueryInput(event.target.value);
    const validation = validateSearchQuery(nextValue);

    setQuery(nextValue);
    setError(validation.error);
  }

  function handleBlur() {
    const validation = validateSearchQuery(query);

    setQuery(validation.normalized);
    setError(validation.error);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateSearchQuery(query);

    setQuery(validation.normalized);
    setError(validation.error);

    if (validation.error) {
      return;
    }

    const params = new URLSearchParams();

    if (validation.normalized) {
      params.set("q", validation.normalized);
    }

    const destination = params.toString()
      ? `/results?${params.toString()}`
      : "/results";
    window.location.assign(destination);
  }

  return (
    <form
      action="/results"
      method="get"
      onSubmit={handleSubmit}
      className={`mx-auto rounded-[2rem] border border-leaf/10 bg-paper p-3 shadow-lg shadow-leaf/10 backdrop-blur ${
        compact ? "w-full" : "w-full max-w-3xl"
      }`}
      noValidate
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          name="q"
          value={query}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Search by city, cuisine, or mood"
          maxLength={SEARCH_QUERY_MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="search"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorTextId : helpTextId}
          className={`h-14 flex-1 rounded-[1.25rem] border-4  px-5 text-base text-ink outline-none transition placeholder:text-leaf/60 focus:border-leaf ${
            error ? "border-amber" : "border-leaf/10"
          }`}
        />
        <button
          type="submit"
          className="h-14 rounded-[1.25rem] bg-leaf px-6 text-sm font-semibold text-paper transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Find meals
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-1 px-2">
        <p id={helpTextId} className="text-xs text-leaf/70">
          Up to {SEARCH_QUERY_MAX_LENGTH} characters. Allowed: letters, numbers,
          spaces, and &apos; &amp; . , ( ) / -
        </p>
        {error ? (
          <p
            id={errorTextId}
            role="alert"
            className="text-xs font-medium text-amber"
          >
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
