# Buzzer project checklist

## Frontend demo

- [x] Set up Next.js App Router, TypeScript, Tailwind CSS, and npm with a lockfile.
- [x] Add shared button, card, badge, navigation, and theme styles.
- [x] Build the staff queue with ready and collected actions, counts, and a collected view.
- [x] Share demo state between tabs in the same browser and keep it across refreshes.
- [x] Document local setup, the demo walkthrough, and project conventions.
- [x] Add itemized orders, per-order QR codes, and mobile pickup tickets.
- [x] Add a shared Wi-Fi demo mode and simulated pickup alerts.

## Verification

- [x] Type checking passes.
- [x] The production build exports the home, staff, and pickup ticket routes.
- [x] The Matcha and Iced latte tickets update independently across browser sessions in the shared demo.
- [x] A simulated alert appears automatically when the correct order is ready.
- [x] Verify the hosted ticket relay from Waiting to Ready to Collected in two separate browsers.
- [ ] Run the pickup check with a physical phone on the same Wi-Fi.
- [x] Verify desktop and 375px mobile layouts, keyboard focus, and collected orders.

## Later phases

- [ ] Define the backend API contract with the backend developer before integration.
- [ ] Connect a hosted shared database and add staff authentication.
- [ ] Evaluate background alert delivery.
