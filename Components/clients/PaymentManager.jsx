
import React, { useState, useEffect, useCallback } from 'react';
import { Payment } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UploadFile } from "@/integrations/Core";
import { Plus, Upload, ExternalLink, Trash2, DollarSign } from "lucide-react";

const months = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

export default function PaymentManager({ clientId }) {
  const [payments, setPayments] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    month: "",
    year: new Date().getFullYear(),
    amount: 0,
    status: "pendente",
    payment_date: "",
    invoice_url: "",
    receipt_url: "",
    notes: ""
  });

  const loadPayments = useCallback(async () => {
    const data = await Payment.filter({ client_id: clientId }, "-created_date");
    // Ordenar manualmente por ano e mês
    const sortedData = data.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const monthsOrder = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
      return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
    });
    setPayments(sortedData);
  }, [clientId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    await Payment.create({
      ...formData,
      client_id: clientId
    });
    setShowDialog(false);
    setFormData({
      month: "",
      year: new Date().getFullYear(),
      amount: 0,
      status: "pendente",
      payment_date: "",
      invoice_url: "",
      receipt_url: "",
      notes: ""
    });
    loadPayments();
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este pagamento? 🗑️")) {
      await Payment.delete(id);
      loadPayments();
    }
  };

  const statusColors = {
    recebido: "bg-green-100 text-green-700 border-green-300",
    pendente: "bg-orange-100 text-orange-700 border-orange-300",
    atrasado: "bg-red-100 text-red-700 border-red-300"
  };

  const statusEmojis = {
    recebido: "✅",
    pendente: "⏳",
    atrasado: "⚠️"
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">💰 Pagamentos</h3>
        <Button onClick={() => setShowDialog(true)} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      <div className="space-y-3">
        {payments.map(payment => (
          <Card key={payment.id} className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 capitalize">
                      {payment.month} {payment.year}
                    </h4>
                    <Badge className={`border-2 ${statusColors[payment.status]}`}>
                      {statusEmojis[payment.status]} {payment.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-blue-600 mb-2">
                    R$ {payment.amount.toFixed(2)}
                  </p>
                  {payment.payment_date && (
                    <p className="text-sm text-gray-500 mb-2">
                      📅 Pago em: {payment.payment_date}
                    </p>
                  )}
                  {payment.notes && (
                    <p className="text-sm text-gray-600 italic">{payment.notes}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {payment.invoice_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(payment.invoice_url, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        📄 Nota Fiscal
                      </Button>
                    )}
                    {payment.receipt_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(payment.receipt_url, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        🧾 Recibo
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(payment.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {payments.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhum pagamento registrado</p>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-2 border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-600">💰 Novo Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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

            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>📄 Nota Fiscal</Label>
                {formData.invoice_url ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(formData.invoice_url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Ver arquivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, invoice_url: "" }))}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-20 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-blue-50">
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <span className="text-xs text-blue-600">Upload</span>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "invoice_url")}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label>🧾 Recibo</Label>
                {formData.receipt_url ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(formData.receipt_url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Ver arquivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, receipt_url: "" }))}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center h-20 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-blue-50">
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <span className="text-xs text-blue-600">Upload</span>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleFileUpload(e, "receipt_url")}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>📝 Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Adicione observações sobre este pagamento..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.month || !formData.amount} className="bg-gradient-to-r from-blue-500 to-purple-500">
              💾 Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
