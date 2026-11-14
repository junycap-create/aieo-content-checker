import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_PATH = '/api/gemini';

/**
 * Serves the same serverless handler (`api/gemini.ts`) during `npm run dev`, so
 * the frontend can call `/api/gemini` locally without the Vercel CLI and without
 * any key reaching the browser bundle.
 */
const localApiPlugin = (env: Record<string, string>): Plugin => ({
  name: 'local-api-gemini',
  apply: 'serve',
  configureServer(server) {
    if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
    }
    server.middlewares.use(API_PATH, async (req, res, next) => {
      const method = (req.method ?? 'GET').toUpperCase();
      if (method !== 'GET' && method !== 'POST' && method !== 'OPTIONS') {
        next();
        return;
      }
      try {
        const module = await server.ssrLoadModule('/api/gemini.ts');
        const handler = module.default as (req: unknown, res: unknown) => Promise<void>;
        await handler(req, res);
      } catch (error) {
        console.error('[local-api] handler failed:', error);
        if (!res.writableEnded) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: { code: 'INTERNAL', message: 'Local API handler failed.' } }));
        }
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
