import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Info, TrendingUp } from 'lucide-react'
import { getEventById, saveEvent, getEvents, formatCurrency } from '../utils/storage.js'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CHART_COLORS = [
  '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#059669', '#10b981', '#34d399', '#6ee7b7',
  '#d97706', '#f59e0b', '#fcd34d',
]

function formatAmt(amount, currency) {
  return formatCurrency(amount, currency || 'INR')
}

export default function BudgetPlanner({ onRefresh }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // If no id in params, use most recent event
    const ev = id ? getEventById(id) : getEvents()[0]
    if (!ev) return
    setEvent(ev)
    setCategories((ev.plan?.budgetBreakdown || []).map(c => ({
      ...c,
      estimated: Number(c.estimated) || 0,
    })))
  }, [id])

  const totalBudget = event?.budget || 0
  const totalAllocated = categories.reduce((s, c) => s + (Number(c.estimated) || 0), 0)
  const remaining = totalBudget - totalAllocated
  const isOver = remaining < 0

  function handleAmountChange(idx, value) {
    setCategories(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], estimated: Number(value) || 0 }
      return updated
    })
    setSaved(false)
  }

  function handleSave() {
    if (!event) return
    const updated = {
      ...event,
      plan: { ...event.plan, budgetBreakdown: categories },
      updatedAt: new Date().toISOString(),
    }
    saveEvent(updated)
    setEvent(updated)
    setSaved(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setSaved(false), 2000)
  }

  if (!event) return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <p className="text-gray-500 mb-4">No event found. Please create an event first.</p>
      <Link to="/create" className="text-purple-600 hover:underline font-medium">Create an Event →</Link>
    </div>
  )

  const chartData = categories.map(c => ({
    name: c.name,
    value: c.estimated,
  })).filter(d => d.value > 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {id && (
          <button onClick={() => navigate(`/events/${id}`)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>
          <p className="text-sm text-gray-500">{event.name} – {event.eventType}</p>
        </div>
      </div>

      {/* Budget summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">{formatAmt(totalBudget, event.currency)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Allocated</p>
          <p className="text-2xl font-bold text-purple-700">{formatAmt(totalAllocated, event.currency)}</p>
          <p className="text-xs text-gray-400 mt-1">{totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0}% of budget</p>
        </div>
        <div className={`rounded-2xl p-4 border shadow-sm ${isOver ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-xs text-gray-500 mb-1">{isOver ? 'Over Budget' : 'Remaining'}</p>
          <p className={`text-2xl font-bold ${isOver ? 'text-red-600' : 'text-green-700'}`}>
            {formatAmt(Math.abs(remaining), event.currency)}
          </p>
          {isOver && <p className="text-xs text-red-500 mt-1">⚠️ Budget exceeded</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget table */}
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Category Breakdown</h2>
            <button
              onClick={handleSave}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                saved ? 'bg-green-100 text-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No budget categories. Generate an event plan first.</p>
            ) : categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                    {cat.percentage && (
                      <span className="text-xs text-gray-400">({cat.percentage}%)</span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                      {event.currency === 'INR' ? '₹' : event.currency === 'USD' ? '$' : event.currency === 'EUR' ? '€' : '£'}
                    </span>
                    <input
                      type="number"
                      value={cat.estimated}
                      onChange={e => handleAmountChange(idx, e.target.value)}
                      min="0"
                      className="w-28 pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="budget-bar h-1.5 rounded-full"
                    style={{
                      width: `${totalBudget > 0 ? Math.min((cat.estimated / totalBudget) * 100, 100) : 0}%`,
                      background: CHART_COLORS[idx % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {isOver && (
            <div className="px-5 py-3 bg-red-50 border-t border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-600 font-medium">Total allocation exceeds your budget by {formatAmt(Math.abs(remaining), event.currency)}</p>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Budget Distribution
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatAmt(value, event.currency), 'Estimate']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #ede9fe', fontSize: '12px' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: '11px', color: '#4b5563' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              No budget data to display
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          All budget figures are estimates for planning purposes only and do not represent verified market quotations.
          Contact vendors directly for actual pricing. Edit amounts above to match actual quotes.
        </p>
      </div>
    </div>
  )
}
