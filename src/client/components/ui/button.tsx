import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors outline-hidden focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-dashed disabled:border-muted-foreground/50 disabled:bg-transparent disabled:text-muted-foreground disabled:shadow-none aria-disabled:cursor-not-allowed aria-disabled:border-dashed aria-disabled:border-muted-foreground/50 aria-disabled:bg-transparent aria-disabled:text-muted-foreground aria-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-2 border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(43_36_32/0.3)] hover:border-[#4a3e36] hover:bg-[#4a3e36]",
        destructive: "bg-destructive text-primary-foreground",
        outline:
          "border-2 border-foreground bg-transparent text-foreground hover:bg-accent",
        secondary:
          "border-2 border-transparent bg-accent text-accent-foreground hover:bg-border",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "text-foreground underline underline-offset-4",
      },
      size: {
        default: "min-h-12 px-5 py-2.5 text-base has-[>svg]:px-4",
        compact:
          "min-h-11 px-3 py-2 text-sm has-[>svg]:px-3 sm:min-h-12 sm:px-5 sm:text-base",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-10 gap-1.5 px-3.5 py-1.5 text-sm has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 text-base has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  disabled,
  disabledReason,
  onClick,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    disabledReason?: string;
  }) {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const Comp = asChild ? Slot.Root : "button";
  const explainsDisabled = Boolean(disabled && disabledReason);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (explainsDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const button = (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      aria-disabled={explainsDisabled ? true : props["aria-disabled"]}
      disabled={explainsDisabled ? undefined : disabled}
      onClick={handleClick}
    />
  );

  if (disabledReason === undefined) {
    return button;
  }

  return (
    <Tooltip
      onOpenChange={(open) => setIsTooltipOpen(open && explainsDisabled)}
      open={explainsDisabled && isTooltipOpen}
    >
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  );
}

export { Button, buttonVariants };
