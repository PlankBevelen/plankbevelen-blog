import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const chatUrl = String(config.public?.agentChatUrl || 'http://127.0.0.1:6543/chat')
  const body = await readBody<{ message?: string; sessionId?: string; stream?: boolean }>(event)
  const message = String(body?.message || '').trim()
  const sessionId = String(body?.sessionId || '').trim()
  const stream = Boolean(body?.stream)

  if (!message) {
    setResponseStatus(event, 400)
    return {
      status: 400,
      msg: 'message is required',
      data: null
    }
  }

  if (!sessionId) {
    setResponseStatus(event, 400)
    return {
      status: 400,
      msg: 'sessionId is required',
      data: null
    }
  }

  if (stream) {
    try {
      const upstream = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'X-Session-Id': sessionId
        },
        body: JSON.stringify({ message, stream: true }),
        signal: AbortSignal.timeout(45000)
      })

      if (!upstream.ok || !upstream.body) {
        const errorText = await upstream.text().catch(() => '')
        setResponseStatus(event, upstream.status || 502)
        return {
          status: upstream.status || 502,
          msg: errorText || 'Agent stream request failed',
          data: null
        }
      }

      return new Response(upstream.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no'
        }
      })
    } catch (error: any) {
      const statusCode = Number(error?.statusCode || error?.response?.status || 500)
      setResponseStatus(event, statusCode)
      return {
        status: statusCode,
        msg: error?.data?.message || error?.message || 'Agent stream request failed',
        data: null
      }
    }
  }

  try {
    const payload: any = await $fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: { message },
      timeout: 45000
    })

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        answer: String(payload?.answer || ''),
        elapsedMs: Number(payload?.elapsed_ms || 0),
        sessionId: String(payload?.session_id || sessionId)
      }
    }
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.response?.status || 500)
    setResponseStatus(event, statusCode)
    return {
      status: statusCode,
      msg: error?.data?.message || error?.message || 'Agent request failed',
      data: null
    }
  }
})
