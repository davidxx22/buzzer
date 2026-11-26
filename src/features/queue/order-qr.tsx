import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { formatTicketNumber, orderSummary, type OrderSource, type PickupOrder } from "./model";
import { getTicketUrl } from "./ticket-link";

export function OrderQr({ order, source }: { order: PickupOrder; source: OrderSource }) {
  const pickup = formatTicketNumber(order);
  const url = getTicketUrl(order, source);
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-4xl font-bold tabular-nums tracking-tight">{pickup}</p>
      <p className="break-words text-sm text-muted-foreground">{orderSummary(order.items)}</p>
      {order.notes && <p className="max-w-full break-words text-sm text-muted-foreground">{order.notes}</p>}
      <QRCodeCanvas
        value={url.href}
        size={264}
        level="L"
        marginSize={4}
        className="max-w-full"
        style={{ maxWidth: "100%", height: "auto" }}
        role="img"
        aria-label={`Pickup QR for ${pickup}`}
      />
      {isLoopback && source === "shared" ? (
        <p className="text-sm text-muted-foreground">Open the Staff queue at the shared demo’s Wi-Fi address to scan from a phone.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Scan with your phone’s camera to open this ticket.</p>
      )}
      <Button asChild variant="outline">
        <a href={url.href} target="_blank" rel="noreferrer">Open ticket</a>
      </Button>
    </div>
  );
}
