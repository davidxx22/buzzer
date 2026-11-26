import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <section className="overflow-hidden rounded-[1.5rem] bg-foreground px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="max-w-xl">
          <h1 className="text-4xl font-[760] tracking-tight sm:text-6xl">The digital buzzer</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[#c4d6ce] sm:text-lg">A queue and pickup demo for restaurants and cafés.</p>
        </div>
      </section>
      <Card className="mt-5 flex flex-col items-start p-6 sm:p-7">
        <div className="grid size-11 place-items-center rounded-xl bg-muted text-primary">
          <ClipboardList size={21} aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight">Staff view</h2>
        <p className="mt-2 max-w-sm leading-6 text-muted-foreground">See the active queue and mark each order ready or collected.</p>
        <Button asChild className="mt-5">
          <Link href="/staff">Open staff view</Link>
        </Button>
      </Card>
    </div>
  );
}
