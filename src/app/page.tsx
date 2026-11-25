import { ClipboardList, QrCode, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const views = [
  {
    title: "Customer view",
    description: "Take a ticket, see your place in line, and find out when your order is ready.",
    action: "Open customer view",
    href: "/queue",
    icon: Ticket,
  },
  {
    title: "Staff view",
    description: "See the active queue and mark each order ready or collected.",
    action: "Open staff view",
    href: "/staff",
    icon: ClipboardList,
  },
  {
    title: "Owner dashboard",
    description: "See queue counts and print a QR code for customers to join.",
    action: "Open owner dashboard",
    href: "/owner",
    icon: QrCode,
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <section className="overflow-hidden rounded-[1.5rem] bg-foreground px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="max-w-xl">
          <h1 className="text-4xl font-[760] tracking-tight sm:text-6xl">The digital buzzer</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[#c4d6ce] sm:text-lg">A queue and pickup demo for restaurants and cafés.</p>
        </div>
      </section>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {views.map(({ title, description, action, href, icon: Icon }) => (
          <Card key={href} className="flex flex-col items-start p-6 sm:p-7">
            <div className="grid size-11 place-items-center rounded-xl bg-muted text-primary">
              <Icon size={21} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 max-w-sm flex-1 leading-6 text-muted-foreground">{description}</p>
            <Button asChild variant={href === "/queue" ? "default" : "outline"} className="mt-5">
              <Link href={href}>{action}</Link>
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">To try order updates, open Customer and Staff in separate tabs in this browser.</p>
    </div>
  );
}
