interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-leaf/20 bg-paper p-10 text-center shadow-sm shadow-leaf/10">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-leaf/80">{description}</p>
    </div>
  );
}
