<script setup>
const partners = ['Diligent', 'Eclipse', 'Brilliant', 'Polaris', 'Ignite', 'Fusion']

const doctors = [
  {
    name: 'Dr. Michael Johnson',
    role: 'Medicine Specialist',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Dr. William Smith',
    role: 'Pediatrician',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=700&q=85',
  },
  {
    name: 'Dr. Melinda Scott',
    role: 'Dental Surgeon',
    image:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=700&q=85',
  },
]

const faqs = [
  {
    question: 'How experienced are the doctors?',
    answer:
      'All our doctors have years of experience in their respective fields and are dedicated to caring for every patient.',
  },
  {
    question: 'What types of services do you provide?',
    answer:
      'General care, screening, specialist referrals, vaccinations, and ongoing patient support.',
  },
  {
    question: 'How can I book an appointment?',
    answer: 'Use the appointment form below or register through the patient portal.',
  },
  {
    question: 'What should I do in case of an emergency?',
    answer:
      'Call your local emergency number or visit the nearest emergency department immediately.',
  },
  {
    question: 'What health check-up packages do you offer?',
    answer:
      'We provide routine wellness checks, chronic care reviews, and preventive screening packages.',
  },
]

const posts = [
  {
    title: '5 Effective Ways to Prevent Diabetes',
    date: 'November 10, 2025',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=700&q=85',
  },
  {
    title: 'Daily Habits for a Healthy Heart',
    date: 'November 10, 2025',
    image:
      'https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?auto=format&fit=crop&w=700&q=85',
  },
  {
    title: "How to Boost Children's Immunity",
    date: 'November 10, 2025',
    image:
      'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=700&q=85',
  },
]
</script>

<template>
  <section class="clinic-page" aria-labelledby="landing-title">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Clinic Service</p>
        <h1 id="landing-title">Healthcare Made Simple & Accessible</h1>
        <p>Expert doctors, modern treatment, and friendly service all in one place.</p>
        <RouterLink class="action-button" :to="{ name: 'register' }">
          Book appointment
          <span aria-hidden="true">›</span>
        </RouterLink>
      </div>
      <img
        class="hero-image"
        src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=900&q=85"
        alt="Medical team consulting around a patient"
      />
    </section>

    <section class="partner-strip section-wrap" aria-label="Trusted by">
      <p>Loved by 25 million+ users</p>
      <div>
        <span v-for="partner in partners" :key="partner">{{ partner }}</span>
      </div>
    </section>

    <section id="about" class="about-section section-wrap" aria-labelledby="about-title">
      <div class="about-media">
        <img
          class="about-main"
          src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=700&q=85"
          alt="Doctor reviewing an x-ray"
        />
        <img
          class="about-card"
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=85"
          alt="Clinic reception"
        />
      </div>

      <div class="about-copy">
        <h2 id="about-title">About Our Clinic</h2>
        <p>
          Our clinic is committed to providing affordable, modern, and reliable healthcare for
          everyone. We believe caring for patients is more than treatment; it is a relationship
          built on trust, clear guidance, and compassionate care.
        </p>
        <RouterLink class="action-button" :to="{ name: 'register' }">
          Book appointment
          <span aria-hidden="true">›</span>
        </RouterLink>

        <dl class="stats-grid">
          <div>
            <dt>1.9+</dt>
            <dd>Registered patient</dd>
          </div>
          <div>
            <dt>1.3k+</dt>
            <dd>Happy patient</dd>
          </div>
          <div>
            <dt>156+</dt>
            <dd>Departments</dd>
          </div>
        </dl>
      </div>
    </section>

    <section id="services" class="departments-section" aria-labelledby="departments-title">
      <div class="section-wrap">
        <div class="section-heading">
          <h2 id="departments-title">Our Departments & Specialties</h2>
          <p>Quality care provided by expert specialists in every department</p>
        </div>

        <div class="doctor-grid">
          <article v-for="doctor in doctors" :key="doctor.name" class="doctor-card">
            <img :src="doctor.image" :alt="doctor.name" />
            <h3>{{ doctor.name }}</h3>
            <p>{{ doctor.role }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="faq" class="faq-section section-wrap" aria-labelledby="faq-title">
      <div class="section-heading">
        <h2 id="faq-title">Frequently Asked Questions</h2>
        <p>Supporting your health with clear information</p>
      </div>

      <div class="faq-list">
        <details v-for="(faq, index) in faqs" :key="faq.question" :open="index === 0">
          <summary>{{ faq.question }}</summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section id="blogs" class="tips-section section-wrap" aria-labelledby="tips-title">
      <div class="section-heading">
        <h2 id="tips-title">Health Tips & Insights</h2>
        <p>
          Your trusted source for daily wellness, disease prevention, and healthy lifestyle guidance
        </p>
      </div>

      <div class="post-grid">
        <article v-for="post in posts" :key="post.title" class="post-card">
          <img :src="post.image" :alt="post.title" />
          <h3>{{ post.title }}</h3>
          <p>{{ post.date }}</p>
        </article>
      </div>
    </section>

    <section id="appointment" class="appointment-section" aria-labelledby="appointment-title">
      <div class="section-wrap appointment-wrap">
        <div class="section-heading">
          <h2 id="appointment-title">Appointment</h2>
          <p>
            Book your appointment online at your convenient time. Our team will confirm your
            schedule quickly.
          </p>
        </div>

        <form class="appointment-form">
          <input aria-label="Name" placeholder="Name" />
          <input aria-label="Phone Number" placeholder="Phone Number" />
          <select aria-label="Choose Department">
            <option>Choose Department</option>
            <option>Primary Care</option>
            <option>Dental Care</option>
            <option>Health Screening</option>
          </select>
          <input aria-label="Date and Time" placeholder="Date & Time" />
          <textarea aria-label="Message" placeholder="Message (optional)"></textarea>
        </form>

        <RouterLink class="action-button" :to="{ name: 'register' }">
          Book appointment
          <span aria-hidden="true">›</span>
        </RouterLink>
      </div>
    </section>

    <footer class="clinic-footer">
      <div class="section-wrap footer-grid">
        <div>
          <strong class="footer-brand">✚ Clinic</strong>
          <p>Expert doctors, modern treatment, and friendly service all in one place.</p>
          <div class="socials" aria-label="Social media">
            <span>f</span>
            <span>x</span>
            <span>◎</span>
            <span>in</span>
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3>Quick link</h3>
          <RouterLink :to="{ name: 'landing' }">Home</RouterLink>
          <RouterLink :to="{ name: 'about-us' }">About us</RouterLink>
          <RouterLink :to="{ name: 'privacy-policy' }">Privacy policy</RouterLink>
          <RouterLink :to="{ name: 'terms-and-conditions' }">Terms & Conditions</RouterLink>
        </nav>

        <nav aria-label="Social media links">
          <h3>Social Media</h3>
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">YouTube</a>
          <a href="#">LinkedIn</a>
        </nav>

        <address>
          <h3>Contact</h3>
          <span>1234 456 7890</span>
          <span>example@gmail.com</span>
          <span>New York, USA</span>
        </address>
      </div>
      <p class="copyright">Copyright 2026 MyCure. All Rights Reserved.</p>
    </footer>
  </section>
</template>

<style scoped>
.clinic-page {
  --blue-950: #071f49;
  --blue-900: #0a2d66;
  --blue-800: #123b7a;
  --blue-700: #1d63d8;
  --blue-100: #eef6ff;
  --blue-50: #f6faff;
  --text: #1f2937;
  --muted: #637083;
  background: #ffffff;
  color: var(--text);
}

.section-wrap {
  width: min(1120px, calc(100% - 2rem));
  margin-inline: auto;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 640px) minmax(320px, 520px);
  gap: clamp(2rem, 8vw, 7rem);
  align-items: center;
  justify-content: center;
  min-height: 560px;
  background:
    radial-gradient(circle at 34px 34px, rgba(255, 255, 255, 0.12) 2px, transparent 3px),
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(135deg, #061a3f 0%, #082b64 55%, #123b7a 100%);
  background-size:
    48px 48px,
    42px 42px,
    42px 42px,
    auto;
  padding: clamp(3.5rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem);
}

.hero-copy {
  display: grid;
  gap: 1rem;
  color: #ffffff;
}

.eyebrow {
  color: #d9e9ff;
  font-size: 0.85rem;
  font-weight: 800;
}

.hero-copy h1 {
  max-width: 580px;
  font-size: clamp(3.2rem, 7vw, 5.7rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.02;
}

.hero-copy p {
  max-width: 520px;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 600;
}

.hero-panel .action-button {
  background: #ffffff;
  color: #0a2d66;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.18);
}

.hero-panel .action-button span {
  background: #0a2d66;
  color: #ffffff;
}

.action-button {
  display: inline-flex;
  width: max-content;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  border-radius: 999px;
  background: var(--blue-700);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 900;
  padding: 0.82rem 1rem 0.82rem 1.25rem;
  box-shadow: 0 16px 28px rgba(29, 99, 216, 0.24);
}

.action-button span {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: #ffffff;
  color: var(--blue-800);
  font-size: 1.2rem;
  line-height: 1;
}

.hero-image {
  width: 100%;
  aspect-ratio: 1.42;
  border-radius: 28px;
  object-fit: cover;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
}

.partner-strip {
  display: grid;
  gap: 1rem;
  justify-items: center;
  padding: 3rem 0 4rem;
}

.partner-strip p {
  color: #111827;
  font-weight: 850;
}

.partner-strip div {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(1rem, 4vw, 2.5rem);
}

.partner-strip span {
  color: #9aa1aa;
  font-size: 1.05rem;
  font-weight: 900;
}

.about-section {
  display: grid;
  grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1fr);
  gap: clamp(2.5rem, 8vw, 6rem);
  align-items: center;
  padding: 4rem 0 6rem;
}

.about-media {
  position: relative;
  min-height: 390px;
  border-radius: 28px;
  background: var(--blue-50);
  padding: 2rem;
}

.about-main {
  width: 72%;
  height: 330px;
  border-radius: 18px;
  object-fit: cover;
}

.about-card {
  position: absolute;
  right: 0.7rem;
  bottom: 1.2rem;
  width: 48%;
  aspect-ratio: 1.05;
  border: 8px solid #ffffff;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 18px 36px rgba(10, 45, 102, 0.14);
}

.about-copy,
.appointment-wrap {
  display: grid;
  gap: 1.2rem;
}

.about-copy h2,
.section-heading h2 {
  color: var(--text);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.08;
}

.about-copy p,
.section-heading p,
.faq-list p,
.post-card p,
.clinic-footer p,
.clinic-footer a,
.clinic-footer span,
.clinic-footer address {
  color: var(--muted);
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 1rem;
}

.stats-grid dt {
  color: var(--text);
  font-size: 2rem;
  font-weight: 950;
  line-height: 1;
}

.stats-grid dd {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.departments-section,
.appointment-section {
  background: #f3f7fc;
  padding: 6rem 0;
}

.section-heading {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  text-align: center;
}

.section-heading p {
  max-width: 540px;
}

.doctor-grid,
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.doctor-card,
.post-card {
  display: grid;
  gap: 0.75rem;
}

.doctor-card img,
.post-card img {
  width: 100%;
  aspect-ratio: 0.96;
  border-radius: 12px;
  object-fit: cover;
}

.post-card img {
  aspect-ratio: 1.55;
}

.doctor-card h3,
.post-card h3 {
  color: var(--text);
  font-size: 1rem;
  font-weight: 850;
}

.doctor-card p,
.post-card p {
  font-size: 0.82rem;
}

.faq-section,
.tips-section {
  padding: 6rem 0;
}

.faq-list {
  display: grid;
  gap: 0.4rem;
  width: min(960px, 100%);
  margin-inline: auto;
}

.faq-list details {
  border-bottom: 1px solid #e2e8f0;
  padding: 1.15rem 0;
}

.faq-list summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111827;
  cursor: pointer;
  font-weight: 850;
  list-style: none;
}

.faq-list summary::-webkit-details-marker {
  display: none;
}

.faq-list summary::after {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  color: var(--blue-800);
  content: '+';
}

.faq-list details[open] summary::after {
  content: '-';
}

.faq-list p {
  max-width: 760px;
  margin-top: 0.5rem;
}

.appointment-wrap {
  justify-items: center;
}

.appointment-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  width: min(760px, 100%);
}

.appointment-form input,
.appointment-form select,
.appointment-form textarea {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 0;
  background: #ffffff;
  color: var(--text);
  padding: 1rem;
}

.appointment-form textarea {
  min-height: 160px;
  grid-column: 1 / -1;
  resize: vertical;
}

.appointment-form input:focus,
.appointment-form select:focus,
.appointment-form textarea:focus {
  border-color: var(--blue-700);
  outline: 3px solid rgba(29, 99, 216, 0.12);
}

.clinic-footer {
  background: #05070b;
  color: #ffffff;
  padding-top: 5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 3rem;
  padding-bottom: 3rem;
}

.footer-brand,
.clinic-footer h3 {
  color: #ffffff;
  font-weight: 900;
}

.footer-brand {
  display: block;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.clinic-footer nav,
.clinic-footer address {
  display: grid;
  gap: 0.65rem;
  font-style: normal;
}

.socials {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

.socials span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  background: #1f2937;
  color: #ffffff;
  font-size: 0.75rem;
}

.copyright {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 1rem;
  text-align: center;
}

@media (max-width: 860px) {
  .hero-panel,
  .about-section,
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    justify-items: start;
  }

  .doctor-grid,
  .post-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .hero-panel {
    padding: 3rem 1.25rem;
  }

  .about-media {
    min-height: 320px;
    padding: 1rem;
  }

  .about-main {
    height: 260px;
  }

  .doctor-grid,
  .post-grid,
  .appointment-form,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
