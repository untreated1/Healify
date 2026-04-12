import type { ReactNode } from "react";

type TherapistSectionProps = {
  title: string;
  hint?: string;
  children: ReactNode;
};

export function TherapistSection({
  title,
  hint,
  children,
}: TherapistSectionProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {hint ? (
          <p className="max-w-3xl text-sm leading-6 text-slate-600">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
