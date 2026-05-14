---
name: typecheck
description: Run the TypeScript typechecker and report errors
---

Run `npm run typecheck` and surface any errors.

- If errors are present, list each with file:line and a one-line summary.
- For simple errors (missing imports, obvious type mismatches), propose a fix the user can approve.
- Do not silence errors with `// @ts-ignore` or `any` unless explicitly asked.
