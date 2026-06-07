<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { clearAppointmentDraft, getAppointmentDraft } from '../../services/appointmentDraft'

const draft = ref(getAppointmentDraft())

const formattedDate = computed(() => {
  if (!draft.value?.date) {
    return 'Not selected'
  }

  const parsedDate = new Date(draft.value.date)

  if (Number.isNaN(parsedDate.getTime())) {
    return draft.value.date
  }

  return parsedDate.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const clearAndContinue = () => {
  clearAppointmentDraft()
}
</script>

<template>
  <section class="success-page">
    <section v-if="draft?.confirmed" class="success-card">
      <div class="success-icon" aria-hidden="true">&#10003;</div>

      <h1>Booking Successful!</h1>

      <p class="lead-copy">
        Your appointment has been successfully booked. Please arrive at the clinic 10 minutes
        before your appointment time.
      </p>

      <div class="booking-details">
        <p><strong>Service:</strong> {{ draft.serviceName }}</p>
        <p><strong>Doctor:</strong> {{ draft.doctorName || '-' }}</p>
        <p><strong>Date:</strong> {{ formattedDate }}</p>
        <p><strong>Time:</strong> {{ draft.time }}</p>
        <p><strong>Status:</strong> {{ draft.status || 'Pending Confirmation' }}</p>
      </div>

      <div class="btn-group">
        <RouterLink class="btn btn-primary" :to="{ name: 'dashboard' }" @click="clearAndContinue">
          Go to Dashboard
        </RouterLink>
        <RouterLink
          class="btn btn-secondary"
          :to="{ name: 'appointments' }"
          @click="clearAndContinue"
        >
          View Appointments
        </RouterLink>
      </div>
    </section>

    <section v-else class="success-card">
      <h1>No confirmed booking found</h1>
      <p class="lead-copy">Complete the booking confirmation step before opening this page.</p>
      <div class="btn-group">
        <RouterLink class="btn btn-primary" :to="{ name: 'booking' }">Back to Booking</RouterLink>
      </div>
    </section>
  </section>
</template>

<style scoped>
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f3f6ff;
  padding: 1.5rem;
}

.success-card {
  width: min(100%, 500px);
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.08);
  padding: 2.5rem 1.875rem;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: #22c55e;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 2.625rem;
  font-weight: 700;
}

h1 {
  color: #2f3f9f;
  margin: 0 0 0.625rem;
  font-size: clamp(1.8rem, 4vw, 2.3rem);
  line-height: 1.1;
}

.lead-copy {
  color: #666666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.booking-details {
  background: #f4f7ff;
  border-radius: 12px;
  margin: 1.5625rem 0;
  padding: 1.125rem;
  text-align: left;
}

.booking-details p {
  color: #333333;
  line-height: 1.6;
  margin: 0.5rem 0;
}

.booking-details strong {
  color: #3f4fb3;
  font-weight: 800;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 8px;
  font-weight: 700;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  transition: background 180ms ease;
}

.btn-primary {
  background: #4a56c9;
  color: #ffffff;
}

.btn-primary:hover {
  background: #3f4fb3;
}

.btn-secondary {
  background: #eef2ff;
  color: #4a56c9;
  border: 1px solid #cfd8ff;
}

.btn-secondary:hover {
  background: #e2e8ff;
}

@media (max-width: 640px) {
  .success-card {
    padding: 2rem 1.25rem;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
