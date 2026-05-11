interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-leaf/20 bg-paper p-10 text-center shadow-sm shadow-leaf/10 dark:border-slate-600 dark:bg-slate-800 dark:shadow-slate-900/20">
      <h2 className="text-2xl font-semibold text-ink dark:text-slate-100">{title}</h2>
      <p className="mt-3 text-leaf/80 dark:text-slate-400">{description}</p>
    </div>
  );
}
