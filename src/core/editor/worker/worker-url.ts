export function getEditWorkerUrl(): string {
  return new URL('./edit.worker.js', import.meta.url).href;
}
