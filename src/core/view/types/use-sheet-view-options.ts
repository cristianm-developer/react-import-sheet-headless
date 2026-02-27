export type ViewFilterMode = 'all' | 'errors-only';

export interface UseSheetViewOptions {
  page?: number;
  defaultPageSize?: number;
  filterMode?: ViewFilterMode;
}
