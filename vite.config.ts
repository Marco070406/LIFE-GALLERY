import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react-swc';

/**
 * En développement, sert les fonctions de `api/` (format Vercel : `export function GET(request)`)
 * directement depuis Vite, pour ne pas avoir besoin de `vercel dev`.
 */
function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const route = /^\/api\/([\w-]+)$/.exec(url.pathname);
        if (!route) return next();

        try {
          const mod = await server.ssrLoadModule(`/api/${route[1]}.ts`);
          const method = req.method ?? 'GET';
          const handler = mod[method] as ((request: Request) => Promise<Response>) | undefined;
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value);
          }

          const response = await handler(new Request(url.href, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
          }));

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Variables serveur (DATABASE_URL, FAMILY_CODE) depuis .env, pour les fonctions api/ en dev.
  // Seules les variables préfixées VITE_ sont exposées au navigateur.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), apiDevServer()],
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
    },
  };
});
