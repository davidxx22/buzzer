import { ArrowRight, Ticket } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 sm:py-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
      <section>
        <h1 className="max-w-[13ch] text-[2.5rem] leading-[1.06] font-medium tracking-[-0.03em] sm:text-5xl lg:text-[4rem]">
          Pickup starts with a QR ticket
        </h1>
        <p className="mt-5 max-w-[36ch] text-base leading-7 text-muted-foreground sm:text-lg">
          Create a QR ticket for each order. Customers scan it and see when their order is ready to pick up.
        </p>
        <Button asChild size="large" className="mt-8">
          <Link href="/staff">
            Open order queue
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </Button>
      </section>
      <figure className="pickup-preview grid min-h-88 content-center justify-items-center gap-6 rounded-[20px] px-6 py-10 sm:min-h-112 sm:px-10 lg:min-h-128">
        <div className="w-full max-w-68">
          <div className="pickup-paper relative px-6 pt-6 pb-7">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Ticket size={16} strokeWidth={1.5} aria-hidden="true" />
              Pickup ticket
            </p>
            <p className="mt-3 font-mono text-6xl leading-none font-semibold tabular-nums tracking-tight">#01</p>
            <p className="mt-4 text-base">1 × Matcha coffee</p>
            <div className="pickup-divider mt-5 pt-4">
              <Badge variant="ready">Ready for pickup</Badge>
            </div>
          </div>
        </div>
        <figcaption className="text-center text-sm">Example pickup ticket</figcaption>
      </figure>
    </div>
  );
}
