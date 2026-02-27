import { describe, it, expect } from 'vitest';
import {
  buildPipelineMetrics,
  SLOW_THRESHOLD_MS,
  type PipelineMetricsTimings,
} from './metrics.js';

describe('buildPipelineMetrics', () => {
  const timings: PipelineMetricsTimings = {
    parse: 10,
    sanitize: 20,
    validate: 100,
    transform: 70,
  };

  it('should return PipelineMetrics with timings, totalMs, isSlow, efficiency, rowCount', () => {
    const m = buildPipelineMetrics(timings, 1000);
    expect(m.timings).toEqual(timings);
    expect(m.totalMs).toBe(200);
    expect(m.rowCount).toBe(1000);
    expect(m.efficiency).toBe('0.2000ms/row');
    expect(m.isSlow).toBe(false);
  });

  it('should set isSlow when totalMs exceeds SLOW_THRESHOLD_MS', () => {
    const slow = buildPipelineMetrics(
      { parse: 0, sanitize: 0, validate: 2500, transform: 0 },
      100,
    );
    expect(slow.isSlow).toBe(true);
    expect(slow.totalMs).toBeGreaterThan(SLOW_THRESHOLD_MS);
  });

  it('should include percentages when totalMs > 0', () => {
    const m = buildPipelineMetrics(timings, 100);
    expect(m.percentages).toBeDefined();
    const sum =
      (m.percentages!.parse +
        m.percentages!.sanitize +
        m.percentages!.validate +
        m.percentages!.transform) |
      0;
    expect(sum).toBeGreaterThan(0);
  });

  it('should format time strings', () => {
    const m = buildPipelineMetrics(timings, 10);
    expect(m.parseTime).toMatch(/\d+\.\d+ms/);
    expect(m.totalTime).toMatch(/\d+\.\d+ms/);
  });

  it('should handle zero rowCount for efficiency', () => {
    const m = buildPipelineMetrics(timings, 0);
    expect(m.efficiency).toBe('0.0000ms/row');
  });
});
