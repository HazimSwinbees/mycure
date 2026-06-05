<template>
  <section class="info-page">
    <section class="hero-panel">
      <p class="section-label">About us</p>
      <h1>Care built around clarity, trust, and access</h1>
      <p class="hero-copy">
        MyCure is designed to make healthcare easier to access, easier to understand, and easier
        to manage for every patient.
      </p>
    </section>

    <section class="content-grid">
      <article class="content-panel">
        <p class="section-label">Who we are</p>
        <h2>Patient-first clinic experience</h2>
        <p>
          We focus on practical healthcare delivery: clear scheduling, structured patient records,
          reliable follow-up, and better communication between patients and care providers.
        </p>
        <p>
          The platform is intended to reduce friction around everyday healthcare tasks, from
          booking and notifications to viewing prescriptions and maintaining personal records.
        </p>
      </article>

      <article class="content-panel">
        <p class="section-label">What we value</p>
        <h2>Reliable, respectful, and simple</h2>
        <ul class="value-list">
          <li>Clear access to appointments and service information</li>
          <li>Respect for patient privacy and data protection</li>
          <li>Accurate records that support continuity of care</li>
          <li>Interfaces that are calm, readable, and task-focused</li>
        </ul>
      </article>

      <article class="content-panel content-panel-wide">
        <p class="section-label">Our approach</p>
        <h2>Healthcare information without unnecessary friction</h2>
        <p>
          We believe patient tools should support real clinic workflows. That means fewer confusing
          steps, clearer records, and a structure patients can trust when reviewing appointments,
          prescriptions, notifications, and profile information.
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

.hero-panel {
  display: grid;
  gap: 0.5rem;
  padding: 1.5rem;
}

.content-grid {
  display: grid;
  gap: 1rem;
}

.content-panel {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
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
  font-size: 1.35rem;
}

.hero-copy,
p,
li {
  color: #4b5563;
  line-height: 1.65;
}

.value-list {
  display: grid;
  gap: 0.65rem;
  padding-left: 1.1rem;
}

@media (min-width: 900px) {
  .info-page {
    padding: 1.25rem;
  }

  .content-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-panel-wide {
    grid-column: 1 / -1;
  }
}
</style>
