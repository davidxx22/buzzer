# Buzzer

Buzzer is a frontend prototype for replacing restaurant buzzers with a digital ticket. Customers open the queue link, join without an account, and see an in-app alert when staff mark their order ready.

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

## Try the customer and staff workflow

1. Open **Customer** and **Staff** in separate tabs on the same origin and browser profile.
2. Select **Get my ticket** in the customer tab and note the ticket number.
3. Find that ticket in **Active orders** in the staff tab and select **Mark ready**. The customer tab shows **Your order is ready**.
4. Select **Mark collected**. The customer sees the collected confirmation, and the ticket moves to **Collected orders** for staff.
5. Reload the customer ticket URL to see its saved status.

This demo stores fictional tickets in browser storage. Ticket links work in the same browser profile and on the same origin that issued them. To restore the fixture tickets, remove the `buzzer:demo-queue:v1` local storage entry for the app’s origin. That clears tickets created during the demo.

## Print a customer QR code

Open **Owner** to see the queue counts. Under **Customer QR code**, the default destination is this preview’s `/queue/` route. To use a different address, edit **Customer queue URL** and select **Update QR code**. Select **Print QR code** to print the sign or save it as a PDF through the browser’s print menu.

When trying the QR from a phone, use a queue URL reachable from that phone. Localhost and `127.0.0.1` work only on the device running the preview. Queue counts and ticket updates stay in their own browser until a shared backend is added.

See [CHECKLIST.md](CHECKLIST.md) for progress and [AGENT.md](AGENT.md) for development conventions.
