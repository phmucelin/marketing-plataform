import React, { useState, useEffect, useCallback } from "react";
import { PersonalEvent } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Pill, Heart as HeartIcon, Smile } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";

const moodEmojis = {
  muito_feliz: "😊",
  feliz: "🙂",
  neutro: "😐",
  triste: "😔",
  muito_triste: "😢"
};

export default function Personal() {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    mood: "",
    medication_taken: false,
    special_moment: false,
    special_moment_description: "",
    diary_notes: ""
  });

  const loadEvents = useCallback(async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    const data = await PersonalEvent.list();
    setEvents(data.filter(e => e.date >= start && e.date <= end));
  }, [currentMonth]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSaveEvent = async () => {
    const existingEvent = events.find(e => e.date === formData.date);
    
    if (existingEvent) {
      await PersonalEvent.update(existingEvent.id, formData);
    } else {
      await PersonalEvent.create(formData);
    }
    
    setShowDialog(false);
    setFormData({
      date: "",
      title: "",
      mood: "",
      medication_taken: false,
      special_moment: false,
      special_moment_description: "",
      diary_notes: ""
    });
    loadEvents();
  };

  const handleDayClick = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const existingEvent = events.find(e => e.date === dateStr);
    
    if (existingEvent) {
      setFormData(existingEvent);
    } else {
      setFormData({
        date: dateStr,
        title: "",
        mood: "",
        medication_taken: false,
        special_moment: false,
        special_moment_description: "",
        diary_notes: ""
      });
    }
    
    setSelectedDate(day);
    setShowDialog(true);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Adicionar dias do mês anterior para preencher a primeira semana (começando na segunda)
  const firstDayOfWeek = monthStart.getDay(); // 0 = Domingo, 1 = Segunda, etc
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Ajustar para começar na segunda
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - daysToAdd);
  
  // Adicionar dias do próximo mês para completar a última semana
  const lastDayOfWeek = monthEnd.getDay();
  const daysToAddEnd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + daysToAddEnd);
  
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventForDay = (day) => {
    return events.find(e => e.date === format(day, "yyyy-MM-dd"));
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💖 Calendário Pessoal</h1>
          <p className="text-gray-500">Acompanhe sua rotina e bem-estar</p>
        </div>

        <Card className="border-2 border-blue-200 shadow-xl bg-white rounded-3xl">
          <CardHeader className="border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="rounded-full border-2 border-blue-300 hover:bg-blue-100"
              >
                <ChevronLeft className="w-5 h-5 text-blue-600" />
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="rounded-full border-2 border-blue-300 hover:bg-blue-100"
              >
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-sm font-bold text-blue-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, index) => {
                const event = getEventForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square p-2 rounded-2xl border-2 transition-all hover:border-blue-400 hover:shadow-lg ${
                      isToday 
                        ? "border-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 shadow-md" 
                        : event
                        ? "border-blue-300 bg-blue-50"
                        : "border-blue-100 bg-white hover:bg-blue-50"
                    } ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-start h-full">
                      <span className={`text-sm font-bold mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                        {format(day, "d")}
                      </span>
                      {event && (
                        <div className="flex flex-col items-center gap-1 w-full">
                          {event.title && (
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold truncate w-full text-center shadow-md">
                              {event.title}
                            </div>
                          )}
                          <div className="flex gap-1 flex-wrap justify-center">
                            {event.medication_taken && <span className="text-base">💊</span>}
                            {event.special_moment && <span className="text-base">❤️</span>}
                            {event.mood && <span className="text-base">{moodEmojis[event.mood]}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-600">
                ✨ {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>📝 Título do Evento (opcional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Reunião importante, Aniversário..."
                />
              </div>

              <div className="space-y-2">
                <Label>😊 Como você se sentiu?</Label>
                <Select
                  value={formData.mood}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu humor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muito_feliz">😊 Muito Feliz</SelectItem>
                    <SelectItem value="feliz">🙂 Feliz</SelectItem>
                    <SelectItem value="neutro">😐 Neutro</SelectItem>
                    <SelectItem value="triste">😔 Triste</SelectItem>
                    <SelectItem value="muito_triste">😢 Muito Triste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <Checkbox
                  checked={formData.medication_taken}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, medication_taken: checked }))}
                  id="medication"
                />
                <Label htmlFor="medication" className="flex items-center gap-2 cursor-pointer font-medium">
                  <span className="text-xl">💊</span>
                  Tomei minha medicação hoje
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                <Checkbox
                  checked={formData.special_moment}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, special_moment: checked }))}
                  id="special"
                />
                <Label htmlFor="special" className="flex items-center gap-2 cursor-pointer font-medium">
                  <span className="text-xl">❤️</span>
                  Momento especial
                </Label>
              </div>

              {formData.special_moment && (
                <div className="space-y-2">
                  <Label>💝 Conte sobre o momento especial</Label>
                  <Textarea
                    value={formData.special_moment_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_moment_description: e.target.value }))}
                    placeholder="O que tornou este momento especial?"
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>📖 Notas do Dia (Diário)</Label>
                <Textarea
                  value={formData.diary_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, diary_notes: e.target.value }))}
                  placeholder="Como foi seu dia? Escreva aqui suas reflexões..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEvent} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                💾 Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}