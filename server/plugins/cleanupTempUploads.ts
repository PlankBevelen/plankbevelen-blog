import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getTempUploadsDir } from '../utils/uploads'

function readEnvInt(name: string, fallback: number) {
  const raw = (process.env[name] || '').trim()
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export default defineNitroPlugin(async (nuxtApp) => {
  const ttlHours = readEnvInt('TEMP_UPLOAD_TTL_HOURS', 48)
  const intervalMinutes = readEnvInt('TEMP_CLEAN_INTERVAL_MINUTES', 60)
  const ttlMs = ttlHours * 60 * 60 * 1000

  let timer: NodeJS.Timeout | null = null
  let running = false

  const cleanup = async () => {
    if (running) return
    running = true
    try {
      const base = getTempUploadsDir()
      const now = Date.now()

      let entries: any[] = []
      try {
        entries = await fs.readdir(base, { withFileTypes: true })
      } catch (e: any) {
        if (e?.code === 'ENOENT') return
        throw e
      }

      for (const ent of entries) {
        if (!ent?.isDirectory?.()) continue
        const full = path.join(base, ent.name)
        try {
          const st = await fs.stat(full)
          const age = now - st.mtimeMs
          if (age > ttlMs) {
            await fs.rm(full, { recursive: true, force: true })
          }
        } catch (e: any) {
          if (e?.code === 'ENOENT') continue
          console.error('temp uploads cleanup error:', e?.message || e)
        }
      }
    } catch (e: any) {
      console.error('temp uploads cleanup failure:', e?.message || e)
    } finally {
      running = false
    }
  }

  await cleanup()
  timer = setInterval(cleanup, intervalMinutes * 60 * 1000)

  nuxtApp.hooks.hook('close', async () => {
    if (timer) { clearInterval(timer); timer = null }
  })
})

