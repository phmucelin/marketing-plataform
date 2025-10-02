import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video, Edit, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { safeDate } from "@/utils";

const formatLabels = {
  story: { label: "Story", emoji: "📱" },
  carrossel: { label: "Carrossel", emoji: "🎠" },
  post: { label: "Post", emoji: "📸" },
  reel: { label: "Reel", emoji: "🎬" }
};

const statusColors = {
  pendente: "bg-gray-100 text-gray-700 border-gray-300",
  em_criacao: "bg-blue-100 text-blue-700 border-blue-300",
  aguardando_aprovacao: "bg-orange-100 text-orange-700 border-orange-300",
  aprovado: "bg-green-100 text-green-700 border-green-300",
  rejeitado: "bg-red-100 text-red-700 border-red-300",
  agendado: "bg-purple-100 text-purple-700 border-purple-300",
  postado: "bg-indigo-100 text-indigo-700 border-indigo-300"
};

export default function PostCard({ post, client, onEdit, onDelete, isCompact = false }) {
  if (isCompact) {
    // Layout compacto para visualização mensal
    return (
      <div 
        className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs cursor-pointer hover:bg-blue-200 transition-colors"
        onClick={() => onEdit(post)}
      >
        <div className="font-semibold text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
          <span>{formatLabels[post.format].emoji}</span>
          <span>{formatLabels[post.format].label}</span>
        </div>
        <div className="font-medium truncate mb-1">
          {post.title || "Sem título"}
        </div>
        {post.scheduled_date && (() => {
          const postDate = safeDate(post.scheduled_date);
          if (!postDate) return null;
          return (
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <Clock className="w-2 h-2" />
              {format(postDate, "HH:mm")}
            </div>
          );
        })()}
      </div>
    );
  }

  // Layout normal para visualização semanal
  return (
    <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 bg-white cursor-pointer" onClick={() => onEdit(post)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            {/* Tipo acima do título */}
            <div className="mb-2">
              <Badge variant="outline" className="text-xs md:text-sm border-blue-200 bg-blue-50 text-blue-700 px-2 py-1">
                {formatLabels[post.format].emoji} {formatLabels[post.format].label}
              </Badge>
            </div>
            
            <h4 className="font-semibold text-gray-900 truncate text-sm md:text-base mb-1 md:mb-2">{post.title}</h4>
            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">{client?.name || "Cliente"}</p>
            
            {post.scheduled_date && (() => {
              const postDate = safeDate(post.scheduled_date);
              if (!postDate) return null;
              return (
                <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  {format(postDate, "dd/MM HH:mm")}
                </p>
              );
            })()}
          </div>
          
          <div className="flex flex-col gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 hover:bg-blue-50 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post);
              }}
            >
              <Edit className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post.id);
              }}
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
