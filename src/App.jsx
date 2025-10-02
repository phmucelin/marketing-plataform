import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '../Layout.jsx'
import Dashboard from '../Pages/Dashboard'
import Clients from '../Pages/Clients'
import ClientProfile from '../Pages/ClientProfile'
import PostCalendar from '../Pages/PostCalendar'
import Kanban from '../Pages/Kanban'
import Ideas from '../Pages/Ideas'
import Personal from '../Pages/Personal'
import Approval from '../Pages/Approval'

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