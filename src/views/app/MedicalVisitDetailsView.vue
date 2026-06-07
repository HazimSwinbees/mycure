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

const getAppointmentStatusClass = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'completed':
      return 'status-badge status-completed'
    case 'confirmed':
      return 'status-badge status-confirmed'
    case 'pending':
      return 'status-badge status-pending'
    case 'cancelled':
      return 'status-badge status-cancelled'
    default:
      return 'status-badge'
  }
}
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
        <div class="hero-actions">
          <RouterLink class="text-link" :to="{ name: 'prescriptions' }">Back to visits</RouterLink>
        </div>
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

        <section class="panel accent-panel">
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
              <strong :class="getAppointmentStatusClass(record.appointmentStatus)">
                {{ record.appointmentStatus }}
              </strong>
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
  border: 1px solid #e3ebf5;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  padding: 1.3rem;
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

.hero-actions {
  display: grid;
  justify-items: end;
  gap: 0.8rem;
}

.hero-copy {
  gap: 0.4rem;
}

.section-label {
  color: #6f7d90;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2 {
  color: #14213d;
  font-weight: 700;
  margin: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.08;
  margin: 0;
}

.muted-copy,
.detail-item span,
.list-main span,
.list-meta small,
.empty-copy,
.instruction-copy {
  color: #607086;
}

.text-link {
  color: #4a56c9;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 600;
  width: fit-content;
}

.status-badge {
  border: 1px solid #d8e5fb;
  background: #f4f8ff;
  color: #3157b7;
  min-height: 34px;
  padding: 0.35rem 0.8rem;
}

.accent-panel {
  background: linear-gradient(180deg, #f9fbff 0%, #f3f7ff 100%);
}

.status-completed {
  border-color: #cfe7d6;
  background: #edf9f0;
  color: #20744a;
}

.status-confirmed {
  border-color: #cfe0fb;
  background: #eef4ff;
  color: #2f5fb7;
}

.status-pending {
  border-color: #f2dfb3;
  background: #fff7e4;
  color: #9a6700;
}

.status-cancelled {
  border-color: #f3cfd2;
  background: #fff0f1;
  color: #b42318;
}

.detail-grid {
  gap: 0.85rem;
}

.detail-item {
  display: grid;
  gap: 0.28rem;
  border: 1px solid #ebf0f6;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  padding: 0.95rem 1rem;
}

.detail-item strong,
.list-main strong {
  color: #14213d;
  font-weight: 600;
}

.stack-list {
  gap: 0.95rem;
}

.list-card {
  border-radius: 16px;
  background: #ffffff;
  padding: 1rem 1.05rem;
  box-shadow: 0 12px 26px rgba(49, 87, 183, 0.05);
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

@media (max-width: 760px) {
  .hero-panel,
  .panel-head,
  .list-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions,
  .list-meta {
    justify-items: start;
  }
}
</style>
