# Buzzer

Buzzer is a demo for restaurant order pickup. Cashiers create orders and show a per-order QR code. Customers open their pickup ticket without signing in.

## Run locally

Use Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). To check the project and generate its static files, run the following commands. The build writes to `out/`.

```sh
npm run typecheck
npm run build
```

## Test with a cashier device and a phone

Use Node.js 24 for the shared demo. Run these commands from the project root.

```sh
npm run build
npm run demo:shared
```

Use a private Wi-Fi network and fictional orders. Connect both devices to that network. Open the printed Wi-Fi address on the cashier device so the QR contains an address the phone can reach.

1. In **Staff**, select **New order**. Create **#01** with one **Matcha coffee**, then **#02** with one **Iced latte**. Use **Add item** when an order includes more than one item.
2. Reopen **Show QR** for **#01** and scan it with the phone camera. Confirm the ticket shows **#01**, **1 × Matcha coffee**, and **Waiting**. Select **Enable alerts** and keep the ticket open.
3. Mark **#02** ready first. The matcha ticket stays **Waiting**.
4. Mark **#01** ready. The phone shows **Ready for pickup** and a **Simulated pickup alert**. Mark it collected and confirm it moves to **Collected orders**.

The shared demo saves orders in `.buzzer/orders.json` between restarts. Pickup numbers start at **#01** for a fresh queue.

## Try the Vercel preview

The hosted preview stores orders in the browser that created them. Two tabs in the same browser profile stay in sync. Scanning from another device opens a snapshot of the exact order. Use the shared demo for live cross-device updates. Alerts are simulated on the open ticket in both modes. Old Customer and Owner links open the Staff queue.

See [CHECKLIST.md](CHECKLIST.md) for progress and [AGENT.md](AGENT.md) for development conventions.
