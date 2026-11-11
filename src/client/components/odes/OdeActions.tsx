import type { ReactNode } from "react";

type OdeActionsProps = {
  children: ReactNode;
};

const OdeActions = ({ children }: OdeActionsProps) => (
  <div className="border-border bg-background sticky bottom-0 z-10 -mx-4 mt-11 -mb-20 w-[calc(100%+2rem)] border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
    <div className="mx-auto grid max-w-136 grid-cols-2 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-3">
      {children}
    </div>
  </div>
);

export default OdeActions;
