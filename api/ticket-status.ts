import { createHash } from "node:crypto";
import { getCache } from "@vercel/functions";
import { isOrderId, isTicketStatus, ticketStatuses } from "../src/features/queue/model";

const ttl = 12 * 60 * 60;
const headers = { "Cache-Control": "no-store" };

export default {
  async fetch(request: Request) {
    const cache = getCache({
      namespace: "buzzer-ticket-status-v1",
      keyHashFunction: (key) => createHash("sha256").update(key).digest("hex"),
    });
    try {
      if (request.method === "GET") {
        const params = new URL(request.url).searchParams;
        const id = params.get("id");
        const orderId = params.get("order");
        if (!isOrderId(id) || !isOrderId(orderId)) return new Response(null, { status: 400, headers });

        // Separate marks keep a delayed Waiting or Ready write from undoing Collected.
        const marks = await Promise.all(ticketStatuses.map((status) => cache.get(`${orderId}:${id}:${status}`)));
        const status = ticketStatuses[marks.lastIndexOf(true)];
        return status ? Response.json({ status }, { headers }) : new Response(null, { status: 404, headers });
      }

      if (request.method === "POST") {
        const secret = request.headers.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
        if (!secret) return new Response(null, { status: 401, headers });
        const body = await request.json().catch(() => null) as { orderId?: unknown; status?: unknown } | null;
        const orderId = body?.orderId;
        const status = body?.status;
        if (!isOrderId(orderId) || !isTicketStatus(status)) return new Response(null, { status: 400, headers });

        const id = createHash("sha256").update(`${secret}:${orderId}`).digest("hex").slice(0, 32);
        await cache.set(`${orderId}:${id}:${status}`, true, { ttl });
        return Response.json({ id }, { headers });
      }

      return new Response(null, { status: 405, headers: { ...headers, Allow: "GET, POST" } });
    } catch {
      return new Response(null, { status: 503, headers });
    }
  },
};
