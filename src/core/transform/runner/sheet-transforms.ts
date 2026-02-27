import type { SheetError } from '../../../types/error.js';
import type { SheetLayout } from '../../../types/sheet-layout.js';
import type { Sheet } from '../../../types/sheet.js';
import type { TransformDeltaItem } from '../types/transform-delta.js';
import { resolveTransformRef } from './resolve-transform-ref.js';

export const EXTERNAL_TRANSFORM_FAILED = 'EXTERNAL_TRANSFORM_FAILED';

export type SheetTransformFn = (
  sheet: Sheet,
  params?: Readonly<Record<string, unknown>>,
  signal?: AbortSignal,
) => readonly TransformDeltaItem[] | Promise<readonly TransformDeltaItem[]>;

export type GetSheetTransform = (name: string) => SheetTransformFn | undefined;

export interface SheetTransformOutput {
  readonly deltas: TransformDeltaItem[];
  readonly errors: SheetError[];
}

export async function runSheetTransforms(
  sheet: Sheet,
  sheetLayout: SheetLayout,
  getTransform: GetSheetTransform,
  signal?: AbortSignal,
): Promise<SheetTransformOutput> {
  const list = sheetLayout.sheetTransformations;
  if (!list?.length) return { deltas: [], errors: [] };
  const deltas: TransformDeltaItem[] = [];
  const errors: SheetError[] = [];
  for (const ref of list) {
    const { name, params } = resolveTransformRef(ref);
    const fn = getTransform(name);
    if (!fn) continue;
    try {
      const result = await Promise.resolve(fn(sheet, params, signal));
      if (result?.length) deltas.push(...result);
    } catch {
      errors.push({
        code: EXTERNAL_TRANSFORM_FAILED,
        level: 'fatal',
        params: { reason: 'network' },
      });
    }
  }
  return { deltas, errors };
}
