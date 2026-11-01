// api/generate-ideas.js - Vercel serverless function
// Generates fresh creative ideas for an existing event using Gemini

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' })
  }

  const { eventType, location, budget, currency, guests, preferences, includeIndianCulture } = req.body

  const currencySymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || '₹'

  const prompt = `You are EventWise AI. Generate fresh, creative, and practical event planning ideas for:
- Event Type: ${eventType}
- Location: ${location || 'Not specified'}
- Budget: ${currencySymbol}${Number(budget || 0).toLocaleString()}
- Guests: ${guests || 'Not specified'}
- Preferences: ${preferences || 'None'}
- Include Indian/Kerala cultural elements: ${includeIndianCulture ? 'Yes' : 'No'}

Respond ONLY with this JSON (no markdown):
{
  "themes": ["theme 1", "theme 2", "theme 3", "theme 4"],
  "decoration": ["idea 1", "idea 2", "idea 3", "idea 4", "idea 5"],
  "invitations": ["wording 1", "wording 2", "wording 3"],
  "food": ["menu idea 1", "menu idea 2", "menu idea 3", "menu idea 4"],
  "entertainment": ["idea 1", "idea 2", "idea 3", "idea 4"],
  "photography": ["concept 1", "concept 2", "concept 3", "concept 4"],
  "guestExperience": ["idea 1", "idea 2", "idea 3", "idea 4"]
}`

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 2048, responseMimeType: 'application/json' },
      }),
    })

    if (!response.ok) {
      return res.status(502).json({ error: 'AI service error' })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) return res.status(502).json({ error: 'Empty AI response' })

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const ideas = JSON.parse(cleaned)

    return res.status(200).json({ ideas })
  } catch (err) {
    console.error('Ideas generation error:', err)
    return res.status(500).json({ error: 'Failed to generate ideas' })
  }
}
