<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getServiceById } from '../../services/serviceApi'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const service = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

const bookingTarget = computed(() =>
  service.value?.available
    ? { name: 'booking', query: { serviceId: service.value.id } }
    : { name: 'services' },
)

const loadService = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    service.value = await getServiceById(props.id)
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load service details right now.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadService)
</script>

<template>
  <section v-if="isLoading" class="state-panel">
    <p class="section-label">Service details</p>
    <h1>Loading service</h1>
    <p class="muted-copy">Fetching service details from the clinic database.</p>
  </section>

  <section v-else-if="errorMessage" class="state-panel">
    <p class="section-label">Service details</p>
    <h1>Unable to load service</h1>
    <p class="muted-copy">{{ errorMessage }}</p>
    <RouterLink class="secondary-link" :to="{ name: 'services' }">Back to services</RouterLink>
  </section>

  <section v-else-if="service" class="service-details-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <div class="hero-meta">
          <span class="service-badge">{{ service.category }}</span>
          <span :class="['availability-chip', { unavailable: !service.available }]">
            {{ service.available ? 'Available' : 'Unavailable' }}
          </span>
        </div>

        <h1>{{ service.name }}</h1>
        <p class="muted-copy">{{ service.overview }}</p>
      </div>

      <div class="hero-actions">
        <RouterLink class="secondary-link" :to="{ name: 'services' }">Back to services</RouterLink>
        <RouterLink class="primary-link" :to="bookingTarget">
          {{ service.available ? 'Book appointment' : 'View other services' }}
        </RouterLink>
      </div>
    </section>

    <section class="summary-strip">
      <article class="summary-item">
        <span>Duration</span>
        <strong>{{ service.duration }}</strong>
      </article>
      <article class="summary-item">
        <span>Price</span>
        <strong>{{ service.price }}</strong>
      </article>
    </section>

    <section class="panel details-card">
      <section class="content-block">
        <div class="block-head">
          <p class="section-label">Service details</p>
          <h2>Overview</h2>
        </div>
        <p class="content-copy">{{ service.description || service.overview }}</p>
      </section>

      <section class="content-block">
        <div class="block-head">
          <p class="section-label">Preparation</p>
          <h2>Before your visit</h2>
        </div>
        <p class="content-copy">{{ service.preparation }}</p>
      </section>

      <section class="content-block">
        <div class="block-head">
          <p class="section-label">Included</p>
          <h2>What this covers</h2>
        </div>

        <div class="included-list">
          <article v-for="item in service.includes" :key="item" class="included-row">
            <span class="included-dot" aria-hidden="true"></span>
            <strong>{{ item }}</strong>
          </article>
          <article v-if="!service.includes.length" class="included-row">
            <span class="included-dot" aria-hidden="true"></span>
            <strong>Details will be shared by the clinic</strong>
          </article>
        </div>
      </section>
    </section>
  </section>

  <section v-else class="state-panel">
    <p class="section-label">Service details</p>
    <h1>Service not found</h1>
    <RouterLink class="secondary-link" :to="{ name: 'services' }">Back to services</RouterLink>
  </section>
</template>

<style scoped>
.service-details-page,
.included-list,
.details-card {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.state-panel,
.summary-strip {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.hero-panel,
.panel,
.state-panel,
.summary-strip {
  padding: 1.25rem;
}

.hero-panel {
  display: grid;
  gap: 1rem;
}

.hero-copy,
.hero-meta,
.block-head {
  display: grid;
  gap: 0.45rem;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.block-head h2,
.state-panel h1 {
  color: #111827;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-copy h1 {
  font-size: clamp(1.85rem, 4vw, 2.6rem);
  line-height: 1.02;
}

.muted-copy,
.summary-item span,
.content-copy {
  color: #6b7280;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.primary-link,
.secondary-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.primary-link {
  background: #111827;
  color: #ffffff;
}

.secondary-link {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
}

.service-badge,
.availability-chip {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.38rem 0.72rem;
}

.service-badge {
  background: #eef2ff;
  color: #3f4fb3;
}

.availability-chip {
  background: #ecfdf3;
  color: #15803d;
}

.availability-chip.unavailable {
  background: #fff1f2;
  color: #be123c;
}

.summary-strip {
  display: grid;
  gap: 1rem;
}

.summary-item {
  display: grid;
  gap: 0.28rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.95rem;
}

.summary-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.summary-item strong,
.included-row strong {
  color: #111827;
  font-weight: 700;
}

.details-card {
  gap: 1.25rem;
}

.content-block {
  display: grid;
  gap: 0.85rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 1.1rem;
}

.content-block:first-child {
  border-top: 0;
  padding-top: 0;
}

.content-copy {
  margin: 0;
  line-height: 1.65;
}

.included-list {
  gap: 0.85rem;
}

.included-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 0.75rem;
}

.included-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: #3157b7;
  margin-top: 0.35rem;
}

.state-panel {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 760px) {
  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-item {
    border-top: 0;
    border-left: 1px solid #f1f5f9;
    padding-top: 0;
    padding-left: 1rem;
  }

  .summary-item:first-child {
    border-left: 0;
    padding-left: 0;
  }
}

@media (max-width: 640px) {
  .hero-actions {
    align-items: start;
    flex-direction: column;
  }

  .hero-actions > * {
    width: 100%;
  }
}
</style>
