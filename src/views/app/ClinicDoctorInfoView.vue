<script setup>
import { computed, onMounted, ref } from 'vue'
import { getClinicInfo } from '../../services/clinicInfoApi'
import { getDoctorProfiles } from '../../services/doctorProfileApi'

const clinic = ref(null)
const doctors = ref([])
const isLoading = ref(true)
const loadError = ref('')

const clinicHighlights = computed(() =>
  [
    { label: 'Email', value: clinic.value?.email },
    { label: 'Phone', value: clinic.value?.phone },
    { label: 'Hours', value: clinic.value?.operatingHours },
    { label: 'Website', value: clinic.value?.website },
  ].filter((item) => item.value),
)

const clinicAddress = computed(() =>
  [clinic.value?.addressLine1, clinic.value?.addressLine2].filter(Boolean).join(', '),
)

const getInitials = (name) =>
  (name || 'Doctor')
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
    const [clinicData, doctorData] = await Promise.all([getClinicInfo(), getDoctorProfiles()])
    clinic.value = clinicData
    doctors.value = doctorData
  } catch (error) {
    loadError.value = error.message || 'Unable to load clinic and doctor information.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="info-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Clinic information</p>
        <h1>Clinic and doctor info</h1>
        <p class="muted-copy">
          View the latest clinic contact details, operating hours, and doctor profiles from the
          live database.
        </p>
      </div>
    </section>

    <section v-if="isLoading" class="state-panel">
      <p class="section-label">Info</p>
      <h2>Loading clinic and doctor details</h2>
      <p class="muted-copy">Fetching the latest records from the database.</p>
    </section>

    <section v-else-if="loadError" class="state-panel">
      <p class="section-label">Info</p>
      <h2>Unable to load details</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <template v-else>
      <section class="panel clinic-panel">
        <div class="panel-head clinic-head">
          <div>
            <p class="section-label">Clinic overview</p>
            <h2>{{ clinic?.clinicName || 'Clinic information' }}</h2>
            <p v-if="clinic?.tagline" class="clinic-tagline">{{ clinic.tagline }}</p>
          </div>
          <span class="clinic-chip">Public info</span>
        </div>

        <p v-if="clinic?.description" class="clinic-description">{{ clinic.description }}</p>

        <div class="clinic-info-grid">
          <article v-for="item in clinicHighlights" :key="item.label" class="info-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <article v-if="clinicAddress" class="address-card">
          <p class="section-label">Location</p>
          <strong>{{ clinicAddress }}</strong>
        </article>
      </section>

      <section v-if="doctors.length" class="panel doctors-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Doctor profiles</p>
            <h2>Meet the care team</h2>
            <p class="muted-copy">
              All doctor details and profile photos are loaded from the database.
            </p>
          </div>
        </div>

        <div class="doctor-grid">
          <article v-for="doctor in doctors" :key="doctor.id || doctor.fullName" class="doctor-card">
            <div class="doctor-head">
              <div class="doctor-avatar" aria-hidden="true">
                <img v-if="doctor.photoUrl" :src="doctor.photoUrl" alt="" />
                <span v-else>{{ getInitials(doctor.fullName) }}</span>
              </div>
              <div class="doctor-copy">
                <h3>{{ doctor.fullName || 'Doctor profile' }}</h3>
                <p>{{ doctor.roleTitle || '-' }}</p>
              </div>
              <span v-if="doctor.experience" class="meta-chip">{{ doctor.experience }}</span>
            </div>

            <div class="doctor-meta-grid">
              <article v-if="doctor.qualification" class="mini-card">
                <span>Qualification</span>
                <strong>{{ doctor.qualification }}</strong>
              </article>
              <article v-if="doctor.languages.length" class="mini-card">
                <span>Languages</span>
                <strong>{{ doctor.languages.join(', ') }}</strong>
              </article>
              <article v-if="doctor.specializations.length" class="mini-card mini-wide">
                <span>Specializations</span>
                <strong>{{ doctor.specializations.join(', ') }}</strong>
              </article>
              <article v-if="doctor.workingHours.length" class="mini-card mini-wide">
                <span>Working hours</span>
                <strong>{{ doctor.workingHours.join(' | ') }}</strong>
              </article>
            </div>

            <p v-if="doctor.about" class="doctor-about">{{ doctor.about }}</p>
          </article>
        </div>
      </section>

      <section v-else class="state-panel">
        <p class="section-label">Doctor profile</p>
        <h2>No doctor profile available</h2>
        <p class="muted-copy">Doctor information has not been added to the database yet.</p>
      </section>
    </template>
  </section>
</template>

<style scoped>
.info-page,
.clinic-panel,
.doctors-panel,
.doctor-grid,
.doctor-head,
.doctor-meta-grid,
.hero-copy,
.state-panel {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.state-panel,
.panel,
.info-card,
.mini-card,
.doctor-card,
.address-card {
  border: 1px solid #e3ebf5;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.hero-panel,
.state-panel,
.panel {
  padding: 1.35rem;
}

.info-page {
  gap: 1rem;
}

.hero-copy {
  max-width: 44rem;
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
.panel-head h2,
.doctor-copy h3,
.clinic-head h2 {
  color: #14213d;
  font-weight: 700;
  margin: 0;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.08;
}

.muted-copy,
.doctor-copy p,
.clinic-tagline,
.clinic-description,
.doctor-about,
.info-card span,
.mini-card span,
.address-card p {
  color: #607086;
}

.muted-copy,
.clinic-description,
.doctor-about {
  margin: 0;
  line-height: 1.65;
}

.panel-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.clinic-head {
  grid-template-columns: minmax(0, 1fr) auto;
}

.clinic-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border: 1px solid #d7e3fb;
  border-radius: 999px;
  background: #ffffff;
  color: #3157b7;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
}

.clinic-panel {
  gap: 1.1rem;
}

.clinic-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.1rem;
}

.info-card {
  display: grid;
  gap: 0.3rem;
  padding: 1rem;
  border-color: #dfe8f4;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(49, 87, 183, 0.04);
}

.info-card strong,
.mini-card strong,
.address-card strong {
  color: #14213d;
  overflow-wrap: anywhere;
}

.address-card {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
}

.doctor-grid {
  grid-template-columns: 1fr;
}

.doctor-card {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
  width: 100%;
}

.doctor-head {
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
}

.doctor-avatar {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #dbe6f5;
  border-radius: 50%;
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  color: #3157b7;
  font-size: 1.1rem;
  font-weight: 700;
  flex: 0 0 auto;
  box-shadow: 0 16px 28px rgba(49, 87, 183, 0.12);
}

.doctor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.doctor-copy {
  display: grid;
  gap: 0.2rem;
}

.doctor-copy p {
  margin: 0;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid #dbe7fb;
  border-radius: 999px;
  background: #f4f8ff;
  color: #3157b7;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
}

.doctor-meta-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.mini-card {
  display: grid;
  gap: 0.28rem;
  padding: 0.95rem;
  border-color: #dfe8f4;
  background: #ffffff;
}

.mini-wide {
  grid-column: 1 / -1;
}

.doctor-about {
  padding-top: 0.1rem;
  border-top: 1px solid #eef2f7;
}

@media (max-width: 640px) {
  .clinic-head,
  .doctor-head {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .doctor-meta-grid,
  .clinic-info-grid {
    grid-template-columns: 1fr;
  }

  .meta-chip {
    justify-self: start;
  }
}
</style>
