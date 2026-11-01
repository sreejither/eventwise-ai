// Gemini AI service - calls our secure serverless API endpoint
// Never exposes API keys in frontend code

const API_ENDPOINT = '/api/generate-plan';

export async function generateEventPlanWithAI(formData) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.plan) {
    throw new Error('Invalid response from AI service');
  }

  return data.plan;
}

export async function generateNewIdeasWithAI(eventData) {
  const response = await fetch('/api/generate-ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.ideas) throw new Error('Invalid ideas response');
  return data.ideas;
}

export async function checkAPIAvailability() {
  try {
    const response = await fetch('/api/health', { method: 'GET' });
    if (!response.ok) return false;
    const data = await response.json();
    return data.aiEnabled === true;
  } catch {
    return false;
  }
}
