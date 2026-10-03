/**
 * Generates a self-contained, single-file HTML/CSS/JS application
 * that the user can download and double-click to run in any browser!
 */
export function generateStandaloneSingleHtml(apiKeyPrefill: string = ''): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo Inteligente - Gemini AI (Arquivo Único)</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 24px 16px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 28px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #fff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 14px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #e5e7eb;
    }
    input[type="password"], input[type="text"], textarea, select {
      width: 100%;
      background: #0b0f19;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 10px 12px;
      color: #fff;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus, select:focus {
      border-color: var(--primary);
    }
    textarea {
      min-height: 160px;
      resize: vertical;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      width: 100%;
      padding: 12px;
      font-size: 15px;
    }
    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      background: #1f2937;
      color: #d1d5db;
    }
    .btn-sm:hover {
      background: #374151;
      color: #fff;
    }
    .loading-box {
      display: none;
      text-align: center;
      padding: 30px 20px;
      background: rgba(17, 24, 39, 0.7);
      border-radius: 12px;
      border: 1px dashed #374151;
      margin-bottom: 20px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .result-section {
      display: none;
    }
    .result-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .result-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .title-blue { color: #818cf8; }
    .title-emerald { color: #34d399; }
    .title-amber { color: #fbbf24; }
    .key-points-list {
      padding-left: 20px;
    }
    .key-points-list li {
      margin-bottom: 8px;
      color: #e2e8f0;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: none;
    }
    .feedback-box {
      margin-top: 16px;
      padding: 14px;
      background: #0b0f19;
      border: 1px solid #1f2937;
      border-radius: 10px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .rating-stars {
      display: flex;
      gap: 4px;
      cursor: pointer;
    }
    .star {
      font-size: 18px;
      color: #4b5563;
      transition: color 0.15s;
    }
    .star.active {
      color: #f59e0b;
    }
    .history-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .history-card:hover {
      border-color: #6366f1;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">Google AI Studio • Gemini API</span>
      <h1>Resumo Inteligente em 3 Partes</h1>
      <p class="subtitle">Sintetize textos extensos e vídeos com histórico salvo e mecanismo de avaliação.</p>
    </header>

    <!-- Configuração da API -->
    <div class="card">
      <div class="form-group" style="margin-bottom: 0;">
        <label for="apiKey">Chave de API do Gemini (API Key):</label>
        <input type="password" id="apiKey" placeholder="Insira sua GEMINI_API_KEY..." value="${apiKeyPrefill}" />
      </div>
    </div>

    <!-- Entrada de Texto / Transcrição -->
    <div class="card">
      <div class="form-group">
        <label for="sourceText">Texto Longo ou Transcrição de Vídeo:</label>
        <textarea id="sourceText" placeholder="Cole aqui o artigo, notas de reunião ou transcrição do YouTube..."></textarea>
        <div class="toolbar">
          <span id="charCount">0 caracteres • 0 palavras</span>
          <div>
            <button type="button" class="btn btn-sm" id="btnSample">Colar Exemplo</button>
            <button type="button" class="btn btn-sm" id="btnClear">Limpar</button>
          </div>
        </div>
      </div>

      <div id="errorAlert" class="alert-error"></div>

      <button type="button" class="btn btn-primary" id="btnSummarize">
        ⚡ Resumir com Gemini
      </button>
    </div>

    <!-- Indicador de Carregamento -->
    <div id="loadingBox" class="loading-box">
      <div class="spinner"></div>
      <p style="font-weight: 600; color: #e0e7ff;">A inteligência artificial está analisando o conteúdo...</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Dividindo em Ideia Central, Pontos Chave e Conclusão Prática.</p>
    </div>

    <!-- Resultado Estruturado em 3 Partes -->
    <div id="resultSection" class="result-section">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2 style="font-size: 18px; font-weight: 700;">Resumo Estruturado</h2>
            <small id="resTimestamp" style="color: #9ca3af; font-size: 11px;"></small>
          </div>
          <button type="button" class="btn btn-sm" id="btnCopyAll">Copiar Tudo</button>
        </div>

        <!-- 1. Ideia Central -->
        <div class="result-card">
          <div class="result-title title-blue">
            <span>💡 1. Ideia Central</span>
          </div>
          <p id="resMainIdea" style="font-size: 15px; font-weight: 500; color: #f1f5f9;"></p>
        </div>

        <!-- 2. Pontos Chave -->
        <div class="result-card">
          <div class="result-title title-emerald">
            <span>📌 2. Pontos Chave</span>
          </div>
          <ul id="resKeyPoints" class="key-points-list"></ul>
        </div>

        <!-- 3. Conclusão Prática -->
        <div class="result-card">
          <div class="result-title title-amber">
            <span>🎯 3. Conclusão Prática</span>
          </div>
          <p id="resConclusion" style="color: #f1f5f9; font-size: 14px;"></p>
        </div>

        <!-- Feedback Mechanism -->
        <div class="feedback-box">
          <div>
            <span style="font-size: 13px; font-weight: 600;">Como você avalia este resumo?</span>
            <div id="feedbackNotice" style="font-size: 11px; color: #10b981; display: none;">Avaliação salva!</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button type="button" class="btn btn-sm" id="btnThumbUp">👍 Útil</button>
            <button type="button" class="btn btn-sm" id="btnThumbDown">👎 Pode melhorar</button>
            <div class="rating-stars" id="starContainer">
              <span class="star" data-val="1">★</span>
              <span class="star" data-val="2">★</span>
              <span class="star" data-val="3">★</span>
              <span class="star" data-val="4">★</span>
              <span class="star" data-val="5">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Seção de Histórico de Resumos -->
    <div class="card" id="historySection">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h2 style="font-size: 16px; font-weight: 700;">🕒 Histórico de Resumos Salvos</h2>
        <button type="button" class="btn btn-sm" id="btnClearHistory" style="color: #f87171;">Limpar Histórico</button>
      </div>
      <div id="historyList">
        <p style="color: #6b7280; font-size: 13px;">Nenhum resumo salvo ainda.</p>
      </div>
    </div>
  </div>

  <script>
    const SYSTEM_INSTRUCTION = "Você é um especialista em síntese e compreensão textual e de transcrições de vídeos. Sua missão é ler atentamente o conteúdo fornecido e produzir um resumo de alto impacto SEMPRE dividido em três partes: 1. Ideia Central (em exatamente uma frase curta e impactante); 2. Pontos Chave (de 3 a 5 tópicos principais com marcadores destacando conceitos cruciais); 3. Conclusão Prática (um takeaway objetivo e aplicável). Responda estritamente em formato JSON com as chaves: 'mainIdea', 'keyPoints' (array de strings) e 'practicalConclusion'.";

    const SAMPLE = "A capacidade de manter o foco ininterrupto é o maior ativo na era digital. Cada vez que você alterna de aba ou checa uma notificação, o cérebro sofre o custo de troca de contexto, levando de 15 a 23 minutos para retornar ao estado de fluxo. A solução comprovada envolve blocos rígidos de 90 minutos pela manhã sem telefone, eliminação de decisões triviais definindo a prioridade na noite anterior, e descanso ativo para consolidar o aprendizado.";

    const sourceText = document.getElementById('sourceText');
    const apiKey = document.getElementById('apiKey');
    const charCount = document.getElementById('charCount');
    const btnSummarize = document.getElementById('btnSummarize');
    const btnSample = document.getElementById('btnSample');
    const btnClear = document.getElementById('btnClear');
    const btnCopyAll = document.getElementById('btnCopyAll');
    const loadingBox = document.getElementById('loadingBox');
    const resultSection = document.getElementById('resultSection');
    const errorAlert = document.getElementById('errorAlert');

    const resMainIdea = document.getElementById('resMainIdea');
    const resKeyPoints = document.getElementById('resKeyPoints');
    const resConclusion = document.getElementById('resConclusion');
    const resTimestamp = document.getElementById('resTimestamp');
    const historyList = document.getElementById('historyList');
    const btnClearHistory = document.getElementById('btnClearHistory');
    const btnThumbUp = document.getElementById('btnThumbUp');
    const btnThumbDown = document.getElementById('btnThumbDown');
    const starContainer = document.getElementById('starContainer');
    const feedbackNotice = document.getElementById('feedbackNotice');

    let currentSummaryId = null;

    function getHistory() {
      try {
        return JSON.parse(localStorage.getItem('gemini_standalone_history') || '[]');
      } catch {
        return [];
      }
    }

    function saveHistory(arr) {
      localStorage.setItem('gemini_standalone_history', JSON.stringify(arr));
      renderHistory();
    }

    function renderHistory() {
      const hist = getHistory();
      if (!hist.length) {
        historyList.innerHTML = '<p style="color: #6b7280; font-size: 13px;">Nenhum resumo salvo ainda.</p>';
        return;
      }

      historyList.innerHTML = '';
      hist.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-card';
        const dateStr = new Date(item.timestamp).toLocaleString('pt-BR');
        const fbBadge = item.feedback?.type === 'positive' ? '👍 Útil' : item.feedback?.type === 'negative' ? '👎 Pode melhorar' : '';
        const starsBadge = item.feedback?.rating ? '⭐ ' + item.feedback.rating + '/5' : '';

        div.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:13px; color:#e0e7ff;">\${item.title || 'Resumo'}</strong>
            <span style="font-size:11px; color:#9ca3af;">\${dateStr}</span>
          </div>
          <p style="font-size:12px; color:#94a3b8; margin-bottom:6px; font-style:italic;">"\${item.data.mainIdea}"</p>
          <div style="font-size:11px; color:#818cf8;">\${fbBadge} \${starsBadge}</div>
        \`;
        div.addEventListener('click', () => {
          loadSummary(item);
        });
        historyList.appendChild(div);
      });
    }

    function loadSummary(item) {
      currentSummaryId = item.id;
      sourceText.value = item.originalText;
      updateCounts();
      renderResult(item.data, item.timestamp, item.feedback);
    }

    function updateCounts() {
      const val = sourceText.value;
      const chars = val.length;
      const words = val.trim() ? val.trim().split(/\\s+/).length : 0;
      charCount.textContent = chars + ' caracteres • ' + words + ' palavras';
    }
    sourceText.addEventListener('input', updateCounts);

    btnClear.addEventListener('click', () => {
      sourceText.value = '';
      updateCounts();
      resultSection.style.display = 'none';
      errorAlert.style.display = 'none';
    });

    btnSample.addEventListener('click', () => {
      sourceText.value = SAMPLE;
      updateCounts();
      errorAlert.style.display = 'none';
    });

    btnClearHistory.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
        saveHistory([]);
      }
    });

    btnSummarize.addEventListener('click', async () => {
      const key = apiKey.value.trim();
      const text = sourceText.value.trim();

      errorAlert.style.display = 'none';

      if (!key) {
        showError('Por favor, informe sua Chave de API do Gemini no topo da página.');
        apiKey.focus();
        return;
      }
      if (!text) {
        showError('Por favor, cole um texto ou transcrição para resumir.');
        sourceText.focus();
        return;
      }

      loadingBox.style.display = 'block';
      resultSection.style.display = 'none';
      btnSummarize.disabled = true;

      try {
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(key);
        const promptText = SYSTEM_INSTRUCTION + "\\n\\nCONTEÚDO PARA RESUMIR:\\n" + text;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Falha na requisição (' + response.status + ')');
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) throw new Error('Nenhuma resposta recebida do modelo.');

        let parsed;
        try {
          parsed = JSON.parse(candidateText);
        } catch {
          const cleaned = candidateText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
          parsed = JSON.parse(cleaned);
        }

        const id = 'hist_' + Date.now();
        currentSummaryId = id;
        const now = Date.now();

        const record = {
          id: id,
          title: text.slice(0, 50) + '...',
          originalText: text,
          data: parsed,
          timestamp: now,
          feedback: null
        };

        const hist = getHistory();
        saveHistory([record, ...hist]);

        renderResult(parsed, now, null);
      } catch (err) {
        showError(err.message || 'Erro ao processar resumo.');
      } finally {
        loadingBox.style.display = 'none';
        btnSummarize.disabled = false;
      }
    });

    function showError(msg) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    }

    function renderResult(data, timestamp, feedback) {
      resMainIdea.textContent = data.mainIdea || '';
      resKeyPoints.innerHTML = '';
      if (Array.isArray(data.keyPoints)) {
        data.keyPoints.forEach(point => {
          const li = document.createElement('li');
          li.textContent = point;
          resKeyPoints.appendChild(li);
        });
      }
      resConclusion.textContent = data.practicalConclusion || '';
      resTimestamp.textContent = 'Gerado em: ' + new Date(timestamp || Date.now()).toLocaleString('pt-BR');

      updateFeedbackUI(feedback);

      resultSection.style.display = 'block';
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function updateFeedbackUI(feedback) {
      btnThumbUp.style.background = feedback?.type === 'positive' ? '#065f46' : '#1f2937';
      btnThumbDown.style.background = feedback?.type === 'negative' ? '#881337' : '#1f2937';

      const stars = starContainer.querySelectorAll('.star');
      const rating = feedback?.rating || 0;
      stars.forEach(s => {
        const val = parseInt(s.getAttribute('data-val'));
        if (val <= rating) s.classList.add('active');
        else s.classList.remove('active');
      });
    }

    function setFeedback(type, rating) {
      if (!currentSummaryId) return;
      const hist = getHistory();
      const updated = hist.map(item => {
        if (item.id === currentSummaryId) {
          const fb = item.feedback || {};
          if (type !== undefined) fb.type = type;
          if (rating !== undefined) fb.rating = rating;
          return { ...item, feedback: fb };
        }
        return item;
      });
      saveHistory(updated);

      const current = updated.find(i => i.id === currentSummaryId);
      updateFeedbackUI(current?.feedback);

      feedbackNotice.style.display = 'block';
      setTimeout(() => feedbackNotice.style.display = 'none', 2000);
    }

    btnThumbUp.addEventListener('click', () => setFeedback('positive', undefined));
    btnThumbDown.addEventListener('click', () => setFeedback('negative', undefined));

    starContainer.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-val'));
        setFeedback(undefined, val);
      });
    });

    btnCopyAll.addEventListener('click', () => {
      const main = resMainIdea.textContent;
      const points = Array.from(resKeyPoints.querySelectorAll('li')).map(li => '• ' + li.textContent).join('\\n');
      const conclusion = resConclusion.textContent;
      const full = '💡 IDEIA CENTRAL:\\n' + main + '\\n\\n📌 PONTOS CHAVE:\\n' + points + '\\n\\n🎯 CONCLUSÃO PRÁTICA:\\n' + conclusion;

      navigator.clipboard.writeText(full).then(() => {
        btnCopyAll.textContent = 'Copiado!';
        setTimeout(() => btnCopyAll.textContent = 'Copiar Tudo', 2000);
      });
    });

    // Inicializar histórico
    renderHistory();
  </script>
</body>
</html>`;
}
