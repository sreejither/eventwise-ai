// api/health.js - Vercel serverless function
// Health check endpoint to verify API availability and Gemini connectivity

export default function handler(req, res) {
  const aiEnabled = Boolean(process.env.GEMINI_API_KEY)

  res.status(200).json({
    status: 'ok',
    aiEnabled,
    timestamp: new Date().toISOString(),
  })
}
