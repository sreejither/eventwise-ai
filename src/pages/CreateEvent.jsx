import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { generateId, saveEvent } from '../utils/storage.js'
import { generateDemoPlan } from '../utils/demoEngine.js'
import { generateEventPlanWithAI, checkAPIAvailability } from '../utils/aiService.js'

const EVENT_TYPES = ['Wedding', 'Birthday', 'Anniversary', 'Engagement', 'Baby Shower', 'Community Event', 'Festival Celebration', 'Other']
const CURRENCIES = [
  { code: 'INR', label: '₹ INR – Indian Rupee' },
  { code: 'USD', label: '$ USD – US Dollar' },
  { code: 'EUR', label: '€ EUR – Euro' },
  { code: 'GBP', label: '£ GBP – British Pound' },
]

function FormField({ label, required, error, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400
    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-purple-300'}`
}

export default function CreateEvent({ onSave }) {
  const navigate = useNavigate()
  const [aiAvailable, setAiAvailable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    eventType: 'Wedding',
    location: '',
    date: '',
    guests: '',
    budget: '',
    currency: 'INR',
    preferences: '',
    theme: '',
    requirements: '',
    includeIndianCulture: false,
  })

  useEffect(() => {
    checkAPIAvailability().then(setAiAvailable)
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Event name is required'
    if (!form.eventType) errs.eventType = 'Please select an event type'
    if (!form.budget || isNaN(form.budget) || parseFloat(form.budget) <= 0) errs.budget = 'Please enter a valid budget amount'
    if (form.date && new Date(form.date) < new Date(new Date().toDateString())) {
      // allow past dates (editing), just warn
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      let plan = null
      let usedAI = false

      if (aiAvailable) {
        try {
          plan = await generateEventPlanWithAI(form)
          usedAI = true
        } catch (err) {
          console.warn('AI generation failed, falling back to demo:', err.message)
          plan = generateDemoPlan(form)
        }
      } else {
        plan = generateDemoPlan(form)
      }

      const event = {
        id: generateId(),
        name: form.name,
        eventType: form.eventType,
        location: form.location,
        date: form.date,
        guests: form.guests,
        budget: parseFloat(form.budget),
        currency: form.currency,
        preferences: form.preferences,
        theme: form.theme,
        requirements: form.requirements,
        includeIndianCulture: form.includeIndianCulture,
        plan,
        generatedWithAI: usedAI,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      saveEvent(event)
      if (onSave) onSave()
      setSuccess(true)
      setTimeout(() => navigate(`/events/${event.id}`), 1200)
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to generate plan. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Event</h1>
        <p className="text-gray-500 text-sm">Fill in the details and let AI generate your personalized event plan</p>
      </div>

      {/* AI Status Banner */}
      {aiAvailable === false && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Demo Mode Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Gemini API is not configured. Your plan will be generated using our built-in planning engine.
              To enable AI, add your GEMINI_API_KEY to the server environment.
            </p>
          </div>
        </div>
      )}
      {aiAvailable === true && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Gemini AI Connected</p>
            <p className="text-xs text-green-700 mt-0.5">Your plan will be generated using Google Gemini AI for personalized recommendations.</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Event plan created! Redirecting…</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">1</span>
            Basic Event Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <FormField label="Event Name" required error={errors.name}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Priya & Rahul's Wedding"
                  className={inputClass(errors.name)}
                />
              </FormField>
            </div>
            <FormField label="Event Type" required error={errors.eventType}>
              <select name="eventType" value={form.eventType} onChange={handleChange} className={inputClass(errors.eventType)}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Event Location" hint="City, venue name, or region">
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kochi, Kerala"
                className={inputClass()}
              />
            </FormField>
            <FormField label="Event Date">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass()}
              />
            </FormField>
            <FormField label="Number of Guests" hint="Approximate guest count">
              <input
                type="number"
                name="guests"
                value={form.guests}
                onChange={handleChange}
                placeholder="e.g. 200"
                min="1"
                className={inputClass()}
              />
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">2</span>
            Budget Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Total Budget" required error={errors.budget}>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 500000"
                min="1"
                className={inputClass(errors.budget)}
              />
            </FormField>
            <FormField label="Currency">
              <select name="currency" value={form.currency} onChange={handleChange} className={inputClass()}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">3</span>
            Preferences & Style
          </h2>
          <div className="space-y-5">
            <FormField label="Event Preferences" hint="Describe your vision, must-haves, special requirements">
              <textarea
                name="preferences"
                value={form.preferences}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. We want a traditional Kerala ceremony with a garden reception. Vegetarian food preferred."
                className={inputClass() + ' resize-none'}
              />
            </FormField>
            <FormField label="Theme or Style" hint="e.g. Royal, Rustic, Modern, Traditional, Boho">
              <input
                type="text"
                name="theme"
                value={form.theme}
                onChange={handleChange}
                placeholder="e.g. Traditional Kerala with modern reception"
                className={inputClass()}
              />
            </FormField>
            <FormField label="Additional Requirements" hint="Any special needs, dietary restrictions, accessibility needs, etc.">
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Wheelchair accessible venue, Jain food required, outdoor setup preferred"
                className={`${inputClass()} resize-none`}
              />
            </FormField>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="includeIndianCulture"
                checked={form.includeIndianCulture}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Include Indian & Kerala cultural elements</span>
                <p className="text-xs text-gray-400">Adds regional traditions, rituals, and cultural ideas to your plan</p>
              </div>
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: loading || success ? '#a78bfa' : 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {aiAvailable ? 'Generating AI Plan…' : 'Generating Plan…'}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Plan Created!
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate My Event Plan
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          {aiAvailable
            ? '✨ Your plan will be generated using Google Gemini AI'
            : '📋 Your plan will be generated using our local planning engine (Demo Mode)'}
        </p>
      </form>
    </div>
  )
}
