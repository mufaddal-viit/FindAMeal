interface SearchFormProps {
  initialValue?: string;
  compact?: boolean;
}

export default function SearchForm({
  initialValue = "",
  compact = false
}: SearchFormProps) {
  return (
    <form
      action="/results"
      method="get"
      className={`rounded-[2rem] border border-white/60 bg-white/80 p-3 shadow-lg shadow-amber-100/60 backdrop-blur ${
        compact ? "w-full" : "w-full max-w-3xl"
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          name="q"
          defaultValue={initialValue}
          placeholder="Search by city, cuisine, or mood"
          className="h-14 flex-1 rounded-[1.25rem] border border-transparent bg-stone-100 px-5 text-base text-slate-900 outline-none transition focus:border-emerald-700"
        />
        <button
          type="submit"
          className="h-14 rounded-[1.25rem] bg-emerald-800 px-6 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Find meals
        </button>
      </div>
    </form>
  );
}
