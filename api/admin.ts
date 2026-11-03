import { assertAdminCode, handleError, HttpError, json } from './_lib/db.js';

// POST /api/admin — { adminCode } : vérifie le code avant d'activer le mode administrateur
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => {
      throw new HttpError(400, 'Requête invalide.');
    });
    assertAdminCode(body.adminCode);
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
