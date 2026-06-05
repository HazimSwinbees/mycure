<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getCurrentPatientMedicalRecords } from '../../services/medicalRecordApi'

const visits = ref([])
const isLoading = ref(true)
const loadError = ref('')

const summaryItems = computed(() => [
  { label: 'Total visits', value: visits.value.length },
  {
    label: 'With prescription',
    value: visits.value.filter((item) => item.prescriptions.length > 0).length,
  },
  {
    label: 'Follow-up planned',
    value: visits.value.filter((item) => item.followUp && item.followUp !== '-').length,
  },
])

const loadVisits = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    visits.value = await getCurrentPatientMedicalRecords()
  } catch (error) {
    loadError.value = error.message || 'Unable to load medical visits right now.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadVisits)
</script>

<template>
  <section class="visits-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Medical visits</p>
        <h1>Review your visit history</h1>
        <p class="muted-copy">
          See completed clinic visits, diagnosis notes, follow-up plans, and any medication issued
          during the consultation.
        </p>
      </div>
    </section>

    <section class="summary-grid" aria-label="Visit overview">
      <article v-for="item in summaryItems" :key="item.label" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section v-if="isLoading" class="state-panel">
      <p class="section-label">Medical visits</p>
      <h2>Loading visit history</h2>
      <p class="muted-copy">Fetching completed visit records from the clinic database.</p>
    </section>

    <section v-else-if="loadError" class="state-panel">
      <p class="section-label">Medical visits</p>
      <h2>Unable to load visit history</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <section v-else-if="!visits.length" class="state-panel">
      <p class="section-label">Medical visits</p>
      <h2>No visit records yet</h2>
      <p class="muted-copy">Your completed clinic visits will appear here after consultation.</p>
    </section>

    <section v-else class="visits-grid" aria-label="Medical visit list">
      <article v-for="visit in visits" :key="visit.id" class="visit-card">
        <div class="card-top">
          <span class="visit-date">Visit {{ visit.visitDate }}</span>
          <span class="time-chip">{{ visit.appointmentTime }}</span>
        </div>

        <div class="card-main">
          <div class="title-block">
            <h2>{{ visit.serviceName }}</h2>
            <span class="count-pill">
              {{ visit.prescriptions.length }} prescription{{ visit.prescriptions.length === 1 ? '' : 's' }}
            </span>
          </div>

          <div class="details-grid">
            <article class="detail-item">
              <span>Diagnosis</span>
              <strong>{{ visit.diagnosis }}</strong>
            </article>
            <article class="detail-item">
              <span>Chief complaint</span>
              <strong>{{ visit.chiefComplaint }}</strong>
            </article>
            <article class="detail-item detail-wide">
              <span>Clinical note</span>
              <strong>{{ visit.clinicalNote }}</strong>
            </article>
            <article class="detail-item detail-wide">
              <span>Follow-up</span>
              <strong>{{ visit.followUp }}</strong>
            </article>
          </div>
        </div>

        <div class="card-bottom">
          <span class="prescription-copy">
            {{ visit.prescriptions.length ? 'Medication issued during this visit.' : 'No medication issued for this visit.' }}
          </span>
          <RouterLink class="details-button" :to="{ name: 'medical-visit-details', params: { id: visit.id } }">
            View details
          </RouterLink>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.visits-page,
.visits-grid,
.visit-card,
.card-main {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.summary-card,
.state-panel,
.visit-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.hero-panel,
.state-panel,
.visit-card {
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
.title-block h2 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.detail-item span,
.summary-card span,
.prescription-copy,
.visit-date {
  color: #6b7280;
}

.summary-grid {
  display: grid;
  gap: 1rem;
}

.summary-card {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
}

.summary-card strong {
  color: #111827;
  font-size: 1.55rem;
  font-weight: 700;
}

.visit-card {
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.visit-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.08);
  transform: translateY(-2px);
}

.card-top,
.card-bottom,
.title-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.time-chip,
.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.38rem 0.72rem;
}

.time-chip {
  background: #eef2ff;
  color: #4a56c9;
}

.count-pill {
  background: #f5f8ff;
  color: #3157b7;
}

.details-grid {
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

.card-bottom {
  border-top: 1px solid #e8eef9;
  padding-top: 1rem;
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

@media (min-width: 760px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-wide {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1100px) {
  .visits-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
