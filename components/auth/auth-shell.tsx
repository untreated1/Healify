import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/page-container";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="py-10 sm:py-14">
      <PageContainer>
        <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.42)] sm:p-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </PageContainer>
    </div>
  );
}
