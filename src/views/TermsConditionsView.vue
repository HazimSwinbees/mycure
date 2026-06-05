<template>
  <section class="info-page">
    <section class="hero-panel">
      <p class="section-label">Terms and conditions</p>
      <h1>Rules for using the patient platform</h1>
      <p class="hero-copy">
        These terms describe the expected use of MyCure and the responsibilities attached to
        patient access, appointment requests, and account information.
      </p>
    </section>

    <section class="content-stack">
      <article class="content-panel">
        <h2>Use of the platform</h2>
        <p>
          The platform is intended for lawful patient use, including managing appointments,
          reviewing records, and accessing clinic-related information made available through the
          account.
        </p>
      </article>

      <article class="content-panel">
        <h2>Accuracy of information</h2>
        <p>
          Patients should provide accurate and current information when registering, updating their
          profile, or requesting appointments. Inaccurate details may affect service delivery.
        </p>
      </article>

      <article class="content-panel">
        <h2>Appointments and availability</h2>
        <p>
          Appointment requests remain subject to clinic review, scheduling limits, and operational
          availability. Submission through the system does not guarantee immediate confirmation.
        </p>
      </article>

      <article class="content-panel">
        <h2>Account security</h2>
        <p>
          Users are responsible for protecting access to their account and for notifying the clinic
          if they suspect unauthorized use or inaccurate account activity.
        </p>
      </article>
    </section>
  </section>
</template>

<style scoped>
.info-page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background: #f8fbff;
}

.hero-panel,
.content-panel {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
}

.hero-panel,
.content-panel {
  display: grid;
  gap: 0.6rem;
  padding: 1.5rem;
}

.content-stack {
  display: grid;
  gap: 1rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

h1,
h2 {
  color: #111827;
  font-weight: 700;
  line-height: 1.1;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
}

h2 {
  font-size: 1.22rem;
}

.hero-copy,
p {
  color: #4b5563;
  line-height: 1.65;
}

@media (min-width: 900px) {
  .info-page {
    padding: 1.25rem;
  }
}
</style>
