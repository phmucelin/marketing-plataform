import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadFile } from "@/integrations/Core";
import { Upload, X, Loader2, Image as ImageIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function PostDialog({ open, onClose, onSave, post, clients }) {
  const [formData, setFormData] = useState({
    client_id: "",
    title: "",
    format: "post",
    caption: "",
    hashtags: "",
    image_url: "",
    video_url: "",
    carousel_images: [], // Novo: array de imagens para carrossel
    scheduled_date: "",
    status: "pendente",
    notes: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (post) {
      const formattedPost = { ...post };
      if (formattedPost.scheduled_date) {
        // Remover o 'Z' e 'T' para evitar conversão de fuso horário
        let dateStr = formattedPost.scheduled_date;
        
        // Se for ISO string, converter mantendo hora local
        if (dateStr.includes('T')) {
          const [datePart, timePart] = dateStr.split('T');
          const timeOnly = timePart.split('.')[0].substring(0, 5); // Pegar apenas HH:mm
          formattedPost.scheduled_date = `${datePart}T${timeOnly}`;
          console.log('🕐 Data carregada:', formattedPost.scheduled_date);
        }
      }
      // Garantir que carousel_images seja um array
      if (!formattedPost.carousel_images) {
        formattedPost.carousel_images = [];
      }
      setFormData(formattedPost);
    } else {
      setFormData({
        client_id: "",
        title: "",
        format: "post",
        caption: "",
        hashtags: "",
        image_url: "",
        video_url: "",
        carousel_images: [],
        scheduled_date: "",
        status: "pendente",
        notes: ""
      });
    }
  }, [post, open]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📤 Iniciando upload:', file.name, file.size, file.type);
    setUploading(true);
    
    try {
      const { file_url } = await UploadFile({ file });
      console.log('✅ Upload concluído - tamanho URL:', file_url.length);
      
      // Se for carrossel, adicionar ao array
      if (type === "carousel_images") {
        setFormData(prev => ({ 
          ...prev, 
          carousel_images: [...prev.carousel_images, file_url] 
        }));
      } else {
        setFormData(prev => ({ ...prev, [type]: file_url }));
      }
    } catch (error) {
      console.error("❌ Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem. Tente novamente.");
    }
    setUploading(false);
  };

  const removeCarouselImage = (index) => {
    setFormData(prev => ({
      ...prev,
      carousel_images: prev.carousel_images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const dataToSave = { ...formData };
    
    // Salvar a data EXATAMENTE como está no input, sem conversão
    if (dataToSave.scheduled_date) {
      console.log('💾 Data antes de salvar:', dataToSave.scheduled_date);
      // Não converter para ISO, manter o formato local
      // Apenas adicionar segundos se não tiver
      if (!dataToSave.scheduled_date.includes(':00', dataToSave.scheduled_date.length - 3)) {
        dataToSave.scheduled_date = dataToSave.scheduled_date + ':00';
      }
      console.log('💾 Data depois de salvar:', dataToSave.scheduled_date);
    }
    
    console.log('💾 Salvando post completo:', dataToSave);
    onSave(dataToSave);
  };

  const handleSendForApproval = () => {
    const dataToSave = { ...formData, status: "aguardando_aprovacao" };
    
    // Salvar a data EXATAMENTE como está no input
    if (dataToSave.scheduled_date) {
      console.log('📤 Data antes de enviar:', dataToSave.scheduled_date);
      if (!dataToSave.scheduled_date.includes(':00', dataToSave.scheduled_date.length - 3)) {
        dataToSave.scheduled_date = dataToSave.scheduled_date + ':00';
      }
      console.log('📤 Data depois de enviar:', dataToSave.scheduled_date);
    }
    
    console.log('📤 Enviando para aprovação:', dataToSave);
    onSave(dataToSave);
  };

  // Renderizar campo de upload baseado no formato
  const renderMediaUpload = () => {
    if (formData.format === "carrossel") {
      return (
        <div className="col-span-2 space-y-2">
          <Label>🎠 Imagens do Carrossel (múltiplas imagens)</Label>
          <div className="grid grid-cols-3 gap-2">
            {formData.carousel_images.map((url, index) => (
              <div key={index} className="relative">
                <img 
                  src={url} 
                  alt={`Imagem ${index + 1}`} 
                  className="w-full h-24 object-cover rounded-lg border-2 border-blue-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 bg-white shadow-md hover:bg-red-50 hover:text-red-600"
                  onClick={() => removeCarouselImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Adicionar</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "carousel_images")}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">✨ Adicione múltiplas imagens para o carrossel</p>
        </div>
      );
    }

    if (formData.format === "reel") {
      return (
        <div className="col-span-2 space-y-2">
          <Label>🎬 Vídeo do Reel</Label>
          <div className="relative">
            {formData.video_url ? (
              <div className="relative">
                <video 
                  src={formData.video_url} 
                  controls 
                  className="w-full h-40 object-cover rounded-lg border-2 border-blue-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white shadow-md hover:bg-red-50 hover:text-red-600"
                  onClick={() => setFormData(prev => ({ ...prev, video_url: "" }))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-2" />
                    <span className="text-sm text-blue-600">Fazendo upload...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload vídeo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, "video_url")}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>
      );
    }

    // Post ou Story - uma única imagem
    return (
      <div className="col-span-2 space-y-2">
        <Label>🖼️ Imagem</Label>
        <div className="relative">
          {formData.image_url ? (
            <div className="relative">
              <img 
                src={formData.image_url} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                onError={(e) => {
                  console.error("❌ Erro ao carregar imagem");
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white shadow-md hover:bg-red-50 hover:text-red-600"
                onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-2" />
                  <span className="text-sm text-blue-600">Fazendo upload...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload imagem</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "image_url")}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-600">
            {post ? "✏️ Editar Post" : "✨ Novo Post"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => {
                  console.log('📝 Formato alterado para:', value);
                  setFormData(prev => ({ 
                    ...prev, 
                    format: value,
                    // Limpar campos ao trocar formato
                    image_url: "",
                    video_url: "",
                    carousel_images: []
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">📸 Post</SelectItem>
                  <SelectItem value="story">📱 Story</SelectItem>
                  <SelectItem value="reel">🎬 Reel</SelectItem>
                  <SelectItem value="carrossel">🎠 Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título do post..."
            />
          </div>

          <div className="space-y-2">
            <Label>📝 Legenda</Label>
            <Textarea
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Escreva a legenda..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>#️⃣ Hashtags</Label>
            <Input
              value={formData.hashtags}
              onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
              placeholder="#exemplo #hashtag"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {renderMediaUpload()}

            <div className="space-y-2">
              <Label>📅 Data e Hora</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => {
                  console.log('🕐 Data alterada no input:', e.target.value);
                  setFormData(prev => ({ ...prev, scheduled_date: e.target.value }));
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>📝 Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-2">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.client_id || !formData.title}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            💾 Salvar
          </Button>
          <Button 
            onClick={handleSendForApproval} 
            disabled={!formData.client_id || !formData.title}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            📤 Enviar para Aprovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
