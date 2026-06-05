<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})

defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="topbar">
    <button
      class="menu-button"
      type="button"
      aria-label="Open navigation menu"
      @click="$emit('toggle-sidebar')"
    >
      Menu
    </button>

    <div>
      <p>Doctor portal</p>
      <h1>{{ title }}</h1>
    </div>

    <RouterLink class="btn btn-primary" :to="{ name: 'admin-appointments' }"
      >Review queue</RouterLink
    >
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  min-height: 70px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid rgba(197, 222, 220, 0.9);
  background: rgba(247, 252, 251, 0.9);
  padding: 0.75rem clamp(1rem, 3vw, 2rem);
  backdrop-filter: blur(20px);
}

.topbar p {
  color: var(--cure-muted);
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.1;
}

.topbar h1 {
  overflow: hidden;
  color: var(--cure-text);
  font-size: clamp(1.05rem, 3vw, 1.35rem);
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-button {
  display: inline-grid;
  width: 56px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--cure-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--cure-text);
  font-size: 0.78rem;
  font-weight: 900;
}

.btn-primary {
  background: linear-gradient(135deg, #0f766e, #115e59);
}

@media (min-width: 980px) {
  .menu-button {
    display: none;
  }

  .topbar {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}

@media (max-width: 560px) {
  .topbar .btn {
    display: none;
  }
}
</style>
