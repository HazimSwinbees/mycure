<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../../assets/mycure-logo.png'
import { supabase } from '../../lib/supabaseClient'
import { logoutUser, updatePassword } from '../../services/authApi'

const router = useRouter()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const isRecoveryReady = ref(false)

let authSubscription

const markRecoveryReady = () => {
  const hasRecoveryHash = window.location.hash.includes('type=recovery')
  isRecoveryReady.value = hasRecoveryHash
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isRecoveryReady.value) {
    errorMessage.value = 'This reset link is invalid or has expired. Request a new one.'
    return
  }

  if (!form.password || !form.confirmPassword) {
    errorMessage.value = 'Please enter and confirm your new password.'
    return
  }

  if (form.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters.'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true

  try {
    await updatePassword(form.password)
    successMessage.value = 'Password updated successfully. Redirecting to login.'
    window.location.hash = ''

    setTimeout(async () => {
      await logoutUser()
      router.push({ name: 'login' })
    }, 1500)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update password right now.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  markRecoveryReady()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
      isRecoveryReady.value = true
    }
  })

  authSubscription = subscription

  const { data } = await supabase.auth.getSession()
  if (data.session) {
    isRecoveryReady.value = true
  }
})

onBeforeUnmount(() => {
  authSubscription?.unsubscribe()
})
</script>

<template>
  <section class="auth-shell">
    <section class="auth-card">
      <div class="brand-badge">
        <img :src="logoUrl" alt="MyCure" />
      </div>

      <div class="panel-head">
        <h1>Reset Password</h1>
        <p class="muted-copy">Enter your new password below</p>
      </div>

      <transition name="fade">
        <div v-if="errorMessage" class="alert alert-error" role="alert">{{ errorMessage }}</div>
      </transition>

      <transition name="fade">
        <div v-if="successMessage" class="alert alert-success" role="status">
          {{ successMessage }}
        </div>
      </transition>

      <div v-if="!isRecoveryReady && !successMessage" class="alert alert-warning" role="status">
        Open this page from the password reset email link to set a new password.
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="form-field">
          <span>New password</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="New password"
            autocomplete="new-password"
            minlength="6"
            required
          />
        </label>

        <label class="form-field">
          <span>Confirm password</span>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm password"
            autocomplete="new-password"
            minlength="6"
            required
          />
        </label>

        <button type="submit" class="primary-action" :disabled="isSubmitting || !isRecoveryReady">
          {{ isSubmitting ? 'Saving...' : 'Save New Password' }}
        </button>
      </form>

      <div class="panel-footer">
        <p>
          Need a new link?
          <RouterLink :to="{ name: 'forgot-password' }">Request again</RouterLink>
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

.alert-warning {
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #a16207;
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
