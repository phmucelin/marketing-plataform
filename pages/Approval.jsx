import React, { useState, useEffect, useCallback } from "react";
import { Post, ApprovalLink, Client } from "@/entities/all";
import { SendEmail } from "@/integrations/Core";
import { safeDate } from "@/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Clock, Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const formatLabels = {
  story: { label: "Story", emoji: "📱" },
  carrossel: { label: "Carrossel", emoji: "🎠" },
  post: { label: "Post", emoji: "📸" },
  reel: { label: "Reel", emoji: "🎬" }
};

export default function Approval() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  const [posts, setPosts] = useState([]);
  const [client, setClient] = useState(null);
  const [link, setLink] = useState(null);
  const [rejectingPost, setRejectingPost] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [boostingPost, setBoostingPost] = useState(null);
  const [boostNotes, setBoostNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [carouselIndexes, setCarouselIndexes] = useState({}); // Estado para controlar índice de cada carrossel

  const loadApprovalData = useCallback(async () => {
    if (!token) {
      alert("⚠️ Token não fornecido. Por favor, use o link completo enviado pelo seu Social Media.");
      return;
    }
    
    try {
      const linkData = await ApprovalLink.filter({ unique_token: token });
      if (!linkData || linkData.length === 0) {
        alert("❌ Link inválido ou expirado.\n\nPor favor, solicite um novo link de aprovação ao seu Social Media.");
        return;
      }

      const linkInfo = linkData[0];
      
      // Verificar se o link ainda está ativo
      const now = new Date();
      const expiresAt = new Date(linkInfo.expires_at);
      if (now > expiresAt || !linkInfo.is_active) {
        alert("⏰ Este link de aprovação expirou.\n\nPor favor, solicite um novo link ao seu Social Media.");
        return;
      }
      
      setLink(linkInfo);

      const clientData = await Client.filter({ id: linkInfo.client_id });
      if (clientData && clientData[0]) {
        setClient(clientData[0]);
      }

      const postsData = await Post.filter({ 
        client_id: linkInfo.client_id,
        status: "aguardando_aprovacao"
      }, "-created_date");
      
      console.log("📋 Posts carregados para aprovação:", postsData);
      setPosts(postsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("❌ Erro ao carregar dados. Por favor, tente novamente ou entre em contato com seu Social Media.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadApprovalData();
    }
  }, [token, loadApprovalData]);

  const sendNotification = async (action, postTitle, reason = "") => {
    try {
      const user = await User.me();
      let emailBody = `🔔 Nova notificação!\n\n`;
      emailBody += `Cliente: ${client.name}\n`;
      emailBody += `Post: ${postTitle}\n`;
      emailBody += `Ação: ${action}\n`;
      if (reason) {
        emailBody += `\nMotivo: ${reason}`;
      }

      await SendEmail({
        to: user.email,
        subject: `${action} - ${postTitle}`,
        body: emailBody
      });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }
  };

  const handleApprove = async (post) => {
    setProcessing(true);
    await Post.update(post.id, { status: "aprovado" });
    await sendNotification("✅ Post Aprovado", post.title);
    loadApprovalData();
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Por favor, informe o motivo da rejeição 📝");
      return;
    }

    setProcessing(true);
    await Post.update(rejectingPost.id, {
      status: "rejeitado",
      rejection_reason: rejectReason
    });
    await sendNotification("❌ Post Rejeitado", rejectingPost.title, rejectReason);
    setRejectingPost(null);
    setRejectReason("");
    loadApprovalData();
    setProcessing(false);
  };

  const handleBoost = async () => {
    setProcessing(true);
    await Post.update(boostingPost.id, {
      boost_requested: true,
      boost_notes: boostNotes
    });
    await sendNotification("⚡ Pedido para Turbinar", boostingPost.title, boostNotes);
    setBoostingPost(null);
    setBoostNotes("");
    loadApprovalData();
    setProcessing(false);
  };

  // Função para navegar no carrossel
  const nextImage = (postId, totalImages) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (postId, totalImages) => {
    setCarouselIndexes(prev => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  // Função para renderizar mídia (imagem, vídeo ou carrossel)
  const renderMedia = (post) => {
    // Carrossel - múltiplas imagens
    if (post.format === "carrossel" && post.carousel_images && post.carousel_images.length > 0) {
      const currentIndex = carouselIndexes[post.id] || 0;
      const totalImages = post.carousel_images.length;

      return (
        <div className="relative w-full md:w-96 h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-200 shadow-lg flex-shrink-0">
          <img 
            src={post.carousel_images[currentIndex]} 
            alt={`${post.title} - ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
            <ImageIcon className="w-20 h-20 text-blue-300" />
          </div>
          
          {/* Navegação do carrossel */}
          {totalImages > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full"
                onClick={() => prevImage(post.id, totalImages)}
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full"
                onClick={() => nextImage(post.id, totalImages)}
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </Button>
              
              {/* Indicador de posição */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {totalImages}
              </div>
            </>
          )}
        </div>
      );
    }

    // Reel - vídeo
    if (post.format === "reel" && post.video_url) {
      return (
        <div className="w-full md:w-96 h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-200 shadow-lg flex-shrink-0">
          <video 
            src={post.video_url} 
            controls 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // Post ou Story - uma única imagem
    if (post.image_url) {
      return (
        <div className="w-full md:w-96 h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-200 shadow-lg flex-shrink-0 relative">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
            <ImageIcon className="w-20 h-20 text-blue-300" />
          </div>
        </div>
      );
    }

    // Sem mídia
    return (
      <div className="w-full md:w-96 h-80 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-300 shadow-lg flex-shrink-0 flex items-center justify-center">
        <ImageIcon className="w-20 h-20 text-gray-400" />
      </div>
    );
  };

  if (!link || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de aprovação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-2 border-blue-200">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              Olá, {client.name}! ✨👋
            </h1>
            <p className="text-gray-600">
              Aprove ou rejeite seus posts abaixo ✨
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-blue-200">
            <Sparkles className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">🎉 Todos os posts foram processados!</h2>
            <p className="text-gray-500">Não há posts aguardando aprovação no momento.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map(post => (
              <Card key={post.id} className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {renderMedia(post)}

                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-2 border-blue-300 text-sm px-3 py-1">
                            {formatLabels[post.format].emoji} {formatLabels[post.format].label}
                          </Badge>
                          {post.scheduled_date && (() => {
                            const postDate = safeDate(post.scheduled_date);
                            if (!postDate) return null;
                            return (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-2 border-purple-300 text-sm px-3 py-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {format(postDate, "dd/MM HH:mm")}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>

                      {post.caption && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                          <p className="text-sm font-semibold text-blue-700 mb-2">📝 Legenda:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{post.caption}</p>
                        </div>
                      )}

                      {post.hashtags && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-blue-600">{post.hashtags}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => handleApprove(post)}
                          disabled={processing}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => setRejectingPost(post)}
                          disabled={processing}
                          variant="destructive"
                          className="px-6 py-2 rounded-xl font-semibold shadow-lg"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                        <Button
                          onClick={() => setBoostingPost(post)}
                          disabled={processing}
                          variant="outline"
                          className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-2 rounded-xl font-semibold"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          ⚡ Turbinar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para Rejeição */}
        <Dialog open={!!rejectingPost} onOpenChange={() => setRejectingPost(null)}>
          <DialogContent className="max-w-md rounded-3xl border-2 border-red-200">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-600">❌ Rejeitar Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">Por favor, informe o motivo da rejeição:</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: A imagem não está clara, o texto precisa ser ajustado..."
                rows={4}
                className="border-2 border-red-200 focus:border-red-400"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingPost(null)} className="border-2">
                Cancelar
              </Button>
              <Button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white">
                Rejeitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Turbinar */}
        <Dialog open={!!boostingPost} onOpenChange={() => setBoostingPost(null)}>
          <DialogContent className="max-w-md rounded-3xl border-2 border-purple-200">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-600">⚡ Turbinar Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">Sugestões para turbinar o post:</p>
              <Textarea
                value={boostNotes}
                onChange={(e) => setBoostNotes(e.target.value)}
                placeholder="Ex: Adicionar mais hashtags, melhorar a legenda, usar filtros..."
                rows={4}
                className="border-2 border-purple-200 focus:border-purple-400"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBoostingPost(null)} className="border-2">
                Cancelar
              </Button>
              <Button onClick={handleBoost} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                ⚡ Turbinar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
