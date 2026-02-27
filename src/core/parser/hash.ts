import { sha256 } from 'js-sha256';

const CHUNK_SIZE = 256 * 1024;

export async function streamHashHex(blob: Blob): Promise<string> {
  const hasher = sha256.create();
  let offset = 0;
  while (offset < blob.size) {
    const chunk = blob.slice(offset, offset + CHUNK_SIZE);
    const buffer = await chunk.arrayBuffer();
    hasher.update(new Uint8Array(buffer));
    offset += CHUNK_SIZE;
  }
  return hasher.hex();
}
