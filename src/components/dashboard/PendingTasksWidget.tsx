import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  User,
  Tag,
} from 'lucide-react';
import { ClinicTask } from '../../types';

export const PendingTasksWidget: React.FC = () => {
  const { tasks, toggleClinicTask, addClinicTask, deleteClinicTask, currentUser } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'reception' | 'clinical' | 'financial' | 'sanitation'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'reception' | 'clinical' | 'financial' | 'sanitation' | 'general'>('reception');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addClinicTask({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      assignedUserName: currentUser.name,
      assignedRole: currentUser.role,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const getPriorityBadge = (priority: ClinicTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgente',
          classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      case 'high':
        return {
          label: 'Alta',
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'medium':
        return {
          label: 'Média',
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      default:
        return {
          label: 'Normal',
          classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  const getCategoryLabel = (category: ClinicTask['category']) => {
    switch (category) {
      case 'reception':
        return 'Recepção';
      case 'clinical':
        return 'Clínico';
      case 'financial':
        return 'Financeiro';
      case 'sanitation':
        return 'Higienização';
      default:
        return 'Geral';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Tarefas & Pendências da Clínica
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pendingCount} pendências abertas • {completedCount} concluídas hoje
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'reception', label: 'Recepção' },
          { id: 'clinical', label: 'Clínico' },
          { id: 'financial', label: 'Financeiro' },
          { id: 'sanitation', label: 'Higienização' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as any)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === cat.id
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add Task Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddTask}
          className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 space-y-3 animate-in fade-in slide-in-from-top-2"
        >
          <input
            type="text"
            placeholder="Ex: Conferir confirmações de presença para amanhã..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300"
              >
                <option value="reception">Recepção</option>
                <option value="clinical">Clínico</option>
                <option value="financial">Financeiro</option>
                <option value="sanitation">Higienização</option>
                <option value="general">Geral</option>
              </select>

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300"
              >
                <option value="low">Prioridade Normal</option>
                <option value="medium">Prioridade Média</option>
                <option value="high">Prioridade Alta</option>
                <option value="urgent">Prioridade Urgente</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition"
              >
                Salvar Tarefa
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task list items */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Todas as tarefas estão em dia!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nenhuma pendência pendente nesta categoria.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priorityBadge = getPriorityBadge(task.priority);

            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 group ${
                  task.completed
                    ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                    : 'bg-slate-50/90 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleClinicTask(task.id)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold text-slate-900 dark:text-white leading-snug ${
                        task.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {getCategoryLabel(task.category)}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadge.classes}`}>
                        {priorityBadge.label}
                      </span>

                      {task.assignedUserName && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          {task.assignedUserName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteClinicTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Excluir Tarefa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
