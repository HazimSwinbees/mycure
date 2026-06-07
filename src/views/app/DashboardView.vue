<script setup>
import { computed, onMounted, ref } from 'vue'
import { getCurrentPatientAppointments } from '../../services/appointmentApi'
import { getClinicInfo } from '../../services/clinicInfoApi'
import { getCurrentPatientNotifications } from '../../services/notificationApi'
import { getCurrentPatientProfile } from '../../services/patientApi'

const patient = ref(null)
const appointments = ref([])
const notifications = ref([])
const clinic = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const quickActions = [
  { title: 'Book appointment', detail: 'Schedule your next clinic visit', to: { name: 'booking' } },
  { title: 'Medical visits', detail: 'Review your visit history', to: { name: 'prescriptions' } },
  { title: 'Symptom checker', detail: 'Check symptom patterns quickly', to: { name: 'symptom-checker' } },
  { title: 'Gemini chat', detail: 'Ask health-related questions', to: { name: 'gemini-chat' } },
]

const toAppointmentTimestamp = (appointment) => {
  if (!appointment?.rawDate) {
    return Number.POSITIVE_INFINITY
  }

  const dateValue = new Date(`${appointment.rawDate}T${appointment.time || '00:00'}`)
  return Number.isNaN(dateValue.getTime()) ? Number.POSITIVE_INFINITY : dateValue.getTime()
}

const activeAppointments = computed(() =>
  [...appointments.value]
    .filter((item) => !['Cancelled', 'Rejected', 'Completed'].includes(item.status))
    .sort((a, b) => toAppointmentTimestamp(a) - toAppointmentTimestamp(b)),
)

const upcomingAppointment = computed(() => activeAppointments.value[0] || null)
const recentNotifications = computed(() => [...notifications.value].slice(0, 2))

const clinicHighlights = computed(() => [
  { label: 'Phone', value: clinic.value?.phone || '-' },
  { label: 'Hours', value: clinic.value?.operatingHours || '-' },
  { label: 'Address', value: clinic.value?.addressLine1 || '-' },
])

const displayName = computed(
  () => patient.value?.first_name || patient.value?.full_name || patient.value?.email || 'Patient',
)

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [profileData, appointmentData, notificationData, clinicData] = await Promise.all([
      getCurrentPatientProfile(),
      getCurrentPatientAppointments(),
      getCurrentPatientNotifications(),
      getClinicInfo(),
    ])

    patient.value = profileData
    appointments.value = appointmentData
    notifications.value = notificationData
    clinic.value = clinicData
  } catch (error) {
    loadError.value = error.message || 'Unable to load patient information.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="dashboard-page">
    <p v-if="loadError" class="message-box error-box" role="alert">{{ loadError }}</p>
    <div v-else-if="isLoading" class="message-box">Loading patient information...</div>

    <template v-else>
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="section-label">Dashboard</p>
          <h1>Welcome back, {{ displayName }}</h1>
          <p class="muted-copy">Your next appointment and latest updates in one place.</p>
        </div>
      </section>

      <div class="dashboard-grid">
        <section class="panel quick-actions-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Quick actions</p>
              <h2>Choose what to do next</h2>
              <p class="muted-copy">Shortcuts to the patient tools you will use most.</p>
            </div>
          </div>

          <div class="actions-grid">
            <RouterLink
              v-for="action in quickActions"
              :key="action.title"
              class="action-card"
              :to="action.to"
            >
              <strong>{{ action.title }}</strong>
              <p>{{ action.detail }}</p>
            </RouterLink>
          </div>
        </section>

        <section class="panel appointment-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Upcoming appointment</p>
              <h2>{{ upcomingAppointment?.service || 'No upcoming appointment' }}</h2>
              <p class="muted-copy">
                {{
                  upcomingAppointment
                    ? `${upcomingAppointment.doctor} · ${upcomingAppointment.category}`
                    : 'Book your next clinic visit when you are ready.'
                }}
              </p>
            </div>
            <span v-if="upcomingAppointment" class="status-chip">
              {{ upcomingAppointment.status }}
            </span>
          </div>

          <div class="appointment-meta">
            <article class="meta-item">
              <span>Date</span>
              <strong>{{ upcomingAppointment?.date || '-' }}</strong>
            </article>
            <article class="meta-item">
              <span>Time</span>
              <strong>{{ upcomingAppointment?.time || '-' }}</strong>
            </article>
          </div>

          <div class="panel-actions">
            <RouterLink class="secondary-link" :to="{ name: 'appointments' }">
              View appointment
            </RouterLink>
          </div>
        </section>

        <section class="panel notifications-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Notifications</p>
              <h2>Recent updates</h2>
              <p class="muted-copy">The latest reminders and account activity.</p>
            </div>
            <RouterLink class="inline-link" :to="{ name: 'notifications' }">View all</RouterLink>
          </div>

          <div class="stack-list">
            <article v-for="item in recentNotifications" :key="item.id" class="stack-row">
              <div class="stack-main">
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
              <strong class="stack-value">{{ item.time }}</strong>
            </article>
            <p v-if="!recentNotifications.length" class="empty-copy">No notifications yet.</p>
          </div>
        </section>

        <section class="panel clinic-panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Clinic info</p>
              <h2>{{ clinic?.clinicName || 'MyCure Clinic' }}</h2>
              <p class="muted-copy">
                {{ clinic?.tagline || 'Clinic details and contact information.' }}
              </p>
            </div>
          </div>

          <div class="clinic-grid">
            <article v-for="item in clinicHighlights" :key="item.label" class="clinic-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 1rem;
}

.message-box,
.hero-panel,
.panel {
  border: 1px solid #e3ebf5;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.message-box {
  color: #607086;
  padding: 1rem 1.1rem;
}

.error-box {
  color: var(--cure-danger);
}

.hero-panel,
.appointment-meta,
.dashboard-grid,
.actions-grid,
.clinic-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel {
  align-items: end;
  padding: 1.35rem;
  position: relative;
  overflow: hidden;
}

.hero-panel::after {
  content: '';
  position: absolute;
  inset: auto -3rem -3rem auto;
  width: 11rem;
  aspect-ratio: 1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(49, 87, 183, 0.16) 0%, rgba(49, 87, 183, 0) 72%);
  pointer-events: none;
}

.hero-panel::before {
  content: none;
}

.hero-copy {
  display: grid;
  gap: 0.4rem;
  max-width: 42rem;
}

.section-label {
  color: #6f7d90;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.stack-main h3 {
  color: #14213d;
  font-weight: 700;
  margin: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.08;
}

.muted-copy,
.meta-item span,
.stack-main p,
.inline-link,
.empty-copy,
.action-card p,
.clinic-item span {
  color: #607086;
}

.panel-head,
.panel-actions,
.stack-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.secondary-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #d7e3fb;
  border-radius: 12px;
  background: #f7faff;
  color: #3157b7;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.panel {
  display: grid;
  align-content: start;
  padding: 1.2rem;
}

.status-chip {
  flex: 0 0 auto;
  border: 1px solid #d7e3fb;
  border-radius: 999px;
  background: #f4f8ff;
  color: #3157b7;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.4rem 0.7rem;
}

.appointment-meta {
  grid-template-columns: repeat(1, minmax(0, 1fr));
  margin-top: 1rem;
}

.meta-item,
.action-card,
.clinic-item {
  display: grid;
  gap: 0.24rem;
  border: 1px solid #e4ebf5;
  border-radius: 14px;
  background: #ffffff;
  padding: 1rem;
}

.meta-item strong,
.action-card strong,
.stack-value,
.clinic-item strong {
  color: #14213d;
  font-weight: 700;
}

.panel-actions,
.actions-grid,
.stack-list,
.clinic-grid {
  margin-top: 0.9rem;
}

.panel-actions {
  justify-content: flex-end;
}

.action-card {
  color: inherit;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.action-card:hover {
  border-color: #c4d5ee;
  box-shadow: 0 16px 28px rgba(49, 87, 183, 0.08);
  transform: translateY(-2px);
}

.stack-list {
  display: grid;
  height: 100%;
  align-content: start;
}

.stack-row {
  border-top: 1px solid #f1f5f9;
  padding: 0.95rem 0;
}

.stack-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.stack-row:last-child {
  padding-bottom: 0;
}

.stack-main {
  min-width: 0;
}

.stack-main p {
  margin: 0.25rem 0 0;
}

.stack-value {
  flex: 0 0 auto;
  font-size: 0.88rem;
}

@media (min-width: 760px) {
  .appointment-meta,
  .clinic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 980px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }

  .quick-actions-panel,
  .clinic-panel {
    grid-column: 1 / -1;
  }

  .actions-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .appointment-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .clinic-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .panel-actions > * {
    width: 100%;
  }

  .panel-head,
  .stack-row {
    align-items: start;
    flex-direction: column;
  }
}
</style>
