import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Smile, Pill, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeDate } from "@/utils";

const moodEmojis = {
  muito_feliz: "😊",
  feliz: "🙂",
  neutro: "😐",
  triste: "😔",
  muito_triste: "😢"
};

export default function TodayEvents({ posts, personalEvent }) {
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Hoje
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1 capitalize">{today}</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {personalEvent && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Meu Dia
              </h4>
              <div className="flex flex-wrap gap-2">
                {personalEvent.mood && (
                  <Badge variant="outline" className="bg-white">
                    <Smile className="w-3 h-3 mr-1" />
                    {moodEmojis[personalEvent.mood]}
                  </Badge>
                )}
                {personalEvent.medication_taken && (
                  <Badge variant="outline" className="bg-white">
                    <Pill className="w-3 h-3 mr-1" />
                    Medicação ✓
                  </Badge>
                )}
                {personalEvent.special_moment && (
                  <Badge variant="outline" className="bg-white text-pink-600 border-pink-200">
                    ❤️ Momento Especial
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Posts Agendados</h4>
            <div className="space-y-2">
              {posts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum post agendado para hoje</p>
              ) : (
                posts.map(post => {
                  const postDate = safeDate(post.scheduled_date);
                  return (
                    <div key={post.id} className="p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors bg-white">
                      <p className="font-medium text-sm text-gray-900">{post.title}</p>
                      {postDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(postDate, "HH:mm")}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}