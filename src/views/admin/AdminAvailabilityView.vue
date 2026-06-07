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
const activeWeekday = ref('')

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
const activeDay = computed(() => weeklySchedule.value.find((day) => day.weekday === activeWeekday.value) || null)

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
    activeWeekday.value = weeklySchedule.value[0]?.weekday || ''
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
      <section v-if="hasSchedule" class="tabs-panel" aria-label="Availability days">
        <div class="tabs-row" role="tablist" aria-label="Availability days">
          <button
            v-for="day in weeklySchedule"
            :key="day.weekday"
            class="tab-button"
            :class="{ 'is-active': activeWeekday === day.weekday }"
            type="button"
            role="tab"
            :aria-selected="activeWeekday === day.weekday"
            @click="activeWeekday = day.weekday"
          >
            <span>{{ day.dayName }}</span>
          </button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Weekly schedule</p>
            <h2>Available time slots</h2>
          </div>
        </div>

        <div v-if="hasSchedule" class="day-stack">
          <article v-if="activeDay" class="day-card">
            <div class="day-head">
              <div class="day-copy">
                <p class="day-kicker">Selected day</p>
                <strong>{{ activeDay.dayName }}</strong>
                <small>
                  {{
                    activeDay.isOpen
                      ? `${activeDay.availableSlots.length} slot${activeDay.availableSlots.length === 1 ? '' : 's'} ready`
                      : 'Currently unavailable for booking'
                  }}
                </small>
              </div>

              <label class="toggle-row">
                <input v-model="activeDay.isOpen" type="checkbox" />
                <span>{{ activeDay.isOpen ? 'Available' : 'Unavailable' }}</span>
              </label>
            </div>

            <div v-if="activeDay.isOpen && activeDay.availableSlots.length" class="slot-section">
              <div class="slot-section-head">
                <p class="section-label">Active slots</p>
                <p class="slot-helper">Select a slot to remove it.</p>
              </div>

              <div class="slot-grid">
              <button
                v-for="slot in activeDay.availableSlots"
                :key="slot"
                class="slot-chip"
                type="button"
                @click="removeSlot(activeDay, slot)"
              >
                <span>{{ slot }}</span>
                <span class="chip-close">x</span>
              </button>
              </div>
            </div>

            <p v-else class="empty-copy">
              {{
                activeDay.isOpen ? 'No slots added for this day.' : 'This day is currently unavailable for booking.'
              }}
            </p>

            <div class="day-tools" :class="{ 'is-disabled': !activeDay.isOpen }">
              <div class="slot-section-head">
                <p class="section-label">Add time range</p>
                <p class="slot-helper">New slots will be merged into the current day.</p>
              </div>

              <div class="range-row">
                <label class="field compact-field">
                  <span>From</span>
                  <input
                    v-model="ensureDayForm(activeDay.weekday).startTime"
                    type="time"
                    :disabled="!activeDay.isOpen"
                  />
                </label>

                <label class="field compact-field">
                  <span>To</span>
                  <input
                    v-model="ensureDayForm(activeDay.weekday).endTime"
                    type="time"
                    :disabled="!activeDay.isOpen"
                  />
                </label>
              </div>

              <div class="day-actions">
                <button
                  class="add-range-button"
                  type="button"
                  :disabled="!activeDay.isOpen"
                  @click="addTimeRange(activeDay)"
                >
                  Add time range
                </button>
                <button class="clear-button" type="button" @click="clearDay(activeDay)">Clear day</button>
              </div>
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

        <div class="action-row action-row-right action-row-spaced closure-action-row">
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
.closure-form,
.slot-section,
.day-tools {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.tabs-panel,
.panel,
.day-card,
.closure-card {
  border: 1px solid #e3ebf5;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.hero-panel,
.tabs-panel,
.panel {
  padding: 1.35rem;
}

.day-card,
.closure-card {
  padding: 1rem 1.05rem;
}

.hero-copy,
.day-copy,
.closure-copy,
.field {
  display: grid;
  gap: 0.35rem;
}

.section-label {
  color: #6f7d90;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1,
.panel-head h2,
.day-copy strong,
.closure-copy strong,
.overview-card strong {
  color: #14213d;
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
.empty-copy,
.overview-card span,
.slot-helper,
.day-kicker {
  color: #607086;
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

.tabs-row {
  display: flex;
  width: max-content;
  gap: 1.25rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  scrollbar-width: thin;
  flex-wrap: nowrap;
  min-width: 100%;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  position: relative;
  border: 0;
  background: transparent;
  color: #8a8f98;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0 0 0.85rem;
  white-space: nowrap;
}

.tab-button::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: transparent;
}

.tab-button.is-active {
  color: #4a56c9;
}

.tab-button.is-active::after {
  background: #5b61ff;
}

.toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 44px;
  border: 1px solid #d7e3fb;
  border-radius: 999px;
  background: #f8fbff;
  color: #14213d;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.95rem;
}

.toggle-row input {
  width: 1rem;
  height: 1rem;
  accent-color: #4a56c9;
}

.day-card {
  display: grid;
  gap: 1.1rem;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.slot-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.slot-chip {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  min-height: 42px;
  border: 1px solid #d7e3fb;
  border-radius: 999px;
  background: #f8fbff;
  color: #14213d;
  font-size: 0.92rem;
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
  background: #3157b7;
  color: #ffffff;
  font-size: 0.8rem;
  line-height: 1;
}

.range-row {
  justify-content: flex-start;
}

.day-tools {
  border-top: 1px solid #e8eef8;
  padding-top: 0.2rem;
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
  border: 1px solid #d7e3f2;
  border-radius: 12px;
  background: #ffffff;
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
  color: #ffffff;
}

.clear-button {
  border: 1px solid #d7e3fb;
  background: #f5f8ff;
  color: #3157b7;
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

.closure-action-row {
  margin-bottom: 1.1rem;
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
  .tabs-panel {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tabs-row {
    min-width: max-content;
    padding-right: 0.35rem;
  }

  .slot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .panel-head,
  .closure-card,
  .action-row,
  .range-row,
  .day-actions,
  .slot-section-head {
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
