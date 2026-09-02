import { defineEventHandler, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const healthUrl = String(config.public?.agentHealthUrl || 'http://127.0.0.1:6543/health')
  const started = Date.now()

  try {
    const payload: any = await $fetch(healthUrl, {
      method: 'GET',
      timeout: 2500
    })

    const elapsedMs = Date.now() - started
    const online = payload?.status === 'ok' || payload?.ok === true

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        online,
        healthUrl,
        elapsedMs
      }
    }
  } catch (error: any) {
    const elapsedMs = Date.now() - started
    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        online: false,
        healthUrl,
        elapsedMs,
        reason: error?.message || 'Agent service unavailable'
      }
    }
  }
})
