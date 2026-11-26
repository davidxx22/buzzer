import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold", {
  variants: {
    variant: {
      waiting: "bg-waiting-surface text-waiting-ink",
      ready: "bg-ready-surface text-ready-ink",
      collected: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: { variant: "collected" },
});

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
