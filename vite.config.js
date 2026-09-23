import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Serves the Vercel functions in /api during `npm run dev`.
function devApi() {
  return {
    name: 'tugasku-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/assistant', async (req, res) => {
        const file = path.resolve(__dirname, 'api/assistant.js')
        try {
          // mtime query = fresh module after each edit without restarting Vite
          const mod = await import(`${pathToFileURL(file).href}?v=${fs.statSync(file).mtimeMs}`)
          await mod.default(req, res)
        } catch (err) {
          server.config.logger.error(err?.stack || String(err))
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Dev API error' }))
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Server-only secrets (ANTHROPIC_API_KEY) are read from .env by the dev API
  const env = loadEnv(mode, __dirname, '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [react(), devApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
