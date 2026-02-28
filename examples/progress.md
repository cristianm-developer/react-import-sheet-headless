# Example: Showing progress

Illustrative example of **showing import progress** in the UI: status from `useImporterStatus()` and fine-grained progress (phase, percent, row counts) via `useImporterEventTarget()` or `useImporterProgressSubscription()`.

---

## Status (high-level)

**`useImporterStatus()`** gives you a simple **`status`** string (e.g. `'idle'`, `'loading'`, `'success'`, `'error'`). Use it for loading spinners or success/error states.

```tsx
import { useImporterStatus } from '@cristianm/react-import-sheet-headless';

function StatusLabel() {
  const { status } = useImporterStatus();
  return <p>Status: {status}</p>;
}
```

---

## Progress (phase and percent)

For **phase** (e.g. `'parsing'`, `'sanitizing'`, `'validating'`, `'transforming'`) and **percent** or **row counts**, subscribe to the importer **EventTarget** and listen for **`importer-progress`** events.

**`useImporterEventTarget()`** returns `progressEventTarget` and **`subscribeToProgress(callback)`**. The callback receives **`ImporterProgressDetail`** with optional:

- **`phase`** — e.g. `'parsing'`, `'sanitizing'`, `'validating'`, `'transforming'`
- **`globalPercent`** / **`localPercent`** — 0–100
- **`currentRow`** / **`totalRows`** — for row-based progress
- **`rowsProcessed`** — alternative row count

**`useImporterProgressSubscription(callback)`** subscribes for the component lifetime and unsubscribes on unmount.

```tsx
import {
  useImporterEventTarget,
  useImporterProgressSubscription,
} from '@cristianm/react-import-sheet-headless';
import { useEffect, useState } from 'react';

function ProgressBar() {
  const [detail, setDetail] = useState<{
    phase?: string;
    globalPercent?: number;
    currentRow?: number;
    totalRows?: number;
  }>({});

  const { subscribeToProgress } = useImporterEventTarget();

  useEffect(() => {
    return subscribeToProgress((d) => {
      setDetail({
        phase: d.phase,
        globalPercent: d.globalPercent,
        currentRow: d.currentRow,
        totalRows: d.totalRows,
      });
    });
  }, [subscribeToProgress]);

  const percent = detail.globalPercent ?? 0;
  const label =
    detail.phase != null
      ? `${detail.phase}${detail.totalRows != null ? ` (${detail.currentRow ?? 0}/${detail.totalRows})` : ''}`
      : '';

  return (
    <div>
      <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${percent}%`, height: 8, background: '#0a0' }} />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
}
```

Alternative: use **`useImporterProgressSubscription`** so you don’t manage the effect yourself:

```tsx
function ProgressBarWithSubscription() {
  const [detail, setDetail] = useState<{ phase?: string; globalPercent?: number }>({});

  useImporterProgressSubscription((d) => {
    setDetail({ phase: d.phase, globalPercent: d.globalPercent });
  });

  const percent = detail.globalPercent ?? 0;
  return (
    <div>
      <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${percent}%`, height: 8, background: '#0a0' }} />
      </div>
      {detail.phase && <span>{detail.phase}</span>}
    </div>
  );
}
```

---

## Abort

Call **`abort()`** from **`useImporter()`** to cancel the current run. Listen for **`importer-aborted`** on the same EventTarget if you need to reset UI state when the user cancels.

---

## Summary

| Need                        | Hook / API                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Simple status               | `useImporterStatus()` → `status`                                                                          |
| Phase, percent, rows        | `useImporterEventTarget()` → `subscribeToProgress(callback)`; callback receives `ImporterProgressDetail`. |
| Auto-subscribe for lifetime | `useImporterProgressSubscription(callback)`                                                               |
| Cancel                      | `abort()` from `useImporter()`; listen for `importer-aborted`                                             |

See: [Implementation](implementation.md), [How to: Parser](../docs/how-to-parser.md).
