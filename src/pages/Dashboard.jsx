import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Calendar, Wallet, CheckSquare, Clock, TrendingUp, Sparkles } from 'lucide-react'
import { formatCurrency, getDaysUntil, getCompletedTaskCount } from '../utils/storage.js'

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-50 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold" style={{ color: '#1e1b4b' }}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, onClick }) {
  const days = getDaysUntil(event.date)
  const budget = event.budget ? formatCurrency(event.budget, event.currency || 'INR') : '—'

  const eventTypeColors = {
    Wedding: '#ec4899', Birthday: '#f59e0b', Anniversary: '#8b5cf6',
    Engagement: '#06b6d4', 'Baby Shower': '#10b981', 'Community Event': '#3b82f6',
    'Festival Celebration': '#f97316', Other: '#6b7280',
  }
  const color = eventTypeColors[event.eventType] || '#6d28d9'

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-purple-50 card-hover transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: color + '15' }}>
            {event.eventType === 'Wedding' ? '💍' :
             event.eventType === 'Birthday' ? '🎂' :
             event.eventType === 'Anniversary' ? '💝' :
             event.eventType === 'Engagement' ? '💌' :
             event.eventType === 'Baby Shower' ? '🍼' :
             event.eventType === 'Community Event' ? '🎪' :
             event.eventType === 'Festival Celebration' ? '🎉' : '✨'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{event.name}</h3>
            <p className="text-xs text-gray-500">{event.eventType}</p>
          </div>
        </div>
        {days !== null && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            days < 0 ? 'bg-gray-100 text-gray-500' :
            days <= 7 ? 'bg-red-50 text-red-600' :
            days <= 30 ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            {days < 0 ? 'Past' : days === 0 ? 'Today!' : `${days}d away`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {event.date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {event.budget && (
          <span className="flex items-center gap-1">
            <Wallet className="w-3 h-3" />
            {budget}
          </span>
        )}
        {event.guests && (
          <span>{event.guests} guests</span>
        )}
      </div>
    </button>
  )
}

export default function Dashboard({ events, onRefresh }) {
  const navigate = useNavigate()

  const totalBudget = events.reduce((s, e) => s + (parseFloat(e.budget) || 0), 0)
  const completedTasks = getCompletedTaskCount(events)
  const upcomingEvents = events.filter(e => {
    const days = getDaysUntil(e.date)
    return days !== null && days >= 0
  }).length

  const recentEvents = events.slice(0, 6)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">EventWise AI</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Welcome back! 👋
        </h1>
        <p className="text-gray-500">Your smart event planning dashboard</p>
      </div>

      {/* CTA Banner */}
      <div
        className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)' }}
      >
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Plan your next celebration</h2>
          <p className="text-purple-200 text-sm">AI-powered planning for weddings, birthdays &amp; more</p>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="flex items-center gap-2 bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors shadow-lg whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Events"
          value={events.length}
          sub="planned events"
          icon={Calendar}
          color="#6d28d9"
        />
        <StatCard
          label="Total Budget"
          value={totalBudget > 0 ? formatCurrency(totalBudget) : '₹0'}
          sub="across all events"
          icon={Wallet}
          color="#059669"
        />
        <StatCard
          label="Tasks Done"
          value={completedTasks}
          sub="completed tasks"
          icon={CheckSquare}
          color="#d97706"
        />
        <StatCard
          label="Upcoming"
          value={upcomingEvents}
          sub="events coming up"
          icon={Clock}
          color="#dc2626"
        />
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Event Plans</h2>
          {events.length > 0 && (
            <button
              onClick={() => navigate('/events')}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View all →
            </button>
          )}
        </div>

        {recentEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-purple-200">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No events yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first event plan with AI assistance</p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      {events.length > 0 && (
        <div className="mt-8 bg-purple-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">Quick Tips</h3>
          </div>
          <ul className="space-y-1 text-sm text-purple-700">
            <li>• Click any event card to view full details, budget, timeline and vendor checklist</li>
            <li>• Use the Budget Planner to manually adjust category allocations</li>
            <li>• Mark checklist items complete to track vendor progress</li>
            <li>• Export any event as a PDF for sharing with family or vendors</li>
          </ul>
        </div>
      )}
    </div>
  )
}
