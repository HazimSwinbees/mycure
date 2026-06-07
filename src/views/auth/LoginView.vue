<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '../../assets/mycure-logo.png'
import { loginUser } from '../../services/authApi'

const router = useRouter()
const route = useRoute()
const errorMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '',
)

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

    if (redirectTarget.value) {
      router.push(redirectTarget.value)
      return
    }

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
    <section class="auth-card">
      <div class="brand-badge">
        <img :src="logoUrl" alt="MyCure" />
      </div>

      <div class="panel-head">
        <h1>Sign In</h1>
        <p class="muted-copy">Enter your credentials to continue</p>
      </div>

      <transition name="fade">
        <div v-if="errorMessage" class="alert alert-error" role="alert">
          {{ errorMessage }}
        </div>
      </transition>

      <form class="auth-form" @submit.prevent="handleLogin">
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

        <label class="form-field">
          <span>Password</span>
          <div class="password-shell">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              autocomplete="current-password"
              required
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </label>

        <div class="form-meta">
          <label class="remember-me">
            <input v-model="rememberMe" type="checkbox" />
            <span>Remember me</span>
          </label>
          <RouterLink :to="{ name: 'forgot-password' }" class="text-link">
            Forgot password?
          </RouterLink>
        </div>

        <button type="submit" class="primary-action" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
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

.password-shell {
  position: relative;
}

.password-shell input {
  padding-right: 4.75rem;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 0.7rem;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 700;
}

.form-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.78rem;
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #94a3b8;
}

.remember-me input {
  width: 0.85rem;
  height: 0.85rem;
  accent-color: #5b7cf2;
}

.text-link {
  color: #5b7cf2;
  font-weight: 700;
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
  display: grid;
  gap: 0.65rem;
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

.back-link {
  font-size: 0.82rem;
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

  .form-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
