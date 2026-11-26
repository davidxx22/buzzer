import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { shareBrowserOrder } from "./browser-store";
import { formatTicketNumber, orderSummary, type OrderSource, type PickupOrder } from "./model";
import { getTicketUrl } from "./ticket-link";

export function OrderQr({ order, source }: { order: PickupOrder; source: OrderSource }) {
  const pickup = formatTicketNumber(order);
  const [hostedQr, setHostedQr] = useState<{ url: URL; live: boolean } | "error" | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (source === "shared") return;

    let active = true;
    shareBrowserOrder(order.id).then(({ order: latest, liveId }) => {
      if (active) setHostedQr({ url: getTicketUrl(latest, "browser", liveId), live: Boolean(liveId) });
    }, () => {
      if (active) setHostedQr("error");
    });
    return () => { active = false; };
  }, [order.id, source, attempt]);

  const qr = source === "shared" ? { url: getTicketUrl(order, source), live: true } : hostedQr;
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-4xl font-bold tabular-nums tracking-tight">{pickup}</p>
      <p className="break-words text-sm text-muted-foreground">{orderSummary(order.items)}</p>
      {order.notes && <p className="max-w-full break-words text-sm text-muted-foreground">{order.notes}</p>}
      {qr === null && <p role="status" className="text-sm text-muted-foreground">Preparing pickup QR…</p>}
      {qr === "error" && (
        <>
          <p role="alert" className="text-sm text-danger">The live pickup QR couldn’t be prepared.</p>
          <Button variant="outline" onClick={() => {
            setHostedQr(null);
            setAttempt((current) => current + 1);
          }}>Try again</Button>
        </>
      )}
      {qr && qr !== "error" && (
        <>
          <QRCodeCanvas
            value={qr.url.href}
            size={264}
            level="L"
            marginSize={4}
            className="max-w-full"
            style={{ maxWidth: "100%", height: "auto" }}
            role="img"
            aria-label={`Pickup QR for ${pickup}`}
          />
          <p className="text-sm text-muted-foreground">
            {isLoopback && source === "shared"
              ? "Open the Staff queue at the shared demo’s Wi-Fi address to scan from a phone."
              : qr.live
                ? "Scan to open a live pickup ticket on your phone."
                : "Scan to open a snapshot of this ticket."}
          </p>
          <Button asChild variant="outline">
            <a href={qr.url.href} target="_blank" rel="noreferrer">Open ticket</a>
          </Button>
        </>
      )}
    </div>
  );
}
