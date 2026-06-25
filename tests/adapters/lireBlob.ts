/** Helper compatible jsdom (Blob.text() pas garanti dans toutes les versions). */
export async function lireBlobTexte(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  return new TextDecoder('utf-8').decode(buf);
}
