
import React, { useState, useEffect, useCallback } from "react";
import { Client, Post, ApprovalLink } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadFile } from "@/integrations/Core";
import { ArrowLeft, Upload, Link as LinkIcon, Copy, Check, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, addDays } from "date-fns";
import PaymentManager from "../components/clients/PaymentManager";

export default function ClientProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  
  const [client, setClient] = useState({
    name: "",
    profile_photo: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    contract_pdf: "",
    monthly_fee: 0,
    payment_status: "pendente",
    payment_history: [],
    notes: ""
  });
  const [posts, setPosts] = useState([]);
  const [approvalLinks, setApprovalLinks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [copiedLink, setCopiedLink] = useState("");

  const loadClient = useCallback(async () => {
    const data = await Client.filter({ id: clientId });
    if (data[0]) setClient(data[0]);
  }, [clientId]);

  const loadPosts = useCallback(async () => {
    const data = await Post.filter({ client_id: clientId }, "-created_date");
    setPosts(data);
  }, [clientId]);

  const loadApprovalLinks = useCallback(async () => {
    const data = await ApprovalLink.filter({ client_id: clientId }, "-created_date");
    setApprovalLinks(data);
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      loadClient();
      loadPosts();
      loadApprovalLinks();
    }
  }, [clientId, loadClient, loadPosts, loadApprovalLinks]);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setClient(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (clientId) {
      await Client.update(clientId, client);
      alert("Cliente atualizado com sucesso!");
    } else {
      await Client.create(client);
      alert("Cliente criado com sucesso!");
      navigate(createPageUrl("Clients"));
    }
  };

  const generateApprovalLink = async () => {
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = format(addDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss");
    
    await ApprovalLink.create({
      client_id: clientId,
      unique_token: token,
      expires_at: expiresAt,
      is_active: true,
      selected_posts: []
    });
    
    loadApprovalLinks();
  };

  const copyLink = (token) => {
    const link = `${window.location.origin}/approval?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  const deleteLink = async (linkId) => {
    if (confirm("❌ Tem certeza que deseja excluir este link de aprovação?")) {
      await ApprovalLink.delete(linkId);
      loadApprovalLinks();
    }
  };

  const deleteClient = async () => {
    if (confirm("⚠️ TEM CERTEZA QUE DESEJA EXCLUIR ESTE CLIENTE?\n\n⚠️ ATENÇÃO: Todos os posts, pagamentos e links de aprovação deste cliente também serão excluídos!\n\nEsta ação NÃO PODE ser desfeita!")) {
      try {
        // Deletar todos os posts do cliente
        for (const post of posts) {
          await Post.delete(post.id);
        }
        
        // Deletar todos os links de aprovação do cliente
        for (const link of approvalLinks) {
          await ApprovalLink.delete(link.id);
        }
        
        // Deletar o cliente
        await Client.delete(clientId);
        
        alert("✅ Cliente excluído com sucesso!");
        navigate(createPageUrl("Clients"));
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        alert("❌ Erro ao excluir cliente. Tente novamente.");
      }
    }
  };

  const approvedPosts = posts.filter(p => p.status === "aprovado").length;
  const rejectedPosts = posts.filter(p => p.status === "rejeitado").length;
  const boostRequests = posts.filter(p => p.boost_requested).length;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Clients"))}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {clientId ? "Perfil do Cliente" : "Novo Cliente"}
              </h1>
            </div>
          </div>
          {clientId && (
            <Button
              variant="destructive"
              onClick={deleteClient}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Cliente
            </Button>
          )}
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            {clientId && <TabsTrigger value="approval">Links de Aprovação</TabsTrigger>}
          </TabsList>

          <TabsContent value="info">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={client.name}
                    onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Foto de Perfil</Label>
                  {client.profile_photo ? (
                    <div className="flex items-center gap-4">
                      <img src={client.profile_photo} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                      <Button
                        variant="outline"
                        onClick={() => setClient(prev => ({ ...prev, profile_photo: "" }))}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Clique para upload</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "profile_photo")}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={client.instagram}
                      onChange={(e) => setClient(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input
                      value={client.facebook}
                      onChange={(e) => setClient(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="URL do perfil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TikTok</Label>
                    <Input
                      value={client.tiktok}
                      onChange={(e) => setClient(prev => ({ ...prev, tiktok: e.target.value }))}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contrato PDF</Label>
                  {client.contract_pdf ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(client.contract_pdf, '_blank')}
                      >
                        Ver Contrato
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setClient(prev => ({ ...prev, contract_pdf: "" }))}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Upload PDF</span>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e, "contract_pdf")}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={client.notes}
                    onChange={(e) => setClient(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas sobre o cliente..."
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600">
                  {clientId ? "Salvar Alterações" : "Criar Cliente"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card className="border-2 border-blue-200 shadow-md rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-100">
                <CardTitle className="text-blue-600">💰 Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>💵 Valor Mensal</Label>
                    <Input
                      type="number"
                      value={client.monthly_fee}
                      onChange={(e) => setClient(prev => ({ ...prev, monthly_fee: parseFloat(e.target.value) }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Atual</Label>
                    <Select
                      value={client.payment_status}
                      onValueChange={(value) => setClient(prev => ({ ...prev, payment_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recebido">✅ Recebido</SelectItem>
                        <SelectItem value="pendente">⏳ Pendente</SelectItem>
                        <SelectItem value="atrasado">⚠️ Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={handleSave} className="w-full mb-6 bg-gradient-to-r from-blue-500 to-purple-500">
                  💾 Salvar Alterações
                </Button>

                <PaymentManager clientId={clientId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Aprovados</p>
                      <p className="text-3xl font-bold text-green-600">{approvedPosts}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Rejeitados</p>
                      <p className="text-3xl font-bold text-red-600">{rejectedPosts}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pedidos Turbinar</p>
                      <p className="text-3xl font-bold text-blue-600">{boostRequests}</p>
                    </div>
                    <LinkIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Histórico de Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {posts.map(post => (
                    <div key={post.id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{post.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{post.format}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          post.status === "aprovado" ? "bg-green-100 text-green-700" :
                          post.status === "rejeitado" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      {post.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">Motivo: {post.rejection_reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {clientId && (
            <TabsContent value="approval">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Links de Aprovação</CardTitle>
                    <Button onClick={generateApprovalLink} className="bg-blue-500 hover:bg-blue-600">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Gerar Novo Link
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                                    <div className="space-y-3">
                    {approvalLinks.map(link => (
<div key={link.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-gray-600 truncate">
                              {window.location.origin}/approval?token={link.unique_token}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Expira em: {format(new Date(link.expires_at), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyLink(link.unique_token)}
                            >
                              {copiedLink === link.unique_token ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLink(link.id)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {approvalLinks.length === 0 && (
                      <p className="text-center text-gray-400 py-8">Nenhum link gerado ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
