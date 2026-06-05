const datasetPath = '/data/desease-prediction.csv'

const normalizeHeader = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, character) => character.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')

const parseCsvLine = (line) => {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

const titleCase = (value) =>
  value.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase())

const symptomFields = ['fever', 'cough', 'fatigue', 'difficultyBreathing']
const profileFields = ['age', 'gender', 'bloodPressure', 'cholesterolLevel']

export const loadSymptomDataset = async () => {
  const response = await fetch(datasetPath)

  if (!response.ok) {
    throw new Error('Unable to load the symptom dataset.')
  }

  const csvText = await response.text()
  const lines = csvText.split(/\r?\n/).filter(Boolean)

  if (lines.length < 2) {
    return { rows: [], symptomOptions: [], filters: {} }
  }

  const rawHeaders = parseCsvLine(lines[0])
  const headers = rawHeaders.map(normalizeHeader)

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })

    return row
  })

  const symptomOptions = symptomFields.map((field) => ({
    key: field,
    label: titleCase(field),
  }))

  const filters = profileFields.reduce((result, field) => {
    result[field] = [...new Set(rows.map((row) => row[field]).filter(Boolean))]
    return result
  }, {})

  return {
    rows,
    symptomOptions,
    filters,
  }
}

const scoreAge = (rowAge, inputAge) => {
  if (!rowAge || !inputAge) return 0

  const difference = Math.abs(Number(rowAge) - Number(inputAge))

  if (Number.isNaN(difference)) return 0
  if (difference <= 3) return 2
  if (difference <= 8) return 1
  return 0
}

export const getSymptomMatches = (rows, input) => {
  const scoredRows = rows.map((row) => {
    let score = 0
    const reasons = []

    symptomFields.forEach((field) => {
      const selected = Boolean(input.symptoms[field])
      const rowValue = row[field]

      if (selected && rowValue === 'Yes') {
        score += field === 'difficultyBreathing' ? 4 : 3
        reasons.push(titleCase(field))
      }
    })

    if (input.gender && row.gender === input.gender) {
      score += 1
    }

    if (input.bloodPressure && row.bloodPressure === input.bloodPressure) {
      score += 1
    }

    if (input.cholesterolLevel && row.cholesterolLevel === input.cholesterolLevel) {
      score += 1
    }

    score += scoreAge(row.age, input.age)

    return {
      ...row,
      score,
      reasons,
    }
  })

  const grouped = new Map()

  for (const row of scoredRows) {
    if (row.score <= 0) continue

    const existing = grouped.get(row.disease)
    if (!existing || row.score > existing.score) {
      grouped.set(row.disease, row)
    }
  }

  return [...grouped.values()]
    .sort((left, right) => right.score - left.score)
    .map((row, index) => ({
      id: `${row.disease}-${index}`,
      disease: row.disease,
      score: row.score,
      matchLabel:
        row.score >= 10 ? 'High match' : row.score >= 7 ? 'Moderate match' : 'Low match',
      reasons: row.reasons.length ? row.reasons : ['Profile similarity'],
      age: row.age,
      gender: row.gender,
      bloodPressure: row.bloodPressure,
      cholesterolLevel: row.cholesterolLevel,
    }))
}
