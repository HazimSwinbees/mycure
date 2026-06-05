<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  doctorAppointments,
  doctorDashboardNotes,
  doctorNotifications,
  doctorPatients,
  doctorPrescriptions,
} from '../../services/doctorPortalMock'

const metrics = computed(() => [
  { label: 'Today appointments', value: doctorAppointments.length, note: 'Clinic schedule' },
  {
    label: 'Pending requests',
    value: doctorAppointments.filter((item) => item.status === 'Pending').length,
    note: 'Need confirmation',
  },
  {
    label: 'Active prescriptions',
    value: doctorPrescriptions.filter((item) => item.status === 'Active').length,
    note: 'Current medication plans',
  },
  {
    label: 'Unread notices',
    value: doctorNotifications.filter((item) => item.status === 'Unread').length,
    note: 'Doctor portal updates',
  },
])

const currentQueue = computed(() => doctorAppointments.slice(0, 3))
const recentPatients = computed(() => doctorPatients.slice(0, 3))
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Doctor portal</p>
        <h1>Clinic overview</h1>
        <p class="muted-copy">
          Review today’s queue, patient activity, and clinic reminders from one place.
        </p>
      </div>
      <RouterLink class="primary-link" :to="{ name: 'admin-appointments' }">
        Open appointments
      </RouterLink>
    </section>

    <section class="metric-grid">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.note }}</small>
      </article>
    </section>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Queue</p>
            <h2>Today’s appointments</h2>
          </div>
          <RouterLink class="text-link" :to="{ name: 'admin-appointments' }">View all</RouterLink>
        </div>

        <div class="stack-list">
          <article v-for="item in currentQueue" :key="item.id" class="list-card">
            <div class="list-main">
              <strong>{{ item.patientName }}</strong>
              <span>{{ item.service }}</span>
            </div>
            <div class="list-meta">
              <small>{{ item.time }}</small>
              <span :class="['status-badge', item.status.toLowerCase().replaceAll(' ', '-')]">
                {{ item.status }}
              </span>
            </div>
          </article>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Patients</p>
            <h2>Recent patient records</h2>
          </div>
          <RouterLink class="text-link" :to="{ name: 'admin-patients' }">View all</RouterLink>
        </div>

        <div class="stack-list">
          <article v-for="patient in recentPatients" :key="patient.id" class="list-card">
            <div class="list-main">
              <strong>{{ patient.name }}</strong>
              <span>{{ patient.condition }}</span>
            </div>
            <div class="list-meta">
              <small>{{ patient.lastVisit }}</small>
            </div>
          </article>
        </div>
      </section>

      <section class="panel panel-wide">
        <div class="panel-head">
          <div>
            <p class="section-label">Clinic notes</p>
            <h2>Today’s reminders</h2>
          </div>
        </div>

        <div class="note-list">
          <article v-for="note in doctorDashboardNotes" :key="note" class="note-card">
            <p>{{ note }}</p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.doctor-page,
.metric-grid,
.content-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.metric-card,
.panel,
.list-card,
.note-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.panel,
.metric-card,
.note-card {
  padding: 1.25rem;
}

.hero-panel,
.panel-head,
.list-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.panel-head h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.metric-card span,
.metric-card small,
.list-main span,
.list-meta small,
.note-card p {
  color: #6b7280;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 10px;
  background: #4a56c9;
  color: #ffffff;
  font-weight: 600;
  padding: 0.7rem 1rem;
}

.metric-grid {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.metric-card {
  display: grid;
  gap: 0.35rem;
}

.metric-card strong {
  color: #111827;
  font-size: 1.6rem;
  font-weight: 700;
}

.panel {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.text-link {
  color: #4a56c9;
  font-weight: 600;
}

.stack-list,
.note-list {
  display: grid;
  gap: 0.75rem;
}

.list-card {
  padding: 1rem;
}

.list-main,
.list-meta {
  display: grid;
  gap: 0.2rem;
}

.list-main strong {
  color: #111827;
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

.status-badge.cancelled {
  background: #fff1f2;
  color: #be123c;
}

.note-card p {
  line-height: 1.6;
}

@media (min-width: 760px) {
  .metric-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-wide {
    grid-column: 1 / -1;
  }
}
</style>
