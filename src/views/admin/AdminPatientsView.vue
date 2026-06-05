<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getDoctorPatients } from '../../services/patientApi'

const searchTerm = ref('')
const patients = ref([])
const isLoading = ref(true)
const loadError = ref('')

const filteredPatients = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  if (!query) {
    return patients.value
  }

  return patients.value.filter((patient) =>
    [patient.name, patient.id, patient.phone, patient.email, patient.condition]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)),
  )
})

const getInitials = (name) =>
  (name || 'Patient')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    patients.value = await getDoctorPatients()
  } catch (error) {
    loadError.value = error.message || 'Unable to load patients.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Patients</p>
        <h1>Patient directory</h1>
        <p class="muted-copy">Review active patient records and open full details from the list.</p>
      </div>

      <label class="search-field">
        <span>Search patient</span>
        <input v-model="searchTerm" type="search" placeholder="Search by name, ID, phone, or condition" />
      </label>
    </section>

    <section class="list-shell">
      <template v-if="isLoading">
        <div class="empty-state">
          <p>Loading patient records.</p>
        </div>
      </template>

      <template v-else-if="loadError">
        <div class="empty-state">
          <p>{{ loadError }}</p>
        </div>
      </template>

      <template v-else-if="filteredPatients.length">
        <div class="list-head">
          <span>Patient</span>
          <span>Phone number</span>
          <span>Email address</span>
          <span>Gender</span>
          <span>Action</span>
        </div>

        <div class="patient-list">
        <RouterLink
          v-for="patient in filteredPatients"
          :key="patient.id"
          class="patient-row"
          :to="{ name: 'admin-patient-profile', params: { id: patient.id } }"
        >
          <div class="patient-primary">
            <div class="patient-avatar" aria-hidden="true">
              <img v-if="patient.photoUrl" :src="patient.photoUrl" alt="" />
              <span v-else>{{ getInitials(patient.name) }}</span>
            </div>
            <div class="patient-identity">
              <strong>{{ patient.name }}</strong>
            </div>
          </div>
          <div class="patient-cell">
            <strong>{{ patient.phone }}</strong>
          </div>
          <div class="patient-cell">
            <strong>{{ patient.email }}</strong>
          </div>
          <div class="patient-cell">
            <strong>{{ patient.gender }}</strong>
          </div>
          <div class="patient-action">
            <span class="details-button">View details</span>
          </div>
        </RouterLink>
        </div>
      </template>

      <div v-else class="empty-state">
        <p>No patients matched the current search.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.doctor-page {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.list-shell,
.patient-row {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

.hero-panel,
.list-shell {
  padding: 1.25rem;
}

.hero-panel {
  display: flex;
  align-items: end;
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

.hero-copy h1 {
  color: #111827;
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  font-weight: 700;
  line-height: 1.05;
}

.muted-copy,
.search-field span,
.patient-row small,
.list-head,
.empty-state {
  color: #6b7280;
}

.search-field {
  display: grid;
  gap: 0.45rem;
  width: min(100%, 360px);
}

.search-field span {
  font-size: 0.875rem;
  font-weight: 600;
}

.search-field input {
  width: 100%;
  min-height: 46px;
  border: 1px solid #d8e0ef;
  border-radius: 12px;
  padding: 0 0.95rem;
  color: #111827;
  background: #fff;
}

.list-shell {
  display: grid;
  gap: 0.8rem;
}

.list-head {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr 0.8fr 0.8fr;
  gap: 1rem;
  padding: 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
}

.patient-list {
  display: grid;
  gap: 0.75rem;
}

.patient-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr 0.8fr 0.8fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.1rem;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.patient-row:hover {
  transform: translateY(-1px);
  border-color: #cdd7f8;
  box-shadow: 0 10px 24px rgba(74, 86, 201, 0.08);
  background: #fbfcff;
}

.patient-primary,
.patient-identity,
.patient-cell,
.patient-action {
  display: grid;
  gap: 0.22rem;
}

.patient-row strong {
  color: #111827;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.patient-primary {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.patient-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 700;
  flex: 0 0 auto;
}

.patient-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.empty-state {
  border: 1px dashed #d8e0ef;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

@media (max-width: 980px) {
  .hero-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field {
    width: 100%;
  }

  .list-head {
    display: none;
  }

  .patient-row {
    grid-template-columns: 1fr;
  }

  .patient-action {
    justify-items: start;
  }
}
</style>
