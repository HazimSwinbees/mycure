<script setup>
import { computed, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '../components/navigation/AppSidebar.vue'
import AppTopbar from '../components/navigation/AppTopbar.vue'

const route = useRoute()
const isSidebarOpen = ref(false)

const pageTitle = computed(() => route.meta.title || 'Dashboard')
const isStandalonePage = computed(() => Boolean(route.meta.standalone))
const userName = computed(() => {
  const storedUser = localStorage.getItem('mycure_user')

  if (!storedUser) {
    return 'Patient'
  }

  try {
    const parsed = JSON.parse(storedUser)
    return parsed.first_name || parsed.full_name || parsed.email || 'Patient'
  } catch {
    return 'Patient'
  }
})

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openSidebar = () => {
  isSidebarOpen.value = true
}
</script>

<template>
  <div :class="['app-layout', { 'standalone-layout': isStandalonePage }]">
    <AppSidebar v-if="!isStandalonePage" :open="isSidebarOpen" @close="closeSidebar" />

    <div :class="['app-workspace', { 'standalone-workspace': isStandalonePage }]">
      <div v-if="!isStandalonePage" class="mobile-topbar">
        <AppTopbar :title="pageTitle" :user-name="userName" @toggle-sidebar="openSidebar" />
      </div>

      <main class="app-main" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f9fd, var(--cure-bg) 28rem);
  overflow-x: hidden;
}

.app-workspace {
  display: grid;
  gap: 1rem;
  min-width: 0;
  padding: 0.75rem;
}

.mobile-topbar {
  display: block;
}

.app-main {
  min-height: 0;
}

@media (min-width: 980px) {
  .app-layout {
    display: grid;
    grid-template-columns: 286px minmax(0, 1fr);
  }

  .app-layout.standalone-layout {
    display: block;
  }

  .app-workspace {
    min-height: 100vh;
    border-left: 1px solid rgba(215, 227, 245, 0.72);
    padding: 1.25rem;
  }

  .app-workspace.standalone-workspace {
    border-left: 0;
    padding: 0;
  }

  .mobile-topbar {
    display: none;
  }
}
</style>
