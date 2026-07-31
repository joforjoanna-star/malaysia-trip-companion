interface SectionHeaderProps {
  eyebrow: string;
  title: string;
}

export function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="mb-5 animate-fade-in-up">
      <div className="text-[11px] tracking-[0.25em] uppercase text-spice font-semibold mb-1.5">
        {eyebrow}
      </div>
      <h2
        className="text-[26px] leading-tight text-forest"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        {title}
      </h2>
      <div className="mt-2 h-[3px] w-8 rounded-full bg-spice/70" />
    </div>
  );
}
