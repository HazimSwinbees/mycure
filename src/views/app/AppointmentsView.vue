<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getCurrentPatientAppointments } from '../../services/appointmentApi'

const appointments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const activeStatus = ref('All')

const statusTabs = ['All', 'Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed']

const filteredAppointments = computed(() => {
  if (activeStatus.value === 'All') {
    return appointments.value
  }

  return appointments.value.filter((item) => item.status === activeStatus.value)
})

const getStatusCount = (status) => {
  if (status === 'All') {
    return appointments.value.length
  }

  return appointments.value.filter((item) => item.status === status).length
}

const loadAppointments = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    appointments.value = await getCurrentPatientAppointments()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load appointments right now.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAppointments)
</script>

<template>
  <section class="appointments-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Appointments</p>
        <h1>Manage your visits</h1>
        <p class="muted-copy">
          Review upcoming bookings, track each appointment status, and open any card for full
          details.
        </p>
      </div>

      <div class="hero-actions">
        <RouterLink class="primary-link" :to="{ name: 'booking' }">Book appointment</RouterLink>
      </div>
    </section>

    <section class="tabs-panel">
      <button
        v-for="status in statusTabs"
        :key="status"
        :class="['status-tab', { active: activeStatus === status }]"
        type="button"
        @click="activeStatus = status"
      >
        <span>{{ status }}</span>
        <strong>{{ getStatusCount(status) }}</strong>
      </button>
    </section>

    <section class="cards-section">
      <div v-if="isLoading" class="state-panel">
        <p>Loading appointments.</p>
      </div>

      <div v-else-if="errorMessage" class="state-panel">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="!filteredAppointments.length" class="state-panel">
        <p>No appointments found for this status.</p>
      </div>

      <div v-else class="appointments-grid">
        <RouterLink
          v-for="appointment in filteredAppointments"
          :key="appointment.id"
          class="appointment-card"
          :to="{ name: 'appointment-details', params: { id: appointment.id } }"
        >
          <div class="card-top">
            <span :class="['status-chip', appointment.status.toLowerCase()]">
              {{ appointment.status }}
            </span>
            <small>{{ appointment.date }}</small>
          </div>

          <div class="card-main">
            <h3>{{ appointment.service }}</h3>
            <p>{{ appointment.doctor }}</p>
          </div>

          <div class="card-meta">
            <article>
              <span>Time</span>
              <strong>{{ appointment.time }}</strong>
            </article>
            <article>
              <span>Location</span>
              <strong>{{ appointment.location }}</strong>
            </article>
          </div>

          <div class="card-footer">
            <span>Open details</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </section>
</template>

<style scoped>
.appointments-page {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.tabs-panel {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.hero-panel {
  padding: 1.25rem;
}

.hero-panel {
  display: grid;
  gap: 1rem;
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
.panel-head h2,
.appointment-card h3 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.appointment-card p,
.appointment-card small,
.card-meta span,
.state-panel p,
.card-footer span {
  color: #6b7280;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.primary-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #111827;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.tabs-panel {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;
  overflow-x: auto;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 0.25rem;
}

.status-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1 0 auto;
  gap: 0.45rem;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #97a3b6;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.95rem 1rem 0.8rem;
  text-align: center;
  white-space: nowrap;
  transition:
    border-color 180ms ease,
    color 180ms ease;
}

.status-tab strong {
  color: inherit;
  font-size: 0.82rem;
  font-weight: 700;
}

.status-tab:hover {
  color: #6f7ea4;
}

.status-tab.active {
  border-color: #5b61ff;
  color: #5b61ff;
}

.status-tab.active strong {
  color: #5b61ff;
}

.state-panel {
  padding-top: 0.25rem;
}

.appointments-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.cards-section {
  display: grid;
  gap: 0.5rem;
}

.appointment-card {
  display: grid;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 1rem;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.appointment-card:hover {
  border-color: #d6def5;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
  transform: translateY(-2px);
}

.card-top,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-main {
  display: grid;
  gap: 0.25rem;
}

.card-main h3 {
  font-size: 1.05rem;
  line-height: 1.2;
}

.card-meta {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.card-meta article {
  display: grid;
  gap: 0.18rem;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  background: #fafbff;
  padding: 0.8rem;
}

.card-meta strong {
  color: #111827;
  font-size: 0.94rem;
  font-weight: 600;
}

.card-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 0.9rem;
}

.status-chip {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.38rem 0.72rem;
}

.status-chip.pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-chip.confirmed {
  background: #eef2ff;
  color: #3f4fb3;
}

.status-chip.cancelled {
  background: #fff1f2;
  color: #be123c;
}

.status-chip.rejected {
  background: #fff1f2;
  color: #be123c;
}

.status-chip.completed {
  background: #ecfdf3;
  color: #067647;
}

@media (min-width: 760px) {
  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .appointments-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1120px) {
  .appointments-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
