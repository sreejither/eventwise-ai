import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CreateEvent from './pages/CreateEvent.jsx'
import MyEvents from './pages/MyEvents.jsx'
import EventDetail from './pages/EventDetail.jsx'
import BudgetPlanner from './pages/BudgetPlanner.jsx'
import Timeline from './pages/Timeline.jsx'
import VendorChecklist from './pages/VendorChecklist.jsx'
import AIIdeas from './pages/AIIdeas.jsx'
import { getEvents } from './utils/storage.js'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [events, setEvents] = useState([])
  const location = useLocation()

  useEffect(() => {
    setEvents(getEvents())
  }, [location])

  const refreshEvents = () => setEvents(getEvents())

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#faf9ff' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        events={events}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top bar for mobile */}
        <header className="lg:hidden flex items-center px-4 py-3 border-b border-purple-100" style={{ background: '#ffffff' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-purple-50 focus-visible:ring-2 mr-3"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-purple-800 text-lg">EventWise AI</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard events={events} onRefresh={refreshEvents} />} />
            <Route path="/create" element={<CreateEvent onSave={refreshEvents} />} />
            <Route path="/events" element={<MyEvents events={events} onRefresh={refreshEvents} />} />
            <Route path="/events/:id" element={<EventDetail onRefresh={refreshEvents} />} />
            <Route path="/events/:id/budget" element={<BudgetPlanner onRefresh={refreshEvents} />} />
            <Route path="/events/:id/timeline" element={<Timeline onRefresh={refreshEvents} />} />
            <Route path="/events/:id/vendors" element={<VendorChecklist onRefresh={refreshEvents} />} />
            <Route path="/events/:id/ideas" element={<AIIdeas onRefresh={refreshEvents} />} />
            <Route path="/budget" element={<BudgetPlanner onRefresh={refreshEvents} />} />
            <Route path="/timeline" element={<Timeline onRefresh={refreshEvents} />} />
            <Route path="/vendors" element={<VendorChecklist onRefresh={refreshEvents} />} />
            <Route path="/ideas" element={<AIIdeas onRefresh={refreshEvents} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
