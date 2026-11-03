export interface Memory {
  id: string;
  chapterId: string;
  author: string;
  message: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  src: string;
}

export interface NewMemory {
  chapterId: string;
  author: string;
  message: string;
  code: string;
  photo: File;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

async function readError(res: Response): Promise<string> {
  if (res.status === 413) return 'Photo trop lourde. Essayez une photo plus petite.';
  try {
    const data = await res.json();
    if (typeof data?.error === 'string') return data.error;
  } catch { /* réponse non JSON */ }
  return 'Le serveur ne répond pas. Réessayez dans un instant.';
}

export async function fetchMemories(chapterId: string, signal?: AbortSignal): Promise<Memory[]> {
  const res = await fetch(`/api/memories?chapter=${encodeURIComponent(chapterId)}`, { signal });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.memories as Memory[];
}

/** Redimensionne la photo (1600 px max) et la convertit en JPEG pour un envoi léger. */
export async function preparePhoto(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error("Ce format de photo n'est pas pris en charge. Essayez une photo JPEG ou PNG.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible de préparer la photo sur cet appareil.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return { dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY), width, height };
}

/** Vérifie le code administrateur ; lève une erreur avec le message du serveur sinon. */
export async function verifyAdminCode(adminCode: string): Promise<void> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminCode }),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function deleteMemory(id: string, adminCode: string): Promise<void> {
  const res = await fetch('/api/memories', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, adminCode }),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function createMemory(input: NewMemory): Promise<Memory> {
  const { dataUrl, width, height } = await preparePhoto(input.photo);
  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chapterId: input.chapterId,
      author: input.author,
      message: input.message,
      code: input.code,
      image: dataUrl,
      width,
      height,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data.memory as Memory;
}
