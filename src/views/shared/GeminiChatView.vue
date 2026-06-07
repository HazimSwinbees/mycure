<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const audience = computed(() => route.meta.chatAudience || 'patient')
const audienceClass = computed(() => (audience.value === 'doctor' ? 'is-doctor' : 'is-patient'))
const pageTitle = computed(() =>
  audience.value === 'doctor' ? 'Gemini Doctor Assistant' : 'Gemini Health Assistant',
)
const pageDescription = computed(() =>
  audience.value === 'doctor'
    ? 'Ask Gemini for clinic workflow help, patient communication drafts, and general medical information summaries.'
    : 'Ask Gemini general health questions, appointment preparation questions, or clinic-related questions.',
)
const assistantLabel = computed(() =>
  audience.value === 'doctor' ? 'Gemini clinical helper' : 'Gemini health helper',
)
const helperNote = computed(() =>
  audience.value === 'doctor'
    ? 'Use this space for drafting, summarising, and clinic workflow support. Review clinical advice before acting on it.'
    : 'Use this space for general health guidance and appointment preparation. It does not replace a doctor consultation.',
)

const starterPrompts = computed(() =>
  audience.value === 'doctor'
    ? [
        'Summarize what I should check before confirming an appointment.',
        'Draft a polite message to a patient whose appointment needs rescheduling.',
        'List follow-up questions for a patient with recurring headaches.',
      ]
    : [
        'What should I prepare before my clinic appointment?',
        'Explain a blood pressure reading in simple terms.',
        'What details should I include when describing symptoms?',
      ],
)

const form = reactive({
  prompt: '',
})

const messages = ref([
  {
    role: 'assistant',
    content:
      audience.value === 'doctor'
        ? 'Hello doctor. Ask about clinic workflow, patient communication, or general medical information.'
        : 'Hello. Ask about clinic preparation, general health information, or how to describe your symptoms clearly.',
  },
])

const isSubmitting = ref(false)
const errorMessage = ref('')

const parseGeminiResponse = async (response) => {
  const rawBody = await response.text()
  const contentType = response.headers.get('content-type') || ''

  if (!rawBody.trim()) {
    throw new Error(
      'The Gemini chat service did not return a response. Start the app with Vercel dev or test it on Vercel.',
    )
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      'The Gemini chat service is not available in local Vite mode. Start the app with Vercel dev or test it on Vercel.',
    )
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new Error(
      'The Gemini chat service returned an invalid response. Start the app with Vercel dev or test it on Vercel.',
    )
  }
}

const submitPrompt = async (promptText) => {
  const content = String(promptText || '').trim()

  if (!content || isSubmitting.value) {
    return
  }

  errorMessage.value = ''
  messages.value.push({
    role: 'user',
    content,
  })
  form.prompt = ''
  isSubmitting.value = true

  try {
    const response = await fetch('/api/gemini-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audience: audience.value,
        messages: messages.value,
      }),
    })

    const payload = await parseGeminiResponse(response)

    if (!response.ok) {
      throw new Error(payload?.error || 'Unable to get a response from Gemini.')
    }

    messages.value.push({
      role: 'assistant',
      content: payload.reply,
    })
  } catch (error) {
    errorMessage.value = error.message || 'Unable to get a response from Gemini.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  await submitPrompt(form.prompt)
}
</script>

<template>
  <section :class="['chat-page', audienceClass]">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Gemini chat</p>
        <h1>{{ pageTitle }}</h1>
        <p class="muted-copy">{{ pageDescription }}</p>
      </div>

      <div class="hero-meta">
        <span class="hero-chip">{{ assistantLabel }}</span>
        <p>{{ helperNote }}</p>
      </div>
    </section>

    <div class="chat-layout">
      <aside class="panel starter-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Quick start</p>
            <h2>Suggested prompts</h2>
          </div>
        </div>

        <div class="starter-grid">
          <button
            v-for="prompt in starterPrompts"
            :key="prompt"
            class="starter-button"
            type="button"
            @click="submitPrompt(prompt)"
          >
            <span class="starter-label">Prompt</span>
            <strong>{{ prompt }}</strong>
          </button>
        </div>
      </aside>

      <section class="panel chat-panel">
        <div class="chat-head">
          <div>
            <p class="section-label">Conversation</p>
            <h2>Chat with Gemini</h2>
          </div>
          <span class="conversation-chip">{{ messages.length }} messages</span>
        </div>

        <div class="message-list" aria-live="polite">
          <article
            v-for="(message, index) in messages"
            :key="`${message.role}-${index}`"
            :class="['message-row', message.role]"
          >
            <span class="message-avatar">{{ message.role === 'assistant' ? 'G' : 'You' }}</span>
            <div class="message-card">
              <span class="message-role">{{ message.role === 'assistant' ? 'Gemini' : 'You' }}</span>
              <p>{{ message.content }}</p>
            </div>
          </article>
        </div>

        <p v-if="errorMessage" class="feedback error-text" role="alert">{{ errorMessage }}</p>

        <form class="composer" @submit.prevent="handleSubmit">
          <label class="composer-field">
            <span>Your message</span>
            <textarea
              v-model="form.prompt"
              rows="4"
              placeholder="Type your question here..."
              :disabled="isSubmitting"
            />
          </label>

          <div class="composer-actions">
            <p class="composer-note">{{ helperNote }}</p>
            <button
              class="primary-action"
              type="submit"
              :disabled="isSubmitting || !form.prompt.trim()"
            >
              {{ isSubmitting ? 'Sending...' : 'Send message' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.chat-page,
.chat-layout,
.starter-grid,
.message-list,
.composer,
.composer-field {
  display: grid;
  gap: 1rem;
}

.chat-page {
  --chat-surface: #ffffff;
  --chat-surface-soft: #f7fbff;
  --chat-line: #d8e4f5;
  --chat-primary: #3157b7;
  --chat-primary-soft: #e8f0ff;
  --chat-text: #14213d;
  --chat-muted: #607086;
  --chat-shadow: 0 18px 40px rgba(20, 33, 61, 0.08);
}

.chat-page.is-doctor {
  --chat-surface: #ffffff;
  --chat-surface-soft: #f5fbfb;
  --chat-line: #d5e7e3;
  --chat-primary: #1e6c67;
  --chat-primary-soft: #e2f3f1;
  --chat-text: #163330;
  --chat-muted: #5d7472;
  --chat-shadow: 0 18px 40px rgba(22, 51, 48, 0.08);
}

.hero-panel,
.panel,
.starter-button,
.message-card {
  border: 1px solid var(--chat-line);
  border-radius: 18px;
  background: var(--chat-surface);
  box-shadow: var(--chat-shadow);
}

.hero-panel,
.panel {
  padding: 1.25rem 1.35rem;
}

.hero-panel {
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  align-items: end;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--chat-primary) 16%, transparent), transparent 14rem),
    linear-gradient(180deg, var(--chat-surface) 0%, var(--chat-surface-soft) 100%);
}

.hero-copy,
.hero-meta {
  display: grid;
  gap: 0.5rem;
}

.section-label {
  color: var(--chat-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.chat-head h2 {
  color: var(--chat-text);
  font-weight: 700;
  margin: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.message-role,
.composer-field span,
.hero-meta p,
.composer-note,
.starter-label {
  color: var(--chat-muted);
}

.muted-copy,
.hero-meta p,
.composer-note {
  margin: 0;
  line-height: 1.6;
}

.hero-chip,
.conversation-chip {
  display: inline-flex;
  width: max-content;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border: 1px solid color-mix(in srgb, var(--chat-primary) 20%, white);
  border-radius: 999px;
  background: var(--chat-primary-soft);
  color: var(--chat-primary);
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.3rem 0.8rem;
}

.panel-head,
.chat-head,
.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.chat-layout {
  align-items: start;
}

.starter-grid {
  grid-template-columns: 1fr;
}

.starter-button {
  display: grid;
  gap: 0.35rem;
  color: var(--chat-text);
  font: inherit;
  font-weight: 600;
  padding: 1rem 1.05rem;
  text-align: left;
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.starter-button:hover {
  border-color: color-mix(in srgb, var(--chat-primary) 30%, white);
  box-shadow: 0 16px 28px color-mix(in srgb, var(--chat-primary) 12%, transparent);
  transform: translateY(-1px);
}

.starter-button strong {
  color: var(--chat-text);
  line-height: 1.55;
}

.chat-panel {
  display: grid;
  gap: 1rem;
  background:
    linear-gradient(180deg, var(--chat-surface) 0%, var(--chat-surface-soft) 100%);
}

.message-list {
  max-height: 560px;
  overflow-y: auto;
  padding-right: 0.25rem;
  padding-block: 0.15rem;
}

.message-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.message-row.user {
  grid-template-columns: minmax(0, 1fr) auto;
}

.message-row.user .message-avatar {
  order: 2;
}

.message-row.user .message-card {
  order: 1;
  background: var(--chat-primary-soft);
  border-color: color-mix(in srgb, var(--chat-primary) 24%, white);
}

.message-avatar {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border-radius: 50%;
  background: var(--chat-primary-soft);
  color: var(--chat-primary);
  font-size: 0.78rem;
  font-weight: 800;
}

.message-card {
  display: grid;
  gap: 0.45rem;
  padding: 1rem 1.05rem;
}

.message-role {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.message-card p {
  color: var(--chat-text);
  line-height: 1.65;
  white-space: pre-wrap;
  margin: 0;
}

.composer-field textarea {
  width: 100%;
  border: 1px solid var(--chat-line);
  border-radius: 12px;
  background: #ffffff;
  color: var(--chat-text);
  font: inherit;
  padding: 0.85rem 0.95rem;
  resize: vertical;
}

.composer-field textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--chat-primary) 52%, white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chat-primary) 14%, transparent);
}

.composer-actions {
  align-items: end;
}

.composer-note {
  flex: 1 1 auto;
  font-size: 0.88rem;
}

.feedback {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.error-text {
  color: #b91c1c;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid var(--chat-primary);
  border-radius: 12px;
  background: var(--chat-primary);
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  white-space: nowrap;
}

.primary-action:disabled,
.starter-button:disabled {
  opacity: 0.7;
}

@media (min-width: 1080px) {
  .chat-layout {
    grid-template-columns: minmax(280px, 0.68fr) minmax(0, 1.32fr);
  }
}

@media (max-width: 900px) {
  .hero-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .message-row,
  .message-row.user {
    grid-template-columns: 1fr;
  }

  .message-row.user .message-avatar,
  .message-row.user .message-card {
    order: initial;
  }

  .composer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-action {
    width: 100%;
  }
}
</style>
