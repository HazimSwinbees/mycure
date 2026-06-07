<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '../components/navigation/AppSidebar.vue'
import AppTopbar from '../components/navigation/AppTopbar.vue'
import { getCurrentPatientProfile } from '../services/patientApi'

const route = useRoute()
const isSidebarOpen = ref(false)
const patientPhotoUrl = ref('')

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

onMounted(async () => {
  try {
    const profile = await getCurrentPatientProfile()
    patientPhotoUrl.value = profile?.photo_url || ''
  } catch {
    patientPhotoUrl.value = ''
  }
})
</script>

<template>
  <div :class="['app-layout', { 'standalone-layout': isStandalonePage }]">
    <AppSidebar v-if="!isStandalonePage" :open="isSidebarOpen" @close="closeSidebar" />

    <div :class="['app-workspace', { 'standalone-workspace': isStandalonePage }]">
      <div v-if="!isStandalonePage" class="mobile-topbar">
        <AppTopbar
          :title="pageTitle"
          :user-name="userName"
          :photo-url="patientPhotoUrl"
          @toggle-sidebar="openSidebar"
        />
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
  background:
    radial-gradient(circle at top left, rgba(42, 123, 240, 0.12), transparent 28rem),
    linear-gradient(180deg, var(--cure-bg-strong), var(--cure-bg) 36rem);
  overflow-x: hidden;
}

.app-workspace {
  display: grid;
  gap: 1rem;
  min-width: 0;
  padding: 0.75rem;
  background: transparent;
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
