import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Download, Edit3, Save, X, Calendar, Wallet, Users,
  MapPin, Sparkles, Clock, CheckSquare, Lightbulb, ChevronRight,
  AlertCircle, Info
} from 'lucide-react'
import { getEventById, saveEvent, formatCurrency, formatDate } from '../utils/storage.js'
import { generateDemoPlan } from '../utils/demoEngine.js'

export default function EventDetail({ onRefresh }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [exportLoading, setExportLoading] = useState(false)
  const printRef = useRef(null)

  useEffect(() => {
    const e = getEventById(id)
    if (!e) { navigate('/events'); return }
    setEvent(e)
    setEditForm({
      name: e.name,
      location: e.location || '',
      date: e.date || '',
      guests: e.guests || '',
      budget: e.budget || '',
      currency: e.currency || 'INR',
    })
  }, [id])

  function handleEditSave() {
    const updated = {
      ...event,
      ...editForm,
      budget: parseFloat(editForm.budget) || event.budget,
      updatedAt: new Date().toISOString(),
    }
    saveEvent(updated)
    setEvent(updated)
    setEditing(false)
    if (onRefresh) onRefresh()
  }

  async function handleExportPDF() {
    setExportLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, margin = 18, contentW = W - margin * 2
      let y = margin

      function addText(text, x, yPos, opts = {}) {
        pdf.text(text, x, yPos, opts)
        return yPos
      }

      function checkPage(needed = 10) {
        if (y + needed > 270) { pdf.addPage(); y = margin }
      }

      // Header
      pdf.setFillColor(109, 40, 217)
      pdf.rect(0, 0, W, 40, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20); pdf.setFont('helvetica', 'bold')
      pdf.text('EventWise AI', margin, 18)
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal')
      pdf.text('Plan Smarter. Celebrate Better.', margin, 26)
      pdf.setFontSize(14); pdf.setFont('helvetica', 'bold')
      pdf.text(event.name, margin, 36)
      y = 50

      // Event details
      pdf.setTextColor(30, 27, 75)
      pdf.setFontSize(12); pdf.setFont('helvetica', 'bold')
      pdf.text('Event Details', margin, y); y += 8
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(80, 80, 100)
      const details = [
        ['Type', event.eventType],
        ['Date', event.date ? formatDate(event.date) : 'Not set'],
        ['Location', event.location || 'Not specified'],
        ['Guests', event.guests ? `${event.guests} guests` : 'Not specified'],
        ['Budget', event.budget ? formatCurrency(event.budget, event.currency) : 'Not specified'],
      ]
      details.forEach(([k, v]) => {
        pdf.setFont('helvetica', 'bold'); pdf.text(k + ':', margin, y)
        pdf.setFont('helvetica', 'normal'); pdf.text(String(v), margin + 28, y)
        y += 6
      })

      // Overview
      if (event.plan?.eventOverview) {
        y += 4; checkPage(20)
        pdf.setTextColor(30, 27, 75); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold')
        pdf.text('Event Overview', margin, y); y += 7
        pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(60, 60, 80)
        const lines = pdf.splitTextToSize(event.plan.eventOverview, contentW)
        lines.forEach(line => { checkPage(6); pdf.text(line, margin, y); y += 5 })
      }

      // Budget
      if (event.plan?.budgetBreakdown?.length > 0) {
        y += 4; checkPage(30)
        pdf.setTextColor(30, 27, 75); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold')
        pdf.text('Budget Breakdown (Estimates)', margin, y); y += 3
        pdf.setFontSize(8); pdf.setFont('helvetica', 'italic'); pdf.setTextColor(120, 100, 180)
        pdf.text('Note: All figures are estimates, not verified market quotations.', margin, y + 4); y += 9
        pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(60, 60, 80)
        event.plan.budgetBreakdown.forEach(cat => {
          checkPage(6)
          pdf.text(`• ${cat.name}`, margin + 2, y)
          pdf.text(formatCurrency(cat.estimated, cat.currency || event.currency), margin + contentW - 20, y, { align: 'right' })
          y += 6
        })
        pdf.setFont('helvetica', 'bold'); pdf.setTextColor(109, 40, 217)
        const total = event.plan.budgetBreakdown.reduce((s, c) => s + c.estimated, 0)
        pdf.text('Total:', margin + 2, y)
        pdf.text(formatCurrency(total, event.currency), margin + contentW - 20, y, { align: 'right' })
        y += 8
      }

      // Timeline
      if (event.plan?.timeline?.length > 0) {
        checkPage(20)
        pdf.setTextColor(30, 27, 75); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold')
        pdf.text('Preparation Timeline', margin, y); y += 8
        event.plan.timeline.forEach(phase => {
          checkPage(15)
          pdf.setFontSize(10); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(109, 40, 217)
          pdf.text(phase.phase + (phase.date ? ` (${phase.date})` : ''), margin, y); y += 6
          pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(60, 60, 80)
          ;(phase.tasks || []).forEach(task => {
            checkPage(5)
            const taskText = typeof task === 'string' ? task : task.text
            const lines = pdf.splitTextToSize(`  ${task.completed ? '✓' : '○'} ${taskText}`, contentW)
            lines.forEach(l => { pdf.text(l, margin + 2, y); y += 5 })
          })
          y += 2
        })
      }

      // Vendor checklist
      if (event.plan?.vendorChecklist?.length > 0) {
        checkPage(20)
        pdf.setTextColor(30, 27, 75); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold')
        pdf.text('Vendor Checklist', margin, y); y += 8
        pdf.setFontSize(9); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(60, 60, 80)
        event.plan.vendorChecklist.forEach(v => {
          checkPage(6)
          pdf.text(`• ${v.name}`, margin + 2, y)
          pdf.text(v.status, margin + contentW - 25, y, { align: 'right' })
          y += 5
          if (v.notes) {
            const noteLines = pdf.splitTextToSize(`  Note: ${v.notes}`, contentW)
            noteLines.forEach(l => { checkPage(5); pdf.text(l, margin + 4, y); y += 4 })
          }
        })
      }

      // Footer
      pdf.setFontSize(8); pdf.setTextColor(150, 150, 180); pdf.setFont('helvetica', 'italic')
      pdf.text(`Generated by EventWise AI • ${new Date().toLocaleDateString('en-IN')} • All budget figures are estimates only.`, margin, 285)

      pdf.save(`${event.name.replace(/\s+/g, '_')}_EventWise_Plan.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  if (!event) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
    </div>
  )

  const plan = event.plan || {}

  return (
    <div className="max-w-4xl mx-auto" ref={printRef}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/events')} className="p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{event.eventType}</span>
              {!event.generatedWithAI && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">📋 Demo Mode</span>
              )}
              {event.generatedWithAI && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✨ AI Generated</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exportLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {exportLoading ? 'Exporting…' : 'Download PDF'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleEditSave} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700">
                <Save className="w-4 h-4" /> Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Edit Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Event Name', type: 'text' },
              { key: 'location', label: 'Location', type: 'text' },
              { key: 'date', label: 'Event Date', type: 'date' },
              { key: 'guests', label: 'Number of Guests', type: 'number' },
              { key: 'budget', label: 'Budget', type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={editForm[key] || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Calendar, label: 'Date', value: event.date ? formatDate(event.date) : 'Not set', color: '#6d28d9' },
          { icon: Wallet, label: 'Budget', value: event.budget ? formatCurrency(event.budget, event.currency) : '—', color: '#059669' },
          { icon: Users, label: 'Guests', value: event.guests ? `${event.guests} guests` : '—', color: '#d97706' },
          { icon: MapPin, label: 'Location', value: event.location || 'Not specified', color: '#dc2626' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-3 border border-purple-50 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Overview */}
      {plan.eventOverview && (
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Event Overview
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{plan.eventOverview}</p>
          {plan.theme && (
            <div className="mt-3 inline-block bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full">
              🎨 Theme: {plan.theme}
            </div>
          )}
        </div>
      )}

      {/* Quick navigation to sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[
          { path: 'budget', icon: Wallet, label: 'Budget Planner', desc: 'View & edit budget breakdown', color: '#059669' },
          { path: 'timeline', icon: Clock, label: 'Timeline', desc: 'Track preparation milestones', color: '#6d28d9' },
          { path: 'vendors', icon: CheckSquare, label: 'Vendor Checklist', desc: 'Manage vendor bookings', color: '#d97706' },
          { path: 'ideas', icon: Lightbulb, label: 'AI Ideas', desc: 'Creative ideas & suggestions', color: '#ec4899' },
        ].map(({ path, icon: Icon, label, desc, color }) => (
          <Link
            key={path}
            to={`/events/${event.id}/${path}`}
            className="flex items-center gap-4 bg-white rounded-xl border border-purple-50 shadow-sm p-4 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '15' }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </Link>
        ))}
      </div>

      {/* AI Disclaimer */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          All budget figures and vendor price estimates are approximate and for planning purposes only.
          They do not represent verified market quotations. Please contact vendors directly for actual pricing.
        </p>
      </div>
    </div>
  )
}
