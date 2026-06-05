const MODEL_NAME = 'gemini-2.5-flash'

const buildSystemPrompt = (audience) => {
  if (audience === 'doctor') {
    return (
      'You are MyCure AI assistant for doctors. Help with clinic workflow, patient communication drafting, and general medical information summaries. ' +
      'Do not claim to diagnose patients with certainty. Encourage clinical judgment and local protocol checks.'
    )
  }

  return (
    'You are MyCure AI assistant for patients. Give clear, supportive health information in plain language. ' +
    'Do not provide definitive diagnosis, prescriptions, or emergency-only delays. Encourage contacting the clinic or emergency services when appropriate.'
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
