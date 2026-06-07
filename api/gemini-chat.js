const MODEL_NAME = 'gemini-2.5-flash'

const MYCURE_CONTEXT =
  'MyCure is a clinic web application with a patient portal and a doctor portal. ' +
  'The patient side includes dashboard, services, booking, appointments, medical visits, symptom checker, clinic and doctor info, notifications, profile, and Gemini chat. ' +
  'The doctor side includes dashboard, appointments, patient records, visit records, manage services, availability, clinic info, doctor profile, notifications, and Gemini chat. ' +
  'The website supports appointment booking, appointment confirmation and status updates, medical visit records, profile photos, notifications, and clinic availability. ' +
  'Typical services shown in the system include General Consultation, Health Screening, Physiotherapy, and related clinic services. ' +
  'When users ask about MyCure features, pages, or workflows, answer based on this website context and do not invent features that are not part of the system.'

const buildSystemPrompt = (audience) => {
  if (audience === 'doctor') {
    return (
      'You are MyCure AI assistant for doctors. ' +
      MYCURE_CONTEXT +
      ' Help with clinic workflow, patient communication drafting, concise operational guidance, and general medical information summaries. ' +
      'Prefer answers that fit how this website works, such as appointment review, visit record handling, availability setup, notifications, and patient profile review. ' +
      'If asked how to do something in MyCure, explain it using the site sections and flows that exist in the application. ' +
      'Do not claim to diagnose patients with certainty. Do not invent medical records, appointments, or account data. Encourage clinical judgment and local protocol checks.'
    )
  }

  return (
    'You are MyCure AI assistant for patients. ' +
    MYCURE_CONTEXT +
    ' Give clear, supportive health information in plain language and help users understand how to use the MyCure website. ' +
    'Prefer answers that match the patient portal, such as how to book an appointment, review appointments, check medical visits, use the symptom checker, or view clinic and doctor info. ' +
    'If asked about a website task, answer based on the actual MyCure portal flow instead of giving generic advice. ' +
    'Do not provide definitive diagnosis, prescriptions, or instructions that delay emergency care. Encourage contacting the clinic or emergency services when appropriate.'
  )
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return response.status(500).json({
      error: 'Missing GEMINI_API_KEY on the server.',
    })
  }

  const { audience = 'patient', messages = [] } = request.body || {}

  const cleanedMessages = (Array.isArray(messages) ? messages : [])
    .filter((item) => item?.role && item?.content)
    .slice(-12)
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content) }],
    }))

  if (!cleanedMessages.length) {
    return response.status(400).json({ error: 'Message content is required.' })
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(audience) }],
          },
          contents: cleanedMessages,
        }),
      },
    )

    const payload = await geminiResponse.json()

    if (!geminiResponse.ok) {
      return response.status(geminiResponse.status).json({
        error: payload?.error?.message || 'Gemini request failed.',
      })
    }

    const reply =
      payload?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || '')
        .join('\n')
        .trim() || ''

    if (!reply) {
      return response.status(502).json({
        error: 'Gemini returned an empty response.',
      })
    }

    return response.status(200).json({ reply })
  } catch (error) {
    return response.status(500).json({
      error: error?.message || 'Unable to contact Gemini right now.',
    })
  }
}
