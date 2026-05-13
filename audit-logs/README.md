# Audit Logs

Record of every design/code/a11y audit run on caboodledesign.info. One file per audit run, named `YYYY-MM-DD-<command>.md`.

## How to log an audit (next session)

Open Claude Code in this folder, then say something like:

> Run `/impeccable audit` and save the full findings to `audit-logs/YYYY-MM-DD-audit.md` using the template format.

Claude will run the audit, structure the output per the template below, and write the file. You'll approve the file write before it lands.

Repeat for `/impeccable critique` (UX) and `/impeccable polish` (pre-ship) — each gets its own dated file.

## Template

```markdown
# Audit: <command> — YYYY-MM-DD

**Scope:** <which pages or components were audited>
**Command:** /impeccable <command>
**Run by:** Emily

## Critical (fix before next deploy)
- [ ] <issue> — <file:line> — <why it matters>

## Important (fix this week)
- [ ] <issue> — <file:line> — <why it matters>

## Nice to have
- [ ] <issue> — <file:line> — <why it matters>

## Dismissed (off-brand or doesn't apply)
- ~~<suggestion>~~ — Reason: <e.g., "swap Bauhaus Bool" → no, brand-locked>

## Notes
<any context for future you>
```

## Rules

- **Always include a Dismissed section.** Impeccable will suggest off-brand changes (Bauhaus Bool → Inter, hex → OKLCH, etc.). Capture them so you don't re-evaluate the same bad suggestions on the next audit.
- **Update checkboxes as you fix things.** Don't delete fixed items — leave them checked so you can see your progress over time.
- **One file per audit run, never overwrite.** Even if you run the same command twice in a week, save as separate dated files so you can compare.
