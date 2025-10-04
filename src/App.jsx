import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/Layout.jsx'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import ClientProfile from '@/pages/ClientProfile'
import PostCalendar from '@/pages/PostCalendar'
import Kanban from '@/pages/Kanban'
import Ideas from '@/pages/Ideas'
import Personal from '@/pages/Personal'
import Approval from '@/pages/Approval'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import AuthGuard from '@/components/AuthGuard'

function App() {
  console.log('🚀 AppMari 2.0: Sistema com autenticação funcionando!');

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Páginas públicas (sem autenticação) */}
        <Route path="/approval" element={<Approval />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Páginas protegidas (requerem autenticação) */}
        <Route path="/" element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="client-profile" element={<ClientProfile />} />
          <Route path="post-calendar" element={<PostCalendar />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="personal" element={<Personal />} />
        </Route>
        
        {/* Redirecionamento padrão para login se rota não encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App