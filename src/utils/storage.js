// localStorage utility for EventWise AI

const STORAGE_KEY = 'eventwise_events';

export function getEvents() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEvent(event) {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === event.id);
  if (idx >= 0) {
    events[idx] = event;
  } else {
    events.unshift(event);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  return event;
}

export function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getEventById(id) {
  return getEvents().find(e => e.id === id) || null;
}

export function generateId() {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatCurrency(amount, currency = 'INR') {
  const locales = { INR: 'en-IN', USD: 'en-US', EUR: 'en-DE', GBP: 'en-GB' };
  return new Intl.NumberFormat(locales[currency] || 'en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getCompletedTaskCount(events) {
  return events.reduce((total, event) => {
    const tl = (event.plan?.timeline || []).reduce((s, phase) =>
      s + (phase.tasks || []).filter(t => t.completed).length, 0);
    const vl = (event.plan?.vendorChecklist || []).filter(v => v.status === 'Completed').length;
    return total + tl + vl;
  }, 0);
}
