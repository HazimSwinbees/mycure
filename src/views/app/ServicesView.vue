<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getServices } from '../../services/serviceApi'

const services = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const loadServices = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    services.value = await getServices()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load services right now.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadServices)
</script>

<template>
  <section class="services-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Services</p>
        <h1>Choose the care you need</h1>
        <p class="muted-copy">
          Browse available services, compare appointment details, and open each service for full
          information.
        </p>
      </div>
    </section>

    <section v-if="isLoading" class="state-panel">
      <p class="section-label">Services</p>
      <h2>Loading services</h2>
      <p class="muted-copy">Fetching the latest list from the clinic database.</p>
    </section>

    <section v-else-if="errorMessage" class="state-panel">
      <p class="section-label">Services</p>
      <h2>Unable to load services</h2>
      <p class="muted-copy">{{ errorMessage }}</p>
    </section>

    <section v-else-if="!services.length" class="state-panel">
      <p class="section-label">Services</p>
      <h2>No services available</h2>
      <p class="muted-copy">No service records were returned from the database.</p>
    </section>

    <section v-else class="services-list" aria-label="Available services">
      <article v-for="service in services" :key="service.id" class="service-card">
        <div class="card-top">
          <span class="service-badge">{{ service.category }}</span>
          <span :class="['availability-chip', { unavailable: !service.available }]">
            {{ service.available ? 'Available' : 'Unavailable' }}
          </span>
        </div>

        <div class="service-main">
          <h2>{{ service.name }}</h2>
          <p class="service-description">{{ service.description }}</p>
          <span class="service-duration">{{ service.duration }}</span>
        </div>

        <div class="card-bottom">
          <RouterLink
            class="details-link"
            :to="{ name: 'service-details', params: { id: service.id } }"
          >
            View details
          </RouterLink>

          <RouterLink
            class="service-link"
            :class="{ unavailable: !service.available }"
            :to="
              service.available
                ? { name: 'booking', query: { serviceId: service.id } }
                : { name: 'service-details', params: { id: service.id } }
            "
          >
            <span>Book Appointment</span>
          </RouterLink>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.services-page {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.state-panel,
.service-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.hero-panel,
.state-panel {
  display: grid;
  gap: 1rem;
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

.hero-copy h1 {
  color: #111827;
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.05;
}

.muted-copy,
.service-description {
  color: #6b7280;
}

.services-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.service-card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 250px;
  padding: 1.25rem;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.service-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.08);
  transform: translateY(-4px);
}

.card-top,
.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.card-top {
  padding-bottom: 1rem;
}

.service-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  background: #e8f0ff;
  color: #3157b7;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.38rem 0.72rem;
  transition:
    background 180ms ease,
    color 180ms ease;
}

.availability-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  background: #ecfdf3;
  color: #15803d;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.38rem 0.72rem;
}

.availability-chip.unavailable {
  background: #fff1f2;
  color: #be123c;
}

.service-card:hover .service-badge {
  background: #3157b7;
  color: #ffffff;
}

.service-duration {
  color: #3157b7;
  font-size: 0.92rem;
  font-weight: 600;
}

.service-main {
  display: grid;
  align-content: start;
  gap: 0.65rem;
  min-width: 0;
}

.service-main h2 {
  color: #111827;
  font-size: 1.28rem;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.service-description {
  max-width: 30ch;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-bottom {
  margin-top: 1.25rem;
  align-items: stretch;
  gap: 0.75rem;
  border-top: 1px solid #e8eef9;
  padding-top: 1rem;
  flex-wrap: wrap;
}

.details-link,
.service-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 180px;
  min-height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.9rem;
  text-align: center;
  white-space: normal;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.details-link {
  color: #3157b7;
  border-color: #d7e3fb;
  background: #f5f8ff;
}

.service-link {
  gap: 0.5rem;
  background: #3157b7;
  border-color: #3157b7;
  color: #ffffff;
}

.service-link.unavailable {
  background: #e5e7eb;
  border-color: #e5e7eb;
  color: #6b7280;
}

.service-card:hover .details-link,
.details-link:hover {
  border-color: #bfd0f7;
  background: #eef4ff;
  color: #27479b;
  transform: translateY(-1px);
}

.service-card:hover .service-link,
.service-link:hover {
  background: #27479b;
  border-color: #27479b;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.service-link.unavailable:hover,
.service-card:hover .service-link.unavailable {
  background: #e5e7eb;
  border-color: #e5e7eb;
  color: #6b7280;
  box-shadow: none;
  transform: none;
}

@media (min-width: 760px) {
  .services-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .services-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1440px) {
  .services-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
