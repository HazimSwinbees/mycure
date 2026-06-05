<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getSymptomMatches, loadSymptomDataset } from '../../services/symptomCheckerApi'

const isLoading = ref(true)
const loadError = ref('')
const datasetRows = ref([])
const symptomOptions = ref([])
const filterOptions = reactive({
  gender: [],
  bloodPressure: [],
  cholesterolLevel: [],
})

const form = reactive({
  age: '',
  gender: '',
  bloodPressure: '',
  cholesterolLevel: '',
  symptoms: {
    fever: false,
    cough: false,
    fatigue: false,
    difficultyBreathing: false,
  },
})

const diagnosed = ref(false)
const matches = ref([])

const levelDisplayMap = {
  Low: 'Low - 50',
  Normal: 'Normal - 100',
  High: 'High - 150',
}

const levelOrder = ['Low', 'Normal', 'High']

const orderedBloodPressureOptions = computed(() =>
  levelOrder.filter((level) => filterOptions.bloodPressure.includes(level)),
)

const orderedCholesterolOptions = computed(() =>
  levelOrder.filter((level) => filterOptions.cholesterolLevel.includes(level)),
)

const topMatches = computed(() => matches.value.slice(0, 3))

const formatLevelOption = (value) => levelDisplayMap[value] || value

const buildBookingReason = (match) => {
  const activeSymptoms = symptomOptions.value
    .filter((item) => form.symptoms[item.key])
    .map((item) => item.label)

  const reasonParts = [
    `Possible disease match: ${match.disease}.`,
    activeSymptoms.length ? `Symptoms selected: ${activeSymptoms.join(', ')}.` : '',
    form.age ? `Age: ${form.age}.` : '',
    form.gender ? `Gender: ${form.gender}.` : '',
    form.bloodPressure ? `Blood pressure: ${formatLevelOption(form.bloodPressure)}.` : '',
    form.cholesterolLevel ? `Cholesterol: ${formatLevelOption(form.cholesterolLevel)}.` : '',
  ]

  return reasonParts.filter(Boolean).join(' ')
}

const runDiagnosis = () => {
  diagnosed.value = true
  matches.value = getSymptomMatches(datasetRows.value, form)
}

const clearForm = () => {
  form.age = ''
  form.gender = ''
  form.bloodPressure = ''
  form.cholesterolLevel = ''

  Object.keys(form.symptoms).forEach((key) => {
    form.symptoms[key] = false
  })

  diagnosed.value = false
  matches.value = []
}

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const dataset = await loadSymptomDataset()
    datasetRows.value = dataset.rows
    symptomOptions.value = dataset.symptomOptions
    filterOptions.gender = dataset.filters.gender || []
    filterOptions.bloodPressure = dataset.filters.bloodPressure || []
    filterOptions.cholesterolLevel = dataset.filters.cholesterolLevel || []
  } catch (error) {
    loadError.value = error.message || 'Unable to load the symptom checker dataset.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="symptom-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="section-label">Symptom checker</p>
        <h1>Check symptom patterns from the dataset</h1>
        <p class="muted-copy">
          Enter symptoms and basic health details, then run a dataset-based comparison to see the
          top matching disease records. This is guidance only and not a diagnosis.
        </p>
      </div>
    </section>

    <section v-if="isLoading" class="state-panel">
      <p class="section-label">Dataset</p>
      <h2>Loading symptom records</h2>
      <p class="muted-copy">Reading the disease prediction dataset from local app storage.</p>
    </section>

    <section v-else-if="loadError" class="state-panel">
      <p class="section-label">Dataset</p>
      <h2>Unable to load symptom checker</h2>
      <p class="muted-copy">{{ loadError }}</p>
    </section>

    <template v-else>
      <section class="panel input-panel">
        <div class="panel-head">
          <div>
            <p class="section-label">Input</p>
            <h2>Patient details and symptoms</h2>
          </div>
        </div>

        <div class="input-grid">
          <div class="grid-field symptom-group">
            <span class="grid-label">Symptoms</span>
            <button
              v-for="symptom in symptomOptions.filter((item) => item.key === 'fever')"
              :key="symptom.key"
              :class="['symptom-tile', { active: form.symptoms[symptom.key] }]"
              type="button"
              @click="form.symptoms[symptom.key] = !form.symptoms[symptom.key]"
            >
              <strong>{{ symptom.label }}</strong>
            </button>
          </div>

          <div class="grid-field symptom-group">
            <button
              v-for="symptom in symptomOptions.filter((item) => item.key === 'cough')"
              :key="symptom.key"
              :class="['symptom-tile', { active: form.symptoms[symptom.key] }]"
              type="button"
              @click="form.symptoms[symptom.key] = !form.symptoms[symptom.key]"
            >
              <strong>{{ symptom.label }}</strong>
            </button>
          </div>

          <div class="grid-field symptom-group">
            <button
              v-for="symptom in symptomOptions.filter((item) => item.key === 'fatigue')"
              :key="symptom.key"
              :class="['symptom-tile', { active: form.symptoms[symptom.key] }]"
              type="button"
              @click="form.symptoms[symptom.key] = !form.symptoms[symptom.key]"
            >
              <strong>{{ symptom.label }}</strong>
            </button>
          </div>

          <div class="grid-field symptom-group">
            <button
              v-for="symptom in symptomOptions.filter((item) => item.key === 'difficultyBreathing')"
              :key="symptom.key"
              :class="['symptom-tile', { active: form.symptoms[symptom.key] }]"
              type="button"
              @click="form.symptoms[symptom.key] = !form.symptoms[symptom.key]"
            >
              <strong>{{ symptom.label }}</strong>
            </button>
          </div>

          <label class="grid-field">
            <span class="grid-label">Age</span>
            <input class="field-control" v-model="form.age" type="number" min="0" placeholder="Enter age" />
          </label>

          <label class="grid-field">
            <span class="grid-label">Gender</span>
            <select class="field-control" v-model="form.gender">
              <option value="">Select gender</option>
              <option v-for="option in filterOptions.gender" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>

          <label class="grid-field">
            <span class="grid-label">Blood pressure</span>
            <select class="field-control" v-model="form.bloodPressure">
              <option value="">Select level</option>
              <option v-for="option in orderedBloodPressureOptions" :key="option" :value="option">
                {{ formatLevelOption(option) }}
              </option>
            </select>
          </label>

          <label class="grid-field">
            <span class="grid-label">Cholesterol</span>
            <select class="field-control" v-model="form.cholesterolLevel">
              <option value="">Select level</option>
              <option
                v-for="option in orderedCholesterolOptions"
                :key="option"
                :value="option"
              >
                {{ formatLevelOption(option) }}
              </option>
            </select>
          </label>
        </div>

        <div class="action-row">
          <button class="diagnose-button" type="button" @click="runDiagnosis">Diagnose</button>
          <button class="clear-button" type="button" @click="clearForm">Clear</button>
        </div>

        <p class="disclaimer">
          The results are based on the uploaded CSV records and should not be treated as a medical
          diagnosis.
        </p>
      </section>

      <section class="matches-section">
        <div class="panel-head">
          <div>
            <p class="section-label">Disease results</p>
            <h2>Possible disease matches</h2>
          </div>
        </div>

        <section v-if="!diagnosed" class="state-panel">
          <p class="section-label">Ready</p>
          <h2>Run the checker to see disease matches</h2>
          <p class="muted-copy">
            Click <strong>Diagnose</strong> after filling in the symptom and patient details.
          </p>
        </section>

        <section v-else-if="!matches.length" class="state-panel">
          <p class="section-label">No match</p>
          <h2>No disease matches found</h2>
          <p class="muted-copy">
            Try changing the selected symptoms or filling in more profile details.
          </p>
        </section>

        <div v-else class="results-stack">
          <p class="results-note">Showing the top 3 possible disease matches.</p>

          <article
            v-for="(match, index) in topMatches"
            :key="match.id"
            class="match-card"
          >
            <div class="match-top">
              <div class="match-lead">
                <span class="rank-badge">Top {{ index + 1 }}</span>
                <span class="match-badge">{{ match.matchLabel }}</span>
              </div>
              <strong class="match-score">{{ match.score }} pts</strong>
            </div>

            <div class="match-main">
              <h3>{{ match.disease }}</h3>
              <p class="match-copy">
                Matched on {{ match.reasons.join(', ').toLowerCase() }}.
              </p>
            </div>

            <div class="detail-grid">
              <article class="detail-item">
                <span>Age reference</span>
                <strong>{{ match.age || '-' }}</strong>
              </article>
              <article class="detail-item">
                <span>Gender</span>
                <strong>{{ match.gender || '-' }}</strong>
              </article>
              <article class="detail-item">
                <span>Blood pressure</span>
                <strong>{{ match.bloodPressure ? formatLevelOption(match.bloodPressure) : '-' }}</strong>
              </article>
              <article class="detail-item">
                <span>Cholesterol</span>
                <strong>{{ match.cholesterolLevel ? formatLevelOption(match.cholesterolLevel) : '-' }}</strong>
              </article>
            </div>

            <div class="match-actions">
              <RouterLink
                class="book-link"
                :to="{
                  name: 'booking',
                  query: {
                    serviceId: 'general-consultation',
                    reason: buildBookingReason(match),
                  },
                }"
              >
                Book general consultation
              </RouterLink>
            </div>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.symptom-page,
.matches-section,
.results-stack {
  display: grid;
  gap: 1rem;
}

.hero-panel,
.panel,
.state-panel,
.match-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.hero-panel,
.panel,
.state-panel,
.match-card {
  padding: 1.25rem;
}

.hero-copy,
.match-main {
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
.match-main h3 {
  color: #111827;
  font-weight: 700;
}

.hero-copy h1 {
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.05;
}

.muted-copy,
.disclaimer,
.match-copy,
.detail-item span,
.tile-label {
  color: #6b7280;
}

.panel-head,
.match-top,
.match-actions,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.input-grid,
.detail-grid {
  display: grid;
  gap: 0.85rem;
}

.input-grid {
  margin-top: 1rem;
}

.grid-field {
  display: grid;
  align-content: start;
  gap: 0.45rem;
}

.grid-label {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
}

.symptom-tile {
  min-height: 54px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 0.45rem 1rem;
  text-align: left;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.symptom-tile strong {
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
}

.symptom-group {
  align-self: end;
}

.symptom-tile:hover {
  border-color: #cfd8ff;
  background: #f7f9ff;
  color: #3f4fb3;
}

.symptom-tile.active {
  border-color: #4a56c9;
  background: #4a56c9;
  box-shadow: 0 12px 28px rgba(74, 86, 201, 0.22);
}

.symptom-tile.active .tile-label,
.symptom-tile.active strong {
  color: #ffffff;
}

.field-control {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  padding: 0.8rem 0.9rem;
}

.action-row {
  justify-content: center;
  margin-top: 1rem;
}

.diagnose-button,
.clear-button {
  min-width: 8.5rem;
  min-height: 42px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.diagnose-button {
  border: 1px solid #4a56c9;
  background: #4a56c9;
  color: #ffffff;
}

.diagnose-button:hover {
  border-color: #3f4fb3;
  background: #3f4fb3;
}

.clear-button {
  border: 1px solid #dbe2ea;
  background: #ffffff;
  color: #4b5563;
}

.clear-button:hover {
  border-color: #c5cfdb;
  background: #f8fafc;
  color: #111827;
}

.disclaimer {
  margin-top: 1rem;
  text-align: center;
  line-height: 1.6;
}

.match-card {
  display: grid;
  gap: 1rem;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.match-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.08);
  transform: translateY(-2px);
}

.match-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4a56c9;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.38rem 0.72rem;
}

.match-lead {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.38rem 0.72rem;
}

.match-score,
.detail-item strong {
  color: #111827;
  font-weight: 600;
}

.results-note {
  color: #475569;
  font-size: 0.92rem;
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-item {
  display: grid;
  gap: 0.3rem;
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.match-actions {
  justify-content: flex-start;
  padding-top: 0.2rem;
}

.book-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 10px;
  background: #111827;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

@media (min-width: 900px) {
  .input-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
