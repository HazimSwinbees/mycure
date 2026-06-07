<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getCurrentPatientMedicalRecords } from '../../services/medicalRecordApi'

const visits = ref([])
const isLoading = ref(true)
const loadError = ref('')
const filters = reactive({
  search: '',
})

const filteredVisits = computed(() => {
  const keyword = filters.search.trim().toLowerCase()

  if (!keyword) {
    return visits.value
  }

  return visits.value.filter((visit) => {
    const searchableFields = [
      visit.serviceName,
      visit.visitDate,
      visit.diagnosis,
      visit.chiefComplaint,
      visit.clinicalNote,
      visit.followUp,
    ]

    return searchableFields.some((value) => String(value || '').toLowerCase().includes(keyword))
  })
})

const resultLabel = computed(() => {
  const count = filteredVisits.value.length
  return `${count} visit${count === 1 ? '' : 's'}`
})

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
          See completed clinic visits, diagnosis notes, follow-up plans, and consultation records
          in one searchable list.
        </p>
      </div>
    </section>

    <section class="filters-panel">
      <div class="toolbar-copy">
        <p class="section-label">Find a visit</p>
        <p class="toolbar-note">Search by service, diagnosis, complaint, notes, follow-up, or date.</p>
      </div>
      <label class="search-field">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input
          v-model.trim="filters.search"
          type="search"
          placeholder="Search medical visits"
          aria-label="Search medical visits"
        />
      </label>
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

    <section v-else-if="!filteredVisits.length" class="state-panel">
      <p class="section-label">Medical visits</p>
      <h2>No matching visit found</h2>
      <p class="muted-copy">Try changing your search term to find a visit.</p>
    </section>

    <section v-else class="list-shell" aria-label="Medical visit list">
      <div class="list-intro">
        <div>
          <p class="section-label">Visit list</p>
          <h2>Your medical visits</h2>
        </div>
        <p class="list-count">{{ resultLabel }}</p>
      </div>
      <div class="list-body">
        <article v-for="visit in filteredVisits" :key="visit.id" class="list-row">
          <div class="visit-main">
            <div class="visit-date">
              <strong>{{ visit.visitDate }}</strong>
              <small>{{ visit.appointmentTime }}</small>
            </div>
            <div class="visit-summary">
              <div class="summary-topline">
                <strong>{{ visit.serviceName }}</strong>
                <span class="detail-chip">
                  {{
                    visit.prescriptions.length
                      ? `${visit.prescriptions.length} prescription${visit.prescriptions.length === 1 ? '' : 's'}`
                      : 'No prescription'
                  }}
                </span>
              </div>
              <p>{{ visit.chiefComplaint }}</p>
            </div>
          </div>
          <div class="visit-clinical">
            <div class="info-block">
              <span>Diagnosis</span>
              <strong>{{ visit.diagnosis }}</strong>
            </div>
            <div class="info-block">
              <span>Clinical note</span>
              <p>{{ visit.clinicalNote }}</p>
            </div>
          </div>
          <div class="visit-follow-up">
            <span>Follow-up</span>
            <strong>{{ visit.followUp || 'No follow-up planned' }}</strong>
          </div>
          <div class="list-action">
            <RouterLink
              class="details-button"
              :to="{ name: 'medical-visit-details', params: { id: visit.id } }"
            >
              View details
            </RouterLink>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.visits-page,
.list-shell,
.visit-main,
.visit-summary,
.visit-clinical,
.info-block {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.filters-panel,
.state-panel,
.list-shell {
  border: 1px solid #e3ebf5;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 1.35rem;
}

.hero-panel,
.filters-panel,
.list-intro,
.summary-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-panel {
  border-radius: 14px;
  padding: 1.25rem;
}

.hero-copy {
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
.state-panel h2,
.list-intro h2 {
  color: #14213d;
  font-weight: 700;
  margin: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
  margin: 0;
}

.muted-copy,
.toolbar-note,
.visit-date small,
.visit-summary p,
.info-block span,
.info-block p,
.list-count {
  color: #607086;
}

.muted-copy,
.toolbar-note,
.visit-summary p,
.info-block p {
  margin: 0;
  line-height: 1.6;
}

.list-count,
.detail-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 600;
}

.filters-panel {
  padding: 1rem 1.1rem;
}

.toolbar-copy {
  display: grid;
  gap: 0.2rem;
}

.search-field {
  position: relative;
  flex: 1;
  min-width: min(100%, 22rem);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 0.95rem;
  transform: translateY(-50%);
  color: #8ca0bd;
  font-size: 1rem;
}

.search-field input {
  width: 100%;
  min-height: 44px;
  border: 1px solid #d7e3f2;
  border-radius: 14px;
  background: #ffffff;
  color: #111827;
  font: inherit;
  padding: 0.82rem 0.95rem 0.82rem 2.6rem;
}

.search-field input:focus {
  outline: none;
  border-color: #9bb7f1;
  box-shadow: 0 0 0 4px rgba(49, 87, 183, 0.1);
}

.list-shell,
.list-body {
  gap: 0.9rem;
}

.list-intro {
  border-bottom: 1px solid #ebf0f6;
  padding-bottom: 0.2rem;
}

.list-count {
  border: 1px solid #e2eaf6;
  background: #f8fbff;
  color: #46618d;
  min-height: 38px;
  padding: 0.45rem 0.85rem;
}

.list-body {
  display: grid;
  gap: 1rem;
}

.list-row {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.15fr) minmax(12rem, 0.8fr) auto;
  gap: 1rem;
  align-items: start;
  border: 1px solid #e2eaf4;
  border-radius: 18px;
  background: #ffffff;
  padding: 1.1rem;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.list-row:hover {
  border-color: #c4d5ee;
  box-shadow: 0 18px 36px rgba(49, 87, 183, 0.08);
  transform: translateY(-2px);
}

.visit-main {
  grid-template-columns: minmax(8.25rem, 0.72fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.visit-date {
  display: grid;
  gap: 0.18rem;
  padding-right: 1rem;
  border-right: 1px solid #edf2f8;
}

.visit-date strong,
.visit-summary strong,
.visit-follow-up strong,
.info-block strong {
  color: #14213d;
  font-weight: 600;
}

.visit-summary {
  gap: 0.45rem;
}

.detail-chip {
  border: 1px solid #dce8fb;
  background: #f4f8ff;
  color: #3157b7;
  min-height: 32px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
}

.visit-clinical {
  gap: 0.8rem;
}

.info-block {
  gap: 0.25rem;
}

.info-block span,
.visit-follow-up span {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.visit-follow-up {
  display: grid;
  gap: 0.35rem;
  padding: 0.05rem 0 0 1rem;
  border-left: 1px solid #edf2f8;
}

.list-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.details-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid #d7e3fb;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  color: #3157b7;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.7rem 1rem;
  box-shadow: 0 10px 22px rgba(49, 87, 183, 0.08);
}

@media (max-width: 1100px) {
  .list-row {
    grid-template-columns: 1fr;
  }

  .visit-main {
    grid-template-columns: 1fr;
  }

  .visit-date,
  .visit-follow-up {
    border: 0;
    padding: 0;
  }

  .list-action {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .hero-panel,
  .filters-panel,
  .list-intro,
  .summary-topline {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-field {
    width: 100%;
  }

  .hero-badge,
  .list-count {
    min-height: 36px;
  }
}
</style>
