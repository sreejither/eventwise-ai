import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Calendar, Wallet, Users, ChevronRight, PlusCircle } from 'lucide-react'
import { deleteEvent, formatCurrency, getDaysUntil } from '../utils/storage.js'

const EVENT_EMOJIS = {
  Wedding: '💍', Birthday: '🎂', Anniversary: '💝', Engagement: '💌',
  'Baby Shower': '🍼', 'Community Event': '🎪', 'Festival Celebration': '🎉', Other: '✨',
}

export default function MyEvents({ events, onRefresh }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const eventTypes = ['All', ...Array.from(new Set(events.map(e => e.eventType)))]

  const filtered = events.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || e.eventType === filter
    return matchSearch && matchFilter
  })

  function handleDelete(id) {
    deleteEvent(id)
    if (onRefresh) onRefresh()
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 text-sm">{events.length} event plan{events.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="flex items-center gap-2 bg-purple-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Search and filter */}
      {events.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-purple-200">
          <div className="text-4xl mb-4">{events.length === 0 ? '🎉' : '🔍'}</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {events.length === 0 ? 'No events yet' : 'No events match your search'}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {events.length === 0 ? 'Create your first AI-powered event plan' : 'Try adjusting your search or filters'}
          </p>
          {events.length === 0 && (
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Create First Event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(event => {
            const days = getDaysUntil(event.date)
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-purple-50 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="text-3xl">{EVENT_EMOJIS[event.eventType] || '✨'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{event.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            {event.eventType}
                          </span>
                          {event.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {event.budget && (
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              {formatCurrency(event.budget, event.currency)}
                            </span>
                          )}
                          {event.guests && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.guests} guests
                            </span>
                          )}
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                      {days !== null && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                          days < 0 ? 'bg-gray-100 text-gray-500' :
                          days === 0 ? 'bg-green-100 text-green-700' :
                          days <= 7 ? 'bg-red-50 text-red-600' :
                          days <= 30 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {days < 0 ? 'Past event' : days === 0 ? '🎉 Today!' : `${days} days away`}
                        </span>
                      )}
                    </div>
                    {event.generatedWithAI !== undefined && (
                      <span className="inline-block mt-2 text-xs text-gray-400">
                        {event.generatedWithAI ? '✨ AI Generated' : '📋 Demo Mode'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirm(event.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete ${event.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium text-sm px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Open <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete confirmation */}
                {deleteConfirm === event.id && (
                  <div className="px-5 pb-4 border-t border-red-50 bg-red-50">
                    <p className="text-sm text-red-700 font-medium py-3">
                      Are you sure you want to delete "{event.name}"? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-1.5 bg-white text-gray-600 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
