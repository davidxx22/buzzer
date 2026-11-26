# Working on Buzzer

Buzzer is a frontend demo for a restaurant queue and order pickup workflow. Use fictional tickets in the staff view. Backend integration, staff authentication, Web Push, SMS, and hosting belong to later phases.

## Folder conventions

- `src/app` contains the routes, layout, and shared theme. Keep route files thin.
- `src/components/ui` contains reusable interface primitives. Use the theme tokens in `src/app/globals.css` for colors, focus, and status styling.
- `src/features/queue` contains the staff screen, typed model, fixtures, and browser store. Keep storage and status transitions in that feature so the staff view can later use a shared backend without rewriting its UI.

## Queue behavior

- Staff move waiting tickets to `ready`, then `collected`. Repeat or stale actions leave the current state intact.
- The browser store keeps the current status. Staff see the same tickets in tabs on the same origin and browser profile.
- Preserve visible text for all statuses, keyboard access to queue actions, and a live region for changes on the staff page.

## Verify and resume

- Run `npm run typecheck` and `npm run build`, then follow the two-tab walkthrough in [README.md](README.md).
- Keep [CHECKLIST.md](CHECKLIST.md) current. Mark a verification step complete when there is a passing result.
- On **PAUSE**, stop development immediately. Use the current files and checklist as the handoff. On **CONTINUE**, inspect the current files and checklist, then resume from the first unfinished step.
