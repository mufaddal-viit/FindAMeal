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
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-leaf">
        {eyebrow}
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold text-ink md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-7 text-leaf/80">{description}</p>
    </div>
  );
}
