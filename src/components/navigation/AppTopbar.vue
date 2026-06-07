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
  photoUrl: {
    type: String,
    default: '',
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
      <RouterLink class="icon-link" :to="{ name: 'notifications' }" aria-label="Notifications">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 3.5a4 4 0 0 1 4 4v2.2c0 .8.3 1.6.8 2.3l1 1.2c.4.5.1 1.3-.6 1.3H4.8c-.7 0-1-.8-.6-1.3l1-1.2c.5-.7.8-1.5.8-2.3V7.5a4 4 0 0 1 4-4Zm-1.8 14a1.8 1.8 0 0 0 3.6 0"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.6"
          />
        </svg>
      </RouterLink>
      <RouterLink class="profile-link compact-profile" :to="{ name: 'profile' }" aria-label="Profile">
        <span class="profile-mark" aria-hidden="true">
          <img v-if="photoUrl" :src="photoUrl" alt="" />
          <span v-else>{{ initials }}</span>
        </span>
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
  border: 1px solid var(--cure-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
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
  flex-wrap: nowrap;
  justify-content: flex-end;
}

.menu-button {
  display: inline-grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  gap: 0.22rem;
  border: 1px solid var(--cure-line);
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

.icon-link,
.profile-link {
  min-height: 40px;
  border: 1px solid var(--cure-line);
  border-radius: 8px;
  background: #ffffff;
  color: var(--cure-text);
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.6rem 0.8rem;
}

.icon-link,
.compact-profile {
  display: inline-flex;
  width: 40px;
  min-width: 40px;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.icon-link svg {
  width: 1.15rem;
  height: 1.15rem;
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
  overflow: hidden;
}

.profile-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 980px) {
  .menu-button {
    display: none;
  }
}

@media (max-width: 640px) {
  .topbar {
    align-items: center;
    flex-direction: row;
  }

  .topbar-actions {
    width: auto;
    margin-left: auto;
  }
}
</style>
