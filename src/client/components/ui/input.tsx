import * as React from "react";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input caret-destructive h-12 w-full min-w-0 rounded-none border-0 border-b-2 bg-transparent px-0 text-lg outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:border-destructive focus-visible:border-b-[3px]",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
