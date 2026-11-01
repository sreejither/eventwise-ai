// api/generate-plan.js - Vercel serverless function
// Securely calls Gemini API without exposing the key to the frontend

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured. Using demo mode.' })
  }

  const {
    name, eventType, location, date, guests, budget, currency,
    preferences, theme, requirements, includeIndianCulture
  } = req.body

  if (!eventType || !budget) {
    return res.status(400).json({ error: 'Missing required fields: eventType and budget' })
  }

  const currencySymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || '₹'
  const formattedBudget = `${currencySymbol}${Number(budget).toLocaleString('en-IN')}`

  const prompt = `You are EventWise AI, an expert event planner. Generate a comprehensive, practical event plan for the following event.

EVENT DETAILS:
- Name: ${name || 'Unnamed Event'}
- Type: ${eventType}
- Location: ${location || 'To be decided'}
- Date: ${date || 'To be decided'}
- Guest Count: ${guests || 'To be decided'}
- Total Budget: ${formattedBudget} (${currency})
- Theme/Style: ${theme || 'Not specified'}
- Preferences: ${preferences || 'None specified'}
- Additional Requirements: ${requirements || 'None'}
- Include Indian/Kerala Cultural Elements: ${includeIndianCulture ? 'Yes' : 'No'}

IMPORTANT INSTRUCTIONS:
1. All budget figures are ESTIMATES only - clearly note this
2. Ensure budgetBreakdown total does not exceed the given budget of ${formattedBudget}
3. Make suggestions practical and budget-conscious
4. ${includeIndianCulture ? 'Include relevant Kerala/Indian cultural traditions, rituals, and regional food ideas' : 'Use universal event planning suggestions'}
5. Adapt timeline to the actual event date if provided
6. Generate exactly the JSON structure below with no markdown or extra text

Respond ONLY with this exact JSON structure (no markdown, no code blocks):
{
  "eventOverview": "2-3 sentence overview of the event plan",
  "theme": "specific theme name",
  "budgetBreakdown": [
    {"name": "Category Name", "percentage": 25, "estimated": 125000, "currency": "${currency}"}
  ],
  "timeline": [
    {
      "phase": "3 Months Before",
      "date": null,
      "tasks": [
        {"text": "Task description", "completed": false}
      ]
    }
  ],
  "vendorChecklist": [
    {"id": "v1", "name": "Vendor Category", "status": "Not Started", "estimatedCost": "", "notes": ""}
  ],
  "creativeIdeas": {
    "themes": ["theme 1", "theme 2", "theme 3", "theme 4"],
    "decoration": ["idea 1", "idea 2", "idea 3", "idea 4", "idea 5"],
    "invitations": ["wording 1", "wording 2", "wording 3"],
    "food": ["menu idea 1", "menu idea 2", "menu idea 3", "menu idea 4"],
    "entertainment": ["idea 1", "idea 2", "idea 3", "idea 4"],
    "photography": ["concept 1", "concept 2", "concept 3", "concept 4"],
    "guestExperience": ["idea 1", "idea 2", "idea 3", "idea 4"]
  }
}`

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json().catch(() => ({}))
      console.error('Gemini API error:', errData)
      return res.status(502).json({ error: 'AI service temporarily unavailable' })
    }

    const geminiData = await geminiResponse.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from AI service' })
    }

    // Parse and validate the JSON
    let plan
    try {
      // Strip any markdown code blocks if present
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      plan = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw:', rawText.substring(0, 200))
      return res.status(502).json({ error: 'Invalid response format from AI service' })
    }

    // Validate required fields
    if (!plan.budgetBreakdown || !plan.timeline || !plan.vendorChecklist) {
      return res.status(502).json({ error: 'Incomplete plan from AI service' })
    }

    // Ensure budget total doesn't exceed input budget
    const totalAllocated = plan.budgetBreakdown.reduce((s, c) => s + (Number(c.estimated) || 0), 0)
    if (totalAllocated > Number(budget) * 1.02) {
      // Scale down proportionally
      const scale = Number(budget) / totalAllocated
      plan.budgetBreakdown = plan.budgetBreakdown.map(c => ({
        ...c,
        estimated: Math.round(c.estimated * scale),
      }))
    }

    // Ensure vendor IDs exist
    plan.vendorChecklist = plan.vendorChecklist.map((v, i) => ({
      ...v,
      id: v.id || `v_${Date.now()}_${i}`,
    }))

    return res.status(200).json({ plan })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
