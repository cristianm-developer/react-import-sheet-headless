export function getValidatorWorkerUrl(): string {
  return new URL('./validator.worker.js', import.meta.url).href;
}
