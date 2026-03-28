export default function ResultsLoading() {
  return (
    <main className="space-y-8 py-10">
      <section className="space-y-6 rounded-[2.5rem] border border-leaf/10 bg-paper p-8 shadow-lg shadow-leaf/10">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-sand" />
          <div className="h-12 w-full max-w-2xl animate-pulse rounded-[1.25rem] bg-sand" />
          <div className="h-6 w-full max-w-xl animate-pulse rounded-full bg-sand" />
        </div>

        <div className="h-[14.5rem] animate-pulse rounded-[2rem] border border-leaf/10 bg-sand" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 animate-pulse rounded-full bg-sand" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-sand" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-[2rem] border border-leaf/10 bg-paper shadow-sm shadow-leaf/10"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
