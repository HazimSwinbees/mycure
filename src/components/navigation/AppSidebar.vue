<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { logoutUser } from '../../services/authApi'
import { getCurrentPatientProfile } from '../../services/patientApi'
import logoUrl from '../../assets/mycure-logo.png'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()
const patient = ref(null)

const navigationItems = [
  { label: 'Dashboard', to: { name: 'dashboard' }, icon: 'dashboard' },
  { label: 'Services', to: { name: 'services' }, icon: 'services' },
  { label: 'Clinic & Doctor Info', to: { name: 'clinic-and-doctor-info' }, icon: 'clinic' },
  { label: 'Gemini Chat', to: { name: 'gemini-chat' }, icon: 'chat' },
  { label: 'Symptom Checker', to: { name: 'symptom-checker' }, icon: 'symptoms' },
  { label: 'Medical Visits', to: { name: 'prescriptions' }, icon: 'prescriptions' },
  { label: 'Appointments', to: { name: 'appointments' }, icon: 'appointments' },
  { label: 'Notifications', to: { name: 'notifications' }, icon: 'notifications' },
  { label: 'Book Appointment', to: { name: 'booking' }, icon: 'booking' },
]

const currentUser = computed(() => ({
  name: patient.value?.full_name || patient.value?.first_name || 'Patient Account',
  email: patient.value?.email || 'Email not provided',
  photoUrl: patient.value?.photo_url || '',
}))

const initials = computed(() =>
  currentUser.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

const iconPaths = {
  dashboard: 'M3.5 4.5h7v7h-7zm10 0h7v4h-7zm0 7h7v7h-7zm-10 3h7v4h-7z',
  services:
    'M5 11.5c0-3 2.5-5.5 5.5-5.5S16 8.5 16 11.5 13.5 17 10.5 17 5 14.5 5 11.5Zm10.5 0H20m-19 0h4.5',
  clinic:
    'M3.5 16V8.8c0-.5.2-.9.6-1.2l5-3.8c.5-.4 1.2-.4 1.8 0l5 3.8c.4.3.6.7.6 1.2V16M7.5 16v-4.5h5V16',
  chat:
    'M4 5.5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 2.8c-.6.4-1.5 0-1.5-.8V15.5H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z',
  symptoms:
    'M3 10h2.4l1.4-3.2 2.7 7 2.2-5.1 1.3 1.9H17',
  prescriptions:
    'M6 3.5h6.5a2 2 0 0 1 2 2V16m-8.5-12.5H5.5a2 2 0 0 0-2 2V16a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9.5m-7 2.5h4.5m-4.5 3h4.5m1-11 2.5 2.5L15 9',
  appointments:
    'M6 3.5v3m8-3.2v3m-9 3h10m-11 10h12a2 2 0 0 0 2-2v-9.5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2V17a2 2 0 0 0 2 2Z',
  notifications:
    'M10 3.5a4 4 0 0 1 4 4v2.2c0 .8.3 1.6.8 2.3l1 1.2c.4.5.1 1.3-.6 1.3H4.8c-.7 0-1-.8-.6-1.3l1-1.2c.5-.7.8-1.5.8-2.3V7.5a4 4 0 0 1 4-4Zm-1.8 14a1.8 1.8 0 0 0 3.6 0',
  booking: 'M10 2.5v15m-7.5-7.5h15',
}

const handleLogout = async () => {
  await logoutUser()
  localStorage.removeItem('mycure_token')
  localStorage.removeItem('mycure_refresh_token')
  localStorage.removeItem('mycure_role')
  localStorage.removeItem('mycure_user')
  emit('close')
  router.push({ name: 'login' })
}

onMounted(async () => {
  try {
    patient.value = await getCurrentPatientProfile()
  } catch {
    patient.value = null
  }
})
</script>

<template>
  <div class="sidebar-shell">
    <button
      v-if="open"
      class="sidebar-backdrop"
      type="button"
      aria-label="Close navigation menu"
      @click="emit('close')"
    />

    <aside class="sidebar" :class="{ 'is-open': open }" aria-label="Application navigation">
      <div class="sidebar-inner">
        <RouterLink class="brand-link" :to="{ name: 'dashboard' }" @click="emit('close')">
          <span class="brand-logo">
            <img :src="logoUrl" alt="MyCure" />
          </span>
          <span class="brand-copy">
            <strong>MyCure</strong>
            <small>Patient portal</small>
          </span>
        </RouterLink>

        <nav class="nav-sections">
          <div class="nav-list">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.label"
              class="nav-link"
              :to="item.to"
              @click="emit('close')"
            >
              <span class="nav-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none">
                  <path
                    :d="iconPaths[item.icon]"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.6"
                  />
                </svg>
              </span>
              <span class="nav-label">{{ item.label }}</span>
            </RouterLink>
          </div>
        </nav>

        <div class="sidebar-footer">
          <RouterLink
            class="profile-card profile-link"
            :to="{ name: 'profile' }"
            @click="emit('close')"
          >
            <span class="profile-avatar" aria-hidden="true">
              <img v-if="currentUser.photoUrl" :src="currentUser.photoUrl" alt="" />
              <span v-else>{{ initials }}</span>
            </span>
            <div class="profile-copy">
              <strong>{{ currentUser.name }}</strong>
              <span>{{ currentUser.email }}</span>
            </div>
          </RouterLink>
          <button class="logout-link" type="button" @click="handleLogout">Log out</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  border: 0;
  background: rgba(15, 23, 42, 0.18);
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  width: min(86vw, 286px);
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  transform: translateX(-100%);
  transition: transform 180ms ease;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
}

.sidebar.is-open {
  transform: translateX(0);
}

.sidebar-inner {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 1.1rem 1.1rem 1.4rem;
}

.nav-sections {
  display: grid;
  align-content: start;
  flex: 1 1 auto;
  margin-top: 1.5rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.brand-logo {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  flex: 0 0 auto;
}

.brand-logo img {
  width: 1.9rem;
  height: 1.9rem;
}

.brand-copy {
  display: grid;
  min-width: 0;
  gap: 0.1rem;
}

.brand-copy strong {
  color: #111827;
  font-size: 1.08rem;
  font-weight: 700;
}

.brand-copy small {
  color: #8a8f98;
  font-size: 0.86rem;
  font-weight: 500;
}

.profile-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
}

.profile-link {
  border-radius: 10px;
  padding: 0.2rem;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.profile-link:hover {
  background: #f9fafb;
  transform: translateY(-1px);
}

.profile-avatar {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 600;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-copy {
  display: grid;
  min-width: 0;
}

.profile-copy strong,
.nav-label,
.logout-link {
  color: #111827;
}

.profile-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.98rem;
  font-weight: 600;
}

.profile-copy span {
  color: #8a8f98;
  font-size: 0.82rem;
  font-weight: 500;
  margin-top: 0.1rem;
}

.nav-list {
  display: grid;
  gap: 0.15rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-height: 2.75rem;
  border-radius: 10px;
  color: #6b7280;
  padding: 0.5rem 0.25rem;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.nav-link:hover {
  background: #f9fafb;
  color: #111827;
  transform: translateX(2px);
}

.nav-link.router-link-active {
  color: #111827;
}

.nav-icon {
  display: inline-grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  flex: 0 0 auto;
}

.nav-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nav-label {
  font-size: 0.98rem;
  font-weight: 500;
}

.sidebar-footer {
  display: grid;
  gap: 1rem;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.logout-link {
  min-height: 42px;
  border: 1px solid #f3d0d3;
  border-radius: 10px;
  background: #fff5f5;
  color: #b4232c;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  text-align: center;
  transition:
    background 160ms ease,
    color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.logout-link:hover {
  background: #feecee;
  border-color: #e7b3b8;
  color: #991b1b;
  transform: translateY(-1px);
}

@media (min-width: 980px) {
  .sidebar-shell {
    width: 286px;
    flex: 0 0 286px;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 286px;
    height: 100vh;
    transform: none;
    box-shadow: none;
    overflow-y: auto;
  }

  .sidebar-backdrop {
    display: none;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
  }

  .sidebar-inner {
    padding: 1rem;
  }
}
</style>
