import React, { useState, useEffect } from "react";
import { Client } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, Instagram, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients();
    
    // Adicionar listener para recarregar quando a janela recebe foco
    const handleFocus = () => {
      console.log('🔄 Recarregando clientes devido ao foco da janela');
      loadClients();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadClients = async () => {
    const data = await Client.list("-created_date");
    setClients(data);
  };

  const paymentStatusColors = {
    recebido: "bg-green-100 text-green-700 border-green-200",
    pendente: "bg-orange-100 text-orange-700 border-orange-200",
    atrasado: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
            <p className="text-gray-500">Gerencie seus clientes de social media</p>
          </div>
          <Button 
            onClick={() => navigate("/client-profile")}
            className="bg-blue-500 hover:bg-blue-600 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <Card 
              key={client.id}
              className="border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
              onClick={() => navigate(`/client-profile?id=${client.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {client.profile_photo ? (
                      <img src={client.profile_photo} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{client.name}</h3>
                    {client.instagram && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Instagram className="w-3 h-3" />
                        @{client.instagram}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {client.monthly_fee && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Mensalidade</span>
                      <span className="font-semibold text-gray-900">
                        R$ {client.monthly_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {client.payment_status && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`text-xs px-3 py-1 rounded-full border ${paymentStatusColors[client.payment_status]}`}>
                        {client.payment_status}
                      </span>
                    </div>
                  )}
                </div>

                {client.contract_pdf && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(client.contract_pdf, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Ver Contrato
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cliente cadastrado ainda</p>
            <Button 
              onClick={() => navigate("/client-profile")}
              className="mt-4"
            >
              Adicionar Primeiro Cliente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}