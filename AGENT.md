# Working on Buzzer

Buzzer is a frontend demo for a restaurant queue and order pickup workflow. Use fictional tickets in the customer, staff, and owner views. Backend integration, staff authentication, Web Push, SMS, and hosting belong to later phases.

## Folder conventions

- `src/app` contains the routes, layout, and shared theme. Keep route files thin.
- `src/components/ui` contains reusable interface primitives. Use the theme tokens in `src/app/globals.css` for colors, focus, and status styling.
- `src/features/queue` contains the customer and staff screens, typed model, fixtures, and browser store. Keep storage and status transitions in that feature so the views can later use a shared backend without rewriting their UI.
- `src/features/owner` contains the owner dashboard and printable customer QR code. The dashboard reads the shared queue store. The QR defaults to the current origin’s `/queue/` route and saves an edited destination in browser storage.

## Queue behavior

- A new ticket starts as `waiting`. Staff move it to `ready`, then `collected`. Repeat or stale actions leave the current state intact.
- The ticket URL identifies the ticket. The browser store keeps the current status. Customers and staff see the same tickets in tabs on the same origin and browser profile.
- Preserve visible text for all statuses, keyboard access to queue actions, and a live region for changes on the customer ticket page.

## Verify and resume

- Run `npm run typecheck` and `npm run build`, then follow the two-tab walkthrough in [README.md](README.md).
- Keep [CHECKLIST.md](CHECKLIST.md) current. Mark a verification step complete when there is a passing result.
- On **PAUSE**, stop development immediately. Use the current files and checklist as the handoff. On **CONTINUE**, inspect the current files and checklist, then resume from the first unfinished step.
