import React from 'react'
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

function App() {
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