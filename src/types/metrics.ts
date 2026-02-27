export interface PipelineMetricsTimings {
  readonly parse: number;
  readonly sanitize: number;
  readonly validate: number;
  readonly transform: number;
}

export interface PipelineMetricsPercentages {
  readonly parse: number;
  readonly sanitize: number;
  readonly validate: number;
  readonly transform: number;
  readonly overhead?: number;
}

export interface PipelineMetrics {
  readonly timings: PipelineMetricsTimings;
  readonly percentages?: PipelineMetricsPercentages;
  readonly totalMs: number;
  readonly isSlow: boolean;
  readonly parseTime: string;
  readonly sanitizeTime: string;
  readonly validateTime: string;
  readonly transformTime: string;
  readonly totalTime: string;
  readonly efficiency: string;
  readonly rowCount: number;
  readonly overheadMs?: number;
}

export const SLOW_THRESHOLD_MS = 2000;

function formatMs(ms: number): string {
  if (ms < 0.01 && ms >= 0) return '0.00ms';
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  return `${ms.toFixed(2)}ms`;
}

export function buildPipelineMetrics(
  timings: PipelineMetricsTimings,
  rowCount: number,
  overheadMs?: number,
): PipelineMetrics {
  const totalMs =
    timings.parse + timings.sanitize + timings.validate + timings.transform;
  const isSlow = totalMs > SLOW_THRESHOLD_MS;
  const efficiencyMsPerRow = rowCount > 0 ? totalMs / rowCount : 0;
  const efficiency = `${efficiencyMsPerRow.toFixed(4)}ms/row`;

  let percentages: PipelineMetricsPercentages | undefined;
  if (totalMs > 0) {
    const overhead = overheadMs ?? 0;
    const totalWithOverhead = totalMs + overhead;
    percentages = {
      parse: (timings.parse / totalWithOverhead) * 100,
      sanitize: (timings.sanitize / totalWithOverhead) * 100,
      validate: (timings.validate / totalWithOverhead) * 100,
      transform: (timings.transform / totalWithOverhead) * 100,
      overhead: totalWithOverhead > 0 ? (overhead / totalWithOverhead) * 100 : 0,
    };
  }

  return {
    timings: { ...timings },
    percentages,
    totalMs,
    isSlow,
    parseTime: formatMs(timings.parse),
    sanitizeTime: formatMs(timings.sanitize),
    validateTime: formatMs(timings.validate),
    transformTime: formatMs(timings.transform),
    totalTime: formatMs(totalMs),
    efficiency,
    rowCount,
    ...(overheadMs !== undefined && overheadMs >= 0 ? { overheadMs } : {}),
  };
}
