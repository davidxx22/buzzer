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
- [x] Verify the ticket-themed landing page and staff queue, plus the live pink Waiting, green Ready, and neutral Collected ticket states.
- [x] Verify ready orders move above the waiting section and keep keyboard focus in Active orders.
- [x] Verify the heading, counts, and order lists fit inside one staff queue card on desktop and mobile.
- [x] Verify the staff queue’s waiting number stubs use #A4161A with readable light text, while customer waiting tickets stay pink.
- [x] Verify collected pickup tickets and staff number stubs both use #A8A29E with dark text.
- [x] Verify staff ticket stubs show “No.” above the padded order number in every order state.
- [x] Verify the staff page’s white backdrop, shadowed white queue card, and white navbar on desktop and mobile. Verify primary buttons use #008000 with white text.
- [x] Verify that opening the customer QR link replaces the QR with an in-dialog confirmation before closing. Staff previews and QR links from an earlier dialog leave the current dialog open.
- [x] Verify the business logo appears in the navbar, the dropdown opens the staff queue, and Escape closes it and returns focus to the logo.
- [x] Verify the white dashed perforation sits 2px inside the colored number stub for Waiting, Ready, and Collected orders.
- [x] Verify staff tickets of different heights and customer pickup tickets use whole, fixed-size scallops at normal zoom.
- [x] Verify the ticket cutouts have a smooth, crisp outline and the white dashes stop short of the notches.
- [x] Verify staff timers persist after refresh in both demo modes and disappear on collection.
- [x] Verify elapsed waiting time updates every second and a new timer starts when staff mark the order ready.
- [x] Verify the Ready for pickup and Waiting orders headings appear without horizontal lines.

## Later phases

- [ ] Define the backend API contract with the backend developer before integration.
- [ ] Connect a hosted shared database and add staff authentication.
- [ ] Evaluate background alert delivery.
