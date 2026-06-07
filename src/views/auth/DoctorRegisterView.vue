<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../../assets/mycure-logo.png'
import { registerDoctor } from '../../services/authApi'

const router = useRouter()
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const errors = reactive({
  fullName: '',
  email: '',
  roleTitle: '',
  qualification: '',
  experience: '',
  photo: '',
  password: '',
  confirmPassword: '',
  specializations: '',
  agreeToTerms: '',
})

const form = reactive({
  fullName: '',
  email: '',
  roleTitle: '',
  qualification: '',
  experience: '',
  languages: '',
  specializations: '',
  workingHours: '',
  about: '',
  photo: null,
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
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

const toList = (value) =>
  String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  clearErrors()

  let hasError = false

  if (!form.fullName) {
    errors.fullName = 'Full name is required.'
    hasError = true
  }
  if (!form.email) {
    errors.email = 'Email address is required.'
    hasError = true
  }
  if (!form.roleTitle) {
    errors.roleTitle = 'Role title is required.'
    hasError = true
  }
  if (!form.qualification) {
    errors.qualification = 'Qualification is required.'
    hasError = true
  }
  if (!form.experience) {
    errors.experience = 'Experience is required.'
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
  if (!form.specializations) {
    errors.specializations = 'At least one specialization is required.'
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
    const data = await registerDoctor({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      roleTitle: form.roleTitle,
      qualification: form.qualification,
      experience: form.experience,
      languages: toList(form.languages),
      specializations: toList(form.specializations),
      workingHours: toList(form.workingHours),
      about: form.about,
      photo: form.photo,
    })

    localStorage.setItem(
      'mycure_registered_doctor',
      JSON.stringify({
        email: form.email,
        fullName: form.fullName,
        roleTitle: form.roleTitle,
      }),
    )

    successMessage.value = data.session
      ? 'Doctor registration successful. Redirecting to login.'
      : 'Doctor registration successful. Check your email if confirmation is required.'

    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1800)
  } catch (error) {
    errorMessage.value = error.message || 'Doctor registration failed. Please try again.'
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
        <h1>Register Doctor</h1>
        <p class="muted-copy">Create a doctor account and save the profile in the doctor table</p>
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
        <label class="form-field">
          <span>Full name</span>
          <input v-model.trim="form.fullName" type="text" placeholder="Doctor full name" required />
          <small v-if="errors.fullName" class="field-error">{{ errors.fullName }}</small>
        </label>

        <div class="field-grid">
          <label class="form-field">
            <span>Email</span>
            <input v-model.trim="form.email" type="email" placeholder="Email" required />
            <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
          </label>

          <label class="form-field">
            <span>Role title</span>
            <input v-model.trim="form.roleTitle" type="text" placeholder="General Practitioner" required />
            <small v-if="errors.roleTitle" class="field-error">{{ errors.roleTitle }}</small>
          </label>
        </div>

        <div class="field-grid">
          <label class="form-field">
            <span>Qualification</span>
            <input v-model.trim="form.qualification" type="text" placeholder="MBBS, university" required />
            <small v-if="errors.qualification" class="field-error">{{ errors.qualification }}</small>
          </label>

          <label class="form-field">
            <span>Experience</span>
            <input v-model.trim="form.experience" type="text" placeholder="8 Years" required />
            <small v-if="errors.experience" class="field-error">{{ errors.experience }}</small>
          </label>
        </div>

        <label class="form-field">
          <span>Specializations</span>
          <textarea
            v-model.trim="form.specializations"
            rows="3"
            placeholder="One specialization per line or separated by commas"
            required
          />
          <small v-if="errors.specializations" class="field-error">{{ errors.specializations }}</small>
        </label>

        <label class="form-field">
          <span>Languages</span>
          <textarea
            v-model.trim="form.languages"
            rows="2"
            placeholder="English, Malay, Mandarin"
          />
        </label>

        <label class="form-field">
          <span>Working hours</span>
          <textarea
            v-model.trim="form.workingHours"
            rows="2"
            placeholder="Mon - Fri: 9 AM - 5 PM"
          />
        </label>

        <label class="form-field">
          <span>About</span>
          <textarea
            v-model.trim="form.about"
            rows="4"
            placeholder="Brief doctor profile and care focus"
          />
        </label>

        <label class="form-field file-field">
          <span>Profile photo</span>
          <input type="file" accept="image/*" @change="handlePhotoChange" />
          <small class="field-hint">
            {{ form.photo ? form.photo.name : 'Upload profile photo (max 2MB)' }}
          </small>
          <small v-if="errors.photo" class="field-error">{{ errors.photo }}</small>
        </label>

        <label class="form-field">
          <span>Password</span>
          <div class="password-shell">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              minlength="6"
              required
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
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

        <label class="checkbox-row">
          <input v-model="form.agreeToTerms" type="checkbox" required />
          <span>I agree to the terms and conditions and understand this account is for doctor access.</span>
        </label>
        <small v-if="errors.agreeToTerms" class="field-error">{{ errors.agreeToTerms }}</small>

        <button type="submit" class="primary-action" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating doctor account...' : 'Create doctor account' }}
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
  width: min(100%, 780px);
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

.field-grid {
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

.form-field input,
.form-field textarea {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  font: inherit;
  padding: 0.75rem 0.9rem;
}

.form-field textarea {
  min-height: 5.2rem;
  resize: vertical;
}

.form-field input:focus,
.form-field textarea:focus {
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

.field-error {
  color: #be123c;
  font-size: 0.8rem;
  font-weight: 700;
}

.field-hint {
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
}

.checkbox-row {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.55rem;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.45;
}

.checkbox-row input {
  width: 0.85rem;
  height: 0.85rem;
  margin-top: 0.15rem;
  accent-color: #5b7cf2;
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

@media (min-width: 640px) {
  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .auth-shell {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem 1rem;
  }

  .form-field input,
  .form-field textarea {
    font-size: 16px;
  }
}
</style>
