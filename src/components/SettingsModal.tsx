import React, { useState } from 'react';
import { X, Key, Cpu, Sparkles, RotateCcw, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  hasEnvKey: boolean;
}

export const DEFAULT_SYSTEM_INSTRUCTION = `Você é o Orvyx-One.AI, uma inteligência artificial enciclopédica, brilhante e multidisciplinar, especialista em explicar, ensinar e sintetizar ABSOLUTAMENTE QUALQUER TEMA:
- Matemática (Álgebra, Equações, Geometria, Estatística, Cálculos)
- Ciências & Biologia (Corpo Humano, Genética, Fotossíntese, Ecologia)
- Física & Química (Leis de Newton, Termodinâmica, Eletricidade, Reações Químicas)
- História & Geografia (História do Brasil e Mundial, Guerras, Civilizações, Geopolítica)
- Educação Financeira (Juros Compostos, Orçamento 50/30/20, Investimentos, Renda Fixa/Ações)
- Educação Física & Saúde (Biomecânica, Hipertrofia, Treino HIIT/Cardio, Nutrição, Sono)
- Esportes (Futebol, Basquete, Vôlei, Táticas, Regras Oficiais, Treinamento)
- Filosofia, Literatura, Tecnologia, Idiomas e qualquer outro assunto humano.

Sua missão é sempre entregar uma resposta estruturada com excelência didática, clareza e profundidade estritamente em três seções:
1. Ideia Central: O conceito essencial em uma frase direta, elegante e memorável.
2. Pontos Chave: De 3 a 5 tópicos principais com explicações detalhadas, passos práticos, regras de ouro, fórmulas fundamentais ou exemplos resolvidos.
3. Conclusão Prática: Um 'takeaway' objetivo com a aplicação prática na vida real, dica definitiva ou método mental para fixar o aprendizado.

Mantenha o mesmo idioma do conteúdo (ou português por padrão). Seja claro, elegante e livre de redundâncias.`;

export function SettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  hasEnvKey,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(config.model);
  const [tone, setTone] = useState(config.tone);
  const [systemInstruction, setSystemInstruction] = useState(config.systemInstruction);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      apiKey: apiKey.trim(),
      model,
      tone,
      systemInstruction: systemInstruction.trim() || DEFAULT_SYSTEM_INSTRUCTION,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetInstruction = () => {
    setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Configurações da IA Gemini</h2>
              <p className="text-xs text-slate-400">Chave de API, modelo e regras de instrução do sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Status da Conexão / Chave de API */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                Chave de API do Gemini (API Key)
              </label>
              {hasEnvKey && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Chave do Ambiente Ativa
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasEnvKey ? 'Usando chave do ambiente (ou insira uma personalizada)...' : 'AIzaSy...'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-11 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-mono text-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {hasEnvKey 
                ? 'Sua chave configurada no Google AI Studio (Secrets) já está ativa. Você pode opcionalmente substituí-la aqui.'
                : 'Insira sua chave obtida gratuitamente no Google AI Studio (aistudio.google.com).'}
            </p>
          </div>

          {/* Seleção do Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Modelo Gemini
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado • Ultrarrápido)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Raciocínio Avançado)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Tom do Resumo
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                <option value="balanced">Equilibrado (Claro e Direto)</option>
                <option value="executive">Executivo (Focado em Decisões)</option>
                <option value="didactic">Didático (Explicativo e Pedagógico)</option>
                <option value="concise">Ultra Conciso (Máxima brevidade)</option>
              </select>
            </div>
          </div>

          {/* System Instruction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                System Instruction (Diretrizes para o Modelo)
              </label>
              <button
                type="button"
                onClick={handleResetInstruction}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                title="Restaurar instrução padrão de 3 seções"
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar Padrão
              </button>
            </div>
            <textarea
              rows={6}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-y"
              placeholder="Instruções enviadas ao modelo..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Instrui a IA a entregar a síntese dividida estritamente em: 1) Ideia Central, 2) Pontos Chave (3 a 5), e 3) Conclusão Prática.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-medium text-sm transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Salvo com Sucesso!
              </>
            ) : (
              'Salvar Configurações'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
