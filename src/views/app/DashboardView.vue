<script setup>
import { computed, onMounted, ref } from 'vue'
import { getCurrentPatientAppointments } from '../../services/appointmentApi'
import { getCurrentPatientMedicalRecords } from '../../services/medicalRecordApi'
import { getCurrentPatientNotifications } from '../../services/notificationApi'
import { getCurrentPatientProfile } from '../../services/patientApi'

const patient = ref(null)
const appointments = ref([])
const notifications = ref([])
const medicalRecords = ref([])
const isLoading = ref(true)
const loadError = ref('')

const quickActions = [
  { title: 'Book appointment', detail: 'Schedule a new visit', to: { name: 'booking' } },
  { title: 'View appointments', detail: 'Open appointment history', to: { name: 'appointments' } },
  {
    title: 'Open notifications',
    detail: 'Review reminders and alerts',
    to: { name: 'notifications' },
  },
  { title: 'Manage profile', detail: 'Update personal details', to: { name: 'profile' } },
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

const recentAppointments = computed(() => [...appointments.value].slice(0, 3))
const recentMedicalRecords = computed(() => [...medicalRecords.value].slice(0, 3))
const recentNotifications = computed(() => [...notifications.value].slice(0, 3))
const unreadNotifications = computed(() => notifications.value.filter((item) => !item.read).length)

const overviewMetrics = computed(() => [
  {
    label: 'Next visit',
    value: upcomingAppointment.value?.date || 'None',
    detail: upcomingAppointment.value?.time || 'No upcoming appointment',
  },
  {
    label: 'Notifications',
    value: String(notifications.value.length).padStart(2, '0'),
    detail: `${unreadNotifications.value} unread`,
  },
  {
    label: 'Medical records',
    value: String(medicalRecords.value.length).padStart(2, '0'),
    detail: 'Visit history available',
  },
  {
    label: 'Appointments',
    value: String(appointments.value.length).padStart(2, '0'),
    detail: `${activeAppointments.value.length} active`,
  },
])

const displayName = computed(
  () => patient.value?.first_name || patient.value?.full_name || patient.value?.email || 'Patient',
)

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [profileData, appointmentData, notificationData, medicalRecordData] = await Promise.all([
      getCurrentPatientProfile(),
      getCurrentPatientAppointments(),
      getCurrentPatientNotifications(),
      getCurrentPatientMedicalRecords(),
    ])

    patient.value = profileData
    appointments.value = appointmentData
    notifications.value = notificationData
    medicalRecords.value = medicalRecordData
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
          <p class="muted-copy">Appointments, visit updates, and reminders in one place.</p>
        </div>

        <div class="hero-actions">
          <RouterLink class="primary-link" :to="{ name: 'booking' }">Book appointment</RouterLink>
          <RouterLink class="secondary-link" :to="{ name: 'appointments' }">
            View appointments
          </RouterLink>
        </div>
      </section>

      <section class="metrics-panel">
        <article v-for="item in overviewMetrics" :key="item.label" class="metric-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.detail }}</small>
        </article>
      </section>

      <div class="dashboard-grid">
        <main class="dashboard-main">
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
              <article class="meta-item">
                <span>Location</span>
                <strong>{{ upcomingAppointment?.location || '-' }}</strong>
              </article>
            </div>

            <div class="panel-actions">
              <RouterLink class="secondary-link" :to="{ name: 'appointments' }">
                View details
              </RouterLink>
              <RouterLink class="secondary-link" :to="{ name: 'notifications' }">
                Open reminders
              </RouterLink>
            </div>
          </section>

          <div class="main-bottom-grid">
            <section class="panel">
              <div class="panel-head">
                <div>
                  <p class="section-label">Appointments</p>
                  <h2>Recent bookings</h2>
                </div>
              </div>

              <div class="stack-list">
                <article v-for="item in recentAppointments" :key="item.id" class="stack-row">
                  <div class="stack-main">
                    <h3>{{ item.service }}</h3>
                    <p>{{ item.date }} · {{ item.doctor }}</p>
                  </div>
                  <strong class="stack-value">{{ item.status }}</strong>
                </article>
                <p v-if="!recentAppointments.length" class="empty-copy">No appointments yet.</p>
              </div>
            </section>

            <section class="panel">
              <div class="panel-head">
                <div>
                  <p class="section-label">Medical records</p>
                  <h2>Recent visits</h2>
                </div>
              </div>

              <div class="vitals-list">
                <article v-for="item in recentMedicalRecords" :key="item.id" class="vital-row">
                  <div>
                    <span>{{ item.serviceName }}</span>
                    <small>{{ item.visitDate }}</small>
                  </div>
                  <strong>{{ item.diagnosis }}</strong>
                </article>
                <p v-if="!recentMedicalRecords.length" class="empty-copy">
                  No medical records available yet.
                </p>
              </div>
            </section>
          </div>
        </main>

        <aside class="dashboard-side">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Quick access</p>
                <h2>Actions</h2>
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

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Updates</p>
                <h2>Recent</h2>
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

          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="section-label">Profile</p>
                <h2>Patient details</h2>
              </div>
            </div>

            <div class="stack-list">
              <article class="stack-row">
                <div class="stack-main">
                  <h3>Email</h3>
                  <p>{{ patient?.email || '-' }}</p>
                </div>
              </article>
              <article class="stack-row">
                <div class="stack-main">
                  <h3>Phone</h3>
                  <p>{{ patient?.phone || '-' }}</p>
                </div>
              </article>
              <article class="stack-row">
                <div class="stack-main">
                  <h3>Address</h3>
                  <p>{{ patient?.home_address || '-' }}</p>
                </div>
              </article>
            </div>
          </section>
        </aside>
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
.metrics-panel,
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.message-box {
  color: #6b7280;
  padding: 1rem 1.1rem;
}

.error-box {
  color: var(--cure-danger);
}

.hero-panel,
.metrics-panel,
.dashboard-grid,
.dashboard-main,
.dashboard-side,
.main-bottom-grid,
.appointment-meta,
.actions-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel {
  align-items: end;
  padding: 1.25rem;
}

.hero-copy {
  display: grid;
  gap: 0.35rem;
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
  letter-spacing: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.metric-item span,
.metric-item small,
.meta-item span,
.stack-main p,
.vital-row span,
.vital-row small,
.inline-link,
.action-card p,
.empty-copy {
  color: #6b7280;
}

.hero-actions,
.panel-head,
.panel-actions,
.stack-row,
.vital-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-actions,
.panel-actions {
  flex-wrap: wrap;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.primary-link {
  background: #111827;
  color: #ffffff;
}

.secondary-link {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
}

.metrics-panel,
.panel {
  padding: 1.2rem;
}

.metrics-panel {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.metric-item {
  display: grid;
  gap: 0.2rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.95rem;
}

.metric-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.metric-item strong,
.meta-item strong,
.stack-value,
.vital-row strong,
.action-card strong {
  color: #111827;
  font-weight: 700;
}

.metric-item strong {
  font-size: 1.2rem;
}

.panel-head {
  align-items: start;
}

.status-chip {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.4rem 0.7rem;
}

.appointment-meta {
  grid-template-columns: repeat(1, minmax(0, 1fr));
  margin-top: 1rem;
}

.meta-item,
.action-card {
  display: grid;
  gap: 0.2rem;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  background: #fafafa;
  padding: 0.95rem;
}

.panel-actions {
  margin-top: 1rem;
}

.stack-list,
.vitals-list {
  display: grid;
  margin-top: 0.9rem;
}

.stack-row,
.vital-row {
  border-top: 1px solid #f1f5f9;
  padding: 0.95rem 0;
}

.stack-row:first-child,
.vital-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.stack-row:last-child,
.vital-row:last-child {
  padding-bottom: 0;
}

.stack-main {
  min-width: 0;
}

.stack-main h3 {
  color: #111827;
  font-size: 0.97rem;
  font-weight: 600;
}

.stack-main p {
  margin-top: 0.25rem;
}

.stack-value {
  flex: 0 0 auto;
  font-size: 0.88rem;
}

.vital-row span,
.vital-row small {
  display: block;
}

.vital-row small {
  margin-top: 0.2rem;
}

.actions-grid {
  grid-template-columns: repeat(1, minmax(0, 1fr));
  margin-top: 0.9rem;
}

.action-card {
  color: inherit;
}

@media (min-width: 760px) {
  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .metrics-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-item {
    border-top: 0;
    border-left: 1px solid #f1f5f9;
    padding-top: 0;
    padding-left: 1rem;
  }

  .metric-item:nth-child(odd) {
    border-left: 0;
    padding-left: 0;
  }

  .appointment-meta,
  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 980px) {
  .metrics-panel {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .metric-item,
  .metric-item:nth-child(odd) {
    border-left: 1px solid #f1f5f9;
    padding-left: 1rem;
  }

  .metric-item:first-child {
    border-left: 0;
    padding-left: 0;
  }

  .dashboard-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.95fr);
    align-items: start;
  }

  .main-bottom-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
  }

  .appointment-meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero-actions > *,
  .panel-actions > * {
    width: 100%;
  }

  .panel-head,
  .stack-row,
  .vital-row {
    align-items: start;
    flex-direction: column;
  }
}
</style>
