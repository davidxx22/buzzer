import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { isOrderDetails, isOrderId, isPickupOrder, isQueueTicket, newPickupOrder, nextStatus, ordersEndpoint, ticketStatusEndpoint } from "../src/features/queue/model.ts";
import { qrConfirmationTtl } from "../src/features/queue/ticket-rules.mjs";

const staticDirectory = resolve("out");
const dataDirectory = resolve(process.env.BUZZER_DATA_DIR ?? ".buzzer");
const dataFile = join(dataDirectory, "orders.json");
const host = process.env.BUZZER_HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".txt": "text/plain; charset=utf-8" };
const { redirects } = JSON.parse(await readFile("vercel.json", "utf8"));

const home = await readFile(join(staticDirectory, "index.html")).catch(() => {
  throw new Error("Run npm run build before starting the shared demo.");
});
const notFound = await readFile(join(staticDirectory, "404.html"));
await mkdir(dataDirectory, { recursive: true });
const savedQueue = JSON.parse(await readFile(dataFile, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "[]";
  throw error;
}));
if (!Array.isArray(savedQueue) || !savedQueue.every(isQueueTicket)) throw new Error("Invalid saved shared demo queue.");

let queue = savedQueue;
let pendingWrites = Promise.resolve();
const pickupQrs = new Map();

setInterval(() => {
  for (const [key, qr] of pickupQrs) {
    if (qr.expiresAt <= Date.now()) pickupQrs.delete(key);
  }
}, qrConfirmationTtl * 1000).unref();

function changeQueue(change) {
  const update = pendingWrites.then(async () => {
    const { nextQueue, result } = change(queue);
    if (nextQueue) {
      const pendingFile = dataFile + ".tmp";
      await writeFile(pendingFile, JSON.stringify(nextQueue));
      await rename(pendingFile, dataFile);
      queue = nextQueue;
    }
    return result;
  });
  pendingWrites = update.then(() => {}, () => {});
  return update;
}

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  if (request.headers["content-type"] !== "application/json") return null;

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8192) return null;
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

async function orderApi(request, response, url) {
  if (request.method === "HEAD") {
    response.writeHead(200, { "Cache-Control": "no-store" });
    response.end();
    return;
  }
  if (request.method === "GET") {
    const id = url.searchParams.get("ticket");
    if (id === null) return json(response, 200, queue);

    const tickets = queue.filter((ticket) => ticket.id === id && isPickupOrder(ticket))
      .map(({ notes, ...ticket }) => ({ ...ticket, notes: "" }));
    return json(response, 200, tickets);
  }
  if (request.method !== "POST" && request.method !== "PATCH") {
    return json(response, 405, { error: "Unsupported method." });
  }

  const body = await readJson(request);
  if (!isOrderId(body?.id)) return json(response, 400, { error: "Invalid order ID." });
  const { id } = body;

  if (request.method === "POST") {
    if (!isOrderDetails(body)) return json(response, 400, { error: "Invalid order details." });

    const details = {
      items: body.items.map(({ name, quantity }) => ({ name: name.trim(), quantity })),
      notes: body.notes.trim(),
    };
    const order = await changeQueue((tickets) => {
      const existing = tickets.find((ticket) => ticket.id === id);
      if (existing) return { result: existing };
      const result = newPickupOrder(tickets, id, details);
      return { result, nextQueue: [...tickets, result] };
    });
    return json(response, 200, order);
  }

  if (body.status !== "ready" && body.status !== "collected") {
    return json(response, 400, { error: "Invalid order status." });
  }
  const updated = await changeQueue((tickets) => {
    const ticket = tickets.find((entry) => entry.id === id);
    if (!ticket || nextStatus(ticket.status) !== body.status) return { result: false };
    const nextQueue = tickets.map((entry) => entry.id === id ? { ...entry, status: body.status } : entry);
    return { result: true, nextQueue };
  });
  return json(response, 200, updated);
}

async function pickupQrApi(request, response, url) {
  if (request.method !== "GET" && request.method !== "POST") {
    return json(response, 405, { error: "Unsupported method." });
  }

  const body = request.method === "POST" ? await readJson(request) : null;
  const orderId = request.method === "GET" ? url.searchParams.get("order") : body?.orderId;
  const scanId = request.method === "GET" ? url.searchParams.get("scan") : body?.scanId;
  if (!isOrderId(orderId) || !isOrderId(scanId)) return json(response, 400, { error: "Invalid pickup QR." });

  const key = `${orderId}:${scanId}`;
  const qr = pickupQrs.get(key);
  const pending = qr && qr.expiresAt > Date.now();
  if (request.method === "GET") return json(response, 200, { opened: Boolean(pending && qr.opened) });

  if (body.action === "prepare-qr") {
    if (!queue.some((order) => order.id === orderId && isPickupOrder(order))) {
      return json(response, 404, { error: "Order not found." });
    }
    if (!pending) pickupQrs.set(key, { expiresAt: Date.now() + qrConfirmationTtl * 1000, opened: false });
  } else if (body.action === "qr-opened") {
    if (!pending) return json(response, 404, { error: "Pickup QR expired." });
    qr.opened = true;
  } else {
    return json(response, 400, { error: "Invalid pickup QR action." });
  }

  response.writeHead(204, { "Cache-Control": "no-store" }).end();
}

async function servePage(response, pathname) {
  if (pathname === "/") {
    response.writeHead(200, { "Content-Type": mime[".html"] });
    response.end(home);
    return;
  }

  const path = decodeURIComponent(pathname);
  const file = resolve(staticDirectory, "." + path + (path.endsWith("/") ? "index.html" : ""));
  const fromRoot = relative(staticDirectory, file);
  if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) {
    response.writeHead(404, { "Content-Type": mime[".html"] });
    response.end(notFound);
    return;
  }

  const content = await readFile(file).catch((error) => {
    if (["ENOENT", "EISDIR", "ENOTDIR"].includes(error.code)) return null;
    throw error;
  });
  response.writeHead(content ? 200 : 404, { "Content-Type": mime[extname(file)] ?? mime[".html"] });
  response.end(content ?? notFound);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === ordersEndpoint) return await orderApi(request, response, url);
    if (url.pathname === ticketStatusEndpoint) return await pickupQrApi(request, response, url);
    const redirect = redirects.find(({ source }) => source === url.pathname);
    if (redirect || url.pathname === "/staff" || url.pathname === "/ticket") {
      response.writeHead(307, { Location: redirect?.destination ?? url.pathname + "/" + url.search });
      response.end();
      return;
    }
    await servePage(response, url.pathname);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) json(response, 500, { error: "The shared demo couldn’t complete the request." });
    else response.end();
  }
});

server.listen(port, host, () => {
  const boundPort = server.address().port;
  console.log(`Buzzer shared demo is listening on ${host}:${boundPort}`);
  if (host === "0.0.0.0") {
    for (const address of Object.values(networkInterfaces()).flat()) {
      if (address?.family === "IPv4" && !address.internal) {
        console.log(`Staff on Wi-Fi: http://${address.address}:${boundPort}/staff/`);
      }
    }
  }
});
