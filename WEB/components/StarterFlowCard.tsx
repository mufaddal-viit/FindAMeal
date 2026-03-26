import Link from "next/link";

export default function StarterFlowCard() {
  return (
    <div className="rounded-[2rem] bg-leaf p-8 text-paper shadow-lg shadow-ink/15">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-paper">
        Starter flow
      </p>
      <div className="mt-6 space-y-5">
        <div className="w-fit rounded-[1.5rem] border border-paper bg-ink/10 px-5 py-2">
          <p className="text-sm text-paper">1. Search</p>
          <p className="mt-2 text-xl font-semibold">
            Try a city or cuisine from the home page.
          </p>
        </div>
        <div className="w-fit rounded-[1.5rem] border border-paper bg-ink/10 px-5 py-2">
          <p className="text-sm text-paper">2. Browse</p>
          <p className="mt-2 text-xl font-semibold">
            Review the results page with API-driven cards.
          </p>
        </div>
        <div className="w-fit rounded-[1.5rem] border border-paper bg-ink/10 px-5 py-2">
          <p className="text-sm text-paper">3. Inspect</p>
          <p className="mt-2 text-xl font-semibold">
            Open a place detail page for the full snapshot.
          </p>
        </div>
      </div>
      <Link
        href="/results?q=Dubai"
        className="mt-8 inline-flex rounded-full bg-amber px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-paper"
      >
        View sample results
      </Link>
    </div>
  );
}

