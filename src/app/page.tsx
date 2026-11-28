import Link from "next/link";
import { BrandMarks } from "@/components/brand-marks";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <BrandMarks />
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-8 sm:pt-16 md:pt-20">
        <section className="grid md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]" aria-labelledby="home-heading">
          <div className="ticket-paper relative px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-20">
            <h1 id="home-heading" className="max-w-[11ch] font-display text-6xl leading-[0.89] font-semibold tracking-tight sm:text-7xl lg:text-[6.5rem]">
              The digital buzzer
            </h1>
            <p className="mt-6 max-w-[32ch] text-base leading-6 sm:text-lg sm:leading-7">
              Create a pickup ticket for each order. Customers scan it to see when their order is ready.
            </p>
            <Button asChild size="large" className="mt-8 bg-paper-ink text-paper-cream outline-[#772c49] hover:bg-[#513745]">
              <Link href="/staff">Open staff view</Link>
            </Button>
          </div>

          <figure className="ticket-paper ticket-edge landing-stub flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12" data-tone="waiting">
            <figcaption className="text-sm font-semibold">Example pickup ticket</figcaption>
            <p className="mt-3 font-display text-7xl leading-none font-semibold tabular-nums sm:text-8xl lg:text-[8rem]">#01</p>
            <p className="mt-3 text-base">1 × Iced latte</p>
            <div className="mt-5 border-t border-dashed border-paper-ink/45 pt-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="size-2 rounded-full bg-current" aria-hidden="true" />
                Waiting
              </p>
            </div>
          </figure>
        </section>
      </div>
    </>
  );
}
