import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { createHash, timingSafeEqual } from 'node:crypto';

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<unknown> | null = null;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Client Neon, créé à la demande. La table est créée au premier appel si besoin. */
export async function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new HttpError(503, "La base de données n'est pas encore configurée.");
  if (!client) client = neon(url);
  if (!schemaReady) {
    const sql = client;
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS memories (
          id          BIGSERIAL PRIMARY KEY,
          chapter_id  TEXT        NOT NULL,
          author      TEXT        NOT NULL,
          message     TEXT        NOT NULL DEFAULT '',
          image       BYTEA       NOT NULL,
          image_type  TEXT        NOT NULL,
          width       INTEGER,
          height      INTEGER,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS memories_chapter_idx ON memories (chapter_id, created_at DESC)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
  return client;
}

/** Compare le code saisi au code famille sans fuite de timing. */
export function isFamilyCode(input: unknown): boolean {
  const expected = process.env.FAMILY_CODE;
  if (!expected || typeof input !== 'string') return false;
  const a = createHash('sha256').update(input.trim()).digest();
  const b = createHash('sha256').update(expected.trim()).digest();
  return timingSafeEqual(a, b);
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...init.headers },
  });
}

export function handleError(err: unknown) {
  if (err instanceof HttpError) return json({ error: err.message }, { status: err.status });
  console.error(err);
  return json({ error: 'Une erreur est survenue. Réessayez dans un instant.' }, { status: 500 });
}
