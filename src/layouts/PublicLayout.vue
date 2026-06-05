<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import logoUrl from '../assets/mycure-logo.png'

const route = useRoute()
</script>

<template>
  <div class="public-layout">
    <header
      v-if="!['login', 'register'].includes(route.name)"
      class="public-header"
      :class="{ 'is-landing': route.name === 'landing' }"
      aria-label="Public navigation"
    >
      <RouterLink class="brand" :to="{ name: 'landing' }" aria-label="MyCure Web home">
        <span class="brand-logo">
          <img :src="logoUrl" alt="" />
        </span>
        <span class="brand-copy">
          <strong>MyCure</strong>
          <span>Healthcare Clinic</span>
        </span>
      </RouterLink>

      <nav class="public-nav">
        <RouterLink :to="{ name: 'landing' }">Home</RouterLink>
        <RouterLink :to="{ name: 'landing', hash: '#about' }">About</RouterLink>
        <RouterLink :to="{ name: 'landing', hash: '#services' }">Services</RouterLink>
        <RouterLink :to="{ name: 'landing', hash: '#faq' }">FAQ</RouterLink>
        <RouterLink :to="{ name: 'landing', hash: '#blogs' }">Blogs</RouterLink>
        <RouterLink class="login-link" :to="{ name: 'login' }">Login</RouterLink>
        <RouterLink class="appointment-link" :to="{ name: 'login' }">
          Book appointment
          <span aria-hidden="true">›</span>
        </RouterLink>
      </nav>
    </header>

    <main class="public-main">
      <RouterView :key="route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
}

.public-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(90deg, #061a3f 0%, #082b64 54%, #123b7a 100%);
  padding: 0.85rem clamp(1.25rem, 4vw, 3rem);
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 12px 32px rgba(16, 42, 86, 0.2);
  backdrop-filter: blur(16px);
}

.public-header.is-landing {
  border-bottom-color: rgba(255, 255, 255, 0.16);
  background: linear-gradient(90deg, #061a3f 0%, #082b64 54%, #123b7a 100%);
  position: sticky;
  z-index: 30;
  backdrop-filter: blur(16px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: max-content;
}

.brand-logo {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12px 24px rgba(29, 99, 216, 0.18);
}

.brand-logo img {
  width: 28px;
  height: 28px;
}

.brand-copy {
  gap: 0;
}

.brand-copy strong {
  color: #ffffff;
  font-size: 1.02rem;
  font-weight: 950;
  line-height: 1.1;
}

.brand-copy span {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.2;
}

.public-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.public-nav a:not(.appointment-link) {
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.84rem;
  font-weight: 900;
  padding: 0.68rem 0.85rem;
  transition:
    background 160ms ease,
    color 160ms ease;
}

.public-nav a.router-link-active:not(.appointment-link),
.public-nav a:not(.appointment-link):hover {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.login-link {
  margin-left: 0.35rem;
}

.appointment-link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  background: #ffffff;
  color: #123b7a;
  border-radius: 999px;
  margin-left: 0.55rem;
  padding: 0.62rem 0.75rem 0.62rem 1rem;
  font-size: 0.84rem;
  font-weight: 950;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
}

.appointment-link span {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: #123b7a;
  color: #ffffff;
  font-size: 1.2rem;
  line-height: 1;
}

.public-main {
  min-height: 100vh;
}

@media (max-width: 900px) {
  .public-nav a:nth-child(4),
  .public-nav a:nth-child(5),
  .login-link {
    display: none;
  }
}

@media (max-width: 640px) {
  .brand-copy span {
    display: none;
  }

  .public-header {
    align-items: center;
    gap: 0.85rem;
    padding-inline: 0.85rem;
  }

  .public-nav {
    gap: 0.2rem;
  }

  .public-nav a:not(.appointment-link) {
    padding: 0.62rem 0.55rem;
  }

  .appointment-link {
    min-height: 38px;
    padding: 0.55rem 0.6rem 0.55rem 0.75rem;
  }

  .appointment-link span {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 460px) {
  .public-nav a:nth-child(2),
  .public-nav a:nth-child(3) {
    display: none;
  }
}
</style>
