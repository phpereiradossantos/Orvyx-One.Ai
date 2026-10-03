import React, { useState } from 'react';
import {
  X,
  Clock,
  Trash2,
  ChevronRight,
  Search,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Star,
  Download,
  Filter,
  ArrowUpDown,
  Sparkles,
  Calendar
} from 'lucide-react';
import { SummaryRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: SummaryRecord[];
  onSelectRecord: (record: SummaryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}: HistoryDrawerProps) {
  const [search, setSearch] = useState('');
  const [filterFeedback, setFilterFeedback] = useState<'all' | 'positive' | 'negative' | 'rated'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isOpen) return null;

  // Filter records
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.summary.mainIdea.toLowerCase().includes(search.toLowerCase()) ||
      (r.feedback?.comment && r.feedback.comment.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterFeedback === 'positive') return r.feedback?.type === 'positive';
    if (filterFeedback === 'negative') return r.feedback?.type === 'negative';
    if (filterFeedback === 'rated') return Boolean(r.feedback?.rating || r.feedback?.type);

    return true;
  });

  // Sort records
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    if (sortBy === 'oldest') return a.createdAt - b.createdAt;
    if (sortBy === 'rating') {
      const rateA = a.feedback?.rating || (a.feedback?.type === 'positive' ? 4 : 0);
      const rateB = b.feedback?.rating || (b.feedback?.type === 'positive' ? 4 : 0);
      return rateB - rateA;
    }
    return 0;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `historico-resumos-gemini-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Hoje às ${timeStr}`;
    }

    return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${timeStr}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Histórico de Resumos</h2>
              <p className="text-xs text-slate-400">
                {records.length} {records.length === 1 ? 'resumo salvo' : 'resumos salvos'} com avaliações
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Sorters */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-950/40">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por texto, tema ou feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterFeedback('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterFeedback === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterFeedback('positive')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  filterFeedback === 'positive'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                Positivos
              </button>
              <button
                type="button"
                onClick={() => setFilterFeedback('negative')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  filterFeedback === 'negative'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                Negativos
              </button>
              <button
                type="button"
                onClick={() => setFilterFeedback('rated')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  filterFeedback === 'rated'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-300'
                }`}
              >
                <Star className="w-3 h-3" />
                Avaliados
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="rating">Melhor avaliados</option>
            </select>
          </div>
        </div>

        {/* List of Summaries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
              <p className="font-semibold text-sm text-slate-300">Nenhum resumo salvo</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Quando você resumir um texto ou transcrição, ele será armazenado automaticamente aqui com seu carimbo de data e hora.
              </p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhum resumo corresponde aos filtros selecionados.
            </div>
          ) : (
            sorted.map((item) => {
              const fb = item.feedback;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectRecord(item);
                    onClose();
                  }}
                  className="group relative p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  {/* Title & Delete */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition">
                      {item.title || 'Resumo Sem Título'}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      title="Excluir este resumo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Main Idea preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 italic">
                    "{item.summary.mainIdea}"
                  </p>

                  {/* Feedback preview & Tag info */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px]">
                    {/* Timestamp & Model */}
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {formatTimestamp(item.createdAt)}
                      </span>
                      {item.videoUrl && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400 font-semibold text-[10px]">
                            {item.videoInfo?.platform ? item.videoInfo.platform.toUpperCase() : 'VÍDEO'}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-slate-400 font-mono text-[10px]">{item.modelUsed}</span>
                    </div>

                    {/* Feedback Badge */}
                    <div className="flex items-center gap-1.5">
                      {fb?.type === 'positive' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <ThumbsUp className="w-2.5 h-2.5" />
                          Útil
                        </span>
                      )}
                      {fb?.type === 'negative' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                          <ThumbsDown className="w-2.5 h-2.5" />
                          Pode melhorar
                        </span>
                      )}
                      {fb?.rating && fb.rating > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {fb.rating}/5
                        </span>
                      )}
                      {!fb && (
                        <span className="text-[10px] text-slate-600">Não avaliado</span>
                      )}
                    </div>
                  </div>

                  {/* Feedback comment preview if present */}
                  {fb?.comment && (
                    <div className="mt-2 text-[11px] text-slate-400 bg-indigo-950/20 border border-indigo-500/20 px-2 py-1 rounded">
                      <span className="font-medium text-indigo-300">Nota:</span> "{fb.comment}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Clear Confirmation Modal / Banner */}
        {confirmClearOpen && (
          <div className="p-4 bg-rose-950/40 border-t border-rose-500/30 text-xs text-rose-200 flex flex-col gap-2 animate-in fade-in">
            <p className="font-semibold">Tem certeza que deseja apagar todos os resumos do histórico?</p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClearOpen(false);
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {records.length > 0 && !confirmClearOpen && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-rose-950/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar histórico
              </button>

              <button
                onClick={handleExportJson}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800 transition"
                title="Exportar todos os resumos e avaliações em arquivo JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar JSON
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium transition"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
