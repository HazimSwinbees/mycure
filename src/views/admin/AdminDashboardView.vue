<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getAvailabilitySettings } from '../../services/availabilityApi'
import { getDoctorAppointments } from '../../services/appointmentApi'
import { getCurrentDoctorProfile } from '../../services/doctorProfileApi'
import { getDoctorNotifications } from '../../services/notificationApi'

const doctorProfile = ref(null)
const appointments = ref([])
const notifications = ref([])
const availability = ref({ weeklySchedule: [], closures: [] })
const isLoading = ref(true)
const loadError = ref('')

const today = new Date()
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const todayWeekday = today.getDay()

const todayAppointments = computed(() =>
  appointments.value
    .filter((item) => item.rawDate === todayKey)
    .sort((first, second) => String(first.time || '').localeCompare(String(second.time || ''))),
)

const todayStatusLabel = computed(() => {
  if (!todayAppointments.value.length) {
    return 'No bookings today'
  }

  return `${todayAppointments.value.length} appointment${todayAppointments.value.length === 1 ? '' : 's'} today`
})

const quickActions = [
  { label: 'Appointment queue', note: 'Review bookings', to: { name: 'admin-appointments' } },
  { label: 'Visit records', note: 'Open clinical notes', to: { name: 'admin-medical-records' } },
  { label: 'Availability', note: 'Manage clinic hours', to: { name: 'admin-availability' } },
  { label: 'Notifications', note: 'Check updates', to: { name: 'admin-notifications' } },
]

const pendingAppointments = computed(() =>
  appointments.value
    .filter((item) => item.status === 'Pending')
    .sort((first, second) => {
      const firstKey = `${first.rawDate || ''} ${first.time || ''}`
      const secondKey = `${second.rawDate || ''} ${second.time || ''}`
      return firstKey.localeCompare(secondKey)
    })
    .slice(0, 2),
)

const todayScheduleSummary = computed(() => {
  const closure = availability.value.closures.find((item) => item.closureDate === todayKey)

  if (closure?.isFullDay) {
    return {
      title: 'Clinic closed today',
      detail: closure.displayDate,
      note: 'The clinic is marked as closed for the full day.',
    }
  }

  const schedule = availability.value.weeklySchedule.find((item) => item.weekday === todayWeekday)

  if (!schedule || !schedule.isOpen) {
    return {
      title: 'Clinic closed today',
      detail: 'No doctor slots available',
      note: 'Today is marked unavailable in the weekly schedule.',
    }
  }

  const slotCount = schedule.availableSlots?.length || 0
  const closureNote =
    closure?.startTime && closure?.endTime
      ? `Partial closure from ${closure.startTime} to ${closure.endTime}.`
      : 'No clinic closure has been added for today.'

  return {
    title: schedule.dayName,
    detail: `${schedule.startTime} - ${schedule.endTime}`,
    note: `${slotCount} slot${slotCount === 1 ? '' : 's'} configured. ${closureNote}`,
  }
})

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [profileData, appointmentData, notificationData, availabilityData] =
      await Promise.all([
        getCurrentDoctorProfile(),
        getDoctorAppointments(),
        getDoctorNotifications(),
        getAvailabilitySettings(),
      ])

    doctorProfile.value = profileData
    appointments.value = appointmentData
    notifications.value = notificationData
    availability.value = availabilityData
  } catch (error) {
    loadError.value = error.message || 'Unable to load dashboard information.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="doctor-page">
    <section v-if="loadError" class="panel state-panel">
      <p class="section-label">Doctor portal</p>
      <h2>Unable to load dashboard</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <section v-else-if="isLoading" class="panel state-panel">
      <p class="section-label">Doctor portal</p>
      <h2>Loading dashboard</h2>
      <p class="muted-copy">Fetching appointments, records, and clinic updates.</p>
    </section>

    <template v-else>
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="section-label">Doctor portal</p>
          <h1>Welcome back, {{ doctorProfile?.fullName || 'Doctor' }}</h1>
          <p class="muted-copy">Your clinic work for today, organised in one place.</p>
        </div>
      </section>

      <section class="panel appointments-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Today</p>
            <h2>Today’s appointments</h2>
          </div>
          <span class="panel-chip">{{ todayStatusLabel }}</span>
        </div>

        <div v-if="todayAppointments.length" class="appointment-list">
          <article v-for="item in todayAppointments.slice(0, 4)" :key="item.id" class="appointment-card">
            <div class="appointment-main">
              <strong>{{ item.patientName }}</strong>
              <p>{{ item.service }}</p>
            </div>
            <div class="appointment-side">
              <div class="appointment-meta">
                <span>Time</span>
                <strong>{{ item.time }}</strong>
              </div>
              <span :class="['status-badge', item.status.toLowerCase().replaceAll(' ', '-')]">
                {{ item.status }}
              </span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <p>No appointments are scheduled for today.</p>
        </div>
      </section>

      <div class="dashboard-row">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Shortcuts</p>
              <h2>Quick actions</h2>
            </div>
          </div>

          <div class="actions-grid actions-grid-refined">
            <RouterLink v-for="action in quickActions" :key="action.label" class="action-card action-card-refined" :to="action.to">
              <div class="action-copy">
                <strong>{{ action.label }}</strong>
                <span>{{ action.note }}</span>
              </div>
              <span class="action-arrow" aria-hidden="true">›</span>
            </RouterLink>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Attention</p>
              <h2>Pending appointments</h2>
            </div>
            <RouterLink class="text-link" :to="{ name: 'admin-appointments' }">View all</RouterLink>
          </div>

          <div class="pending-list">
            <article v-for="item in pendingAppointments" :key="item.id" class="pending-card">
              <div class="pending-copy">
                <strong>{{ item.patientName }}</strong>
                <span>{{ item.service }}</span>
              </div>
              <div class="pending-side">
                <small>{{ item.date }} · {{ item.time }}</small>
                <RouterLink class="details-link" :to="{ name: 'admin-appointment-details', params: { id: item.id } }">
                  View
                </RouterLink>
              </div>
            </article>

            <div v-if="!pendingAppointments.length" class="empty-state">
              <p>No pending appointments right now.</p>
            </div>
          </div>
        </section>
      </div>

      <section class="panel clinic-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Clinic summary</p>
            <h2>Today’s clinic schedule</h2>
          </div>
          <RouterLink class="text-link" :to="{ name: 'admin-availability' }">Manage availability</RouterLink>
        </div>

        <article class="clinic-card">
          <div class="clinic-copy">
            <strong>{{ todayScheduleSummary.title }}</strong>
            <p>{{ todayScheduleSummary.detail }}</p>
          </div>
          <span class="clinic-note">{{ todayScheduleSummary.note }}</span>
        </article>
      </section>
    </template>
  </section>
</template>

<style scoped>
.doctor-page,
.dashboard-row,
.actions-grid,
.pending-list,
.appointment-list {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.appointment-card,
.action-card,
.pending-card,
.clinic-card {
  border: 1px solid #e3ebf5;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.hero-panel,
.panel {
  padding: 1.35rem;
}

.hero-copy,
.appointment-main,
.appointment-meta,
.pending-copy,
.clinic-copy,
.action-copy {
  display: grid;
  gap: 0.35rem;
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
.appointment-main strong,
.action-card strong,
.pending-copy strong,
.clinic-copy strong {
  color: #14213d;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.85rem, 4vw, 2.55rem);
  line-height: 1.05;
  margin: 0;
}

.muted-copy,
.appointment-main p,
.appointment-meta span,
.action-card span,
.pending-copy span,
.clinic-copy p,
.clinic-note,
.empty-state p {
  color: #607086;
}

.panel-head,
.appointment-card,
.appointment-side,
.pending-card,
.clinic-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-panel {
  background:
    radial-gradient(circle at top right, rgba(74, 86, 201, 0.14), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.panel {
  display: grid;
  gap: 1rem;
}

.state-panel {
  padding: 1.25rem;
}

.panel-chip,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 600;
}

.panel-chip {
  min-height: 36px;
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
  padding: 0.45rem 0.8rem;
  font-size: 0.84rem;
}

.appointment-card,
.action-card,
.pending-card,
.clinic-card {
  padding: 1rem 1.05rem;
  text-decoration: none;
}

.appointment-main p,
.clinic-copy p,
.empty-state p {
  margin: 0;
}

.appointment-side {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.appointment-meta {
  justify-items: end;
}

.status-badge {
  min-height: 30px;
  background: #eef2ff;
  color: #4a56c9;
  font-size: 0.78rem;
  padding: 0.25rem 0.7rem;
}

.status-badge.completed {
  background: #ecfdf3;
  color: #15803d;
}

.status-badge.cancelled,
.status-badge.rejected {
  background: #fff1f2;
  color: #be123c;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.actions-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-card,
.pending-card {
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.action-card:hover,
.pending-card:hover {
  border-color: #c9d8f2;
  box-shadow: 0 16px 30px rgba(49, 87, 183, 0.08);
  transform: translateY(-2px);
}

.actions-grid-refined {
  gap: 0.9rem;
}

.action-card-refined {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
  min-height: 5.5rem;
  background: linear-gradient(180deg, #ffffff 0%, #f6faff 100%);
}

.action-copy strong {
  font-size: 1rem;
}

.action-copy span {
  line-height: 1.5;
}

.action-arrow {
  color: #3157b7;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.pending-side {
  display: grid;
  justify-items: end;
  gap: 0.35rem;
}

.pending-side small {
  color: #607086;
}

.details-link {
  color: #3157b7;
  font-size: 0.88rem;
  font-weight: 600;
}

.text-link {
  color: #4a56c9;
  font-weight: 600;
}

.clinic-panel {
  gap: 1rem;
}

.clinic-card {
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%);
}

.clinic-note {
  max-width: 28rem;
  text-align: right;
  line-height: 1.55;
}

.empty-state {
  border: 1px dashed #d7e3fb;
  border-radius: 16px;
  background: #fbfdff;
  padding: 1rem;
}

@media (min-width: 960px) {
  .dashboard-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .panel-head,
  .appointment-card,
  .appointment-side,
  .pending-card,
  .clinic-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-card-refined {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .appointment-meta {
    justify-items: start;
  }

  .pending-side {
    justify-items: start;
  }

  .clinic-note {
    max-width: none;
    text-align: left;
  }
}
</style>
