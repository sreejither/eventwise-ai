import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { getEventById, saveEvent, getEvents } from '../utils/storage.js'

const STATUSES = ['Not Started', 'In Progress', 'Completed']
const STATUS_STYLES = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Completed': 'bg-green-100 text-green-700',
}

function generateVendorId() {
  return `v_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

export default function VendorChecklist({ onRefresh }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [vendors, setVendors] = useState([])
  const [saved, setSaved] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [newVendor, setNewVendor] = useState({ name: '', status: 'Not Started', estimatedCost: '', notes: '' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    const ev = id ? getEventById(id) : getEvents()[0]
    if (!ev) return
    setEvent(ev)
    setVendors((ev.plan?.vendorChecklist || []).map(v => ({
      ...v,
      id: v.id || generateVendorId(),
    })))
  }, [id])

  function persistVendors(updatedVendors) {
    if (!event) return
    const updatedEvent = {
      ...event,
      plan: { ...event.plan, vendorChecklist: updatedVendors },
      updatedAt: new Date().toISOString(),
    }
    saveEvent(updatedEvent)
    setEvent(updatedEvent)
    if (onRefresh) onRefresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleStatusChange(vendorId, status) {
    const updated = vendors.map(v => v.id === vendorId ? { ...v, status } : v)
    setVendors(updated)
    persistVendors(updated)
  }

  function handleFieldChange(vendorId, field, value) {
    const updated = vendors.map(v => v.id === vendorId ? { ...v, [field]: value } : v)
    setVendors(updated)
  }

  function handleSaveVendor(vendorId) {
    persistVendors(vendors)
    setEditingId(null)
  }

  function handleDeleteVendor(vendorId) {
    const updated = vendors.filter(v => v.id !== vendorId)
    setVendors(updated)
    persistVendors(updated)
  }

  function handleAddVendor() {
    if (!newVendor.name.trim()) return
    const v = { ...newVendor, id: generateVendorId() }
    const updated = [...vendors, v]
    setVendors(updated)
    persistVendors(updated)
    setNewVendor({ name: '', status: 'Not Started', estimatedCost: '', notes: '' })
    setAddingNew(false)
  }

  const completed = vendors.filter(v => v.status === 'Completed').length
  const inProgress = vendors.filter(v => v.status === 'In Progress').length
  const progressPct = vendors.length > 0 ? Math.round((completed / vendors.length) * 100) : 0

  if (!event) return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <p className="text-gray-500 mb-4">No event found. Please create an event first.</p>
      <Link to="/create" className="text-purple-600 hover:underline font-medium">Create an Event →</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {id && (
          <button onClick={() => navigate(`/events/${id}`)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Checklist</h1>
          <p className="text-sm text-gray-500">{event.name}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Vendor Progress</p>
            <p className="text-xs text-gray-400">{completed} of {vendors.length} vendors confirmed</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {completed} Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              {inProgress} In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              {vendors.length - completed - inProgress} Not Started
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="budget-bar h-3 rounded-full"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }}
          />
        </div>
        <p className="text-xs text-right text-gray-500 mt-1">{progressPct}% complete</p>
        {saved && <p className="text-xs text-green-600 mt-1">✓ Changes saved</p>}
      </div>

      {/* Add vendor button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Add vendor form */}
      {addingNew && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4">
          <h3 className="font-medium text-purple-800 mb-3">Add New Vendor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Vendor name / category *"
              value={newVendor.name}
              onChange={e => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <select
              value={newVendor.status}
              onChange={e => setNewVendor(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="text"
              placeholder="Estimated cost (optional)"
              value={newVendor.estimatedCost}
              onChange={e => setNewVendor(prev => ({ ...prev, estimatedCost: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={newVendor.notes}
              onChange={e => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddVendor} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">Add</button>
            <button onClick={() => setAddingNew(false)} className="px-4 py-2 bg-white text-gray-600 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Vendors list */}
      {vendors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-purple-300 mx-auto mb-3" />
          <p className="text-gray-500">No vendors yet. Generate an event plan or add vendors manually.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
              {editingId === vendor.id ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={vendor.name}
                      onChange={e => handleFieldChange(vendor.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <select
                      value={vendor.status}
                      onChange={e => handleFieldChange(vendor.id, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Estimated cost"
                      value={vendor.estimatedCost || ''}
                      onChange={e => handleFieldChange(vendor.id, 'estimatedCost', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                      type="text"
                      placeholder="Notes"
                      value={vendor.notes || ''}
                      onChange={e => handleFieldChange(vendor.id, 'notes', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveVendor(vendor.id)} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-white text-gray-600 text-sm rounded-lg border border-gray-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-800 text-sm">{vendor.name}</h3>
                      <select
                        value={vendor.status}
                        onChange={e => handleStatusChange(vendor.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-purple-400 ${STATUS_STYLES[vendor.status]}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {vendor.estimatedCost && (
                      <p className="text-xs text-gray-500 mt-1">💰 Est. cost: {vendor.estimatedCost}</p>
                    )}
                    {vendor.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">📝 {vendor.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {vendor.status === 'Completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                    )}
                    <button
                      onClick={() => setEditingId(vendor.id)}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      aria-label={`Edit ${vendor.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete ${vendor.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
