# Buzzer

Buzzer is a frontend prototype for managing restaurant order pickup. Staff use a digital queue to mark demo orders ready and collected.

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

## Try the staff workflow

On the Vercel deployment, old Customer and Owner links open the staff queue.

1. Open **Staff** in two tabs on the same origin and browser profile.
2. Find a waiting ticket in **Active orders** and select **Mark ready**. Confirm the ticket shows **Ready** in both tabs.
3. Select **Mark collected** and check **Collected orders** in both tabs for the ticket.
4. Reload a staff tab and open **Collected orders** to confirm the status was saved.

This demo stores fictional tickets in browser storage. To restore the fixture tickets, remove the `buzzer:demo-queue:v1` local storage entry for the app’s origin.

See [CHECKLIST.md](CHECKLIST.md) for progress and [AGENT.md](AGENT.md) for development conventions.
