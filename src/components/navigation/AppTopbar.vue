<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: 'Patient',
  },
})

defineEmits(['toggle-sidebar'])

const initials = computed(() =>
  props.userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <header class="topbar">
    <div class="topbar-main">
      <button
        class="menu-button"
        type="button"
        aria-label="Open navigation menu"
        @click="$emit('toggle-sidebar')"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="title-block">
        <p class="eyebrow">Patient portal</p>
        <h1>{{ title }}</h1>
      </div>
    </div>

    <div class="topbar-actions">
      <RouterLink class="action-link" :to="{ name: 'notifications' }">Notifications</RouterLink>
      <RouterLink class="profile-link" :to="{ name: 'profile' }">
        <span class="profile-mark" aria-hidden="true">{{ initials }}</span>
        <span>{{ userName }}</span>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(215, 227, 245, 0.85);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.9rem 1rem;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(12px);
}

.topbar-main,
.topbar-actions,
.profile-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.topbar-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.menu-button {
  display: inline-grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  gap: 0.22rem;
  border: 1px solid rgba(215, 227, 245, 0.9);
  border-radius: 8px;
  background: #ffffff;
  padding: 0;
}

.menu-button span {
  display: block;
  width: 0.9rem;
  height: 1px;
  background: var(--cure-text);
}

.title-block {
  min-width: 0;
}

.title-block h1 {
  color: var(--cure-text);
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: 850;
  line-height: 1.1;
}

.action-link,
.profile-link {
  min-height: 40px;
  border: 1px solid rgba(215, 227, 245, 0.85);
  border-radius: 8px;
  background: #ffffff;
  color: var(--cure-text);
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.6rem 0.8rem;
}

.profile-mark {
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  place-items: center;
  border-radius: 50%;
  background: var(--cure-text);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 800;
}

@media (min-width: 980px) {
  .menu-button {
    display: none;
  }
}

@media (max-width: 640px) {
  .topbar,
  .topbar-main,
  .topbar-actions {
    align-items: start;
    flex-direction: column;
  }

  .topbar-actions {
    width: 100%;
  }

  .action-link,
  .profile-link {
    width: 100%;
    justify-content: center;
  }
}
</style>
