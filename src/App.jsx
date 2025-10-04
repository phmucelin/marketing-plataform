import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/Layout.jsx'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import ClientProfile from '@/pages/ClientProfile'
import PostCalendar from '@/pages/PostCalendar'
import Kanban from '@/pages/Kanban'
import Ideas from '@/pages/Ideas'
import Personal from '@/pages/Personal'
import Approval from '@/pages/Approval'
import { initializeEntities } from '@/entities/all'


function App() {
  const [entitiesReady, setEntitiesReady] = useState(false)

  useEffect(() => {
    // Inicializar entidades no startup
    initializeEntities().then(() => {
      setEntitiesReady(true)
      console.log('🚀 App pronto para renderizar!')
    })
  }, [])

  if (!entitiesReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Carregando aplicativo...</p>
        </div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/approval" element={<Approval />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="client-profile" element={<ClientProfile />} />
          <Route path="post-calendar" element={<PostCalendar />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="personal" element={<Personal />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App 