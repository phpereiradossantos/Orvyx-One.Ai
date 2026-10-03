import React, { useState } from 'react';
import {
  Lightbulb,
  ListOrdered,
  Target,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  Code,
  FileText,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  MessageSquare,
  Share2
} from 'lucide-react';
import { SummaryData, SummaryFeedback, FeedbackType, VideoMeta } from '../types';
import { generateStandaloneSingleHtml } from '../standaloneHtmlGenerator';
import { ExternalLink, Video as VideoIcon } from 'lucide-react';

interface SummaryResultViewProps {
  summary: SummaryData;
  modelUsed?: string;
  sourceWordCount?: number;
  userApiKey?: string;
  feedback?: SummaryFeedback;
  onFeedbackChange?: (feedback: SummaryFeedback) => void;
  timestamp?: number;
  videoInfo?: VideoMeta;
}

export function SummaryResultView({
  summary,
  modelUsed = 'gemini-3.8-flash',
  sourceWordCount,
  userApiKey = '',
  feedback,
  onFeedbackChange,
  timestamp,
  videoInfo,
}: SummaryResultViewProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'markdown'>('cards');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [showCommentBox, setShowCommentBox] = useState<boolean>(Boolean(feedback?.comment));
  const [commentText, setCommentText] = useState<string>(feedback?.comment || '');
  const [feedbackSavedNotice, setFeedbackSavedNotice] = useState<boolean>(false);

  const currentType = feedback?.type || null;
  const currentRating = feedback?.rating || 0;

  const triggerFeedbackUpdate = (newType: FeedbackType, newRating?: number, newComment?: string) => {
    if (!onFeedbackChange) return;

    const updatedFeedback: SummaryFeedback = {
      type: newType,
      rating: newRating !== undefined ? newRating : currentRating,
      comment: newComment !== undefined ? newComment : commentText,
      timestamp: Date.now(),
    };

    onFeedbackChange(updatedFeedback);
    setFeedbackSavedNotice(true);
    setTimeout(() => setFeedbackSavedNotice(false), 2500);
  };

  const handleThumbClick = (type: 'positive' | 'negative') => {
    const nextType: FeedbackType = currentType === type ? null : type;
    // Suggest 5 stars for positive or 2 stars for negative if not set
    let nextRating = currentRating;
    if (nextType === 'positive' && (!currentRating || currentRating < 3)) {
      nextRating = 5;
    } else if (nextType === 'negative' && (!currentRating || currentRating > 3)) {
      nextRating = 2;
    }
    triggerFeedbackUpdate(nextType, nextRating);
  };

  const handleStarClick = (starValue: number) => {
    let nextType = currentType;
    if (starValue >= 4) nextType = 'positive';
    else if (starValue <= 2) nextType = 'negative';
    triggerFeedbackUpdate(nextType, starValue);
  };

  const handleSaveComment = () => {
    triggerFeedbackUpdate(currentType, currentRating, commentText.trim());
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getFullMarkdown = () => {
    const points = summary.keyPoints.map((p) => `- ${p}`).join('\n');
    return `### 💡 Ideia Central\n${summary.mainIdea}\n\n### 📌 Pontos Chave\n${points}\n\n### 🎯 Conclusão Prática\n${summary.practicalConclusion}`;
  };

  const handleDownloadMarkdown = () => {
    const content = `# Resumo Inteligente (Gemini AI)\n\n${getFullMarkdown()}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumo-gemini-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateStandaloneSingleHtml(userApiKey);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumo-inteligente-gemini-standalone.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareText = `*${summary.mainIdea}*\n\n📌 Pontos Chave:\n${summary.keyPoints.map((p) => `• ${p}`).join('\n')}\n\n🎯 Conclusão Prática:\n${summary.practicalConclusion}\n\n— Gerado com Orvyx-One.AI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resumo • Orvyx-One.AI',
          text: shareText,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareText, 'share');
        }
      }
    } else {
      copyToClipboard(shareText, 'share');
    }
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta leitura por voz.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const fullText = `Ideia Central: ${summary.mainIdea}. Pontos Chave: ${summary.keyPoints.join(
      '. '
    )}. Conclusão Prática: ${summary.practicalConclusion}.`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const totalSummaryWords = (
    summary.mainIdea +
    ' ' +
    summary.keyPoints.join(' ') +
    ' ' +
    summary.practicalConclusion
  ).split(/\s+/).length;

  const reductionPercentage =
    sourceWordCount && sourceWordCount > 0
      ? Math.max(0, Math.round((1 - totalSummaryWords / sourceWordCount) * 100))
      : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Action Bar & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {modelUsed}
          </span>
          {reductionPercentage !== null && reductionPercentage > 0 && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-medium">
              ⚡ {reductionPercentage}% de redução
            </span>
          )}
          {timestamp && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* View toggles & actions */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'markdown'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown
            </button>
          </div>

          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isSpeaking
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isSpeaking ? 'Parar áudio' : 'Ouvir resumo em voz alta'}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
          </button>

          <button
            onClick={() => copyToClipboard(getFullMarkdown(), 'all')}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            title="Copiar resumo completo"
          >
            {copiedSection === 'all' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            title="Compartilhar resumo em outros aplicativos (WhatsApp, Telegram, etc.)"
          >
            {copiedSection === 'share' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-indigo-300" />
                <span className="hidden sm:inline">Compartilhar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            title="Baixar como arquivo Markdown"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">.MD</span>
          </button>

          <button
            onClick={handleDownloadStandaloneHtml}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition"
            title="Baixar versão standalone em um único arquivo HTML puro"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Baixar HTML Único</span>
          </button>
        </div>
      </div>

      {/* Video Source Banner if present */}
      {videoInfo && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            {videoInfo.thumbnail ? (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title || 'Thumbnail do vídeo'}
                className="w-16 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <VideoIcon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    videoInfo.platform === 'youtube'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      : videoInfo.platform === 'tiktok'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                      : videoInfo.platform === 'instagram'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                      : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {videoInfo.platform}
                </span>
                {videoInfo.author && (
                  <span className="text-slate-400 truncate text-[11px]">
                    por {videoInfo.author}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-slate-200 truncate text-xs sm:text-sm">
                {videoInfo.title || videoInfo.url}
              </h4>
            </div>
          </div>

          <a
            href={videoInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 shrink-0 transition"
          >
            <span className="hidden sm:inline">Ver Vídeo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {/* 1. IDEIA CENTRAL */}
          <div className="relative group bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl shadow-indigo-950/20 transition hover:border-indigo-500/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                  <Lightbulb className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                    1. Ideia Central
                  </h3>
                  <span className="text-xs text-slate-400">Em uma frase curta e impactante</span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(summary.mainIdea, 'mainIdea')}
                className="opacity-80 group-hover:opacity-100 p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition"
                title="Copiar Ideia Central"
              >
                {copiedSection === 'mainIdea' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-lg font-medium text-slate-100 leading-relaxed pl-1 border-l-2 border-indigo-500/60 ml-1">
              "{summary.mainIdea}"
            </p>
          </div>

          {/* 2. PONTOS CHAVE */}
          <div className="relative group bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl shadow-emerald-950/10 transition hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  <ListOrdered className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                    2. Pontos Chave
                  </h3>
                  <span className="text-xs text-slate-400">
                    De 3 a 5 tópicos principais com marcadores
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(summary.keyPoints.map((p) => `• ${p}`).join('\n'), 'keyPoints')
                }
                className="opacity-80 group-hover:opacity-100 p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition"
                title="Copiar Pontos Chave"
              >
                {copiedSection === 'keyPoints' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <ul className="space-y-3 pl-1">
              {summary.keyPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-emerald-500/30 transition text-slate-200"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. CONCLUSÃO PRÁTICA */}
          <div className="relative group bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl shadow-amber-950/10 transition hover:border-amber-500/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                    3. Conclusão Prática
                  </h3>
                  <span className="text-xs text-slate-400">Takeaway objetivo e acionável</span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(summary.practicalConclusion, 'conclusion')}
                className="opacity-80 group-hover:opacity-100 p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition"
                title="Copiar Conclusão Prática"
              >
                {copiedSection === 'conclusion' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-slate-100 text-sm leading-relaxed">
              <p>{summary.practicalConclusion}</p>
            </div>
          </div>

          {/* Key tags if available */}
          {summary.keyTerms && summary.keyTerms.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-400 font-medium">Termos destacados:</span>
              {summary.keyTerms.map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/90 text-slate-300 border border-slate-700"
                >
                  #{term}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Markdown / Raw View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              resumo-formatado.md
            </span>
            <button
              onClick={() => copyToClipboard(getFullMarkdown(), 'raw')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copiedSection === 'raw' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copiedSection === 'raw' ? 'Copiado' : 'Copiar Texto'}
            </button>
          </div>
          <pre className="text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            {getFullMarkdown()}
          </pre>
        </div>
      )}

      {/* FEEDBACK MECHANISM CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Como você avalia a qualidade deste resumo?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Sua avaliação ajuda a monitorar a eficácia da IA e fica salva junto com o resumo no histórico.
            </p>
          </div>

          {/* Feedback buttons & Stars */}
          <div className="flex items-center gap-3">
            {/* Thumbs up / down */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleThumbClick('positive')}
                className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  currentType === 'positive'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Resumo útil e de alta qualidade"
              >
                <ThumbsUp className={`w-4 h-4 ${currentType === 'positive' ? 'fill-emerald-400' : ''}`} />
                <span className="hidden sm:inline">Útil</span>
              </button>

              <button
                type="button"
                onClick={() => handleThumbClick('negative')}
                className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  currentType === 'negative'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Resumo impreciso ou incompleto"
              >
                <ThumbsDown className={`w-4 h-4 ${currentType === 'negative' ? 'fill-rose-400' : ''}`} />
                <span className="hidden sm:inline">Pode melhorar</span>
              </button>
            </div>

            {/* 5-Star Rating */}
            <div className="flex items-center gap-0.5 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = (hoverStar !== null ? hoverStar : currentRating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverStar(starVal)}
                    onMouseLeave={() => setHoverStar(null)}
                    onClick={() => handleStarClick(starVal)}
                    className="p-1 text-slate-600 hover:scale-110 transition"
                    title={`${starVal} de 5 estrelas`}
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comment toggle and input */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {!showCommentBox ? (
            <button
              type="button"
              onClick={() => setShowCommentBox(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {feedback?.comment ? 'Editar comentário de feedback' : 'Adicionar comentário (opcional)'}
            </button>
          ) : (
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ex: Excelente síntese, capturou o ponto chave..."
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveComment}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                Salvar Nota
              </button>
            </div>
          )}

          {feedbackSavedNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Avaliação salva no histórico!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
