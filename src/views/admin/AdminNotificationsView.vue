<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  getDoctorNotifications,
  markAllDoctorNotificationsRead,
  markDoctorNotificationRead,
} from '../../services/notificationApi'

const notifications = ref([])
const activeFilter = ref('All')
const selectedNotification = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const filterOptions = ['All', 'Read', 'Unread']

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'All') {
    return notifications.value
  }

  if (activeFilter.value === 'Unread') {
    return notifications.value.filter((item) => !item.read)
  }

  if (activeFilter.value === 'Read') {
    return notifications.value.filter((item) => item.read)
  }

  return notifications.value
})

const loadNotifications = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    notifications.value = await getDoctorNotifications()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load notifications right now.'
  } finally {
    isLoading.value = false
  }
}

const handleMarkAllRead = async () => {
  try {
    await markAllDoctorNotificationsRead()
    notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update notifications right now.'
  }
}

const openNotification = async (notification) => {
  selectedNotification.value = notification

  if (notification.read) {
    return
  }

  notifications.value = notifications.value.map((item) =>
    item.id === notification.id ? { ...item, read: true } : item,
  )

  try {
    await markDoctorNotificationRead(notification.id)
    selectedNotification.value = { ...notification, read: true }
  } catch (error) {
    errorMessage.value = error.message || 'Unable to update notifications right now.'
  }
}

const closeNotification = () => {
  selectedNotification.value = null
}

onMounted(loadNotifications)
</script>

<template>
  <section class="notifications-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Notifications</p>
        <h1>Recent updates</h1>
        <p class="muted-copy">
          Review appointment alerts, patient activity, and clinic reminders in one place.
        </p>
      </div>

      <button class="secondary-button" type="button" @click="handleMarkAllRead">Mark all read</button>
    </section>

    <section class="filter-bar">
      <button
        v-for="option in filterOptions"
        :key="option"
        :class="['filter-chip', { active: activeFilter === option }]"
        type="button"
        @click="activeFilter = option"
      >
        {{ option }}
      </button>
    </section>

    <section class="feed-section">
      <div v-if="isLoading" class="empty-state">
        <p class="section-label">Inbox</p>
        <h2>Loading notifications</h2>
        <p class="muted-copy">Fetching your latest updates.</p>
      </div>

      <div v-else-if="errorMessage" class="empty-state">
        <p class="section-label">Inbox</p>
        <h2>Unable to load notifications</h2>
        <p class="muted-copy">{{ errorMessage }}</p>
      </div>

      <div v-else-if="!filteredNotifications.length" class="empty-state">
        <p class="section-label">Inbox</p>
        <h2>No notifications</h2>
        <p class="muted-copy">There are no notifications for this filter right now.</p>
      </div>

      <div v-else class="notification-stack">
        <article
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :class="['notification-card', { unread: !notification.read }]"
          role="button"
          tabindex="0"
          @click="openNotification(notification)"
          @keydown.enter.prevent="openNotification(notification)"
          @keydown.space.prevent="openNotification(notification)"
        >
          <div class="card-marker" aria-hidden="true" />

          <div class="notification-body">
            <div class="notification-head">
              <div class="title-wrap">
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.body }}</p>
              </div>

              <div class="meta-wrap">
                <small>{{ notification.time }}</small>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div v-if="selectedNotification" class="modal-shell" @click.self="closeNotification">
      <section class="modal-card" aria-label="Notification details">
        <div class="modal-head">
          <div class="modal-title">
            <span class="type-chip">{{ selectedNotification.type }}</span>
            <h2>{{ selectedNotification.title }}</h2>
          </div>
          <button class="close-button" type="button" @click="closeNotification">Close</button>
        </div>

        <div class="modal-body">
          <p>{{ selectedNotification.body }}</p>
        </div>

        <div class="modal-footer">
          <small>{{ selectedNotification.time }}</small>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.notifications-page {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.filter-bar {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.hero-panel,
.filter-bar {
  padding: 1.25rem;
}

.hero-panel {
  display: grid;
  gap: 1rem;
}

.hero-copy {
  display: grid;
  gap: 0.35rem;
}

.section-label {
  color: #7a7f87;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hero-copy h1,
.empty-state h2,
.title-wrap strong {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.title-wrap p,
.meta-wrap small {
  color: #6b7280;
}

.secondary-button {
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-chip {
  min-height: 38px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.55rem 0.9rem;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.filter-chip.active {
  border-color: #cfd8ff;
  background: #eef2ff;
  color: #3f4fb3;
}

.feed-section {
  display: grid;
  gap: 1rem;
}

.empty-state {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 0;
}

.notification-stack {
  display: grid;
  gap: 0.9rem;
}

.notification-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 1rem;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
  cursor: pointer;
}

.notification-card:hover {
  border-color: #d6def5;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.notification-card.unread {
  border-color: #d7e3fb;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.card-marker {
  width: 10px;
  min-height: 100%;
  border-radius: 999px;
  background: #dbeafe;
}

.notification-card.unread .card-marker {
  background: #4a56c9;
}

.notification-body,
.notification-head,
.title-wrap,
.meta-wrap {
  display: grid;
  gap: 0.35rem;
}

.title-wrap strong {
  font-size: 1rem;
}

.title-wrap p {
  line-height: 1.55;
}

.meta-wrap {
  justify-items: start;
}

.type-chip {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eef2ff;
  color: #3f4fb3;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.72rem;
}

.modal-shell {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.28);
  padding: 1rem;
}

.modal-card {
  width: min(100%, 520px);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  padding: 1.25rem;
}

.modal-head,
.modal-title,
.modal-body,
.modal-footer {
  display: grid;
  gap: 0.6rem;
}

.modal-head {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
}

.modal-title h2 {
  color: #111827;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.3;
}

.modal-body {
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-top: 1rem;
  padding: 1rem 0;
}

.modal-body p,
.modal-footer small {
  color: #6b7280;
  line-height: 1.65;
}

.close-button {
  min-height: 38px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.55rem 0.85rem;
}

@media (min-width: 760px) {
  .hero-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .notification-head {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 1rem;
  }

  .meta-wrap {
    justify-items: end;
  }
}
</style>
