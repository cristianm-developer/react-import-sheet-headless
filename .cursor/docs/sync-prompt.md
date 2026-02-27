# Sync prompt — Start of session

When you open Cursor to continue working on this project (e.g. after a break or a multi-day sprint), run this **alignment prompt** first:

---

**Prompt to paste:**

> Read the Architecture.md and the latest entries in the devlog. Summarize the current state of the project and tell me what is the next logical step according to the construction plan.

---

**What it does:** Forces the AI to load `.cursor/docs/Architecture.md` and `.cursor/devlog.md` (and optionally `.cursor/history.md`) so it has full context before you ask for the next task. The construction plan is in `.cursor/docs/Construction Steps/` (steps 1–11: PackageSetting, Setting, Parser, Convert, Sanitizer, Validator, Transform, Edit, View, Readme, Telemetry).
