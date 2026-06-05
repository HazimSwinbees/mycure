<script setup>
import { ref, computed } from 'vue'
import { doctorPrescriptions } from '../../services/doctorPortalMock'

const activeStatus = ref('All')
const statuses = ['All', 'Active', 'Completed']
const filteredPrescriptions = computed(() =>
  activeStatus.value === 'All'
    ? doctorPrescriptions
    : doctorPrescriptions.filter((item) => item.status === activeStatus.value),
)
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Prescriptions</p>
        <h1>Medication records</h1>
        <p class="muted-copy">Review active and completed prescriptions issued by the clinic.</p>
      </div>
    </section>

    <section class="tabs-panel">
      <div class="tabs-row">
        <button
          v-for="status in statuses"
          :key="status"
          class="tab-button"
          :class="{ 'is-active': activeStatus === status }"
          type="button"
          @click="activeStatus = status"
        >
          {{ status }}
        </button>
      </div>
    </section>

    <section class="card-grid">
      <article v-for="prescription in filteredPrescriptions" :key="prescription.id" class="entry-card">
        <div class="card-top">
          <span :class="['status-badge', prescription.status.toLowerCase()]">{{ prescription.status }}</span>
          <span class="time-copy">{{ prescription.issuedDate }}</span>
        </div>

        <div class="card-main">
          <h2>{{ prescription.medicine }} {{ prescription.strength }}</h2>
          <p>{{ prescription.patientName }}</p>
        </div>

        <div class="detail-grid">
          <article class="detail-item"><span>Dosage</span><strong>{{ prescription.dosage }}</strong></article>
          <article class="detail-item"><span>Frequency</span><strong>{{ prescription.frequency }}</strong></article>
          <article class="detail-item"><span>Duration</span><strong>{{ prescription.duration }}</strong></article>
          <article class="detail-item"><span>Instructions</span><strong>{{ prescription.instructions }}</strong></article>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.doctor-page,.card-grid{display:grid;gap:1rem}
.hero-panel,.tabs-panel,.entry-card{border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:1.25rem}
.hero-copy{display:grid;gap:.35rem}
.section-label{color:#7a7f87;font-size:.75rem;font-weight:600;text-transform:uppercase}
.hero-copy h1,.card-main h2{color:#111827;font-weight:700}
.hero-copy h1{font-size:clamp(1.75rem,4vw,2.35rem);line-height:1.05}
.muted-copy,.card-main p,.detail-item span,.time-copy{color:#6b7280}
.tabs-row{display:flex;gap:1.5rem;overflow-x:auto}
.tab-button{position:relative;border:0;background:transparent;color:#8a8f98;font-size:.95rem;font-weight:600;padding:0 0 .85rem;white-space:nowrap}
.tab-button::after{content:'';position:absolute;right:0;bottom:0;left:0;height:2px;border-radius:999px;background:transparent}
.tab-button.is-active{color:#4a56c9}.tab-button.is-active::after{background:#5b61ff}
.card-grid{grid-template-columns:repeat(1,minmax(0,1fr))}
.entry-card{display:grid;gap:1rem}
.card-top{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.status-badge{display:inline-flex;align-items:center;justify-content:center;min-height:28px;border-radius:999px;background:#eef2ff;color:#4a56c9;font-size:.78rem;font-weight:600;padding:.2rem .65rem}
.status-badge.completed{background:#ecfdf3;color:#15803d}
.card-main{display:grid;gap:.4rem}
.detail-grid{display:grid;gap:.85rem}
.detail-item{display:grid;gap:.28rem;border-top:1px solid #eef2f7;padding-top:.85rem}
.detail-item strong{color:#111827;font-weight:600}
@media (min-width:900px){.card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
