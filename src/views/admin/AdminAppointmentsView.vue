<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getDoctorAppointments } from '../../services/appointmentApi'

const activeStatus = ref('Upcoming')
const statuses = ['Upcoming', 'All', 'Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed']
const appointments = ref([])
const isLoading = ref(true)
const loadError = ref('')

const isUpcomingAppointment = (appointment) => {
  if (!appointment?.rawDate) return false
  if (['Cancelled', 'Completed', 'Rejected'].includes(appointment.status)) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(appointment.rawDate)
  if (Number.isNaN(target.getTime())) return false
  target.setHours(0, 0, 0, 0)

  return target.getTime() >= today.getTime()
}

const filteredAppointments = computed(() => {
  if (activeStatus.value === 'Upcoming') {
    return appointments.value.filter(isUpcomingAppointment)
  }

  return activeStatus.value === 'All'
    ? appointments.value
    : appointments.value.filter((item) => item.status === activeStatus.value)
})

const usesGroupedLayout = computed(() => ['Upcoming', 'All'].includes(activeStatus.value))

const formatDateLabel = (value) => {
  if (!value) {
    return { title: 'Unknown date', subtitle: '' }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { title: value, subtitle: '' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const fullDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  const shortDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  if (target.getTime() === today.getTime()) {
    return { title: 'Today', subtitle: shortDate }
  }

  if (target.getTime() === tomorrow.getTime()) {
    return { title: 'Tomorrow', subtitle: shortDate }
  }

  return { title: fullDate, subtitle: '' }
}

const groupedAppointments = computed(() => {
  const groups = new Map()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const formatIsoDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  groups.set(formatIsoDate(today), [])
  groups.set(formatIsoDate(tomorrow), [])

  for (const appointment of filteredAppointments.value) {
    const key = appointment.rawDate || appointment.date || 'unknown'

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key).push(appointment)
  }

  return [...groups.entries()]
    .map(([dateKey, items]) => ({
      dateKey,
      ...formatDateLabel(dateKey),
      items,
    }))
    .sort((a, b) => {
      if (a.dateKey === 'unknown') return 1
      if (b.dateKey === 'unknown') return -1

      const first = new Date(a.dateKey)
      const second = new Date(b.dateKey)

      if (Number.isNaN(first.getTime())) return 1
      if (Number.isNaN(second.getTime())) return -1

      return first.getTime() - second.getTime()
    })
})

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    appointments.value = await getDoctorAppointments()
  } catch (error) {
    loadError.value = error.message || 'Unable to load appointments.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Appointments</p>
        <h1>Clinic appointment queue</h1>
        <p class="muted-copy">
          Review pending, confirmed, rejected, completed, and cancelled bookings in one structured view.
        </p>
      </div>

    </section>

    <section class="tabs-panel" aria-label="Appointment status">
      <div class="tabs-row">
        <button
          v-for="status in statuses"
          :key="status"
          class="tab-button"
          :class="{ 'is-active': activeStatus === status }"
          type="button"
          @click="activeStatus = status"
        >
          {{ status }}
        </button>
      </div>
    </section>

    <section v-if="isLoading" class="entry-card state-card">
      <p class="section-label">Appointments</p>
      <h2>Loading appointments</h2>
      <p class="muted-copy">Fetching clinic bookings from Supabase.</p>
    </section>

    <section v-else-if="loadError" class="entry-card state-card">
      <p class="section-label">Appointments</p>
      <h2>Unable to load appointments</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <section v-else-if="!filteredAppointments.length" class="entry-card state-card">
      <p class="section-label">Appointments</p>
      <h2>No appointments found</h2>
      <p class="muted-copy">
        {{ activeStatus === 'Upcoming' ? 'There is no upcoming appointment.' : 'There is no appointment for the selected status.' }}
      </p>
    </section>

    <div v-else-if="usesGroupedLayout" class="grouped-lists">
      <section
        v-for="group in groupedAppointments"
        :key="group.dateKey"
        class="date-group"
      >
        <div class="date-head">
          <div class="date-copy">
            <h2>{{ group.title }}</h2>
            <p v-if="group.subtitle" class="muted-copy">{{ group.subtitle }}</p>
          </div>
        </div>

        <section class="list-shell">
          <div class="list-head">
            <span>Patient</span>
            <span>Service</span>
            <span>Date</span>
            <span>Time</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          <div v-if="group.items.length" class="list-body">
            <article v-for="appointment in group.items" :key="appointment.id" class="list-row">
              <div class="list-cell list-patient">
                <strong>{{ appointment.patientName || 'Patient' }}</strong>
                <small>{{ appointment.patientAge ?? '-' }} years</small>
              </div>
              <div class="list-cell">
                <strong>{{ appointment.service }}</strong>
                <small>{{ appointment.notes || '-' }}</small>
              </div>
              <div class="list-cell">
                <strong>{{ appointment.date }}</strong>
              </div>
              <div class="list-cell">
                <strong>{{ appointment.time }}</strong>
              </div>
              <div class="list-cell">
                <span :class="['status-badge', appointment.status.toLowerCase()]">
                  {{ appointment.status }}
                </span>
              </div>
              <div class="list-cell list-action">
                <RouterLink class="details-button" :to="{ name: 'admin-appointment-details', params: { id: appointment.id } }">
                  View details
                </RouterLink>
              </div>
            </article>
          </div>

          <div v-else class="empty-group">There is no appointment.</div>
        </section>
      </section>
    </div>

    <section v-else class="list-shell">
      <div class="list-head">
        <span>Patient</span>
        <span>Service</span>
        <span>Date</span>
        <span>Time</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      <div class="list-body">
        <article v-for="appointment in filteredAppointments" :key="appointment.id" class="list-row">
          <div class="list-cell list-patient">
            <strong>{{ appointment.patientName || 'Patient' }}</strong>
            <small>{{ appointment.patientAge ?? '-' }} years</small>
          </div>
          <div class="list-cell">
            <strong>{{ appointment.service }}</strong>
            <small>{{ appointment.notes || '-' }}</small>
          </div>
          <div class="list-cell">
            <strong>{{ appointment.date }}</strong>
          </div>
          <div class="list-cell">
            <strong>{{ appointment.time }}</strong>
          </div>
          <div class="list-cell">
            <span :class="['status-badge', appointment.status.toLowerCase()]">
              {{ appointment.status }}
            </span>
          </div>
          <div class="list-cell list-action">
            <RouterLink class="details-button" :to="{ name: 'admin-appointment-details', params: { id: appointment.id } }">
              View details
            </RouterLink>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.doctor-page,
.list-shell,
.grouped-lists,
.date-group {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.tabs-panel,
.list-shell {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.tabs-panel,
.list-shell {
  padding: 1.25rem;
}

.hero-copy {
  display: grid;
  gap: 0.35rem;
}

.hero-panel {
  position: relative;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.card-main h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.list-cell small,
.list-head {
  color: #6b7280;
}

.tabs-row {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
}

.tab-button {
  position: relative;
  border: 0;
  background: transparent;
  color: #8a8f98;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0 0 0.85rem;
  white-space: nowrap;
}

.tab-button::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: transparent;
}

.tab-button.is-active {
  color: #4a56c9;
}

.tab-button.is-active::after {
  background: #5b61ff;
}

.state-card {
  padding: 1.25rem;
}

.date-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.date-copy {
  display: grid;
  gap: 0.2rem;
}

.date-copy h2 {
  color: #111827;
  font-size: 1.2rem;
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4a56c9;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
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

.details-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 1px solid #d7e3fb;
  border-radius: 10px;
  background: #f5f8ff;
  color: #3157b7;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 1rem;
}

.list-shell {
  padding-top: 0.95rem;
}

.list-head,
.list-row {
  display: grid;
  grid-template-columns: 1.2fr 1.3fr 0.9fr 0.7fr 0.8fr 0.9fr;
  gap: 1rem;
  align-items: center;
}

.list-head {
  padding: 0 0.15rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
}

.list-body {
  display: grid;
  gap: 0.75rem;
}

.empty-group {
  color: #6b7280;
  font-size: 0.95rem;
  padding: 0.5rem 0.15rem 0;
}

.list-row {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 0.95rem 1rem;
}

.list-cell {
  display: grid;
  gap: 0.18rem;
}

.list-cell strong {
  color: #111827;
  font-weight: 600;
}

.list-action {
  justify-items: end;
}

@media (max-width: 980px) {
  .list-head {
    display: none;
  }

  .list-row {
    grid-template-columns: 1fr;
  }

  .list-action {
    justify-items: start;
  }
}
</style>
