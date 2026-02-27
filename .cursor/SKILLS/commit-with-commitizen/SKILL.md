---
name: commit-with-commitizen
description: Stages all changes and runs the project's Commitizen flow (npm run commit) to create conventional commits with a short subject and optional long body. Use when the user asks to commit, save changes to git, create a commit, or use commitizen/cz.
---

# Commit with Commitizen

Stages every change and runs the repo's Commitizen script so the user (or agent in terminal) can complete the commit with a conventional message.

## Workflow

1. **Stage all changes**
   - Run: `git add -A` (or `git add .` if you only want the current tree).
   - Ensures every modified, added, or deleted file is included.

2. **Run Commitizen**
   - Run: `npm run commit`
   - This runs `cz` (Commitizen with `cz-conventional-changelog`). An interactive prompt will ask for type, scope, subject, body, etc.

## Message format (conventional changelog)

When proposing or writing the commit text (e.g. for the user to type when prompted, or for `git commit -m` if not using the interactive flow):

- **Short description (subject):** One line, imperative, ~50 chars.
  - Format: `type(scope): subject`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
  - Example: `feat(parser): add CSV engine`

- **Long description (body):** Optional. Wrap at 72 chars. Explain what and why, not how.
  - Example:
    ```
    Add a CSV parser engine under core/parser/engines so the pipeline
    can handle .csv uploads. Keeps xlsx for spreadsheets only.
    ```

## One-shot (non-interactive)

If the user wants a single command that commits without opening the Commitizen prompt, use:

- `git add -A && git commit -m "type(scope): short subject" -m "Optional body line one.\nOptional body line two."`
- Prefer `npm run commit` when the project expects Commitizen’s prompts and validation (e.g. commitlint).

## Checklist

- [ ] Run `git add -A` (or `git add .`) first.
- [ ] Run `npm run commit` for the Commitizen flow.
- [ ] Use a short subject (type + optional scope + imperative subject).
- [ ] Add a long body only when it adds context (what/why).
