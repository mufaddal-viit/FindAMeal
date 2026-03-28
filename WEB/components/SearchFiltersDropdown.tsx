import {
  DISTANCE_FILTER_OPTIONS,
  PRICE_LEVEL_OPTIONS,
  RATING_FILTER_OPTIONS,
  SEARCH_CATEGORIES,
  SEARCH_SORT_OPTIONS,
  type SearchCategory,
  type SearchSortValue
} from "@/lib/searchFormOptions";
import type { PriceLevel } from "@/types/place";

interface SearchFiltersDropdownProps {
  category: SearchCategory;
  sort: SearchSortValue;
  radiusKm?: number;
  minRating?: number;
  priceLevels: PriceLevel[];
  openNow: boolean;
  hasCoordinates: boolean;
  activeFilterCount: number;
  onCategoryChange: (value: SearchCategory) => void;
  onSortChange: (value: SearchSortValue) => void;
  onRadiusChange: (value: number | undefined) => void;
  onMinRatingChange: (value: number | undefined) => void;
  onTogglePriceLevel: (value: PriceLevel) => void;
  onOpenNowChange: (value: boolean) => void;
  onReset: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-leaf">
      {children}
    </p>
  );
}

function FilterChip({
  active,
  disabled = false,
  children,
  onClick
}: {
  active: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-leaf bg-leaf text-paper"
          : "border-leaf/15 bg-sand text-ink hover:border-leaf hover:bg-paper"
      } ${disabled ? "cursor-not-allowed opacity-50 hover:border-leaf/15 hover:bg-sand" : ""}`}
    >
      {children}
    </button>
  );
}

export default function SearchFiltersDropdown({
  category,
  sort,
  radiusKm,
  minRating,
  priceLevels,
  openNow,
  hasCoordinates,
  activeFilterCount,
  onCategoryChange,
  onSortChange,
  onRadiusChange,
  onMinRatingChange,
  onTogglePriceLevel,
  onOpenNowChange,
  onReset
}: SearchFiltersDropdownProps) {
  return (
    <div className="rounded-[1.8rem] border border-leaf/10 bg-paper p-5 shadow-xl shadow-leaf/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <SectionLabel>Filters</SectionLabel>
          <p className="text-sm text-leaf/80">
            Fine-tune results before the request is sent to the API.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sand px-3 py-2 text-xs font-medium text-ink">
            {activeFilterCount} active
          </span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper hover:text-ink"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="space-y-3">
          <SectionLabel>Category</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {SEARCH_CATEGORIES.map((option) => (
              <FilterChip
                key={option}
                active={category === option}
                onClick={() => onCategoryChange(option)}
              >
                {option}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>Sort</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {SEARCH_SORT_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                active={sort === option.value}
                onClick={() => onSortChange(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>Distance</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DISTANCE_FILTER_OPTIONS.map((option) => {
              const disabled = !hasCoordinates && typeof option.value === "number";

              return (
                <FilterChip
                  key={option.label}
                  active={radiusKm === option.value}
                  disabled={disabled}
                  onClick={() => onRadiusChange(option.value)}
                >
                  {option.label}
                </FilterChip>
              );
            })}
          </div>
          {!hasCoordinates ? (
            <p className="text-xs text-leaf/70">
              Choose a map location first to enable distance filtering.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <SectionLabel>Rating</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {RATING_FILTER_OPTIONS.map((option) => (
              <FilterChip
                key={option.label}
                active={minRating === option.value}
                onClick={() => onMinRatingChange(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>Price Range</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {PRICE_LEVEL_OPTIONS.map((option) => (
              <FilterChip
                key={option}
                active={priceLevels.includes(option)}
                onClick={() => onTogglePriceLevel(option)}
              >
                {option}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>Availability</SectionLabel>
          <label className="flex items-center justify-between rounded-[1.3rem] border border-leaf/10 bg-sand px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Open now</p>
              <p className="text-xs text-leaf/70">
                Show only currently open places.
              </p>
            </div>
            <input
              type="checkbox"
              checked={openNow}
              onChange={(event) => onOpenNowChange(event.target.checked)}
              aria-label="Show open places only"
              className="h-5 w-5 accent-leaf"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
