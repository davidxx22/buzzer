import { BellRing } from "lucide-react";
import Image from "next/image";

export function BrandMarks() {
  return (
    <div className="flex w-fit items-center gap-3">
      <span className="inline-flex items-center gap-2 font-display text-2xl leading-none font-semibold">
        <BellRing size={19} strokeWidth={1.75} aria-hidden="true" />
        Buzzer
      </span>
      <span aria-hidden="true" className="h-5 w-px bg-current opacity-25" />
      <Image src="/business-logo.png" alt="Coffee shop logo" width={32} height={32} unoptimized className="size-8 shrink-0 rounded-full object-cover" />
    </div>
  );
}
