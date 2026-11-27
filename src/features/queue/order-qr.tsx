import { Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { shareBrowserOrder } from "./browser-store";
import { formatTicketNumber, orderSummary, type OrderSource, type PickupOrder } from "./model";
import { getTicketUrl } from "./ticket-link";
import { qrConfirmationTtl } from "./ticket-rules.mjs";
import { isPickupTicketOpened, prepareSharedPickupQr } from "./ticket-status";

type PreparedQr = { url: URL; live: boolean; scanId?: string; liveId?: string };

export function OrderQr({ order, source, onClose }: {
  order: PickupOrder;
  source: OrderSource;
  onClose: () => void;
}) {
  const pickup = formatTicketNumber(order);
  const [qr, setQr] = useState<PreparedQr | "error" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [expired, setExpired] = useState(false);
  const [opened, setOpened] = useState(false);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const confirmationDetails = useId();

  useEffect(() => {
    let active = true;
    const scanId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    async function prepare() {
      try {
        if (source === "shared") {
          const canConfirm = await prepareSharedPickupQr(order.id, scanId).catch(() => false);
          if (active) setQr({ url: getTicketUrl(order, source), live: true, scanId: canConfirm ? scanId : undefined });
          return;
        }

        const { order: latest, liveId } = await shareBrowserOrder(order.id, scanId);
        if (active) setQr({
          url: getTicketUrl(latest, source, liveId),
          live: Boolean(liveId),
          scanId: liveId ? scanId : undefined,
          liveId: liveId ?? undefined,
        });
      } catch {
        if (active) setQr("error");
      }
    }

    void prepare();
    return () => { active = false; };
  }, [order, source, attempt]);

  useEffect(() => {
    if (!qr || qr === "error" || !qr.scanId) return;
    const { scanId, liveId } = qr;
    const deadline = Date.now() + qrConfirmationTtl * 1000;
    let active = true;
    let timer: number;

    async function check() {
      if (Date.now() >= deadline) {
        setExpired(true);
        return;
      }

      const opened = await isPickupTicketOpened(order.id, scanId, liveId).catch(() => false);
      if (!active) return;
      if (opened) {
        setOpened(true);
      } else {
        timer = window.setTimeout(check, 2500);
      }
    }

    timer = window.setTimeout(check, 2500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [order.id, qr]);

  useEffect(() => {
    if (!opened) return;

    confirmationHeading.current?.focus();
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose, opened]);

  if (opened) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
          <Check size={36} strokeWidth={2.5} aria-hidden="true" />
        </div>
        <div>
          <h3 ref={confirmationHeading} tabIndex={-1} aria-describedby={confirmationDetails} className="rounded-sm text-xl font-bold">
            Pickup ticket opened
          </h3>
          <p id={confirmationDetails} className="mt-2 text-sm text-muted-foreground">The customer opened ticket {pickup}.</p>
        </div>
      </div>
    );
  }

  const customerUrl = qr && qr !== "error" ? new URL(qr.url) : null;
  if (customerUrl && qr && qr !== "error" && qr.scanId) customerUrl.searchParams.set("scan", qr.scanId);
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
            setQr(null);
            setExpired(false);
            setAttempt((current) => current + 1);
          }}>Try again</Button>
        </>
      )}
      {qr && qr !== "error" && customerUrl && (
        <>
          <QRCodeCanvas
            value={customerUrl.href}
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
          {qr.scanId && (
            <p role="status" className="text-sm text-muted-foreground">
              {expired ? "Reopen the QR to check for a new ticket opening." : "Waiting for the customer to open the ticket…"}
            </p>
          )}
          <Button asChild variant="outline">
            <a href={qr.url.href} target="_blank" rel="noreferrer">Open ticket</a>
          </Button>
        </>
      )}
    </div>
  );
}
