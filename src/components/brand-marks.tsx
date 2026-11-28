import { BellRing } from "lucide-react";
import Image from "next/image";

export function BrandMarks() {
  return (
    <div className="staff-theme mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 text-foreground sm:px-8">
      <span className="inline-flex items-center gap-2.5 font-display text-2xl leading-none font-semibold">
        <BellRing size={19} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
        Buzzer
      </span>
      <Image src="/business-logo.png" alt="Coffee shop logo" width={32} height={32} unoptimized className="size-8 shrink-0 rounded-full object-cover" />
    </div>
  );
}
