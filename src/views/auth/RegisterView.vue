<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../../assets/mycure-logo.png'
import { registerUser } from '../../services/authApi'

const router = useRouter()
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const errors = reactive({
  firstName: '',
  lastName: '',
  icPassportNumber: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  photo: '',
  password: '',
  confirmPassword: '',
  homeAddress: '',
  agreeToTerms: '',
})

const form = reactive({
  firstName: '',
  lastName: '',
  icPassportNumber: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  homeAddress: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  photo: null,
})

const handlePhotoChange = (event) => {
  const [file] = event.target.files
  form.photo = file || null
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  clearErrors()

  let hasError = false

  if (!form.firstName) {
    errors.firstName = 'First name is required.'
    hasError = true
  }
  if (!form.lastName) {
    errors.lastName = 'Last name is required.'
    hasError = true
  }
  if (!form.icPassportNumber) {
    errors.icPassportNumber = 'IC / Passport Number is required.'
    hasError = true
  }
  if (!form.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.'
    hasError = true
  }
  if (!form.gender) {
    errors.gender = 'Gender is required.'
    hasError = true
  }
  if (!form.phone) {
    errors.phone = 'Phone number is required.'
    hasError = true
  }
  if (!form.email) {
    errors.email = 'Email address is required.'
    hasError = true
  }
  if (!form.photo) {
    errors.photo = 'Profile photo is required.'
    hasError = true
  } else if (!form.photo.type.startsWith('image/')) {
    errors.photo = 'Please upload an image file.'
    hasError = true
  } else if (form.photo.size > 2 * 1024 * 1024) {
    errors.photo = 'Profile photo must be 2MB or smaller.'
    hasError = true
  }
  if (!form.password) {
    errors.password = 'Password is required.'
    hasError = true
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
    hasError = true
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
    hasError = true
  }
  if (!form.homeAddress) {
    errors.homeAddress = 'Home address is required.'
    hasError = true
  }
  if (!form.agreeToTerms) {
    errors.agreeToTerms = 'Please agree to the terms and conditions.'
    hasError = true
  }

  if (hasError) {
    return
  }

  isSubmitting.value = true

  try {
    const data = await registerUser(form)

    localStorage.setItem('mycure_registered_user', JSON.stringify(data.user))
    successMessage.value = data.session
      ? 'Registration successful. Redirecting to login.'
      : 'Registration successful. Check your email if confirmation is required.'

    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1800)
  } catch (error) {
    errorMessage.value = error.message || 'Registration failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-shell">
    <div class="auth-card auth-card-wide">
      <aside class="auth-brand">
        <div class="brand-badge">
          <img :src="logoUrl" alt="MyCure" />
        </div>
        <p class="eyebrow">Create Account</p>
        <h1>Join MyCure</h1>
        <p class="brand-copy">
          Register once to manage appointments, health records, notifications, and your clinic
          interactions from a single account.
        </p>
      </aside>

      <section class="auth-panel">
        <div class="panel-head">
          <p class="eyebrow">New patient account</p>
          <h2>Registration</h2>
          <p class="muted-copy">Complete the form below to create your MyCure account.</p>
        </div>

        <transition name="fade">
          <div v-if="errorMessage" class="alert alert-error" role="alert">{{ errorMessage }}</div>
        </transition>

        <transition name="fade">
          <div v-if="successMessage" class="alert alert-success" role="status">
            {{ successMessage }}
          </div>
        </transition>

        <form class="auth-form" novalidate @submit.prevent="handleRegister">
          <div class="section-grid">
            <div class="section-head">Personal Information</div>

            <label class="form-field">
              <span>First name</span>
              <input v-model.trim="form.firstName" type="text" placeholder="Aisha" required />
              <small v-if="errors.firstName" class="field-error">{{ errors.firstName }}</small>
            </label>

            <label class="form-field">
              <span>Last name</span>
              <input v-model.trim="form.lastName" type="text" placeholder="Tan" required />
              <small v-if="errors.lastName" class="field-error">{{ errors.lastName }}</small>
            </label>

            <label class="form-field">
              <span>Date of birth</span>
              <input v-model="form.dateOfBirth" type="date" required />
              <small v-if="errors.dateOfBirth" class="field-error">{{ errors.dateOfBirth }}</small>
            </label>

            <label class="form-field">
              <span>Gender</span>
              <select v-model="form.gender" required>
                <option value="" disabled>Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <small v-if="errors.gender" class="field-error">{{ errors.gender }}</small>
            </label>

            <label class="form-field">
              <span>IC / Passport Number</span>
              <input
                v-model.trim="form.icPassportNumber"
                type="text"
                placeholder="900101-13-1234"
                required
              />
              <small v-if="errors.icPassportNumber" class="field-error">{{ errors.icPassportNumber }}</small>
            </label>

            <label class="form-field">
              <span>Phone number</span>
              <input
                v-model.trim="form.phone"
                type="tel"
                placeholder="+60 12 345 6789"
                required
              />
              <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
            </label>

            <label class="form-field form-field-wide">
              <span>Email address</span>
              <input
                v-model.trim="form.email"
                type="email"
                placeholder="you@example.com"
                required
              />
              <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
            </label>

            <label class="form-field form-field-wide">
              <span>Home address</span>
              <textarea
                v-model.trim="form.homeAddress"
                rows="3"
                placeholder="Street, city, postcode, state"
                required
              />
              <small v-if="errors.homeAddress" class="field-error">{{ errors.homeAddress }}</small>
            </label>

            <label class="form-field form-field-wide">
              <span>Profile photo</span>
              <input type="file" accept="image/*" @change="handlePhotoChange" />
              <small class="field-hint">
                {{ form.photo ? form.photo.name : 'Upload PNG, JPG, or GIF up to 2MB.' }}
              </small>
              <small v-if="errors.photo" class="field-error">{{ errors.photo }}</small>
            </label>
          </div>

          <div class="section-grid">
            <div class="section-head">Security</div>

            <label class="form-field">
              <span>Password</span>
              <div class="password-shell">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create password"
                  minlength="6"
                  required
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
              <small class="field-hint">At least 6 characters.</small>
              <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
            </label>

            <label class="form-field">
              <span>Confirm password</span>
              <div class="password-shell">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm password"
                  minlength="6"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
              <small v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</small>
            </label>
          </div>

          <label class="checkbox-row">
            <input v-model="form.agreeToTerms" type="checkbox" required />
            <span>I agree to the terms and conditions and privacy policy.</span>
          </label>
          <small v-if="errors.agreeToTerms" class="field-error">{{ errors.agreeToTerms }}</small>

          <button type="submit" class="primary-action" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <div class="panel-footer">
          <p>
            Already have an account?
            <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
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
  width: min(100%, 1120px);
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
  max-width: 34ch;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
}

.auth-panel {
  align-content: start;
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
.back-link,
.field-hint {
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

.alert-success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.auth-form {
  display: grid;
  gap: 1rem;
}

.section-grid {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e8edf3;
  border-radius: 18px;
  background: #fbfdff;
}

.section-head {
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  min-height: 3rem;
  border: 1px solid #d8e0ea;
  border-radius: 14px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  padding: 0.85rem 0.95rem;
}

.form-field textarea {
  min-height: 6rem;
  resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
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

.field-error {
  color: #be123c;
  font-size: 0.84rem;
  font-weight: 700;
}

.field-hint {
  font-size: 0.82rem;
  font-weight: 600;
}

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  color: #0f172a;
  font-weight: 700;
  line-height: 1.55;
}

.checkbox-row input {
  width: 18px;
  height: 18px;
  margin-top: 0.2rem;
  accent-color: #0f8fc8;
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
    grid-template-columns: minmax(320px, 0.88fr) minmax(0, 1.12fr);
  }

  .auth-brand,
  .auth-panel {
    padding: 2.25rem;
  }

  .section-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-head,
  .form-field-wide {
    grid-column: 1 / -1;
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

  .form-field input,
  .form-field select,
  .form-field textarea {
    font-size: 16px;
  }
}
</style>
