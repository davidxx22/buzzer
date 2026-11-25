# Buzzer project checklist

## Frontend demo

- [x] Set up Next.js App Router, TypeScript, Tailwind CSS, and npm with a lockfile.
- [x] Add shared button, card, badge, navigation, and theme styles.
- [x] Build the customer join screen, ticket view, and pickup alert.
- [x] Build the staff queue with ready and collected actions, counts, and a collected view.
- [x] Add the owner dashboard with queue counts and a printable QR code with an editable destination.
- [x] Share demo state between tabs in the same browser and keep it across refreshes.
- [x] Document local setup, the demo walkthrough, and project conventions.

## Verification

- [x] Type checking passes.
- [x] The production build exports the home, customer, staff, and owner routes.
- [x] A customer can join and see ready and collected updates from a second tab.
- [x] Reloading the ticket page preserves the ticket status.
- [x] Missing tickets and empty queues show a recovery path or clear next step.
- [x] Verify desktop and 375px mobile layouts, keyboard focus, and updates in the browser’s accessible status region.
- [x] Verify the owner dashboard updates across tabs, the QR destination can be edited and saved, and the page uses a sign-only print layout.

## Later phases

- [ ] Define the backend API contract with the backend developer before integration.
- [ ] Add staff authentication, a shared database, and real cross-device updates.
- [ ] Evaluate background alert delivery.
