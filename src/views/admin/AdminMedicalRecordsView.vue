<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getDoctorMedicalRecords } from '../../services/medicalRecordApi'

const records = ref([])
const isLoading = ref(true)
const loadError = ref('')

const hasRecords = computed(() => records.value.length > 0)

const loadRecords = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    records.value = await getDoctorMedicalRecords()
  } catch (error) {
    loadError.value = error.message || 'Unable to load visit records.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRecords)
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Visit records</p>
        <h1>Patient visit records</h1>
        <p class="muted-copy">Review completed consultation records and open the full visit note.</p>
      </div>
      <RouterLink class="primary-link" :to="{ name: 'admin-appointments' }">Choose appointment</RouterLink>
    </section>

    <section v-if="isLoading" class="entry-card">
      <p class="section-label">Visit records</p>
      <h2>Loading records</h2>
    </section>

    <section v-else-if="loadError" class="entry-card">
      <p class="section-label">Visit records</p>
      <h2>Unable to load records</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <section v-else-if="!hasRecords" class="entry-card">
      <p class="section-label">Visit records</p>
      <h2>No records yet</h2>
      <p class="muted-copy">Create a record from a confirmed appointment after the consultation is completed.</p>
    </section>

    <section v-else class="card-grid">
      <article v-for="record in records" :key="record.id" class="entry-card">
        <div class="card-main">
          <div>
            <p class="entry-title">{{ record.patientName }}</p>
            <h2>{{ record.serviceName }}</h2>
          </div>
          <span class="time-chip">{{ record.appointmentTime }}</span>
        </div>

        <div class="detail-grid">
          <article class="detail-item"><span>Visit date</span><strong>{{ record.visitDate }}</strong></article>
          <article class="detail-item"><span>Diagnosis</span><strong>{{ record.diagnosis }}</strong></article>
          <article class="detail-item"><span>Prescriptions</span><strong>{{ record.prescriptionCount }}</strong></article>
          <article class="detail-item detail-wide"><span>Clinical note</span><strong>{{ record.clinicalNote }}</strong></article>
        </div>

        <div class="card-actions">
          <RouterLink class="details-button" :to="{ name: 'admin-medical-record-details', params: { id: record.id } }">
            View record
          </RouterLink>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.doctor-page,
.card-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.entry-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  padding: 1.25rem;
}

.hero-panel,
.card-actions,
.card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-copy,
.card-main > div {
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
.card-main h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.detail-item span,
.entry-title {
  color: #6b7280;
}

.entry-card {
  display: grid;
  gap: 1rem;
}

.entry-title {
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.time-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4a56c9;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
}

.detail-grid {
  display: grid;
  gap: 0.85rem;
}

.detail-item {
  display: grid;
  gap: 0.28rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.detail-item strong {
  color: #111827;
  font-weight: 600;
}

.card-actions {
  border-top: 1px solid #e8eef9;
  padding-top: 1rem;
}

.primary-link,
.details-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 1rem;
}

.primary-link {
  background: #4a56c9;
  color: #fff;
}

.details-button {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
}

@media (min-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-wide {
    grid-column: 1 / -1;
  }
}
</style>
