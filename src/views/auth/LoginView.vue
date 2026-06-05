<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../../assets/mycure-logo.png'
import { loginUser } from '../../services/authApi'

const router = useRouter()
const errorMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  errorMessage.value = ''

  if (!form.email || !form.password) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  isSubmitting.value = true

  try {
    const { session, user } = await loginUser(form)
    const role = user?.user_metadata?.role || 'patient'

    localStorage.setItem('mycure_token', session.access_token)
    localStorage.setItem('mycure_refresh_token', session.refresh_token)
    localStorage.setItem('mycure_role', role)
    localStorage.setItem('mycure_user', JSON.stringify(user))
    router.push(role === 'doctor' ? '/admin/dashboard' : '/app/dashboard')
  } catch (error) {
    errorMessage.value = error.message || 'Login failed. Please check your credentials and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-shell">
    <div class="auth-card">
      <aside class="auth-brand">
        <div class="brand-badge">
          <img :src="logoUrl" alt="MyCure" />
        </div>
        <p class="eyebrow">Healthcare Access</p>
        <h1>Sign in to MyCure</h1>
        <p class="brand-copy">
          Access appointments, patient records, notifications, and clinic workflows from one
          secure place.
        </p>
      </aside>

      <section class="auth-panel">
        <div class="panel-head">
          <p class="eyebrow">Welcome back</p>
          <h2>Login</h2>
          <p class="muted-copy">Enter your account details to continue.</p>
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert alert-error" role="alert">
            {{ errorMessage }}
          </div>
        </transition>

        <form class="auth-form" @submit.prevent="handleLogin">
          <label class="form-field">
            <span>Email address</span>
            <input
              v-model.trim="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </label>

          <label class="form-field">
            <span>Password</span>
            <div class="password-shell">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>

          <button type="submit" class="primary-action" :disabled="isSubmitting">
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="panel-footer">
          <p>
            Don't have an account?
            <RouterLink :to="{ name: 'register' }">Create one</RouterLink>
          </p>
          <RouterLink :to="{ name: 'landing' }" class="back-link">Back to home</RouterLink>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 28%),
    radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12), transparent 24%),
    linear-gradient(180deg, #f5fbff 0%, #eef6ff 100%);
}

.auth-card {
  width: min(100%, 1040px);
  display: grid;
  border: 1px solid #dbe7f3;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.auth-brand,
.auth-panel {
  display: grid;
  gap: 1rem;
  padding: 1.75rem;
}

.auth-brand {
  background:
    linear-gradient(150deg, rgba(14, 165, 233, 0.96), rgba(2, 132, 199, 0.88)),
    linear-gradient(180deg, #0f8fc8 0%, #2563eb 100%);
  color: #ffffff;
  align-content: center;
}

.brand-badge {
  width: 4.5rem;
  height: 4.5rem;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
}

.brand-badge img {
  width: 2.8rem;
  height: 2.8rem;
}

.eyebrow {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-brand h1,
.panel-head h2 {
  margin: 0;
  font-weight: 900;
  line-height: 1.05;
}

.auth-brand h1 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.brand-copy {
  margin: 0;
  max-width: 32ch;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
}

.panel-head {
  display: grid;
  gap: 0.35rem;
}

.panel-head h2 {
  color: #0f172a;
  font-size: clamp(1.8rem, 3vw, 2.3rem);
}

.muted-copy,
.panel-footer p,
.back-link {
  color: #5b6576;
}

.alert {
  padding: 0.9rem 1rem;
  border-radius: 14px;
  font-size: 0.92rem;
  font-weight: 700;
}

.alert-error {
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.auth-form {
  display: grid;
  gap: 1rem;
}

.form-field {
  display: grid;
  gap: 0.45rem;
}

.form-field span {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.form-field input {
  width: 100%;
  min-height: 3rem;
  border: 1px solid #d8e0ea;
  border-radius: 14px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  padding: 0.85rem 0.95rem;
}

.form-field input:focus {
  outline: none;
  border-color: #0f8fc8;
  box-shadow: 0 0 0 3px rgba(15, 143, 200, 0.12);
}

.password-shell {
  position: relative;
}

.password-shell input {
  padding-right: 4.5rem;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 0.7rem;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 800;
}

.primary-action {
  min-height: 3rem;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f8fc8, #2563eb);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.2);
}

.primary-action:disabled {
  opacity: 0.7;
}

.panel-footer {
  display: grid;
  gap: 0.9rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.25rem;
}

.panel-footer p {
  margin: 0;
  font-weight: 600;
}

.panel-footer a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.back-link {
  font-size: 0.92rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 900px) {
  .auth-card {
    grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1.05fr);
  }

  .auth-brand,
  .auth-panel {
    padding: 2.5rem;
  }
}

@media (max-width: 640px) {
  .auth-shell {
    padding: 1rem;
  }

  .auth-card {
    border-radius: 22px;
  }

  .auth-brand,
  .auth-panel {
    padding: 1.25rem;
  }

  .form-field input {
    font-size: 16px;
  }
}
</style>
