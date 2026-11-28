import Image from "next/image";

export function BrandMarks() {
  return (
    <div className="staff-theme mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 text-foreground sm:px-8">
      <Image src="/buzzer-logo.svg" alt="Buzzer" width={114} height={28} unoptimized className="h-7 w-auto shrink-0" />
      <Image src="/business-logo.png" alt="Coffee shop logo" width={32} height={32} unoptimized className="size-8 shrink-0 rounded-full object-cover" />
    </div>
  );
}
