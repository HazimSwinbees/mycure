<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  addClinicClosure,
  getAvailabilitySettings,
  removeClinicClosure,
  saveWeeklyAvailability,
} from '../../services/availabilityApi'

const weeklySchedule = ref([])
const closures = ref([])
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const closureError = ref('')
const isSavingSchedule = ref(false)
const isSavingClosure = ref(false)

const closureForm = reactive({
  closureDate: '',
  mode: 'full-day',
  startTime: '09:00',
  endTime: '17:00',
})

const dayRangeForms = reactive({})

const hasSchedule = computed(() => weeklySchedule.value.length > 0)
const hasClosures = computed(() => closures.value.length > 0)
const isPartialClosure = computed(() => closureForm.mode === 'time-range')

const ensureDayForm = (weekday) => {
  if (!dayRangeForms[weekday]) {
    dayRangeForms[weekday] = {
      startTime: '09:00',
      endTime: '17:00',
    }
  }

  return dayRangeForms[weekday]
}

const buildTimeSlots = (startTime, endTime, intervalMinutes) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  let current = startHours * 60 + startMinutes
  const end = endHours * 60 + endMinutes
  const slots = []

  while (current <= end) {
    const hours = String(Math.floor(current / 60)).padStart(2, '0')
    const minutes = String(current % 60).padStart(2, '0')
    slots.push(`${hours}:${minutes}`)
    current += intervalMinutes
  }

  return slots
}

const syncDayForms = () => {
  for (const day of weeklySchedule.value) {
    const form = ensureDayForm(day.weekday)
    form.startTime = day.availableSlots?.[0] || day.startTime || '09:00'
    form.endTime = day.availableSlots?.[day.availableSlots.length - 1] || day.endTime || '17:00'
  }
}

const loadAvailability = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const settings = await getAvailabilitySettings()
    weeklySchedule.value = settings.weeklySchedule.map((day) => ({
      ...day,
      availableSlots: [...(day.availableSlots || [])],
    }))
    closures.value = settings.closures
    syncDayForms()
  } catch (error) {
    loadError.value = error.message || 'Unable to load clinic availability.'
  } finally {
    isLoading.value = false
  }
}

const saveSchedule = async () => {
  isSavingSchedule.value = true
  saveError.value = ''

  try {
    const settings = await saveWeeklyAvailability(weeklySchedule.value)
    weeklySchedule.value = settings.weeklySchedule.map((day) => ({
      ...day,
      availableSlots: [...(day.availableSlots || [])],
    }))
    closures.value = settings.closures
    syncDayForms()
  } catch (error) {
    saveError.value = error.message || 'Unable to save weekly availability.'
  } finally {
    isSavingSchedule.value = false
  }
}

const addTimeRange = (day) => {
  const form = ensureDayForm(day.weekday)

  if (!form.startTime || !form.endTime || form.startTime >= form.endTime) {
    saveError.value = `Invalid time range for ${day.dayName}.`
    return
  }

  saveError.value = ''

  const newSlots = buildTimeSlots(form.startTime, form.endTime, day.slotIntervalMinutes || 30)
  const mergedSlots = [...new Set([...(day.availableSlots || []), ...newSlots])].sort()

  day.availableSlots = mergedSlots
  day.isOpen = mergedSlots.length > 0
  day.startTime = mergedSlots[0] || form.startTime
  day.endTime = mergedSlots[mergedSlots.length - 1] || form.endTime
}

const removeSlot = (day, slot) => {
  day.availableSlots = (day.availableSlots || []).filter((item) => item !== slot)
  day.isOpen = day.availableSlots.length > 0
  day.startTime = day.availableSlots[0] || '09:00'
  day.endTime = day.availableSlots[day.availableSlots.length - 1] || '17:00'
}

const clearDay = (day) => {
  day.availableSlots = []
  day.isOpen = false
  day.startTime = '09:00'
  day.endTime = '17:00'
}

const resetClosureForm = () => {
  closureForm.closureDate = ''
  closureForm.mode = 'full-day'
  closureForm.startTime = '09:00'
  closureForm.endTime = '17:00'
}

const addClosure = async () => {
  if (!closureForm.closureDate) {
    closureError.value = 'Closure date is required.'
    return
  }

  if (isPartialClosure.value && closureForm.startTime >= closureForm.endTime) {
    closureError.value = 'End time must be later than start time.'
    return
  }

  isSavingClosure.value = true
  closureError.value = ''

  try {
    const settings = await addClinicClosure({
      closureDate: closureForm.closureDate,
      isFullDay: !isPartialClosure.value,
      startTime: closureForm.startTime,
      endTime: closureForm.endTime,
    })
    weeklySchedule.value = settings.weeklySchedule.map((day) => ({
      ...day,
      availableSlots: [...(day.availableSlots || [])],
    }))
    closures.value = settings.closures
    syncDayForms()
    resetClosureForm()
  } catch (error) {
    closureError.value = error.message || 'Unable to add closure date.'
  } finally {
    isSavingClosure.value = false
  }
}

const deleteClosure = async (id) => {
  isSavingClosure.value = true
  closureError.value = ''

  try {
    const settings = await removeClinicClosure(id)
    weeklySchedule.value = settings.weeklySchedule.map((day) => ({
      ...day,
      availableSlots: [...(day.availableSlots || [])],
    }))
    closures.value = settings.closures
    syncDayForms()
  } catch (error) {
    closureError.value = error.message || 'Unable to remove closure date.'
  } finally {
    isSavingClosure.value = false
  }
}

onMounted(loadAvailability)
</script>

<template>
  <section class="doctor-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Availability</p>
        <h1>Doctor availability</h1>
        <p class="muted-copy">
          Manage each day using actual booking slots, then close the clinic for a full day or part of a day when needed.
        </p>
      </div>
    </section>

    <section v-if="isLoading" class="panel">
      <p class="section-label">Availability</p>
      <h2>Loading schedule</h2>
    </section>

    <section v-else-if="loadError" class="panel">
      <p class="section-label">Availability</p>
      <h2>Unable to load availability</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <template v-else>
      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Weekly schedule</p>
            <h2>Available time slots</h2>
          </div>
        </div>

        <div v-if="hasSchedule" class="day-stack">
          <article v-for="day in weeklySchedule" :key="day.weekday" class="day-card">
            <div class="day-head">
              <div class="day-copy">
                <strong>{{ day.dayName }}</strong>
                <small>{{ day.isOpen ? `${day.availableSlots.length} slots` : 'Unavailable' }}</small>
              </div>

              <label class="toggle-row">
                <input v-model="day.isOpen" type="checkbox" />
                <span>{{ day.isOpen ? 'Available' : 'Unavailable' }}</span>
              </label>
            </div>

            <div v-if="day.isOpen && day.availableSlots.length" class="slot-grid">
              <button
                v-for="slot in day.availableSlots"
                :key="slot"
                class="slot-chip"
                type="button"
                @click="removeSlot(day, slot)"
              >
                <span>{{ slot }}</span>
                <span class="chip-close">x</span>
              </button>
            </div>

            <p v-else class="empty-copy">
              {{ day.isOpen ? 'No slots added for this day.' : 'This day is currently unavailable for booking.' }}
            </p>

            <div class="range-row" :class="{ 'is-disabled': !day.isOpen }">
              <label class="field compact-field">
                <span>From</span>
                <input v-model="ensureDayForm(day.weekday).startTime" type="time" :disabled="!day.isOpen" />
              </label>

              <label class="field compact-field">
                <span>To</span>
                <input v-model="ensureDayForm(day.weekday).endTime" type="time" :disabled="!day.isOpen" />
              </label>
            </div>

            <div class="day-actions">
              <button class="add-range-button" type="button" :disabled="!day.isOpen" @click="addTimeRange(day)">
                Add time range
              </button>
              <button class="clear-button" type="button" @click="clearDay(day)">Clear day</button>
            </div>
          </article>
        </div>

        <p v-if="saveError" class="error-copy" role="alert">{{ saveError }}</p>

        <div class="action-row action-row-right action-row-spaced">
          <button class="primary-action" type="button" :disabled="isSavingSchedule" @click="saveSchedule">
            {{ isSavingSchedule ? 'Saving schedule...' : 'Save weekly schedule' }}
          </button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Clinic closure</p>
            <h2>Closed dates</h2>
          </div>
        </div>

        <div class="closure-form">
          <label class="field">
            <span>Closure date</span>
            <input v-model="closureForm.closureDate" type="date" />
          </label>

          <label class="field">
            <span>Closure type</span>
            <select v-model="closureForm.mode">
              <option value="full-day">Full day</option>
              <option value="time-range">Specific time</option>
            </select>
          </label>

          <label v-if="isPartialClosure" class="field">
            <span>Closed from</span>
            <input v-model="closureForm.startTime" type="time" />
          </label>

          <label v-if="isPartialClosure" class="field">
            <span>Closed until</span>
            <input v-model="closureForm.endTime" type="time" />
          </label>
        </div>

        <p v-if="closureError" class="error-copy" role="alert">{{ closureError }}</p>

        <div class="action-row action-row-right action-row-spaced">
          <button class="secondary-action" type="button" :disabled="isSavingClosure" @click="addClosure">
            {{ isSavingClosure ? 'Saving date...' : 'Add closed date' }}
          </button>
        </div>

        <div v-if="hasClosures" class="closure-list">
          <article v-for="closure in closures" :key="closure.id" class="closure-card">
            <div class="closure-copy">
              <strong>{{ closure.displayDate }}</strong>
              <p>
                {{
                  closure.isFullDay
                    ? 'Clinic closed for the full day.'
                    : `Clinic closed from ${closure.startTime} to ${closure.endTime}.`
                }}
              </p>
            </div>
            <button class="delete-button" type="button" :disabled="isSavingClosure" @click="deleteClosure(closure.id)">
              Remove
            </button>
          </article>
        </div>

        <p v-else class="muted-copy">No closed dates have been added.</p>
      </section>
    </template>
  </section>
</template>

<style scoped>
.doctor-page,
.day-stack,
.closure-list,
.closure-form {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.day-card,
.closure-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

.hero-panel,
.panel {
  padding: 1.25rem;
}

.day-card,
.closure-card {
  padding: 1rem;
}

.hero-copy,
.day-copy,
.closure-copy,
.field {
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
.panel-head h2,
.day-copy strong,
.closure-copy strong {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.day-copy small,
.closure-copy p,
.field span,
.empty-copy {
  color: #6b7280;
}

.panel-head,
.day-head,
.closure-card,
.action-row,
.day-actions,
.range-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.day-head {
  align-items: start;
}

.toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: #111827;
  font-size: 0.9rem;
  font-weight: 600;
}

.toggle-row input {
  width: 1rem;
  height: 1rem;
  accent-color: #4a56c9;
}

.day-card {
  display: grid;
  gap: 1rem;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.slot-chip {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.55rem 0.8rem 0.55rem 0.95rem;
}

.chip-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 999px;
  background: #111827;
  color: #fff;
  font-size: 0.8rem;
  line-height: 1;
}

.range-row {
  justify-content: flex-start;
}

.field {
  min-width: 9rem;
}

.compact-field {
  max-width: 12rem;
}

.field input,
.field select {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  color: #111827;
  font: inherit;
  padding: 0.75rem 0.9rem;
}

.field input:disabled {
  background: #f9fafb;
  color: #9ca3af;
}

.day-actions {
  justify-content: space-between;
}

.add-range-button,
.clear-button,
.primary-action,
.secondary-action,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.add-range-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.add-range-button,
.primary-action {
  border: 1px solid #3157b7;
  background: #3157b7;
  color: #fff;
}

.clear-button {
  border: 1px solid #d1d5db;
  background: #e5e7eb;
  color: #4b5563;
}

.secondary-action {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
}

.delete-button {
  border: 1px solid #fecaca;
  background: #fff5f5;
  color: #b91c1c;
}

.action-row-right {
  justify-content: flex-end;
}

.action-row-spaced {
  margin-top: 1.25rem;
}

.error-copy {
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 500;
}

.empty-copy,
.closure-copy p {
  margin: 0;
}

.is-disabled {
  opacity: 0.7;
}

@media (max-width: 980px) {
  .slot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .panel-head,
  .closure-card,
  .action-row,
  .range-row,
  .day-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .slot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field,
  .compact-field {
    width: 100%;
    max-width: none;
    min-width: 0;
  }

  .add-range-button,
  .clear-button {
    width: 100%;
  }
}
</style>
