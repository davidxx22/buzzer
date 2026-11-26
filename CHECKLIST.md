# Buzzer project checklist

## Frontend demo

- [x] Set up Next.js App Router, TypeScript, Tailwind CSS, and npm with a lockfile.
- [x] Add shared button, card, badge, navigation, and theme styles.
- [x] Build the staff queue with ready and collected actions, counts, and a collected view.
- [x] Share demo state between tabs in the same browser and keep it across refreshes.
- [x] Document local setup, the demo walkthrough, and project conventions.

## Verification

- [x] Type checking passes.
- [x] The production build exports the home and staff routes.
- [x] Ready and collected updates appear in two staff tabs and persist after reloading.
- [x] Empty queues show clear status text.
- [x] Verify desktop and 375px mobile layouts, keyboard focus, and updates in the staff page’s accessible status region.

## Later phases

- [ ] Define the backend API contract with the backend developer before integration.
- [ ] Add staff authentication, a shared database, and real cross-device updates.
- [ ] Evaluate background alert delivery.
