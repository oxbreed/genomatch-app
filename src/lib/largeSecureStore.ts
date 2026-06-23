import * as SecureStore from 'expo-secure-store';

/** SecureStore value limit on iOS — chunk larger auth sessions. */
const CHUNK_SIZE = 2000;

function chunkKey(key: string, index: number): string {
  return `${key}_${index}`;
}

function metaKey(key: string): string {
  return `${key}_meta`;
}

async function clearChunks(key: string, chunkCount: number): Promise<void> {
  const tasks: Promise<void>[] = [];
  for (let i = 0; i < chunkCount; i++) {
    tasks.push(SecureStore.deleteItemAsync(chunkKey(key, i)));
  }
  tasks.push(SecureStore.deleteItemAsync(metaKey(key)));
  await Promise.all(tasks);
}

export async function getLargeSecureItem(key: string): Promise<string | null> {
  const meta = await SecureStore.getItemAsync(metaKey(key));
  if (!meta) {
    return SecureStore.getItemAsync(key);
  }

  const chunkCount = Number(meta);
  if (!Number.isFinite(chunkCount) || chunkCount <= 0) {
    return null;
  }

  const parts: string[] = [];
  for (let i = 0; i < chunkCount; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i));
    if (part == null) {
      return null;
    }
    parts.push(part);
  }

  return parts.join('');
}

export async function setLargeSecureItem(key: string, value: string): Promise<void> {
  const existingMeta = await SecureStore.getItemAsync(metaKey(key));
  const existingChunks = existingMeta ? Number(existingMeta) : 0;
  if (Number.isFinite(existingChunks) && existingChunks > 0) {
    await clearChunks(key, existingChunks);
  }

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
  await SecureStore.setItemAsync(metaKey(key), String(chunkCount));
  for (let i = 0; i < chunkCount; i++) {
    const part = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    await SecureStore.setItemAsync(chunkKey(key, i), part);
  }
  await SecureStore.deleteItemAsync(key);
}

export async function deleteLargeSecureItem(key: string): Promise<void> {
  const meta = await SecureStore.getItemAsync(metaKey(key));
  const chunkCount = meta ? Number(meta) : 0;
  if (Number.isFinite(chunkCount) && chunkCount > 0) {
    await clearChunks(key, chunkCount);
  }
  await SecureStore.deleteItemAsync(key);
}
