import http from '~/utils/http'
import type { AgentChatRequest } from '@/types/request/agent'
import type { AgentHealthData } from '@/types/response/agent'

class AgentService {
  getHealth() {
    return http.get<AgentHealthData>('/agent/health')
  }

  async streamChat(
    payload: AgentChatRequest,
    handlers: {
      onDelta: (chunk: string) => void
      onError: (message: string) => void
      onDone: () => void
    }
  ): Promise<void> {
    const runtimeConfig = useRuntimeConfig()
    const appBase = String(runtimeConfig.app.baseURL || '/')
    const chatApiUrl = `${appBase.replace(/\/$/, '')}/api/agent/chat`

    const response = await fetch(chatApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ ...payload, stream: true }),
    })

    if (!response.ok || !response.body) {
      let detail = ''
      try {
        detail = await response.text()
      } catch {
        detail = ''
      }
      throw new Error(detail || `HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const parseSseBuffer = (chunkBuffer: string): string => {
      const normalized = chunkBuffer.replace(/\r\n/g, '\n')
      const parts = normalized.split('\n\n')
      const rest = parts.pop() || ''

      for (const part of parts) {
        const lines = part.split('\n')
        let eventName = ''
        const dataLines: string[] = []

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trim())
          }
        }

        if (!eventName || dataLines.length === 0) continue

        const rawData = dataLines.join('\n')
        let parsed: { text?: string; message?: string } | null = null
        try {
          parsed = JSON.parse(rawData) as { text?: string; message?: string }
        } catch {
          continue
        }

        if (eventName === 'delta') {
          const text = String(parsed?.text || '')
          if (text) handlers.onDelta(text)
        } else if (eventName === 'error') {
          handlers.onError(String(parsed?.message || '流式响应出错'))
        } else if (eventName === 'done') {
          handlers.onDone()
        }
      }

      return rest
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer = parseSseBuffer(buffer + decoder.decode(value, { stream: true }))
    }
    if (buffer) parseSseBuffer(`${buffer}\n\n`)
  }
}

export default new AgentService()
