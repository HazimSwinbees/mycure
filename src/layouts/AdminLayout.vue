<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AdminSidebar from '../components/navigation/AdminSidebar.vue'

const isSidebarOpen = ref(false)

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar :open="isSidebarOpen" @close="closeSidebar" />

    <div class="admin-workspace">
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
  min-width: 0;
}

.admin-main {
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2rem);
}

@media (min-width: 980px) {
  .admin-layout {
    display: grid;
    grid-template-columns: 286px minmax(0, 1fr);
  }

  .admin-workspace {
    min-height: 100vh;
  }
}
</style>
