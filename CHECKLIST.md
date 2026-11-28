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
- [x] Verify the homepage, staff page, and pickup ticket page use the #F5F5F4 backdrop.
- [x] Verify the staff queue cards and dialog use #FAFAF9. Verify primary buttons use #008000 with #FAFAF9 text.
- [x] Verify the homepage, staff queue, and pickup ticket render without a navbar, and the homepage’s Open staff view link still opens the queue.
- [x] Verify the supplied coffee shop mark is the only logo above the homepage, staff queue, and pickup ticket and renders about 48px wide.
- [x] Verify the staff queue has no outer card. On desktop and phones, the standalone logo aligns with the content gutter, and the three metric columns, divider, and waiting and ready ticket rows span the available width.
- [x] Verify the shared demo serves the SVG favicon with its correct media type.
- [x] Verify that opening the customer QR link replaces the QR with an in-dialog confirmation before closing. Staff previews and QR links from an earlier dialog leave the current dialog open.
- [x] Verify the off-white dashed perforation sits 2px inside the colored number stub.
- [x] Verify staff tickets of different heights and customer pickup tickets use whole, fixed-size scallops at normal zoom.
- [x] Verify the 4px staff seam notches have a smooth outline and the off-white dashes stop short of both cutouts.
- [x] Verify staff timers persist after refresh in both demo modes and disappear on collection.
- [x] Verify elapsed waiting time updates every second and a new timer starts when staff mark the order ready.
- [x] Verify the Ready for pickup and Waiting orders headings appear without horizontal lines.
- [x] Verify active staff tickets show timers and notes, with item summaries available in Details, the QR dialog, and the customer ticket.
- [x] Verify the smaller notepad uses a 128px image box on narrow phones and 144px on larger screens. Verify New order opens the form and the empty state returns after the last active order is collected.
- [x] Verify collected rows show the ticket number, QR icon, and Details, with items, notes, and status available in the Details dialog.
- [x] Verify the sort icon fits beside both tabs on narrow portrait screens and the text dropdown appears on landscape phones and tablets. Verify the menu fits, both choices work, and the selected sort survives rotation.
- [x] Verify Notify marks an order ready and shows the pickup alert, and Collected moves it to Collected orders.
- [x] Verify the QR icon opens the pickup dialog and Notify and Collected have matching dimensions.
- [x] Verify the Details button sits between the QR icon and Notify or Collected, opens Order details, and offers editing only for waiting orders.
- [x] Verify the New order, Order details, and Pickup QR dialogs fit narrow phone screens, the QR stays square, and order creation, editing, and pickup status updates still work in the local demo.
- [x] Verify edits preserve the order number and timer, reject stale saves, and show updated items on the original live pickup link in the shared demo and a local hosted-mode test.

## Later phases

- [ ] Define the backend API contract with the backend developer before integration.
- [ ] Connect a hosted shared database and add staff authentication.
- [ ] Evaluate background alert delivery.
