<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '../../assets/mycure-logo.png'
import { logoutUser } from '../../services/authApi'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const router = useRouter()

const navigationItems = [
  { label: 'Dashboard', to: { name: 'admin-dashboard' }, icon: 'dashboard' },
  { label: 'Appointments', to: { name: 'admin-appointments' }, icon: 'appointments' },
  { label: 'Patients', to: { name: 'admin-patients' }, icon: 'patients' },
  { label: 'Manage Services', to: { name: 'admin-services' }, icon: 'services' },
  { label: 'Visit Records', to: { name: 'admin-medical-records' }, icon: 'records' },
  { label: 'Availability', to: { name: 'admin-availability' }, icon: 'availability' },
  { label: 'Notifications', to: { name: 'admin-notifications' }, icon: 'notifications' },
  { label: 'Clinic Info', to: { name: 'admin-clinic-info' }, icon: 'clinic' },
  { label: 'Gemini Chat', to: { name: 'admin-gemini-chat' }, icon: 'chat' },
]

const iconPaths = {
  dashboard: 'M3.5 4.5h7v7h-7zm10 0h7v4h-7zm0 7h7v7h-7zm-10 3h7v4h-7z',
  appointments:
    'M6 3.5v3m8-3.2v3m-9 3h10m-11 10h12a2 2 0 0 0 2-2v-9.5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2V17a2 2 0 0 0 2 2Z',
  patients:
    'M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 1.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM2.5 17a4 4 0 0 1 8 0m1.5 0a3.5 3.5 0 0 1 7 0',
  services:
    'M4 5.5h12a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Zm0 7h12a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.5a2 2 0 0 1 2-2Z',
  records:
    'M6 3.5h6.5a2 2 0 0 1 2 2V16m-8.5-12.5H5.5a2 2 0 0 0-2 2V16a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9.5m-7 2.5h4.5m-4.5 3h4.5m1-11 2.5 2.5L15 9',
  availability:
    'M10 3.5v3m0 3v3m0 3v1.5m-6-8.5h12m-10 5h8M4 5.5h12a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z',
  notifications:
    'M10 3.5a4 4 0 0 1 4 4v2.2c0 .8.3 1.6.8 2.3l1 1.2c.4.5.1 1.3-.6 1.3H4.8c-.7 0-1-.8-.6-1.3l1-1.2c.5-.7.8-1.5.8-2.3V7.5a4 4 0 0 1 4-4Zm-1.8 14a1.8 1.8 0 0 0 3.6 0',
  clinic:
    'M3.5 17V6.5a2 2 0 0 1 2-2H14.5a2 2 0 0 1 2 2V17M7 17v-3.5h6V17M7.5 8h1m3 0h1m-5 2.5h1m3 0h1',
  chat:
    'M4 5.5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 2.8c-.6.4-1.5 0-1.5-.8V15.5H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z',
}

const storedUser = computed(() => {
  const raw = localStorage.getItem('mycure_user')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
})

const currentDoctor = computed(() => {
  const user = storedUser.value
  const metadata = user?.user_metadata || {}
  const fullName =
    metadata.name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() || 'Doctor Account'

  return {
    name: fullName,
    email: user?.email || 'doctor@mycure.com',
  }
})

const initials = computed(() =>
  currentDoctor.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)

const handleLogout = async () => {
  await logoutUser()
  localStorage.removeItem('mycure_token')
  localStorage.removeItem('mycure_refresh_token')
  localStorage.removeItem('mycure_role')
  localStorage.removeItem('mycure_user')
  emit('close')
  router.push({ name: 'login' })
}
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

    <aside class="sidebar" :class="{ 'is-open': open }" aria-label="Doctor navigation">
      <div class="sidebar-inner">
        <RouterLink class="brand-link" :to="{ name: 'admin-dashboard' }" @click="emit('close')">
          <span class="brand-logo">
            <img :src="logoUrl" alt="MyCure" />
          </span>
          <span class="brand-copy">
            <strong>MyCure</strong>
            <small>Doctor portal</small>
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
          <RouterLink class="profile-card profile-link" :to="{ name: 'admin-doctor-profile' }" @click="emit('close')">
            <span class="profile-avatar" aria-hidden="true">{{ initials }}</span>
            <div class="profile-copy">
              <strong>{{ currentDoctor.name }}</strong>
              <span>{{ currentDoctor.email }}</span>
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
    transform 160ms ease,
    color 160ms ease;
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
  flex: 0 0 auto;
  place-items: center;
}

.nav-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nav-label {
  color: #111827;
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

.profile-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.85rem;
  padding: 0.2rem;
}

.profile-link {
  border-radius: 10px;
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
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 600;
}

.profile-copy {
  display: grid;
  gap: 0.1rem;
}

.profile-copy strong {
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.98rem;
  font-weight: 600;
}

.profile-copy span {
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 500;
  margin-top: 0.1rem;
}

.logout-link {
  min-height: 42px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
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
  border-color: #f3b7bd;
  background: #fff1f2;
  transform: translateX(2px);
}

@media (min-width: 980px) {
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 286px;
    transform: none;
  }

  .sidebar-backdrop {
    display: none;
  }
}
</style>
