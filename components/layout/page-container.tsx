import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  const classes = `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className ?? ""}`.trim();
  return <div className={classes}>{children}</div>;
}
