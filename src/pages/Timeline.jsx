import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, Calendar } from 'lucide-react'
import { getEventById, saveEvent, getEvents } from '../utils/storage.js'

export default function Timeline({ onRefresh }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const ev = id ? getEventById(id) : getEvents()[0]
    if (!ev) return
    setEvent(ev)
    setTimeline((ev.plan?.timeline || []).map(phase => ({
      ...phase,
      tasks: (phase.tasks || []).map(t =>
        typeof t === 'string' ? { text: t, completed: false } : t
      ),
    })))
  }, [id])

  function toggleTask(phaseIdx, taskIdx) {
    setTimeline(prev => {
      const updated = prev.map((phase, pi) =>
        pi === phaseIdx
          ? {
              ...phase,
              tasks: phase.tasks.map((task, ti) =>
                ti === taskIdx ? { ...task, completed: !task.completed } : task
              ),
            }
          : phase
      )
      // Auto-save
      if (event) {
        const updatedEvent = {
          ...event,
          plan: { ...event.plan, timeline: updated },
          updatedAt: new Date().toISOString(),
        }
        saveEvent(updatedEvent)
        setEvent(updatedEvent)
        if (onRefresh) onRefresh()
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      }
      return updated
    })
  }

  const totalTasks = timeline.reduce((s, p) => s + p.tasks.length, 0)
  const completedTasks = timeline.reduce((s, p) => s + p.tasks.filter(t => t.completed).length, 0)
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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
          <h1 className="text-2xl font-bold text-gray-900">Event Timeline</h1>
          <p className="text-sm text-gray-500">{event.name}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Overall Progress</p>
            <p className="text-xs text-gray-400">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
          <span className="text-2xl font-bold text-purple-700">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="budget-bar h-3 rounded-full"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)',
            }}
          />
        </div>
        {saved && <p className="text-xs text-green-600 mt-2">✓ Progress saved</p>}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-purple-100 hidden sm:block" />

        <div className="space-y-4">
          {timeline.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-purple-200 p-12 text-center">
              <Calendar className="w-10 h-10 text-purple-300 mx-auto mb-3" />
              <p className="text-gray-500">No timeline data. Generate an event plan first.</p>
              <Link to="/create" className="text-purple-600 hover:underline text-sm mt-2 inline-block">Create Event →</Link>
            </div>
          ) : timeline.map((phase, phaseIdx) => {
            const phaseDone = phase.tasks.filter(t => t.completed).length
            const phaseTotal = phase.tasks.length
            const isAllDone = phaseDone === phaseTotal && phaseTotal > 0

            return (
              <div key={phaseIdx} className="relative flex gap-4">
                {/* Phase dot */}
                <div className="hidden sm:flex flex-col items-center z-10">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg flex-shrink-0 ${
                    isAllDone
                      ? 'bg-green-100 border-green-400'
                      : 'bg-white border-purple-300'
                  }`}>
                    {phaseIdx === timeline.length - 1 ? '🎉' :
                     phaseIdx === 0 ? '📋' :
                     phaseIdx === 1 ? '📞' :
                     phaseIdx === 2 ? '📨' :
                     phaseIdx === 3 ? '✅' : '📌'}
                  </div>
                </div>

                {/* Phase card */}
                <div className="flex-1 bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
                  <div className={`px-5 py-4 border-b ${isAllDone ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${isAllDone ? 'text-green-800' : 'text-purple-800'}`}>{phase.phase}</h3>
                      <div className="flex items-center gap-2">
                        {phase.date && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{phase.date}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isAllDone ? 'bg-green-200 text-green-800' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {phaseDone}/{phaseTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {phase.tasks.map((task, taskIdx) => (
                      <button
                        key={taskIdx}
                        onClick={() => toggleTask(phaseIdx, taskIdx)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors group text-left"
                        aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.text}`}
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-purple-400 transition-colors" />
                        )}
                        <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
