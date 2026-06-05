<template>
  <section class="info-page">
    <section class="hero-panel">
      <p class="section-label">Privacy policy</p>
      <h1>How patient information is handled</h1>
      <p class="hero-copy">
        This page explains how MyCure collects, uses, stores, and protects information within the
        patient portal and related clinic services.
      </p>
    </section>

    <section class="content-stack">
      <article class="content-panel">
        <h2>Information we collect</h2>
        <p>
          We may collect profile details, appointment information, notifications, prescriptions,
          and other patient-provided health-related data needed to support clinic services and
          patient access.
        </p>
      </article>

      <article class="content-panel">
        <h2>How information is used</h2>
        <p>
          Information is used to manage appointments, display patient records, support clinic
          communication, and maintain continuity across healthcare interactions in the system.
        </p>
      </article>

      <article class="content-panel">
        <h2>Data access and protection</h2>
        <p>
          Access to patient information should be limited to the relevant patient and authorized
          clinic personnel. Technical controls, authentication, and database access policies should
          be used to reduce unauthorized access.
        </p>
      </article>

      <article class="content-panel">
        <h2>Patient responsibility</h2>
        <p>
          Patients are responsible for keeping login details secure and reviewing their information
          for accuracy. Contact the clinic if any record appears incorrect or outdated.
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
