"use client";

import { Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const QUEUE_URL_KEY = "buzzer:queue-url:v1";
const MAX_QUEUE_URL_LENGTH = 512;

function parseQueueUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username || url.password ||
    url.href.length > MAX_QUEUE_URL_LENGTH
  ) return null;

  return url;
}

function isLocalPreview(hostname: string) {
  return hostname === "localhost" || hostname.endsWith(".localhost") ||
    hostname === "[::1]" || hostname === "0.0.0.0" || hostname.startsWith("127.");
}

export function QueueQrCard() {
  const [destination, setDestination] = useState<URL | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let savedUrl: URL | null = null;
    try {
      savedUrl = parseQueueUrl(window.localStorage.getItem(QUEUE_URL_KEY) ?? "");
    } catch {
      // The default URL can still be used when storage is unavailable.
    }

    const initialUrl = savedUrl ?? new URL("/queue/", window.location.origin);
    setDestination(initialUrl);
    setDraft(initialUrl.href);
  }, []);

  function updateDestination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const url = parseQueueUrl(draft);
    if (!url) {
      setError(`Enter an HTTP or HTTPS URL up to ${MAX_QUEUE_URL_LENGTH} characters, without sign-in credentials.`);
      return;
    }

    setError("");
    setDestination(url);
    setDraft(url.href);

    try {
      window.localStorage.setItem(QUEUE_URL_KEY, url.href);
      setFeedback("QR code updated.");
    } catch {
      setFeedback("QR code updated for this visit. The browser couldn’t save the URL.");
    }
  }

  return (
    <Card className="mt-5 p-5 sm:p-7 print:m-0 print:rounded-none print:border-0 print:p-0">
      <h2 className="text-xl font-bold tracking-tight print:hidden">Customer QR code</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start print:mt-0 print:block">
        <figure className="min-w-0 rounded-xl border border-border bg-background px-4 py-5 text-center print:mx-auto print:max-w-[145mm] print:break-inside-avoid print:border-0 print:bg-white print:p-0 print:text-black">
          <p className="hidden text-xl font-bold print:block">Buzzer</p>
          <figcaption className="text-lg font-bold print:mt-2 print:text-3xl">Scan to join the queue</figcaption>
          {destination ? (
            <>
              <div className="mx-auto mt-4 w-full max-w-52 bg-white print:mt-5 print:max-w-[75mm]">
                <QRCodeCanvas
                  value={destination.href}
                  size={640}
                  level="M"
                  marginSize={4}
                  role="img"
                  aria-label="Customer queue QR code"
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              </div>
              <p className="mt-4 text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere] print:text-black">{destination.href}</p>
            </>
          ) : (
            <p role="status" className="mt-4 text-sm text-muted-foreground">Loading the QR code…</p>
          )}
        </figure>

        <div className="min-w-0 print:hidden">
          <form onSubmit={updateDestination} noValidate>
            <label htmlFor="queue-url" className="block font-semibold">Customer queue URL</label>
            <p id="queue-url-hint" className="mt-1 text-sm leading-5 text-muted-foreground">Use a queue URL that customers can open on their phones.</p>
            <input
              id="queue-url"
              type="url"
              autoComplete="off"
              spellCheck={false}
              maxLength={MAX_QUEUE_URL_LENGTH}
              disabled={!destination}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setError("");
                setFeedback("");
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "queue-url-hint queue-url-error" : "queue-url-hint"}
              className="mt-3 min-h-11 w-full rounded-lg border border-border bg-card px-3 text-base aria-invalid:border-danger"
            />
            {error && <p id="queue-url-error" role="alert" className="mt-2 text-sm text-danger">{error}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="submit" variant="outline" disabled={!destination}>Update QR code</Button>
              <Button type="button" disabled={!destination} onClick={() => window.print()}>
                <Printer size={16} aria-hidden="true" />
                Print QR code
              </Button>
            </div>
            <p role="status" className="mt-2 text-sm text-primary empty:hidden">{feedback}</p>
          </form>
          {destination && isLocalPreview(destination.hostname) && (
            <p className="mt-4 rounded-lg bg-waiting-surface p-3 text-sm leading-5 text-waiting-ink">
              This QR points to a local preview. Enter a reachable queue URL before scanning from another device.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
