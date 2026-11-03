import { chapters } from '../src/lib/chapters.js';
import { db, handleError, HttpError, json, verifyCode } from './_lib/db.js';

const MAX_AUTHOR = 60;
const MAX_MESSAGE = 1000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
/** Type réel de l'image d'après ses premiers octets (on ne se fie pas au type annoncé). */
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

interface MemoryRow {
  id: string;
  chapter_id: string;
  author: string;
  message: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

function toMemory(row: MemoryRow) {
  return {
    id: String(row.id),
    chapterId: row.chapter_id,
    author: row.author,
    message: row.message,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    src: `/api/photo?id=${row.id}`,
  };
}

function assertChapter(id: unknown): string {
  if (typeof id !== 'string' || !chapters.some((c) => c.id === id)) {
    throw new HttpError(400, 'Chapitre inconnu.');
  }
  return id;
}

// GET /api/memories?chapter=baby — souvenirs d'un chapitre, du plus récent au plus ancien
export async function GET(request: Request) {
  try {
    const chapterId = assertChapter(new URL(request.url).searchParams.get('chapter'));
    const sql = await db();
    const rows = (await sql`
      SELECT id, chapter_id, author, message, width, height, created_at
      FROM memories
      WHERE chapter_id = ${chapterId}
      ORDER BY created_at DESC
      LIMIT 200`) as MemoryRow[];
    return json({ memories: rows.map(toMemory) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/memories — { chapterId, author, message, image: "data:image/jpeg;base64,...", width, height, code }
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new HttpError(400, 'Requête invalide.');
    });

    await verifyCode(request, 'family', body.code);

    const chapterId = assertChapter(body.chapterId);
    const author = typeof body.author === 'string' ? body.author.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!author) throw new HttpError(400, 'Indiquez votre prénom.');
    if (author.length > MAX_AUTHOR) throw new HttpError(400, `Prénom trop long (${MAX_AUTHOR} caractères max).`);
    if (message.length > MAX_MESSAGE) throw new HttpError(400, `Message trop long (${MAX_MESSAGE} caractères max).`);

    const match = typeof body.image === 'string' ? /^data:[\w/+.-]+;base64,(.+)$/.exec(body.image) : null;
    if (!match) throw new HttpError(400, 'Photo invalide (JPEG, PNG ou WebP).');
    const bytes = Buffer.from(match[1], 'base64');
    if (bytes.length === 0) throw new HttpError(400, 'Photo vide.');
    if (bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'Photo trop lourde (3 Mo max).');
    const imageType = sniffImageType(bytes);
    if (!imageType) throw new HttpError(400, 'Photo invalide (JPEG, PNG ou WebP).');

    const width = Number.isInteger(body.width) ? body.width : null;
    const height = Number.isInteger(body.height) ? body.height : null;

    const sql = await db();
    const [row] = (await sql`
      INSERT INTO memories (chapter_id, author, message, image, image_type, width, height)
      VALUES (${chapterId}, ${author}, ${message}, decode(${bytes.toString('hex')}, 'hex'), ${imageType}, ${width}, ${height})
      RETURNING id, chapter_id, author, message, width, height, created_at`) as MemoryRow[];

    return json({ memory: toMemory(row) }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/memories — { id, adminCode } : retire un souvenir (administrateur uniquement)
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new HttpError(400, 'Requête invalide.');
    });

    await verifyCode(request, 'admin', body.adminCode);

    const id = typeof body.id === 'string' || typeof body.id === 'number' ? String(body.id) : '';
    if (!/^\d+$/.test(id)) throw new HttpError(400, 'Identifiant invalide.');

    const sql = await db();
    const deleted = await sql`DELETE FROM memories WHERE id = ${id} RETURNING id`;
    if (deleted.length === 0) throw new HttpError(404, 'Ce souvenir a déjà été supprimé.');

    return json({ deleted: id });
  } catch (err) {
    return handleError(err);
  }
}
