import React, { useState, useEffect } from "react";
import { Post, Client } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeDate } from "@/utils";

import PostCard from "../components/posts/PostCard";
import PostDialog from "../components/posts/PostDialog";

export default function PostCalendar() {
  const [posts, setPosts] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // "week" ou "month"

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [postsData, clientsData] = await Promise.all([
      Post.list("-scheduled_date"),
      Client.list()
    ]);
    console.log("📅 Posts carregados:", postsData);
    setPosts(postsData);
    setClients(clientsData);
  };

  const handleSavePost = async (postData) => {
    console.log("💾 Salvando post:", postData);
    if (editingPost) {
      await Post.update(editingPost.id, postData);
    } else {
      await Post.create(postData);
    }
    setShowDialog(false);
    setEditingPost(null);
    loadData();
  };

  const handleDeletePost = async (postId) => {
    if (confirm("Tem certeza que deseja excluir este post? 🗑️")) {
      await Post.delete(postId);
      loadData();
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1, locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Para visualização mensal
  const monthStart = startOfMonth(currentWeek);
  const monthEnd = endOfMonth(currentWeek);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayPosts = posts.filter(post => {
      if (!post.scheduled_date) return false;
      
      // Comparação simples de string de data
      const postDateStr = post.scheduled_date.split('T')[0]; // Pegar apenas a parte da data
      
      const matches = postDateStr === dayStr;
      if (matches) {
        console.log(`✅ Post encontrado para ${dayStr}:`, post.title);
      }
      
      return matches;
    });
    
    console.log(`📅 Posts para ${dayStr}:`, dayPosts.length);
    return dayPosts;
  };

  const handleWeekChange = (direction) => {
    if (direction === "prev") {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  const handleMonthChange = (direction) => {
    if (direction === "prev") {
      setCurrentWeek(subMonths(currentWeek, 1));
    } else {
      setCurrentWeek(addMonths(currentWeek, 1));
    }
  };

  // Função para obter os dias da semana corretos
  const getWeekDays = () => {
    const firstDayOfMonth = startOfMonth(currentWeek);
    const firstDayOfWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }); // Segunda-feira
    return Array.from({ length: 7 }, (_, i) => addDays(firstDayOfWeek, i));
  };

  return (
    <div className="p-2 md:p-4 lg:p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                📅 Calendário de Posts
              </h1>
              <p className="text-gray-600 text-sm md:text-base">Gerencie seus posts semanalmente ✨</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  onClick={() => setViewMode("week")}
                  className={`text-xs sm:text-sm ${viewMode === "week" ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "border-blue-300"}`}
                >
                  📅 Semana
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  onClick={() => setViewMode("month")}
                  className={`text-xs sm:text-sm ${viewMode === "month" ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "border-blue-300"}`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Mês Inteiro
                </Button>
              </div>
              <Button 
                onClick={() => {
                  setEditingPost(null);
                  setShowDialog(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                ✨ Novo Post
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => viewMode === "week" ? handleWeekChange("prev") : handleMonthChange("prev")}
              className="rounded-full border-2 border-blue-300 hover:bg-blue-50"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </Button>
            <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize">
              {format(currentWeek, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => viewMode === "week" ? handleWeekChange("next") : handleMonthChange("next")}
              className="rounded-full border-2 border-blue-300 hover:bg-blue-50"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </Button>
          </div>

          {viewMode === "week" ? (
            // Visualização semanal - mais espaçosa
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 md:gap-4">
              {weekDays.map((day, index) => {
                const dayPosts = getPostsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={index}
                    className={`min-h-[280px] md:min-h-[350px] rounded-xl md:rounded-2xl p-3 md:p-5 transition-all border-2 ${
                      isToday 
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg" 
                        : "border-blue-200 bg-white hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="text-center mb-3 md:mb-5 pb-3 md:pb-4 border-b-2 border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                        {format(day, "EEE", { locale: ptBR })}
                      </p>
                      <p className={`text-xl md:text-2xl font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                        {format(day, "dd")}
                      </p>
                    </div>
                    <div className="space-y-2 md:space-y-3 max-h-[500px] md:max-h-[700px] overflow-y-auto">
                      {dayPosts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          client={clients.find(c => c.id === post.client_id)}
                          onEdit={(p) => {
                            setEditingPost(p);
                            setShowDialog(true);
                          }}
                          onDelete={handleDeletePost}
                          isCompact={false}
                        />
                      ))}
                      {dayPosts.length === 0 && (
                        <p className="text-center text-gray-400 text-xs md:text-sm py-4 md:py-6">Sem posts 📭</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Visualização mensal - corrigida
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* Cabeçalho dos dias da semana - corrigido */}
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(day => (
                <div key={day} className="text-center py-1 md:py-2 font-bold text-blue-600 text-xs md:text-sm border-b-2 border-blue-100">
                  {day}
                </div>
              ))}
              
              {/* Dias do mês - corrigido */}
              {monthDays.map((day, index) => {
                const dayPosts = getPostsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = day.getMonth() === currentWeek.getMonth();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] md:min-h-[140px] rounded-lg md:rounded-xl p-2 md:p-3 transition-all border ${
                      isToday 
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md" 
                        : isCurrentMonth
                        ? "border-blue-200 bg-white hover:border-blue-400"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="text-center mb-2">
                      <p className={`text-xs md:text-sm font-bold ${isToday ? "text-blue-600" : isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
                        {format(day, "dd")}
                      </p>
                    </div>
                    <div className="space-y-1 max-h-[80px] md:max-h-[100px] overflow-y-auto">
                      {dayPosts.slice(0, 3).map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          client={clients.find(c => c.id === post.client_id)}
                          onEdit={(p) => {
                            setEditingPost(p);
                            setShowDialog(true);
                          }}
                          onDelete={handleDeletePost}
                          isCompact={true}
                        />
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayPosts.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PostDialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        post={editingPost}
        clients={clients}
      />
    </div>
  );
}
