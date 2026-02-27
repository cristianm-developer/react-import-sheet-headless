export function getSanitizerWorkerUrl(): string {
  return new URL('./sanitizer.worker.js', import.meta.url).href;
}
