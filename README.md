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

## Test on the hosted demo

Open [Buzzer Staff](https://buzzerrr.vercel.app/staff/), create an order, scan its QR with a phone, and open the link. The staff dialog replaces the QR with a confirmation for three seconds, then closes. Keep the ticket open while staff select **Notify** when the order is ready and **Collected** after pickup. The phone updates automatically and shows a simulated alert when the order is ready.

The staff **Open ticket** button previews the ticket and leaves the dialog open. Each new QR display checks for a ticket opening for five minutes. The pickup link remains usable after that check ends.

The cashier’s browser keeps the order. Vercel’s temporary cache shares its status with the phone, so this demo needs no database. Reopen **Show QR** to publish the current status if a live link has expired or the original QR was created before live updates were added.

Staff tickets show elapsed minutes and seconds while waiting. **Notify** starts a new timer for the time since the order became ready. Timers survive a refresh in both demo modes. Orders saved before timers were added get a timer the next time staff mark them ready.

## Test on a local Wi-Fi network

Use Node.js 24 for the shared demo. Run these commands from the project root.

```sh
npm run build
npm run demo:shared
```

Use a private Wi-Fi network and fictional orders. Connect both devices to that network. Open the printed Wi-Fi address on the cashier device so the QR contains an address the phone can reach.

1. In **Staff**, select **New order**. Create **#01** with one **Matcha coffee**, then **#02** with one **Iced latte**. Use **Add item** when an order includes more than one item.
2. Reopen **Show QR** for **#01**, scan it with the phone camera, and open the link. Check that the staff dialog shows the confirmation in place of the QR and then closes. The phone should show **#01**, **1 × Matcha coffee**, and **Waiting**. Keep the ticket open for the pickup alert.
3. Select **Notify** for **#02** first. The matcha ticket stays **Waiting**.
4. Select **Notify** for **#01**. The phone shows **Ready for pickup** and a **Simulated pickup alert**. Select **Collected** and confirm it moves to **Collected orders**.

The shared demo saves orders in `.buzzer/orders.json` between restarts. Pickup numbers start at **#01** for a fresh queue.

Old Customer and Owner links open the Staff queue.

See [CHECKLIST.md](CHECKLIST.md) for progress and [AGENT.md](AGENT.md) for development conventions.
