<script setup>
import { reactive, ref } from 'vue'
import logoUrl from '../../assets/mycure-logo.png'
import { requestPasswordReset } from '../../services/authApi'

const form = reactive({
  email: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.email) {
    errorMessage.value = 'Please enter your email address.'
    return
  }

  isSubmitting.value = true

  try {
    await requestPasswordReset(form.email)
    successMessage.value = 'Reset link sent. Check your email to continue.'
  } catch (error) {
    errorMessage.value = error.message || 'Unable to send reset email right now.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-shell">
    <section class="auth-card">
      <div class="brand-badge">
        <img :src="logoUrl" alt="MyCure" />
      </div>

      <div class="panel-head">
        <h1>Forgot Password</h1>
        <p class="muted-copy">Enter your email and we will send you a reset link</p>
      </div>

      <transition name="fade">
        <div v-if="errorMessage" class="alert alert-error" role="alert">{{ errorMessage }}</div>
      </transition>

      <transition name="fade">
        <div v-if="successMessage" class="alert alert-success" role="status">
          {{ successMessage }}
        </div>
      </transition>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="form-field">
          <span>Email</span>
          <input
            v-model.trim="form.email"
            type="email"
            placeholder="Email"
            autocomplete="email"
            required
          />
        </label>

        <button type="submit" class="primary-action" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <div class="panel-footer">
        <p>
          Remembered your password?
          <RouterLink :to="{ name: 'login' }">Back to login</RouterLink>
        </p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
}

.auth-card {
  width: min(100%, 420px);
  display: grid;
  gap: 1.25rem;
  border: 1px solid #e6ebf5;
  border-radius: 14px;
  background: #ffffff;
  padding: 2rem 1.5rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.brand-badge {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  margin-inline: auto;
  border-radius: 14px;
  background: #f4f8ff;
}

.brand-badge img {
  width: 1.9rem;
  height: 1.9rem;
}

.panel-head {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
  text-align: center;
}

.panel-head h1 {
  margin: 0;
  color: #1f2937;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
}

.muted-copy,
.panel-footer p {
  color: #94a3b8;
  font-size: 0.88rem;
}

.alert {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
}

.alert-error {
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.alert-success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.auth-form {
  display: grid;
  gap: 0.9rem;
}

.form-field {
  display: grid;
  gap: 0.35rem;
}

.form-field span {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.form-field input {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  font: inherit;
  padding: 0.75rem 0.9rem;
}

.form-field input:focus {
  outline: none;
  border-color: #6a8af7;
  box-shadow: 0 0 0 3px rgba(106, 138, 247, 0.12);
}

.primary-action {
  min-height: 2.75rem;
  border: 0;
  border-radius: 8px;
  background: #5b7cf2;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
}

.primary-action:disabled {
  opacity: 0.7;
}

.panel-footer {
  text-align: center;
}

.panel-footer p {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
}

.panel-footer a {
  color: #5b7cf2;
  font-weight: 700;
  text-decoration: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .auth-shell {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem 1rem;
  }

  .form-field input {
    font-size: 16px;
  }
}
</style>
