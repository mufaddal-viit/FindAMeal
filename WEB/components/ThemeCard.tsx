export default function ThemeCard() {
  return (
    <section className="rounded-[2.5rem] bg-sand p-6 md:p-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-leaf/15 bg-paper p-8 shadow-xl shadow-amber/20 backdrop-blur-sm">
        <span className="inline-flex rounded-full bg-amber px-3 py-1 text-sm font-medium text-ink">
          Custom Theme
        </span>

        <h2 className="mt-5 text-3xl font-semibold text-ink md:text-4xl">
          Warm, readable colors for the FindAMeal experience.
        </h2>

        <p className="mt-4 max-w-xl leading-7 text-leaf">
          This sample card demonstrates the new Tailwind theme tokens. The page
          uses sand as the base, paper as the card surface, ink for strong text,
          leaf for supporting copy, and amber for the call to action.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex rounded-full bg-amber px-5 py-3 font-semibold text-ink transition-colors hover:bg-leaf hover:text-paper"
        >
          Explore Meals
        </button>
      </div>
    </section>
  );
}

