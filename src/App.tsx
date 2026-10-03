import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Settings,
  Clock,
  Send,
  Loader2,
  Trash2,
  ClipboardPaste,
  FileText,
  AlertCircle,
  Video,
  FileCode2,
  Key,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Search,
  ChevronRight,
  Download,
  Link as LinkIcon,
  ExternalLink,
  Play,
  Upload,
  FileVideo,
  Film,
  X
} from 'lucide-react';
import { AppConfig, SummaryData, SummaryRecord, SummaryFeedback, VideoMeta, UploadedVideoFile } from './types';
import { SAMPLE_TEXTS, SAMPLE_VIDEO_URLS, SampleText, SampleVideoUrl } from './sampleTexts';
import { SettingsModal, DEFAULT_SYSTEM_INSTRUCTION } from './components/SettingsModal';
import { SummaryResultView } from './components/SummaryResultView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { generateStandaloneSingleHtml } from './standaloneHtmlGenerator';

const CONFIG_STORAGE_KEY = 'orvyx_one_ai_config_v1';
const HISTORY_STORAGE_KEY = 'orvyx_one_ai_history_v1';

export const SUBJECT_CATEGORIES = [
  {
    id: 'matematica',
    name: '📐 Matemática',
    topics: [
      'Equação do 1º Grau',
      'Fórmula de Bhaskara (Equação do 2º Grau)',
      'Teorema de Pitágoras',
      'Regra de Três Simples e Composta',
      'Porcentagem e Juros Simples',
      'Geometria Espacial: Volumes',
    ],
  },
  {
    id: 'ciencias',
    name: '🔬 Ciências & Biologia',
    topics: [
      'Fotossíntese das Plantas',
      'Como funciona o Sistema Imunológico',
      'Estrutura do DNA e Genética Básica',
      'Ciclo da Água e Ecologia',
      'A Teoria da Evolução de Darwin',
      'A Célula e suas Organelas',
    ],
  },
  {
    id: 'fisica',
    name: '⚡ Física & Química',
    topics: [
      'As 3 Leis de Newton',
      'Teoria da Relatividade de Einstein',
      'Tabela Periódica e Ligações Químicas',
      'Termodinâmica e Leis do Calor',
      'Eletricidade e Lei de Ohm',
      'Cinemática: Velocidade e Aceleração',
    ],
  },
  {
    id: 'historia',
    name: '🏛️ História & Geografia',
    topics: [
      'A Revolução Industrial',
      'Independência do Brasil e Período Imperial',
      'Primeira e Segunda Guerra Mundial',
      'O Império Romano e sua Queda',
      'Guerra Fria e a Queda do Muro de Berlim',
      'Placas Tectônicas e Relevo Global',
    ],
  },
  {
    id: 'financas',
    name: '💰 Educação Financeira',
    topics: [
      'O Poder dos Juros Compostos',
      'Regra 50/30/20 de Orçamento Pessoal',
      'Como criar uma Reserva de Emergência',
      'Renda Fixa (CDB, Tesouro Selic) vs Ações',
      'O que é Inflação e como se proteger',
      'Educação Financeira para Evitar Dívidas',
    ],
  },
  {
    id: 'edfisica',
    name: '🏃 Educação Física & Saúde',
    topics: [
      'Como funciona a Hipertrofia Muscular',
      'Treino HIIT vs Exercício Aeróbico Contínuo',
      'A Importância do Sono no Rendimento Físico',
      'Alongamento, Mobilidade e Correção Postural',
      'Macronutrientes: Proteínas, Carbos e Gorduras',
      'Prevenção de Lesões em Atividades Físicas',
    ],
  },
  {
    id: 'esportes',
    name: '⚽ Esportes & Táticas',
    topics: [
      'Táticas e Sistemas no Futebol Moderno (4-3-3 vs 3-5-2)',
      'Regras Oficiais e Fundamentos do Basquete',
      'Como funciona a Periodização de Treino Esportivo',
      'A Fisiologia do Atleta de Alto Rendimento',
      'História e Valores dos Jogos Olímpicos',
      'Táticas de Ataque e Defesa no Voleibol',
    ],
  },
  {
    id: 'outros',
    name: '🧠 Tecnologia & Geral',
    topics: [
      'Como funcionam as Redes Neurais e IA',
      'Técnica Pomodoro de Produtividade',
      'Inteligência Emocional e Autocontrole',
      'Comunicação Não-Violenta e Oratória',
    ],
  },
];

export default function App() {
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(0);
  // Application Configuration
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      apiKey: '',
      model: 'gemini-3.1-flash-lite',
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      tone: 'balanced',
    };
  });

  // History records
  const [history, setHistory] = useState<SummaryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Server state / check
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(true);

  // Active top navigation tab ('summarize' vs 'history')
  const [activeTab, setActiveTab] = useState<'summarize' | 'history'>('summarize');

  // Input Mode: 'gallery' (Device Gallery video), 'video_url' (URL), 'text' (manual paste)
  const [inputMode, setInputMode] = useState<'gallery' | 'video_url' | 'text'>('gallery');

  // Uploaded Gallery Video state
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoFile | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  // Video URL state
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoMeta | null>(null);
  const [isFetchingVideoMeta, setIsFetchingVideoMeta] = useState<boolean>(false);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);

  // Text state
  const [sourceText, setSourceText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<SummaryData | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<SummaryFeedback | undefined>(undefined);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | undefined>(undefined);
  const [currentVideoInfo, setCurrentVideoInfo] = useState<VideoMeta | undefined>(undefined);
  const [lastSummarizedWordCount, setLastSummarizedWordCount] = useState<number>(0);

  // Modals & notifications
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Inline history filter & search
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'positive' | 'negative' | 'rated'>('all');

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Detect platform based on URL
  const getDetectedPlatform = (url: string): 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'twitter' | 'web' | null => {
    if (!url.trim()) return null;
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('vimeo.com')) return 'vimeo';
    if (lower.includes('x.com') || lower.includes('twitter.com')) return 'twitter';
    if (lower.startsWith('http://') || lower.startsWith('https://')) return 'web';
    return null;
  };

  const detectedPlatform = getDetectedPlatform(videoUrl);

  // Check backend environment status on mount
  useEffect(() => {
    fetch('/api/config-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasEnvApiKey !== undefined) {
          setHasEnvKey(Boolean(data.hasEnvApiKey));
        }
      })
      .catch(() => {
        // Dev server might still be booting
      });
  }, []);

  // Fetch video metadata when URL changes (debounced)
  useEffect(() => {
    const trimmed = videoUrl.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      setVideoInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingVideoMeta(true);
      try {
        const res = await fetch('/api/video-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setVideoInfo(data.data);
        }
      } catch {
        // Ignore metadata fetch error, fallback gracefully
      } finally {
        setIsFetchingVideoMeta(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [videoUrl]);

  // Handle Gallery file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g. up to 45MB)
    const maxSizeBytes = 45 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg(`O vídeo selecionado (${(file.size / (1024 * 1024)).toFixed(1)} MB) ultrapassa o limite de 45 MB.`);
      return;
    }

    setIsReadingFile(true);
    setErrorMsg(null);

    const previewUrl = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedVideo({
        name: file.name,
        size: file.size,
        type: file.type || 'video/mp4',
        base64,
        previewUrl,
      });
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setErrorMsg('Erro ao ler arquivo de vídeo da galeria.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenGallery = () => {
    setErrorMsg(null);
    galleryFileInputRef.current?.click();
  };

  const handleRemoveUploadedVideo = () => {
    if (uploadedVideo?.previewUrl) {
      URL.revokeObjectURL(uploadedVideo.previewUrl);
    }
    setUploadedVideo(null);
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
    }
  };

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // storage error ignored
    }
  };

  // Save history changes
  const saveHistory = (newHistory: SummaryRecord[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // storage error ignored
    }
  };

  // Keyboard shortcut (Ctrl/Cmd + Enter) to trigger summary
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (activeTab === 'summarize' && !isLoading) {
          if (inputMode === 'gallery' && uploadedVideo) {
            handleSummarize();
          } else if (inputMode === 'video_url' && videoUrl.trim().length > 0) {
            handleSummarize();
          } else if (inputMode === 'text' && sourceText.trim().length > 0) {
            handleSummarize();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sourceText, videoUrl, uploadedVideo, inputMode, isLoading, config, activeTab]);

  // Loading step simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle summarize action
  const handleSummarize = async () => {
    const trimmedText = sourceText.trim();
    const trimmedUrl = videoUrl.trim();

    if (inputMode === 'gallery' && !uploadedVideo) {
      setErrorMsg('Por favor, toque em "Abrir Galeria" para selecionar um vídeo do seu dispositivo.');
      return;
    }

    if (inputMode === 'video_url' && !trimmedUrl) {
      setErrorMsg('Por favor, insira o link de um vídeo do YouTube, TikTok, Instagram ou de outra plataforma.');
      videoInputRef.current?.focus();
      return;
    }

    if (inputMode === 'text' && !trimmedText) {
      setErrorMsg('Por favor, cole um texto longo ou a transcrição de um vídeo para resumir.');
      textareaRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCurrentSummary(null);
    setCurrentFeedback(undefined);

    const wordsOriginal = trimmedText ? trimmedText.split(/\s+/).length : 120;
    setLastSummarizedWordCount(wordsOriginal);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmedText || undefined,
          videoFile: inputMode === 'gallery' && uploadedVideo
            ? {
                name: uploadedVideo.name,
                type: uploadedVideo.type,
                base64: uploadedVideo.base64,
                size: uploadedVideo.size,
              }
            : undefined,
          videoUrl: inputMode === 'video_url' ? trimmedUrl : undefined,
          videoInfo: inputMode === 'video_url' ? videoInfo : undefined,
          apiKey: config.apiKey || undefined,
          model: config.model,
          systemInstruction: config.systemInstruction,
          tone: config.tone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: Falha ao processar resumo.`);
      }

      if (!result.data || !result.data.mainIdea) {
        throw new Error('A resposta do modelo não continha a estrutura esperada.');
      }

      const summaryData: SummaryData = {
        mainIdea: result.data.mainIdea,
        keyPoints: Array.isArray(result.data.keyPoints)
          ? result.data.keyPoints
          : [result.data.keyPoints],
        practicalConclusion: result.data.practicalConclusion || '',
        keyTerms: result.data.keyTerms || [],
      };

      const now = Date.now();
      const newId = 'sum_' + now;

      setCurrentSummary(summaryData);
      setCurrentRecordId(newId);
      setCurrentTimestamp(now);

      if (inputMode === 'gallery' && uploadedVideo) {
        setCurrentVideoInfo({
          platform: 'web',
          title: `Vídeo da Galeria: ${uploadedVideo.name}`,
          url: uploadedVideo.previewUrl || '',
        });
      } else {
        setCurrentVideoInfo(result.videoInfo || (inputMode === 'video_url' ? videoInfo || undefined : undefined));
      }

      // Create history record title
      let previewTitle = '';
      if (inputMode === 'gallery' && uploadedVideo) {
        previewTitle = `[Galeria] ${uploadedVideo.name}`;
      } else if (inputMode === 'video_url' && videoInfo?.title) {
        previewTitle = `[${videoInfo.platform.toUpperCase()}] ${videoInfo.title}`;
      } else if (inputMode === 'video_url' && trimmedUrl) {
        previewTitle = `[Vídeo] ${trimmedUrl.slice(0, 45)}...`;
      } else {
        previewTitle = trimmedText.slice(0, 60).replace(/[\r\n]+/g, ' ') + (trimmedText.length > 60 ? '...' : '');
      }

      const record: SummaryRecord = {
        id: newId,
        title: previewTitle,
        originalText: trimmedText || (uploadedVideo ? `Arquivo de vídeo: ${uploadedVideo.name}` : (videoInfo?.title || trimmedUrl)),
        summary: summaryData,
        createdAt: now,
        wordCountOriginal: wordsOriginal,
        modelUsed: result.model || config.model,
        videoUrl: inputMode === 'video_url' ? trimmedUrl : undefined,
        videoInfo: inputMode === 'video_url' ? result.videoInfo || videoInfo || undefined : undefined,
        uploadedVideo: inputMode === 'gallery' && uploadedVideo
          ? {
              name: uploadedVideo.name,
              size: uploadedVideo.size,
              type: uploadedVideo.type,
            }
          : undefined,
      };

      const updatedHistory = [record, ...history.slice(0, 49)];
      saveHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao comunicar com a API do Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feedback update for current summary
  const handleFeedbackChange = (newFeedback: SummaryFeedback) => {
    setCurrentFeedback(newFeedback);

    if (currentRecordId) {
      const updatedHistory = history.map((item) =>
        item.id === currentRecordId ? { ...item, feedback: newFeedback } : item
      );
      saveHistory(updatedHistory);
    }
  };

  // Select an item from history to view in full
  const handleSelectRecord = (record: SummaryRecord) => {
    if (record.uploadedVideo) {
      setInputMode('gallery');
      setUploadedVideo(null);
      setSourceText(record.originalText || '');
    } else if (record.videoUrl) {
      setInputMode('video_url');
      setVideoUrl(record.videoUrl);
      setVideoInfo(record.videoInfo || null);
      setSourceText(record.originalText || '');
    } else {
      setInputMode('text');
      setSourceText(record.originalText);
      setVideoUrl('');
      setVideoInfo(null);
    }

    setCurrentSummary(record.summary);
    setCurrentRecordId(record.id);
    setCurrentFeedback(record.feedback);
    setCurrentTimestamp(record.createdAt);
    setCurrentVideoInfo(record.videoInfo);
    setLastSummarizedWordCount(record.wordCountOriginal);
    setActiveTab('summarize');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Delete a single record
  const handleDeleteRecord = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistory(updated);
    if (currentRecordId === id) {
      setCurrentRecordId(null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    saveHistory([]);
    setCurrentRecordId(null);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (inputMode === 'video_url') {
          setVideoUrl(text.trim());
        } else {
          setSourceText(text);
        }
        setErrorMsg(null);
      }
    } catch {
      alert('Permissão para ler área de transferência bloqueada. Cole usando Ctrl+V.');
    }
  };

  const handleLoadSampleText = (sample: SampleText) => {
    setInputMode('text');
    setSourceText(sample.content);
    setErrorMsg(null);
  };

  const handleLoadSampleVideo = (sample: SampleVideoUrl) => {
    setInputMode('video_url');
    setVideoUrl(sample.url);
    setVideoInfo({
      platform: sample.platform,
      title: sample.previewTitle,
      author: sample.author,
      url: sample.url,
    });
    setErrorMsg(null);
  };

  const handleDownloadStandalone = () => {
    const html = generateStandaloneSingleHtml(config.apiKey);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orvyx-one-ai-standalone.html';
    link.click();
    URL.revokeObjectURL(url);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Filtered list for the inline history view
  const inlineFilteredHistory = history.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      r.summary.mainIdea.toLowerCase().includes(historySearch.toLowerCase()) ||
      (r.feedback?.comment && r.feedback.comment.toLowerCase().includes(historySearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (historyFilter === 'positive') return r.feedback?.type === 'positive';
    if (historyFilter === 'negative') return r.feedback?.type === 'negative';
    if (historyFilter === 'rated') return Boolean(r.feedback?.rating || r.feedback?.type);

    return true;
  });

  // Calculations
  const charCount = sourceText.length;
  const wordCount = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const estReadMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo / Brand: Orvyx-One.AI */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  Orvyx-One.AI
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  IA Multidisciplinar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Matemática, Ciências, História, Física, Finanças, Ed. Física, Esportes e Vídeos
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Summarizer vs History) */}
          <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('summarize')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'summarize'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Resumidor
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Histórico ({history.length})
            </button>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Standalone HTML Button */}
            <button
              onClick={handleDownloadStandalone}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition"
              title="Baixar Orvyx-One.AI em um arquivo HTML único para rodar offline"
            >
              <FileCode2 className="w-4 h-4 text-indigo-400" />
              <span>HTML Único</span>
            </button>

            {/* History Drawer Trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition flex items-center gap-1.5"
              title="Abrir painel lateral de histórico"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Gaveta</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 transition flex items-center gap-1.5"
              title="Configurações da IA, chave e modelo"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Configurações</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="sm:hidden flex border-b border-slate-800 bg-slate-900/40 p-2">
        <button
          onClick={() => setActiveTab('summarize')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'summarize'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Resumidor
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Histórico ({history.length})
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast alert if singlefile html was exported */}
        {copiedNotification && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Orvyx-One.AI exportado como arquivo HTML único com sucesso! Você pode abri-lo offline no navegador.
            </span>
          </div>
        )}

        {/* TAB 1: SUMMARIZER VIEW */}
        {activeTab === 'summarize' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Banner / Instructions */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Orvyx-One.AI
                    </span>
                    <span className="text-xs text-slate-400">
                      Vídeos da Galeria • YouTube • TikTok • Reels
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Explicações e Sínteses Inteligentes em 3 Partes
                  </h2>
                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Pergunte sobre <strong className="text-indigo-300">qualquer assunto</strong> (ex: <em className="text-amber-300 not-italic font-semibold">Equação do 1º Grau</em>, Física, História, Finanças), escolha um vídeo direto da <strong className="text-emerald-300">galeria</strong> ou insira um link do <strong className="text-rose-400">YouTube / TikTok / Reels</strong>.
                    O Orvyx-One.AI ensina e sintetiza em: <span className="text-indigo-300 font-semibold">1. Ideia Central</span>, <span className="text-emerald-300 font-semibold">2. Pontos Chave</span> e <span className="text-amber-300 font-semibold">3. Conclusão Prática</span>.
                  </p>
                </div>

                {/* Quick Badges of 3-Part Framework */}
                <div className="flex md:flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-indigo-300 font-medium">
                    <span>💡 1. Ideia Central</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-300 font-medium">
                    <span>📌 2. Pontos Chave</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300 font-medium">
                    <span>🎯 3. Conclusão Prática</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Box Card with 3-Mode Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              {/* Mode Switcher Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/90">
                <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                  {/* Mode 1: Device Gallery */}
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('gallery');
                      setErrorMsg(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                      inputMode === 'gallery'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileVideo className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vídeo da Galeria</span>
                  </button>

                  {/* Mode 2: Video URL */}
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('video_url');
                      setErrorMsg(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                      inputMode === 'video_url'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Link (YouTube / TikTok)</span>
                  </button>

                  {/* Mode 3: Text & Universal Topic */}
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('text');
                      setErrorMsg(null);
                    }}
                    className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                      inputMode === 'text'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Texto ou Qualquer Assunto</span>
                  </button>
                </div>

                {/* Ready-to-use Sample Buttons (Only shown for Video URL, never auto-fills text) */}
                {inputMode === 'video_url' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    <span className="text-slate-500 mr-1 text-[11px] font-medium hidden sm:inline">Exemplos de URL:</span>
                    {SAMPLE_VIDEO_URLS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleLoadSampleVideo(sample)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 transition flex items-center gap-1 shrink-0"
                        title={sample.previewTitle}
                      >
                        <Play className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{sample.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* MODE 1: DEVICE GALLERY VIDEO UPLOAD (Native Picker)       */}
              {/* ======================================================== */}
              {inputMode === 'gallery' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-emerald-400" />
                        Selecione um Vídeo da Galeria do seu Dispositivo:
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        MP4, MOV, WebM, 3GP (até 45 MB)
                      </span>
                    </div>

                    {!uploadedVideo ? (
                      /* Click anywhere to natively trigger Gallery permission & picker */
                      <div className="relative group border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-8 text-center bg-slate-950/60 hover:bg-emerald-950/20 transition-all duration-200 flex flex-col items-center justify-center space-y-4 shadow-lg">
                        {/* Native File Input covering entire card */}
                        <input
                          id="device-gallery-video-input"
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/3gpp,video/x-m4v,video/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                          title="Clique para abrir sua galeria de vídeos"
                        />

                        <div className="w-16 h-16 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-600/25 transition-all flex items-center justify-center shadow-lg shadow-emerald-950/50 pointer-events-none">
                          {isReadingFile ? (
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                          ) : (
                            <Upload className="w-8 h-8 text-emerald-300" />
                          )}
                        </div>

                        <div className="pointer-events-none">
                          <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-emerald-200 transition">
                            Toque aqui para abrir sua Galeria de Vídeos
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                            O navegador solicitará permissão para acessar os vídeos e arquivos do seu celular ou computador.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 pointer-events-none">
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition">
                            <FileVideo className="w-4 h-4" />
                            <span>Abrir Galeria do Dispositivo</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Video Preview and Player */
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                              <Film className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-200 truncate">
                                {uploadedVideo.name}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB • {uploadedVideo.type}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Native Trocar Vídeo button */}
                            <label className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition">
                              <span>Trocar Vídeo</span>
                              <input
                                type="file"
                                accept="video/mp4,video/quicktime,video/webm,video/3gpp,video/x-m4v,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={handleRemoveUploadedVideo}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="Remover vídeo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Video Player */}
                        {uploadedVideo.previewUrl && (
                          <div className="rounded-xl overflow-hidden bg-black max-h-64 flex items-center justify-center border border-slate-800/80">
                            <video
                              src={uploadedVideo.previewUrl}
                              controls
                              className="max-h-64 w-full rounded-xl object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Optional notes */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdditionalNotes(!showAdditionalNotes)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition font-medium"
                    >
                      <span>{showAdditionalNotes ? '▲ Ocultar' : '▼ Adicionar'} notas ou contexto complementar (opcional)</span>
                    </button>

                    {showAdditionalNotes && (
                      <div className="mt-2 animate-in fade-in">
                        <textarea
                          rows={3}
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                          placeholder="Adicione tópicos específicos que você gostaria que a IA enfatizasse..."
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition resize-y outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* MODE 2: VIDEO URL (YouTube, TikTok, Instagram)           */}
              {/* ======================================================== */}
              {inputMode === 'video_url' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label
                      htmlFor="videoUrlInput"
                      className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between mb-2"
                    >
                      <span className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-400" />
                        Cole a URL do Vídeo (YouTube, TikTok, Instagram Reels, etc.):
                      </span>
                      {detectedPlatform && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            detectedPlatform === 'youtube'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : detectedPlatform === 'tiktok'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : detectedPlatform === 'instagram'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          Plataforma: {detectedPlatform}
                        </span>
                      )}
                    </label>

                    <div className="relative">
                      <input
                        id="videoUrlInput"
                        ref={videoInputRef}
                        type="url"
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder="https://www.youtube.com/watch?v=... ou https://www.tiktok.com/@... ou https://www.instagram.com/reel/..."
                        className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition outline-none font-mono"
                      />
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setVideoUrl('');
                            setVideoInfo(null);
                            setErrorMsg(null);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Preview Card if metadata is fetched */}
                  {isFetchingVideoMeta ? (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-slate-400 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Identificando vídeo e carregando informações...</span>
                    </div>
                  ) : videoInfo && videoInfo.title ? (
                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                        {videoInfo.thumbnail ? (
                          <img
                            src={videoInfo.thumbnail}
                            alt={videoInfo.title}
                            className="w-14 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                            <Video className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-200 truncate text-xs sm:text-sm">
                            {videoInfo.title}
                          </h4>
                          {videoInfo.author && (
                            <p className="text-slate-400 text-[11px] truncate">
                              Canal / Criador: {videoInfo.author}
                            </p>
                          )}
                        </div>
                      </div>

                      <a
                        href={videoInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 shrink-0 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden sm:inline">Abrir</span>
                      </a>
                    </div>
                  ) : null}

                  {/* Optional Extra Notes/Transcription toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdditionalNotes(!showAdditionalNotes)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition font-medium"
                    >
                      <span>{showAdditionalNotes ? '▲ Ocultar' : '▼ Adicionar'} notas ou transcrição complementar (opcional)</span>
                    </button>

                    {showAdditionalNotes && (
                      <div className="mt-2 animate-in fade-in">
                        <textarea
                          rows={4}
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                          placeholder="Cole aqui a transcrição do vídeo ou notas complementares se desejar mais precisão..."
                          className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 transition resize-y outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* MODE 3: TEXT & UNIVERSAL TOPIC EXPLANATION               */}
              {/* ======================================================== */}
              {inputMode === 'text' && (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="sourceContent"
                      className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Digite qualquer assunto (ex: Equação do 1º Grau) ou cole um texto:
                    </label>
                  </div>

                  {/* Interactive Subject Explorer (Matemática, Ciências, História, Física, Finanças, Ed. Física, Esportes, etc.) */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Explorador de Matérias e Conhecimento:
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Toque em uma matéria e escolha o tema
                      </span>
                    </div>

                    {/* Category tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {SUBJECT_CATEGORIES.map((cat, idx) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryIdx(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                            selectedCategoryIdx === idx
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Subtopics for selected category */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                      {SUBJECT_CATEGORIES[selectedCategoryIdx].topics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setSourceText(topic);
                            setErrorMsg(null);
                            textareaRef.current?.focus();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs transition border flex items-center gap-1 ${
                            sourceText === topic
                              ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 font-semibold'
                              : 'bg-slate-900/90 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border-slate-800 hover:border-indigo-500/40'
                          }`}
                        >
                          <span>{topic}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <textarea
                      id="sourceContent"
                      ref={textareaRef}
                      rows={9}
                      value={sourceText}
                      onChange={(e) => {
                        setSourceText(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="Digite qualquer assunto para a IA ensinar (ex: Equação do 1º Grau, Regra de Três, Física Quântica) ou cole aqui um artigo, livro ou anotações..."
                      className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-600 transition resize-y leading-relaxed outline-none"
                    />
                  </div>

                  {/* Textarea Toolbar (Counters & Actions) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{charCount.toLocaleString('pt-BR')} caracteres</span>
                      <span>•</span>
                      <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                      {wordCount > 30 && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">~{estReadMinutes} min de leitura</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePasteClipboard}
                        className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
                        title="Colar texto da área de transferência"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Colar</span>
                      </button>

                      {sourceText.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSourceText('');
                            setErrorMsg(null);
                            textareaRef.current?.focus();
                          }}
                          className="px-2.5 py-1 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition"
                          title="Limpar texto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Limpar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Box */}
              {errorMsg && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-200">Aviso:</p>
                      <p className="mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium shrink-0 flex items-center gap-1 transition"
                  >
                    <Key className="w-3 h-3" />
                    Configurar Chave
                  </button>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Atalho: Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">Enter</kbd> para processar
                </span>

                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={
                    isLoading ||
                    (inputMode === 'gallery' && !uploadedVideo) ||
                    (inputMode === 'video_url' && videoUrl.trim().length === 0) ||
                    (inputMode === 'text' && sourceText.trim().length === 0)
                  }
                  className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                    isLoading ||
                    (inputMode === 'gallery' && !uploadedVideo) ||
                    (inputMode === 'video_url' && videoUrl.trim().length === 0) ||
                    (inputMode === 'text' && sourceText.trim().length === 0)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                      <span>Processando com Orvyx-One.AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>
                        {inputMode === 'gallery'
                          ? 'Resumir Vídeo da Galeria'
                          : inputMode === 'video_url'
                          ? 'Resumir Link de Vídeo'
                          : sourceText.trim().length > 0 && sourceText.trim().length < 120 && !sourceText.includes('\n')
                          ? 'Explicar & Sintetizar Tema'
                          : 'Resumir / Explicar Conteúdo'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-indigo-200" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Loading Indicator State */}
            {isLoading && (
              <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xl shadow-indigo-950/20 animate-in fade-in">
                <div className="relative w-14 h-14 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {inputMode === 'gallery'
                      ? 'Processando Vídeo da Galeria com IA Multimodal'
                      : inputMode === 'video_url'
                      ? 'Analisando e Sintetizando Vídeo'
                      : 'Processando Conteúdo com Orvyx-One.AI'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Estruturando o conteúdo nas 3 partes: Ideia Central, Pontos Chave e Conclusão Prática.
                  </p>
                </div>

                {/* Dynamic Step Indicator */}
                <div className="max-w-md mx-auto grid grid-cols-3 gap-2 pt-2">
                  <div
                    className={`p-2 rounded-lg text-[11px] font-medium transition ${
                      loadingStep >= 1
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    1. {inputMode === 'gallery' ? 'Lendo áudio & vídeo' : inputMode === 'video_url' ? 'Lendo dados do vídeo' : 'Analisando texto'}
                  </div>
                  <div
                    className={`p-2 rounded-lg text-[11px] font-medium transition ${
                      loadingStep >= 2
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    2. Extraindo conceitos
                  </div>
                  <div
                    className={`p-2 rounded-lg text-[11px] font-medium transition ${
                      loadingStep >= 3
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    3. Conclusão prática
                  </div>
                </div>
              </div>
            )}

            {/* Results Area */}
            {currentSummary && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Resumo Orvyx-One.AI
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    {currentTimestamp
                      ? `Gerado em ${new Date(currentTimestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Gerado agora'} • Modelo {config.model}
                  </span>
                </div>

                <SummaryResultView
                  summary={currentSummary}
                  modelUsed={config.model}
                  sourceWordCount={lastSummarizedWordCount}
                  userApiKey={config.apiKey}
                  feedback={currentFeedback}
                  onFeedbackChange={handleFeedbackChange}
                  timestamp={currentTimestamp}
                  videoInfo={currentVideoInfo}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INLINE HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* History Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Clock className="w-6 h-6 text-indigo-400" />
                  Histórico de Resumos Salvos
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Revise todos os resumos de vídeos da galeria, links e textos, com data/hora e avaliações.
                </p>
              </div>

              {history.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente limpar todo o histórico do Orvyx-One.AI?')) {
                        handleClearAllHistory();
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar Histórico
                  </button>
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
                      const a = document.createElement('a');
                      a.href = dataStr;
                      a.download = `orvyx-one-historico-${Date.now()}.json`;
                      a.click();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar JSON
                  </button>
                </div>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar nos resumos..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Feedback filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    historyFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos ({history.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('positive')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    historyFilter === 'positive'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  Úteis
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('negative')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    historyFilter === 'negative'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  Pode melhorar
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('rated')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    historyFilter === 'rated'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  Com Estrelas
                </button>
              </div>
            </div>

            {/* List of items */}
            {history.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-300">Nenhum resumo salvo ainda</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Utilize o Resumidor para selecionar um vídeo da galeria, link ou texto. Ele aparecerá aqui automaticamente.
                </p>
                <button
                  onClick={() => setActiveTab('summarize')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Ir para o Resumidor
                </button>
              </div>
            ) : inlineFilteredHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Nenhum resumo encontrado com os filtros aplicados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inlineFilteredHistory.map((item) => {
                  const fb = item.feedback;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectRecord(item)}
                      className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Top row: Title and delete */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition">
                            {item.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecord(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Excluir resumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Timestamp & info */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            {new Date(item.createdAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {item.uploadedVideo && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">Galeria</span>
                            </>
                          )}
                          {item.videoUrl && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-400 font-medium">Vídeo Online</span>
                            </>
                          )}
                        </div>

                        {/* Main idea preview */}
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                            💡 Ideia Central:
                          </span>
                          <p className="text-xs text-slate-300 line-clamp-2 italic">
                            "{item.summary.mainIdea}"
                          </p>
                        </div>
                      </div>

                      {/* Footer with feedback and action */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                        {/* Feedback Badge */}
                        <div className="flex items-center gap-1.5">
                          {fb?.type === 'positive' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              <ThumbsUp className="w-3 h-3" />
                              Útil
                            </span>
                          )}
                          {fb?.type === 'negative' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                              <ThumbsDown className="w-3 h-3" />
                              Pode melhorar
                            </span>
                          )}
                          {fb?.rating && fb.rating > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {fb.rating}/5
                            </span>
                          )}
                          {!fb && (
                            <span className="text-[11px] text-slate-500">Sem avaliação</span>
                          )}
                        </div>

                        <span className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition font-medium">
                          Abrir <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong className="text-slate-400">Orvyx-One.AI</strong> • Desenvolvido com Google AI Studio & Gemini API
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Configurar Chave
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-slate-300 transition"
            >
              Histórico ({history.length})
            </button>
            <span>•</span>
            <button
              onClick={handleDownloadStandalone}
              className="hover:text-slate-300 transition"
            >
              Exportar HTML Único
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        hasEnvKey={hasEnvKey}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={history}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
