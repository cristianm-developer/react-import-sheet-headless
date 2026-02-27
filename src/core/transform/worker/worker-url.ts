export function getTransformWorkerUrl(): string {
  return new URL('./transform.worker.js', import.meta.url).href;
}
