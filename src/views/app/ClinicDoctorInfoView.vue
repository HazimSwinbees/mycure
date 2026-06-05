<script setup>
import { computed, onMounted, ref } from 'vue'
import { getClinicInfo } from '../../services/clinicInfoApi'
import { getDoctorProfiles } from '../../services/doctorProfileApi'

const clinic = ref(null)
const doctor = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const clinicHighlights = computed(() => [
  { label: 'Email', value: clinic.value?.email || '-' },
  { label: 'Phone', value: clinic.value?.phone || '-' },
  { label: 'Hours', value: clinic.value?.operatingHours || '-' },
  { label: 'Website', value: clinic.value?.website || '-' },
])

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
    doctor.value = doctorData[0] || null
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
        <div class="panel-head">
          <div>
            <p class="section-label">Clinic overview</p>
            <h2>{{ clinic?.clinicName }}</h2>
            <p class="muted-copy">{{ clinic?.tagline }}</p>
          </div>
        </div>

        <p class="clinic-description">{{ clinic?.description }}</p>

        <div class="highlight-grid">
          <article v-for="item in clinicHighlights" :key="item.label" class="highlight-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div class="address-block">
          <article class="detail-card">
            <span>Address</span>
            <strong>{{ clinic?.addressLine1 }}</strong>
            <strong>{{ clinic?.addressLine2 }}</strong>
          </article>
          <article class="detail-card">
            <span>Emergency note</span>
            <strong>{{ clinic?.emergencyNote }}</strong>
          </article>
        </div>
      </section>

      <section class="panel" v-if="doctor">
        <div class="panel-head">
          <div>
            <p class="section-label">Doctor profile</p>
            <h2>Meet your doctor</h2>
          </div>
        </div>

        <article class="doctor-profile">
          <div class="doctor-head">
            <div class="doctor-avatar" aria-hidden="true">
              <img v-if="doctor.photoUrl" :src="doctor.photoUrl" alt="" />
              <span v-else>{{ getInitials(doctor.fullName) }}</span>
            </div>
            <div class="doctor-copy">
              <h3>{{ doctor.fullName }}</h3>
              <p>{{ doctor.roleTitle }}</p>
            </div>
          </div>

          <div class="doctor-details">
            <article class="detail-card">
              <span>Qualification</span>
              <strong>{{ doctor.qualification }}</strong>
            </article>
            <article class="detail-card">
              <span>Experience</span>
              <strong>{{ doctor.experience }}</strong>
            </article>
            <article class="detail-card">
              <span>Languages</span>
              <strong>{{ doctor.languages.join(', ') }}</strong>
            </article>
            <article class="detail-card">
              <span>Specializations</span>
              <strong>{{ doctor.specializations.join(', ') }}</strong>
            </article>
            <article class="detail-card detail-wide">
              <span>Working hours</span>
              <strong>{{ doctor.workingHours.join(' | ') }}</strong>
            </article>
            <article class="detail-card detail-wide">
              <span>About</span>
              <strong>{{ doctor.about }}</strong>
            </article>
          </div>
        </article>
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
.highlight-grid,
.address-block,
.doctor-details {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.state-panel,
.panel,
.highlight-card,
.detail-card,
.doctor-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.hero-panel,
.state-panel,
.panel {
  padding: 1.25rem;
}

.info-page {
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
.doctor-copy h3 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.highlight-card span,
.detail-card span,
.doctor-copy p,
.doctor-about,
.clinic-description {
  color: #6b7280;
}

.clinic-panel {
  display: grid;
  gap: 1rem;
}

.panel-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.clinic-description,
.doctor-about {
  line-height: 1.65;
}

.highlight-grid {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.highlight-card,
.detail-card,
.doctor-card {
  padding: 1rem;
}

.highlight-card,
.detail-card {
  display: grid;
  gap: 0.28rem;
}

.highlight-card strong,
.detail-card strong,
.doctor-copy h3 {
  overflow-wrap: anywhere;
}

.doctor-profile {
  display: grid;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  padding: 1rem;
}

.doctor-avatar {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
  font-size: 1rem;
  font-weight: 700;
  flex: 0 0 auto;
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

.doctor-details {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 760px) {
  .highlight-grid,
  .address-block,
  .doctor-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-wide {
    grid-column: 1 / -1;
  }
}
</style>
