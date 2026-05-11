interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function PageHeader({
  eyebrow,
  title,
  description
}: PageHeaderProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-leaf dark:text-emerald-400">
        {eyebrow}
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold text-ink dark:text-slate-100 md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-7 text-leaf/80 dark:text-slate-400">{description}</p>
    </div>
  );
}
