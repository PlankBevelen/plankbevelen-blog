<template>
  <BaseCard type="agent" class="agent-card">
    <template #header>
      AI Agent
    </template>

    <div class="agent-layout">
      <aside class="agent-side">
        <div class="agent-status-row">
          <span class="agent-status-dot" :class="{ online: isOnline, offline: !isOnline }"></span>
          <span class="agent-status-text">{{ isOnline ? '在线' : '离线' }}</span>
          <span class="agent-latency" v-if="healthData?.elapsedMs != null">{{ healthData.elapsedMs }} ms</span>
        </div>

        <p class="agent-desc">
          这里连接 plank-agent 的 Flask 服务，你可以直接提问代码、架构和排错问题。
        </p>

        <div class="agent-examples">
          <p class="examples-title">快速问题</p>
          <button
            v-for="item in examples"
            :key="item"
            type="button"
            class="example-btn"
            @click="useExample(item)"
          >
            {{ item }}
          </button>
        </div>
      </aside>

      <section class="agent-chat">
        <div class="messages" ref="messagesRef">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="message.role"
          >
            <div class="bubble">{{ message.content }}</div>
          </div>

          <div v-if="isTyping" class="message-item assistant">
            <div class="bubble">{{ typingText }}<span class="cursor"></span></div>
          </div>
        </div>

        <div class="input-row">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            resize="none"
            maxlength="1000"
            show-word-limit
            :disabled="sending"
            placeholder="输入你的问题，Ctrl + Enter 发送"
            @keydown.ctrl.enter.prevent="onSend"
          />
          <el-button type="primary" :loading="sending" :disabled="!canSend" @click="onSend">
            发送
          </el-button>
        </div>
      </section>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import agentService from '@/services/agent'
import type { AgentHealthData } from '@/types/response/agent'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const examples = [
  '帮我检查这个报错可能的根因',
  '给一个 Nuxt + Node 项目的目录结构建议',
  '帮我写一个接口重试的工具函数'
]

const inputText = ref('')
const sending = ref(false)
const isTyping = ref(false)
const typingText = ref('')
const messages = ref<ChatMessage[]>([
  {
    id: 'welcome',
    role: 'assistant',
    content: '你好，我是 Plank Agent。你可以直接问我开发问题，我会尽量给到可执行的建议。'
  }
])
const messagesRef = ref<HTMLElement | null>(null)
const sessionId = useState<string>(
  'agent-session-id',
  () => `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
)
const { data } = await useAsyncData('agent-health', async (): Promise<AgentHealthData> => {
  try {
    return await agentService.getHealth()
  } catch {
    return {
      online: false,
      elapsedMs: null,
      healthUrl: '',
    }
  }
})

const healthData = computed(() => data.value || null)
const isOnline = computed(() => Boolean(healthData.value?.online))
const canSend = computed(() => inputText.value.trim().length > 0 && !sending.value)

const scrollToBottom = async () => {
  await nextTick()
  const el = messagesRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const pushMessage = async (role: 'user' | 'assistant', content: string) => {
  messages.value.push({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content
  })
  await scrollToBottom()
}

const useExample = async (text: string) => {
  inputText.value = text
  await onSend()
}

const streamChat = async (content: string) => {
  isTyping.value = true
  typingText.value = ''
  await scrollToBottom()

  let gotDone = false
  let streamError = ''

  await agentService.streamChat(
    {
      message: content,
      sessionId: sessionId.value,
      stream: true,
    },
    {
      onDelta: (chunk) => {
        typingText.value += chunk
        void scrollToBottom()
      },
      onError: (message) => {
        streamError = message
      },
      onDone: () => {
        gotDone = true
      },
    }
  )

  isTyping.value = false

  if (streamError) {
    throw new Error(streamError)
  }

  const answer = typingText.value.trim()
  if (!answer && !gotDone) {
    throw new Error('流式响应为空')
  }

  await pushMessage('assistant', answer || '服务已响应，但没有返回有效内容。请稍后重试。')
  typingText.value = ''
}

const onSend = async () => {
  const content = inputText.value.trim()
  if (!content || sending.value) return

  inputText.value = ''
  sending.value = true
  await pushMessage('user', content)

  try {
    await streamChat(content)
  } catch (error: unknown) {
    isTyping.value = false
    const message = error instanceof Error ? error.message : '接口暂时不可用'
    await pushMessage('assistant', `请求失败：${message}`)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped lang="less">
.agent-card {
  :deep(.card-content) {
    padding: 18px @space-3xl;
  }
}

.agent-layout {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  gap: @space-2xl;
}

.agent-side {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: @space-xl;
  background: color-mix(in srgb, var(--card-color) 86%, #f7fbff);
  display: flex;
  flex-direction: column;
  gap: @space-lg;
}

.agent-status-row {
  display: flex;
  align-items: center;
  gap: @space-md;
  font-size: @font-size-sm;
  color: var(--text-color);
}

.agent-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &.online {
    background: #16a34a;
    box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.16);
  }

  &.offline {
    background: #ef4444;
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.14);
  }
}

.agent-status-text {
  font-weight: 600;
}

.agent-latency {
  margin-left: auto;
  color: var(--tertiary-color);
  font-size: @font-size-xs;
}

.agent-desc {
  margin: 0;
  font-size: @font-size-sm;
  line-height: 1.8;
  color: var(--secondary-color);
}

.agent-examples {
  display: flex;
  flex-direction: column;
  gap: @space-base;
}

.examples-title {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}

.example-btn {
  text-align: left;
  border: 1px solid var(--border-color);
  background: var(--card-color);
  color: var(--text-color);
  border-radius: @base-border-radius;
  padding: @space-base @space-md;
  font-size: @font-size-xs;
  line-height: 1.6;
  cursor: pointer;
  transition: all @transition-fast ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--shallow-active-bg-color);
  }
}

.agent-chat {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: @space-lg;
  background:
    linear-gradient(to right, color-mix(in srgb, var(--primary-color) 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--primary-color) 8%, transparent) 1px, transparent 1px),
    color-mix(in srgb, var(--card-color) 90%, #f9fcff);
  background-size: 26px 26px;
}

.message-item {
  display: flex;
  margin-bottom: @space-md;

  &.user {
    justify-content: flex-end;

    .bubble {
      background: var(--primary-color);
      color: #fff;
    }
  }

  &.assistant {
    justify-content: flex-start;
  }
}

.bubble {
  max-width: min(100%, 680px);
  padding: @space-md @space-lg;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--card-color);
  color: var(--text-color);
  font-size: @font-size-sm;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  display: inline-block;
  width: 6px;
  height: 16px;
  margin-left: @space-2xs;
  vertical-align: middle;
  background: var(--primary-color);
  animation: blink 0.9s infinite;
}

.input-row {
  border-top: 1px solid var(--border-color);
  padding: @space-md;
  display: flex;
  align-items: flex-end;
  gap: @space-md;
  background: var(--card-color);
}

@keyframes blink {
  0%,
  40% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (max-width: @screen-lg) {
  .agent-layout {
    grid-template-columns: 1fr;
  }

  .agent-chat {
    min-height: 360px;
  }
}
</style>
