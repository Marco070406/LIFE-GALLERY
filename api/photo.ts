import { db, handleError, HttpError } from './_lib/db.js';

// GET /api/photo?id=42 — renvoie l'image stockée. Une photo ne change jamais, mais elle peut
// être supprimée : cache limité (1 h sur le CDN, 1 jour dans le navigateur).
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) throw new HttpError(400, 'Identifiant invalide.');

    const sql = await db();
    const [row] = (await sql`
      SELECT encode(image, 'base64') AS data, image_type
      FROM memories WHERE id = ${id}`) as { data: string; image_type: string }[];
    if (!row) throw new HttpError(404, 'Photo introuvable.');

    return new Response(Buffer.from(row.data, 'base64'), {
      headers: {
        'Content-Type': row.image_type,
        'Cache-Control': 'public, max-age=86400, s-maxage=3600',
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
