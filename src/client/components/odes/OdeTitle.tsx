import { cn } from "cn";
import type { ReactNode } from "react";

type OdeTitleProps = {
  children: ReactNode;
  className?: string;
};

const OdeTitle = ({ children, className }: OdeTitleProps) => (
  <h1
    className={cn(
      "font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-balance wrap-anywhere",
      className,
    )}
  >
    {children}
  </h1>
);

export default OdeTitle;
