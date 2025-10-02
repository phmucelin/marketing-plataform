import React, { useState, useEffect } from 'react';
import { Task } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await Task.list("-created_date");
    setTasks(data);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    
    await Task.create({
      title: newTask,
      completed: false,
      order: tasks.length
    });
    
    setNewTask("");
    loadTasks();
  };

  const handleToggleTask = async (task) => {
    await Task.update(task.id, { completed: !task.completed });
    loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    await Task.delete(taskId);
    loadTasks();
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Card className="border-2 border-blue-200 shadow-lg rounded-3xl bg-white">
      <CardHeader className="pb-4 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-xl font-bold text-blue-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          ✅ Minhas Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-4">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Adicionar nova tarefa... 📝"
            className="flex-1 border-2 border-blue-200 rounded-xl focus:border-blue-400"
          />
          <Button 
            onClick={handleAddTask}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {pendingTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task)}
                  className="border-2 border-blue-400 data-[state=checked]:bg-blue-500"
                />
                <span className="flex-1 text-gray-900 font-medium">{task.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {completedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-blue-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">✨ Concluídas</p>
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-300 transition-all group mb-2"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task)}
                      className="border-2 border-green-400 data-[state=checked]:bg-green-500"
                    />
                    <span className="flex-1 text-gray-500 line-through">{task.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {tasks.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              Nenhuma tarefa ainda 🌟<br/>
              <span className="text-sm">Comece adicionando sua primeira!</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}