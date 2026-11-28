import Image from "next/image";

export function BrandMarks() {
  return (
    <div className="mx-auto flex min-h-16 max-w-6xl items-center px-4 sm:px-8">
      <div className="relative h-11 w-13 overflow-hidden">
        <Image
          src="/coffee-shop-mark.png"
          alt="Coffee shop logo"
          width={736}
          height={1104}
          unoptimized
          className="absolute top-1/2 left-1/2 h-auto w-24 max-w-none -translate-x-1/2 -translate-y-1/2 brightness-105 mix-blend-multiply"
        />
      </div>
    </div>
  );
}
