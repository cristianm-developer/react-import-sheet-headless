/**
 * Estado posible del flujo de importación.
 */
export type ImporterStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Estado que gestiona el ImportProvider.
 * Solo incluye estado estable; el progreso se emite vía EventTarget para evitar re-renders masivos.
 */
export interface ImporterState {
  /** Archivo seleccionado (CSV/sheet) o null si no hay ninguno. */
  file: File | null;
  /** Datos crudos ya parseados (filas/objetos). */
  rawData: unknown[];
  /** Estado de la operación de importación. */
  status: ImporterStatus;
}

/** Nombre del evento personalizado que se dispara cuando avanza el progreso (parser/sanitizer/validator/transform). */
export const IMPORTER_PROGRESS_EVENT = 'importer-progress';

/**
 * Detalle del evento `importer-progress`. Solo el componente de barra de progreso debe suscribirse;
 * actualizar por ref o useState local para no re-renderizar el resto del árbol.
 */
export interface ImporterProgressDetail {
  /** Fase actual (e.g. "parsing" | "sanitizing" | "validating" | "transforming"). */
  phase?: string;
  /** Progreso global 0–100 (o step N de M). */
  globalPercent?: number;
  /** Progreso dentro del paso actual 0–100. */
  localPercent?: number;
  /** Fila/celda actual (ej. fila 350 de 1000). */
  currentRow?: number;
  /** Total de filas. */
  totalRows?: number;
  /** Alternativa: filas procesadas. */
  rowsProcessed?: number;
}
