<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const audience = computed(() => route.meta.chatAudience || 'patient')
const pageTitle = computed(() => (audience.value === 'doctor' ? 'Gemini Doctor Assistant' : 'Gemini Health Assistant'))
const pageDescription = computed(() =>
  audience.value === 'doctor'
    ? 'Ask Gemini for clinic workflow help, patient communication drafts, and general medical information summaries.'
    : 'Ask Gemini general health questions, appointment preparation questions, or clinic-related questions.'
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
    throw new Error('The Gemini chat service did not return a response. Start the app with Vercel dev or test it on Vercel.')
  }

  if (!contentType.includes('application/json')) {
    throw new Error('The Gemini chat service is not available in local Vite mode. Start the app with Vercel dev or test it on Vercel.')
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new Error('The Gemini chat service returned an invalid response. Start the app with Vercel dev or test it on Vercel.')
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
  <section class="chat-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Gemini chat</p>
        <h1>{{ pageTitle }}</h1>
        <p class="muted-copy">{{ pageDescription }}</p>
      </div>
    </section>

    <section class="panel starter-panel">
      <div class="panel-head">
        <div>
          <p class="section-label">Quick start</p>
          <h2>Try one of these</h2>
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
          {{ prompt }}
        </button>
      </div>
    </section>

    <section class="panel chat-panel">
      <div class="panel-head">
        <div>
          <p class="section-label">Conversation</p>
          <h2>Chat with Gemini</h2>
        </div>
      </div>

      <div class="message-list" aria-live="polite">
        <article
          v-for="(message, index) in messages"
          :key="`${message.role}-${index}`"
          :class="['message-card', message.role]"
        >
          <span class="message-role">{{ message.role === 'assistant' ? 'Gemini' : 'You' }}</span>
          <p>{{ message.content }}</p>
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
          <button class="primary-action" type="submit" :disabled="isSubmitting || !form.prompt.trim()">
            {{ isSubmitting ? 'Sending...' : 'Send message' }}
          </button>
        </div>
      </form>
    </section>
  </section>
</template>

<style scoped>
.chat-page,
.starter-grid,
.message-list {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.starter-button,
.message-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.panel {
  padding: 1.25rem;
}

.hero-copy,
.composer,
.composer-field {
  display: grid;
  gap: 0.5rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.message-role,
.composer-field span {
  color: #6b7280;
}

.panel-head,
.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.starter-grid {
  grid-template-columns: repeat(1, minmax(0, 1fr));
  margin-top: 0.9rem;
}

.starter-button {
  color: #111827;
  font: inherit;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.starter-button:hover {
  border-color: #cbd5e1;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.chat-panel {
  display: grid;
  gap: 1rem;
}

.message-list {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.message-card {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
}

.message-card.assistant {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.message-card.user {
  border-color: #d7e3fb;
  background: #f5f8ff;
}

.message-role {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.message-card p {
  color: #111827;
  line-height: 1.65;
  white-space: pre-wrap;
}

.composer-field textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  background: #ffffff;
  color: #111827;
  font: inherit;
  padding: 0.85rem 0.95rem;
  resize: vertical;
}

.composer-field textarea:focus {
  outline: none;
  border-color: #9db3ff;
  box-shadow: 0 0 0 3px rgba(91, 97, 255, 0.12);
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
  border: 1px solid #3157b7;
  border-radius: 12px;
  background: #3157b7;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.primary-action:disabled,
.starter-button:disabled {
  opacity: 0.7;
}

@media (min-width: 900px) {
  .starter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
