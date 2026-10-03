import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract video metadata from various platforms
async function fetchVideoMetadata(videoUrl: string) {
  const url = videoUrl.trim();
  let platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'twitter' | 'web' = 'web';
  let title = '';
  let author = '';
  let thumbnail = '';

  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        title = data.title || '';
        author = data.author_name || '';
        thumbnail = data.thumbnail_url || '';
      }
    } else if (url.includes('tiktok.com')) {
      platform = 'tiktok';
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        title = data.title || '';
        author = data.author_name || '';
        thumbnail = data.thumbnail_url || '';
      }
    } else if (url.includes('instagram.com')) {
      platform = 'instagram';
      const match = url.match(/(?:reel|p)\/([^/?#&]+)/);
      title = match ? `Reel / Vídeo do Instagram (${match[1]})` : 'Vídeo do Instagram';
      author = 'Instagram Creator';
    } else if (url.includes('vimeo.com')) {
      platform = 'vimeo';
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        title = data.title || '';
        author = data.author_name || '';
        thumbnail = data.thumbnail_url || '';
      }
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
      platform = 'twitter';
      title = 'Vídeo do X / Twitter';
    }
  } catch (err) {
    console.error('Error fetching video metadata:', err);
  }

  return {
    platform,
    title,
    author,
    thumbnail,
    url,
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Support up to 60mb for direct video file uploads from gallery
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ limit: '60mb', extended: true }));

  // Endpoint to fetch video preview info (YouTube, TikTok, Instagram, etc.)
  app.post('/api/video-info', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL do vídeo é obrigatória.' });
      }

      const info = await fetchVideoMetadata(url);
      return res.json({ success: true, data: info });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Falha ao buscar dados do vídeo.' });
    }
  });

  // API endpoint for processing any topic, question, text, or video
  app.post('/api/summarize', async (req, res) => {
    try {
      const {
        text,
        videoUrl,
        videoInfo: clientVideoInfo,
        videoFile,
        apiKey: customKey,
        systemInstruction,
        model,
        tone,
      } = req.body;

      const apiKey = customKey?.trim() || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error:
            'Chave de API do Gemini não detectada. Por favor, configure a chave na área de Configurações ou adicione a variável GEMINI_API_KEY.',
        });
      }

      const hasFile = videoFile && videoFile.base64;
      const hasText = text && typeof text === 'string' && text.trim().length > 0;
      const hasUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.trim().length > 0;

      if (!hasFile && !hasText && !hasUrl) {
        return res.status(400).json({
          error: 'Por favor, digite um assunto/pergunta (ex: Equação do 1º Grau), cole um texto ou envie um vídeo.',
        });
      }

      let fetchedVideoInfo = clientVideoInfo;
      if (hasUrl && (!fetchedVideoInfo || !fetchedVideoInfo.title)) {
        fetchedVideoInfo = await fetchVideoMetadata(videoUrl);
      }

      const selectedModel = model?.trim() || 'gemini-3.1-flash-lite';

      const defaultSystemInstruction = `Você é o Orvyx-One.AI, uma inteligência artificial enciclopédica, brilhante e multidisciplinar, especialista em explicar, ensinar e sintetizar ABSOLUTAMENTE QUALQUER TEMA, com maestria em:
- Matemática (Álgebra, Equações do 1º e 2º grau, Geometria, Estatística, Cálculos)
- Ciências & Biologia (Corpo humano, Genética, Fotossíntese, Ecologia, Zoologia, Medicina)
- Física & Química (Leis de Newton, Termodinâmica, Eletromagnetismo, Reações Químicas, Átomos)
- História & Geografia (Brasil e História Mundial, Civilizações, Guerras, Geopolítica)
- Educação Financeira (Juros Compostos, Orçamento 50/30/20, Investimentos, Renda Fixa/Variável, Inflação)
- Educação Física & Saúde (Biomecânica do Treino, Hipertrofia, Cardio, Nutrição, Sono, Alongamento)
- Esportes (Futebol, Basquete, Vôlei, Táticas, Regras Oficiais, Desempenho Atlético)
- Filosofia, Literatura, Tecnologia, Idiomas e qualquer outro assunto humano.

Sua missão é sempre entregar uma resposta estruturada com excelência didática, clareza e profundidade estritamente em três seções:
1. Ideia Central: O conceito essencial em uma frase direta, elegante e memorável que capture a essência do tema.
2. Pontos Chave: De 3 a 5 tópicos principais com explicações detalhadas, passos práticos, regras de ouro, fórmulas fundamentais ou exemplos resolvidos.
3. Conclusão Prática: Um 'takeaway' objetivo com a aplicação prática na vida real, dica definitiva ou método mental para fixar o aprendizado.

Seja acessível tanto para iniciantes quanto para quem busca rigor técnico. Mantenha o idioma em português (ou no idioma da solicitação).`;

      let finalSystemInstruction = systemInstruction?.trim() || defaultSystemInstruction;
      if (tone) {
        finalSystemInstruction += `\nTom da resposta: ${tone}.`;
      }

      // Build contents parts (multimodal if video file is provided)
      const parts: any[] = [];

      if (hasFile) {
        // Direct video from gallery
        const cleanBase64 = videoFile.base64.replace(/^data:[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: videoFile.type || 'video/mp4',
            data: cleanBase64,
          },
        });

        let promptText = `Por favor, analise e sintetize este vídeo da galeria (${videoFile.name || 'Vídeo'}).
Examine a fala, áudio, texto visual e ações para extrair os ensinamentos principais e estruturar nas 3 partes: Ideia Central, Pontos Chave e Conclusão Prática.`;
        if (hasText) {
          promptText += `\nNotas adicionais do usuário:\n---\n${text.trim()}\n---`;
        }
        parts.push({ text: promptText });
      } else if (hasUrl) {
        let promptContent = `CONTEÚDO PARA RESUMO: Vídeo Online\nPlataforma: ${fetchedVideoInfo?.platform || 'Vídeo'}\nURL: ${videoUrl}\n`;
        if (fetchedVideoInfo?.title) {
          promptContent += `Título do Vídeo: ${fetchedVideoInfo.title}\n`;
        }
        if (fetchedVideoInfo?.author) {
          promptContent += `Canal / Criador: ${fetchedVideoInfo.author}\n`;
        }
        if (hasText) {
          promptContent += `\nNotas / Transcrição fornecida do vídeo:\n---\n${text.trim()}\n---\n`;
        } else {
          promptContent += `\nCom base no título, tema central, contexto cultural e tópicos ensinados nesta publicação/vídeo desta plataforma (${fetchedVideoInfo?.platform || 'web'}), analise e gere o resumo estruturado completo em três seções.`;
        }
        parts.push({ text: promptContent });
      } else {
        const trimmed = text.trim();
        const isShortQueryOrTopic = trimmed.length < 150 && !trimmed.includes('\n');

        let promptMessage = '';
        if (isShortQueryOrTopic) {
          promptMessage = `O usuário solicitou uma explicação e síntese sobre o seguinte tema/assunto:
"${trimmed}"

Você domina com maestria absolutamente todos os assuntos: Matemática (equações do 1º e 2º grau, álgebra, geometria), Ciências & Biologia, Física, Química, História, Educação Financeira (investimentos, orçamento, juros compostos), Educação Física & Saúde (treinos, hipertrofia, nutrição), Esportes (futebol, basquete, táticas, regras) e Tecnologia.

Por favor, ensine e sintetize este tema de forma didática e estruturada estritamente nas 3 seções:
1. Ideia Central (definição conceitual essencial em 1 frase curta, direta e memorável)
2. Pontos Chave (de 3 a 5 pontos com regras fundamentais, fórmulas, passos práticos ou exemplos resolvidos)
3. Conclusão Prática (aplicação no cotidiano, dica definitiva ou método mental para fixar o aprendizado)`;
        } else {
          promptMessage = `Por favor, analise, explique e resuma com máxima clareza o seguinte conteúdo:\n\n---\n${trimmed}\n---`;
        }

        parts.push({ text: promptMessage });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Call Gemini with model failover and retry logic for transient 503/429 errors
      let response: any = null;
      let lastError: any = null;
      let actualModelUsed = selectedModel || 'gemini-3.8-flash';

      const candidateModels = [actualModelUsed];
      if (actualModelUsed !== 'gemini-3.1-flash-lite') {
        candidateModels.push('gemini-3.1-flash-lite');
      }

      modelCascade: for (const currentModel of candidateModels) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: currentModel,
              contents: [
                {
                  role: 'user',
                  parts,
                },
              ],
              config: {
                systemInstruction: finalSystemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    mainIdea: {
                      type: Type.STRING,
                      description: 'A ideia central ou conceito fundamental em exatamente uma frase curta.',
                    },
                    keyPoints: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                      },
                      description: 'De 3 a 5 tópicos principais com explicações detalhadas, passos, fórmulas ou exemplos.',
                    },
                    practicalConclusion: {
                      type: Type.STRING,
                      description: 'Um takeaway objetivo, aplicação prática ou conclusão definitiva.',
                    },
                    keyTerms: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                      },
                      description: 'Palavras-chave mais relevantes (3 a 5 tags).',
                    },
                  },
                  required: ['mainIdea', 'keyPoints', 'practicalConclusion'],
                },
              },
            });
            actualModelUsed = currentModel;
            break modelCascade; // Succeeded!
          } catch (err: any) {
            lastError = err;
            console.warn(`Gemini API call on model ${currentModel} attempt ${attempt} failed:`, err.message);
            // If quota exhausted (429), break immediately to fallback model without waiting
            if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
              break;
            }
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
        }
      }

      if (!response) {
        throw lastError || new Error('Falha ao obter resposta do modelo Gemini após tentativas.');
      }

      const rawText = response.text || '';
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      return res.json({
        success: true,
        data: parsedData,
        model: actualModelUsed,
        videoInfo: fetchedVideoInfo,
        uploadedVideo: hasFile
          ? {
              name: videoFile.name,
              size: videoFile.size || 0,
              type: videoFile.type,
            }
          : undefined,
      });
    } catch (error: any) {
      console.error('Error generating summary:', error);
      return res.status(500).json({
        error: error.message || 'Ocorreu um erro ao processar o conteúdo com a API do Gemini.',
      });
    }
  });

  // Status and configuration check
  app.get('/api/config-status', (_req, res) => {
    res.json({
      hasEnvApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      defaultModel: 'gemini-3.1-flash-lite',
      appName: 'Orvyx-One.AI',
    });
  });

  // Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
