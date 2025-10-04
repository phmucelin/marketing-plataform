import React, { useState, useEffect } from "react";
import { Post, Client, PersonalEvent } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, CheckCircle, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl, safeDate } from "@/utils";

import StatsCard from "@/components/dashboard/StatsCard.jsx";
import PendingPosts from "@/components/dashboard/PendingPosts.jsx";
import TodayEvents from "@/components/dashboard/TodayEvents.jsx";
import TaskList from "@/components/dashboard/TaskList.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [clients, setClients] = useState([]);
  const [personalEvent, setPersonalEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Adicionar listener para recarregar quando a janela recebe focado
    const handleFocus = () => {
      console.log('🔄 Recarregando Dashboard devido ao foco da janela');
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [postsData, clientsData, personalEvents] = await Promise.all([
      Post.list("-created_date"),
      Client.list(),
      PersonalEvent.filter({ date: format(new Date(), "yyyy-MM-dd") })
    ]);
    
    setPosts(postsData);
    setClients(clientsData);
    setPersonalEvent(personalEvents[0] || null);
    setIsLoading(false);
  };

  const pendingApprovalPosts = posts.filter(p => p.status === "aguardando_aprovacao");
  const boostRequests = posts.filter(p => p.boost_requested);
  const todayPosts = posts.filter(p => {
    const postDate = safeDate(p.scheduled_date);
    if (!postDate) return false;
    const today = new Date();
    return format(postDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  });

  const approvedPosts = posts.filter(p => p.status === "aprovado").length;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              📊 Dashboard
            </h1>
            <p className="text-gray-600">Visão geral do seu trabalho ✨</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate(createPageUrl("PostCalendar"))}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              ✨ Novo Post
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Posts Aprovados"
            value={approvedPosts}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            color="bg-green-100 border-green-300"
            textColor="text-green-700"
          />
          <StatsCard
            title="Aguardando Aprovação"
            value={pendingApprovalPosts.length}
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
            color="bg-yellow-100 border-yellow-300"
            textColor="text-yellow-700"
          />
          <StatsCard
            title="Pedidos para Turbinar"
            value={boostRequests.length}
            icon={<Zap className="w-6 h-6 text-purple-600" />}
            color="bg-purple-100 border-purple-300"
            textColor="text-purple-700"
          />
          <StatsCard
            title="Posts Hoje"
            value={todayPosts.length}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100 border-blue-300"
            textColor="text-blue-700"
          />
        </div>

        {/* Seção de Pedidos para Turbinar */}
        {boostRequests.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-purple-600">⚡ Pedidos para Turbinar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boostRequests.map(post => {
                const client = clients.find(c => c.id === post.client_id);
                return (
                  <div key={post.id} className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{post.title || "Sem título"}</h3>
                        <p className="text-xs text-gray-600">{client?.name || "Cliente"}</p>
                      </div>
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                        {post.format}
                      </span>
                    </div>
                    {post.boost_notes && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">💬 Notas do cliente:</p>
                        <p className="text-sm text-gray-800 bg-white rounded-lg p-2 border">
                          {post.boost_notes}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(createPageUrl("PostCalendar", { edit: post.id }))}
                        className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Marcar como processado
                          Post.update(post.id, { boost_requested: false });
                          loadData();
                        }}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                      >
                        ✅ Processado
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts Pendentes */}
        {pendingApprovalPosts.length > 0 && (
          <PendingPosts posts={pendingApprovalPosts} clients={clients} onUpdate={loadData} />
        )}

        {/* Eventos de Hoje */}
        {personalEvent && (
          <TodayEvents event={personalEvent} />
        )}

        {/* Lista de Tarefas */}
        <TaskList />
      </div>
    </div>
  );
}
