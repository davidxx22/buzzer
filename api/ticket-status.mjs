// @ts-check
import { createHash } from "node:crypto";
import { getCache } from "@vercel/functions";
import { isOrderId, isTicketStatus, isVersionedOrderItems, qrConfirmationTtl, ticketStatuses } from "../src/features/queue/ticket-rules.mjs";

const ttl = 12 * 60 * 60;
const headers = { "Cache-Control": "no-store" };

export default {
  /** @param {Request} request */
  async fetch(request) {
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

        const scanId = params.get("scan");
        if (scanId !== null) {
          if (!isOrderId(scanId)) return new Response(null, { status: 400, headers });
          const opened = await cache.get(`${orderId}:${id}:qr:${scanId}:opened`);
          return Response.json({ opened: opened === true }, { headers });
        }

        // Separate marks keep a delayed Waiting or Ready write from undoing Collected.
        const key = `${orderId}:${id}`;
        const [marks, orderItems] = await Promise.all([
          Promise.all(ticketStatuses.map((status) => cache.get(`${key}:${status}`))),
          cache.get(`${key}:items`),
        ]);
        const status = ticketStatuses[marks.lastIndexOf(true)];
        return status ? Response.json({ status, orderItems: orderItems ?? undefined }, { headers }) : new Response(null, { status: 404, headers });
      }

      if (request.method === "POST") {
        const body = await request.json().catch(() => null);
        const orderId = body?.orderId;
        const scanId = body?.scanId;
        if (body?.action === "qr-opened") {
          const id = body.liveId;
          if (!isOrderId(orderId) || !isOrderId(id) || !isOrderId(scanId)) {
            return new Response(null, { status: 400, headers });
          }

          const key = `${orderId}:${id}:qr:${scanId}`;
          if (await cache.get(`${key}:pending`) !== true) return new Response(null, { status: 404, headers });
          await cache.set(`${key}:opened`, true, { ttl: qrConfirmationTtl });
          return new Response(null, { status: 204, headers });
        }

        const secret = request.headers.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
        if (!secret) return new Response(null, { status: 401, headers });
        const status = body?.status;
        if (!isOrderId(orderId) || !isTicketStatus(status) || (scanId !== undefined && !isOrderId(scanId))) {
          return new Response(null, { status: 400, headers });
        }
        const orderItems = body?.orderItems;
        if (orderItems !== undefined && !isVersionedOrderItems(orderItems)) {
          return new Response(null, { status: 400, headers });
        }

        const id = createHash("sha256").update(`${secret}:${orderId}`).digest("hex").slice(0, 32);
        const key = `${orderId}:${id}`;
        if (orderItems) {
          const previous = await cache.get(`${key}:items`);
          if (!isVersionedOrderItems(previous) || orderItems.revision >= previous.revision) {
            await cache.set(`${key}:items`, { revision: orderItems.revision, items: orderItems.items }, { ttl });
          }
        }
        await cache.set(`${key}:${status}`, true, { ttl });
        if (scanId) await cache.set(`${key}:qr:${scanId}:pending`, true, { ttl: qrConfirmationTtl });
        return Response.json({ id }, { headers });
      }

      return new Response(null, { status: 405, headers: { ...headers, Allow: "GET, POST" } });
    } catch {
      return new Response(null, { status: 503, headers });
    }
  },
};
