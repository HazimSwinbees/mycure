<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getCurrentPatientMedicalRecordById } from '../../services/medicalRecordApi'

const route = useRoute()
const record = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const loadRecord = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    record.value = await getCurrentPatientMedicalRecordById(route.params.id)
  } catch (error) {
    loadError.value = error.message || 'Unable to load the medical visit.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRecord)
</script>

<template>
  <section class="visit-page">
    <section v-if="isLoading" class="panel">
      <p class="section-label">Medical visit</p>
      <h2>Loading visit</h2>
    </section>

    <section v-else-if="loadError" class="panel">
      <p class="section-label">Medical visit</p>
      <h2>Unable to load visit</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <template v-else-if="record">
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="section-label">Medical visit</p>
          <h1>{{ record.serviceName }}</h1>
          <p class="muted-copy">{{ record.visitDate }} - {{ record.appointmentTime }}</p>
        </div>
        <RouterLink class="text-link" :to="{ name: 'prescriptions' }">Back to visits</RouterLink>
      </section>

      <div class="content-grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Clinical summary</p>
              <h2>Visit record</h2>
            </div>
          </div>

          <div class="detail-grid">
            <article class="detail-item">
              <span>Chief complaint</span>
              <strong>{{ record.chiefComplaint }}</strong>
            </article>
            <article class="detail-item">
              <span>Diagnosis</span>
              <strong>{{ record.diagnosis }}</strong>
            </article>
            <article class="detail-item detail-wide">
              <span>Clinical note</span>
              <strong>{{ record.clinicalNote }}</strong>
            </article>
            <article class="detail-item detail-wide">
              <span>Follow-up</span>
              <strong>{{ record.followUp }}</strong>
            </article>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Visit context</p>
              <h2>Appointment details</h2>
            </div>
          </div>

          <div class="detail-grid">
            <article class="detail-item">
              <span>Service</span>
              <strong>{{ record.serviceName }}</strong>
            </article>
            <article class="detail-item">
              <span>Time</span>
              <strong>{{ record.appointmentTime }}</strong>
            </article>
            <article class="detail-item">
              <span>Visit date</span>
              <strong>{{ record.visitDate }}</strong>
            </article>
            <article class="detail-item">
              <span>Appointment status</span>
              <strong>{{ record.appointmentStatus }}</strong>
            </article>
          </div>
        </section>

        <section class="panel panel-wide">
          <div class="panel-head">
            <div>
              <p class="section-label">Prescriptions</p>
              <h2>Issued medication</h2>
            </div>
          </div>

          <div v-if="record.prescriptions.length" class="stack-list">
            <article v-for="item in record.prescriptions" :key="item.id" class="list-card">
              <div class="list-top">
                <div class="list-main">
                  <strong>{{ item.medicineName }} {{ item.strength }}</strong>
                  <span>{{ item.dosage }} - {{ item.frequency }} - {{ item.duration }}</span>
                </div>
                <div class="list-meta">
                  <small>{{ item.issuedDate }}</small>
                  <small>{{ item.status }}</small>
                </div>
              </div>
              <p class="instruction-copy">{{ item.instructions }}</p>
            </article>
          </div>

          <p v-else class="empty-copy">No prescription was issued for this visit.</p>
        </section>
      </div>
    </template>

    <section v-else class="panel">
      <p class="section-label">Medical visit</p>
      <h2>Visit not found</h2>
    </section>
  </section>
</template>

<style scoped>
.visit-page,
.content-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.list-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  padding: 1.25rem;
}

.hero-panel,
.panel-head,
.list-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-copy,
.panel,
.detail-grid,
.stack-list,
.list-main,
.list-meta,
.list-card {
  display: grid;
  gap: 1rem;
}

.hero-copy {
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
.detail-item span,
.list-main span,
.list-meta small,
.empty-copy,
.instruction-copy {
  color: #6b7280;
}

.text-link {
  color: #4a56c9;
  font-weight: 600;
}

.detail-grid {
  gap: 0.85rem;
}

.detail-item {
  display: grid;
  gap: 0.28rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.detail-item strong,
.list-main strong {
  color: #111827;
  font-weight: 600;
}

.stack-list {
  gap: 0.85rem;
}

.list-card {
  border-radius: 12px;
  background: #fbfcfe;
}

.list-main,
.list-meta {
  gap: 0.2rem;
}

.list-meta {
  justify-items: end;
}

.instruction-copy,
.empty-copy {
  margin: 0;
}

.instruction-copy {
  line-height: 1.6;
}

@media (min-width: 900px) {
  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-wide {
    grid-column: 1 / -1;
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-wide {
    grid-column: 1 / -1;
  }
}
</style>
