export function getParserWorkerUrl(): string {
  return new URL('./parser.worker.js', import.meta.url).href;
}
