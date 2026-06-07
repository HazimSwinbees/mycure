<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AdminSidebar from '../components/navigation/AdminSidebar.vue'
import AdminTopbar from '../components/navigation/AdminTopbar.vue'
import { getCurrentDoctorProfile } from '../services/doctorProfileApi'

const route = useRoute()
const isSidebarOpen = ref(false)
const doctorName = ref('Doctor')
const doctorPhotoUrl = ref('')

const pageTitle = computed(() => route.meta.title || 'Doctor portal')

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openSidebar = () => {
  isSidebarOpen.value = true
}

onMounted(async () => {
  try {
    const profile = await getCurrentDoctorProfile()
    doctorName.value = profile?.fullName || 'Doctor'
    doctorPhotoUrl.value = profile?.photoUrl || ''
  } catch {
    const raw = localStorage.getItem('mycure_user')

    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw)
      const metadata = parsed?.user_metadata || {}
      doctorName.value =
        metadata.name ||
        `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim() ||
        parsed?.email ||
        'Doctor'
    } catch {
      doctorName.value = 'Doctor'
    }
  }
})
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar :open="isSidebarOpen" @close="closeSidebar" />

    <div class="admin-workspace">
      <div class="mobile-topbar">
        <AdminTopbar
          :title="pageTitle"
          :user-name="doctorName"
          :photo-url="doctorPhotoUrl"
          @toggle-sidebar="openSidebar"
        />
      </div>

      <main class="admin-main" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8fbff;
}

.admin-workspace {
  display: grid;
  gap: 1rem;
  min-width: 0;
  padding: 0.75rem;
}

.mobile-topbar {
  display: block;
}

.admin-main {
  min-height: 0;
}

@media (min-width: 980px) {
  .admin-layout {
    display: grid;
    grid-template-columns: 286px minmax(0, 1fr);
  }

  .admin-workspace {
    min-height: 100vh;
    padding: 1.25rem;
  }

  .mobile-topbar {
    display: none;
  }

  .admin-main {
    min-height: 100vh;
  }
}
</style>
