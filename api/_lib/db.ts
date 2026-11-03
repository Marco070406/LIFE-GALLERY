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
      await sql`
        CREATE TABLE IF NOT EXISTS code_failures (
          id     BIGSERIAL PRIMARY KEY,
          ip     TEXT        NOT NULL,
          scope  TEXT        NOT NULL,
          at     TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS code_failures_lookup_idx ON code_failures (ip, scope, at)`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
  return client;
}

/** Compare un code saisi à une variable d'environnement, sans fuite de timing. */
function matchesSecret(input: unknown, expected: string | undefined): boolean {
  if (!expected || typeof input !== 'string') return false;
  const a = createHash('sha256').update(input.trim()).digest();
  const b = createHash('sha256').update(expected.trim()).digest();
  return timingSafeEqual(a, b);
}

// Limite d'essais : au-delà de MAX_FAILURES codes faux en WINDOW_MINUTES, l'adresse IP est bloquée.
const MAX_FAILURES = 10;
const WINDOW_MINUTES = 15;

const CODES = {
  family: {
    env: 'FAMILY_CODE',
    notConfigured: "L'envoi de photos n'est pas encore configuré.",
    wrong: 'Code famille incorrect.',
  },
  admin: {
    env: 'ADMIN_CODE',
    notConfigured: "La suppression n'est pas encore configurée.",
    wrong: 'Code administrateur incorrect.',
  },
} as const;

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'local';
}

/**
 * Vérifie le code famille ou administrateur, avec une limite d'essais par adresse IP.
 * Lève une HttpError (503 non configuré, 429 trop d'essais, 401 code faux).
 */
export async function verifyCode(request: Request, scope: keyof typeof CODES, input: unknown) {
  const { env, notConfigured, wrong } = CODES[scope];
  const expected = process.env[env];
  if (!expected) throw new HttpError(503, notConfigured);

  const sql = await db();
  const ip = clientIp(request);
  const [{ failures }] = (await sql`
    SELECT count(*)::int AS failures FROM code_failures
    WHERE ip = ${ip} AND scope = ${scope} AND at > now() - make_interval(mins => ${WINDOW_MINUTES})`) as { failures: number }[];
  if (failures >= MAX_FAILURES) {
    throw new HttpError(429, `Trop de codes incorrects. Réessayez dans ${WINDOW_MINUTES} minutes.`);
  }

  if (!matchesSecret(input, expected)) {
    await sql`INSERT INTO code_failures (ip, scope) VALUES (${ip}, ${scope})`;
    await sql`DELETE FROM code_failures WHERE at < now() - interval '1 day'`;
    throw new HttpError(401, wrong);
  }
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
