# Working on Buzzer

Buzzer is a restaurant queue and order pickup demo. Use fictional orders. The Vercel demo keeps orders in the cashier’s browser and shares live ticket statuses through a temporary cache. The Wi-Fi demo uses a local shared service. Production backend integration, staff authentication, Web Push, and SMS belong to later phases.

## Folder conventions

- `src/app` contains the routes, layout, and shared theme. Keep route files thin.
- `src/components/ui` contains reusable interface primitives. Use the theme tokens in `src/app/globals.css` for colors, focus, and status styling.
- `src/features/queue` contains the staff and pickup ticket screens, typed model, and order store client. Keep order validation and status transitions in the typed model so the browser store and shared service use the same rules.
- `scripts/shared-demo.mjs` serves the static export and persists fictional orders on one Wi-Fi demo host.
- `api/ticket-status.mjs` publishes and reads temporary ticket statuses for the hosted demo.

## Queue behavior

- Staff create waiting orders with their own pickup numbers and QR tickets. Staff move waiting tickets to `ready`, then `collected`. Repeat or stale actions leave the current state intact.
- The Wi-Fi demo serves statuses from shared storage. The hosted demo publishes the status when staff show a QR and before saving each later status change.
- Preserve visible status text, keyboard access to queue actions, and accessible status announcements. Show the simulated pickup alert automatically on an open live ticket when that order is ready.

## Verify and resume

- Run `npm run typecheck` and `npm run build`, then follow the pickup walkthrough in [README.md](README.md).
- Keep [CHECKLIST.md](CHECKLIST.md) current. Mark a verification step complete when there is a passing result.
- After verifying Buzzer changes, commit and push them to the GitHub repository unless the user asks to keep them local.
- On **PAUSE**, stop development immediately. Use the current files and checklist as the handoff. On **CONTINUE**, inspect the current files and checklist, then resume from the first unfinished step.
