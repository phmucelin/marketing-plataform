import React, { useState, useEffect } from "react";
import { Post, Client } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, Instagram, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl, safeDate } from "@/utils";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, isSameWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

const columns = [
  { id: "pendente", title: "�� Pendente", color: "bg-gray-100" },
  { id: "em_criacao", title: "✏️ Em Criação", color: "bg-blue-100" },
  { id: "aguardando_aprovacao", title: "⏳ Aguardando Aprovação", color: "bg-yellow-100" },
  { id: "aprovado", title: "✅ Aprovado", color: "bg-green-100" },
  { id: "agendado", title: "📅 Agendado", color: "bg-purple-100" },
  { id: "postado", title: "🚀 Postado", color: "bg-indigo-100" }
];

export default function Kanban() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadData();
    
    // Adicionar listener para recarregar quando a janela recebe foco
    const handleFocus = () => {
      console.log('🔄 Recarregando Kanban devido ao foco da janela');
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadData = async () => {
    const [postsData, clientsData] = await Promise.all([
      Post.list("-created_date"),
      Client.list()
    ]);
    setPosts(postsData);
    setClients(clientsData);
  };

  // Calcular início e fim da semana (começa na segunda-feira)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente";
  };

  const getPostsByStatus = (status) => {
    return posts.filter(post => {
      // Filtrar por status
      if (post.status !== status) return false;
      
      // Se não tem data agendada, só aparece na semana atual
      if (!post.scheduled_date) {
        return isSameWeek(new Date(), currentWeek, { weekStartsOn: 1 });
      }
      
      // Comparação simples de string de data
      const postDateStr = post.scheduled_date.split('T')[0]; // Pegar apenas a parte da data
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");
      
      return postDateStr >= weekStartStr && postDateStr <= weekEndStr;
    });
  };

  const handleStatusChange = async (postId, newStatus) => {
    await Post.update(postId, { status: newStatus });
    loadData();
  };

  const formatLabels = {
    story: { label: "Story", emoji: "📱" },
    carrossel: { label: "Carrossel", emoji: "🎠" },
    post: { label: "Post", emoji: "📷" },
    reel: { label: "Reel", emoji: "🎬" }
  };

  // Contar total de posts na semana (incluindo posts sem data na semana atual)
  const totalPostsInWeek = posts.filter(post => {
    // Se não tem data agendada, só conta na semana atual
    if (!post.scheduled_date) {
      return isSameWeek(new Date(), currentWeek, { weekStartsOn: 1 });
    }
    
    // Comparação simples de string de data
    const postDateStr = post.scheduled_date.split('T')[0];
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const weekEndStr = format(weekEnd, "yyyy-MM-dd");
    
    return postDateStr >= weekStartStr && postDateStr <= weekEndStr;
  }).length;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 min-h-screen">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📋 Kanban de Posts
            </h1>
            <p className="text-gray-600">Gerencie o fluxo de trabalho dos seus posts ✨</p>
          </div>
          <Button 
            onClick={() => navigate(createPageUrl("PostCalendar"))}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            ✨ Novo Post
          </Button>
        </div>

        {/* Navegação Semanal */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-2 border-purple-200">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="rounded-full border-2 border-purple-300 hover:bg-purple-50"
            >
              <ChevronLeft className="w-5 h-5 text-purple-600" />
            </Button>
            
            <div className="flex-1 text-center">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 capitalize mt-1">
                <span>{format(weekStart, "MMMM yyyy", { locale: ptBR })}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                  {totalPostsInWeek} {totalPostsInWeek === 1 ? 'post' : 'posts'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
                className="mt-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                📍 Semana Atual
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="rounded-full border-2 border-purple-300 hover:bg-purple-50"
            >
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {columns.map(column => {
            const columnPosts = getPostsByStatus(column.id);
            
            return (
              <div key={column.id} className={`rounded-2xl p-4 ${column.color} border-2 border-opacity-50 min-h-[600px]`}>
                <div className="mb-4 pb-3 border-b-2 border-gray-300">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{column.title}</h3>
                  <p className="text-xs text-gray-600">{columnPosts.length} posts</p>
                </div>

                <div className="space-y-3">
                  {columnPosts.map(post => (
                    <Card 
                      key={post.id}
                      className="border-2 border-blue-200 shadow-sm hover:shadow-md transition-all cursor-move bg-white"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {getClientName(post.client_id)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {formatLabels[post.format]?.emoji || "📷"}
                            <span className="text-xs text-gray-500">
                              {formatLabels[post.format]?.label || post.format}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                          {post.title || "Sem título"}
                        </h4>
                        
                        {post.scheduled_date && (
                          <div className="flex items-center gap-1 mb-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {post.scheduled_date.split('T')[0].split('-').reverse().join('/')}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          {columns.map(col => (
                            <Button
                              key={col.id}
                              variant={post.status === col.id ? "default" : "ghost"}
                              size="sm"
                              onClick={() => handleStatusChange(post.id, col.id)}
                              className={`text-xs px-2 py-1 h-6 ${
                                post.status === col.id 
                                  ? "bg-blue-500 text-white" 
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {col.id === "postado" ? <CheckCircle className="w-3 h-3" /> : 
                               col.id === "agendado" ? <Clock className="w-3 h-3" /> :
                               col.id === "aprovado" ? <CheckCircle className="w-3 h-3" /> :
                               col.id === "aguardando_aprovacao" ? <Clock className="w-3 h-3" /> :
                               col.id === "em_criacao" ? <Plus className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {columnPosts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">Nenhum post</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
