import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Image as ImageIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { safeDate } from "@/utils";

const formatLabels = {
  story: "Story",
  carrossel: "Carrossel",
  post: "Post",
  reel: "Reel"
};

export default function PendingPosts({ posts, clients, onViewPost }) {
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente";
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Posts Aguardando Aprovação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhum post aguardando aprovação</p>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-200 bg-white"
              >
                <div className="flex gap-4">
                  {post.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{post.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <User className="w-3 h-3 mr-1" />
                        {getClientName(post.client_id)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {formatLabels[post.format]}
                      </Badge>
                    </div>
                    {post.scheduled_date && (() => {
                      const postDate = safeDate(post.scheduled_date);
                      if (!postDate) return null;
                      return (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(postDate, "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                        </p>
                      );
                    })()}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewPost(post)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    Ver
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}