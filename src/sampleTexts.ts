export interface SampleText {
  id: string;
  title: string;
  category: 'Vídeo' | 'Artigo' | 'Reunião';
  icon: string;
  description: string;
  content: string;
}

export interface SampleVideoUrl {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  title: string;
  url: string;
  previewTitle: string;
  author: string;
}

export const SAMPLE_VIDEO_URLS: SampleVideoUrl[] = [
  {
    id: 'yt-feynman',
    platform: 'youtube',
    title: 'YouTube: Técnica Feynman',
    url: 'https://www.youtube.com/watch?v=tkm0TNFzIeg',
    previewTitle: 'A Técnica Feynman: Como Aprender Qualquer Coisa com Clareza',
    author: 'Canal de Desenvolvimento',
  },
  {
    id: 'tiktok-habits',
    platform: 'tiktok',
    title: 'TikTok: Hábitos de Alta Performance',
    url: 'https://www.tiktok.com/@foco.produtivo/video/7234567890123456789',
    previewTitle: '3 Gatilhos Mentais para Eliminar a Procrastinação no Dia a Dia',
    author: '@foco.produtivo',
  },
  {
    id: 'insta-reels',
    platform: 'instagram',
    title: 'Instagram Reels: Inteligência Financeira',
    url: 'https://www.instagram.com/reel/C7mNoPQR123/',
    previewTitle: 'O Método 50-30-20 de Gestão Financeira Pessoal',
    author: '@financaspessoais.br',
  },
];

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'video-deep-work',
    title: 'Transcrição: Foco Profundo e Produtividade sem Distrações',
    category: 'Vídeo',
    icon: 'video',
    description: 'Transcrição de uma aula/vídeo do YouTube sobre atenção, redes sociais e foco.',
    content: `[00:00:05] Olá pessoal, sejam muito bem-vindos. Hoje quero falar sobre o maior ativo da nossa era: a capacidade de manter o foco ininterrupto.
[00:00:22] A maioria das pessoas acredita que não tem tempo, mas o que elas realmente não têm é atenção sustentada. Cada vez que você alterna de aba no navegador ou olha uma notificação no celular, seu cérebro paga o que a neurociência chama de "custo de troca de contexto" (context switching).
[00:00:54] Pesquisas mostram que levamos em média de 15 a 23 minutos para retornar ao estado de fluxo (flow state) após uma simples interrupção de 30 segundos.
[00:01:20] Então, qual é a solução prática? Primeiro: blocos de tempo rígidos (time blocking) de 90 minutos pela manhã, quando sua força de vontade está no pico, deixando o telefone fisicamente em outro cômodo.
[00:01:50] Segundo: elimine as decisões triviais no início do dia. Defina na noite anterior exatamente qual é a única tarefa indispensável que precisa ser finalizada.
[00:02:15] Terceiro: crie rituais de descompressão. Não adianta trabalhar sem parar se a sua mente não processa o descanso. O descanso ativo (caminhada, leitura analógica, sono regulado) é o que consolida o aprendizado.
[00:02:40] Em resumo, quem domina o foco na era do ruído não precisa trabalhar mais horas; precisa apenas proteger a sua atenção das distrações de baixo valor.`,
  },
  {
    id: 'article-ai-agents',
    title: 'Artigo: O Impacto dos Agentes de IA nos Negócios',
    category: 'Artigo',
    icon: 'file-text',
    description: 'Artigo opinativo sobre a transição de chatbots para sistemas autônomos.',
    content: `A transição da inteligência artificial generativa de simples assistentes de texto (chatbots) para ecossistemas de agentes autônomos marca um ponto de inflexão na economia digital. Enquanto os primeiros modelos eram reativos — aguardando comandos do usuário para fornecer respostas estáticas —, a nova geração de modelos multimodais é capaz de raciocinar sobre problemas em múltiplas etapas, acionar ferramentas externas e executar planos de ação complexos com mínima supervisão humana.

Empresas pioneiras estão substituindo fluxos de trabalho manuais e silos de software por redes de agentes especializados que colaboram entre si. Na área financeira, por exemplo, um agente monitora discrepâncias em faturas, outro cruza com os contratos legais e um terceiro redige o parecer de conformidade para aprovação humana final.

No entanto, essa velocidade de automação impõe desafios severos de governança. Sem verificabilidade transparente, sistemas autônomos podem amplificar alucinações ou tomar decisões operacionais equivocadas em milissegundos. Portanto, as organizações que mais prosperarão não serão aquelas que simplesmente substituem pessoas por algoritmos, mas as que criam arquiteturas sólidas de "human-in-the-loop", onde o discernimento ético, estratégico e criativo humano atua como o maestro definitivo da orquestra tecnológica.`,
  },
  {
    id: 'meeting-startup',
    title: 'Transcrição: Reunião Estratégica de Lançamento de Produto',
    category: 'Reunião',
    icon: 'users',
    description: 'Notas e transcrição de alinhamento entre produto, engenharia e marketing.',
    content: `Transcrição da Reunião de Alinhamento - Q4 Lançamento Beta

Participantes: Carlos (Head de Produto), Mariana (Tech Lead), Lucas (Marketing), Beatriz (Operações).

Carlos: Vamos direto ao ponto. Nosso beta fechado está com 3 semanas de atraso devido aos gargalos de integração com a API de pagamentos. Precisamos tomar uma decisão hoje: adiamos a data pública ou cortamos funcionalidades para manter o cronograma?

Mariana: Do ponto de vista técnico, se mantivermos a exigência de suportar 5 métodos de pagamento diferentes no dia 1, nós com certeza não teremos tempo hábil para testes de segurança e carga. Minha recomendação técnica é lançar apenas com PIX e Cartão de Crédito básico, o que nos permite estabilizar o backend e cumprir o prazo original de 15 de novembro.

Lucas: Concordo totalmente com a Mariana. Nossos dados de pesquisa indicam que 92% do nosso público-alvo utiliza PIX ou Cartão. Se tentarmos cobrir boleto parcelado e carteiras digitais agora, perderemos a janela da Black Friday.

Beatriz: Operações consegue dar suporte perfeitamente a esse escopo reduzido. Teremos menos incidentes de suporte se o fluxo for simples e robusto.

Carlos: Perfeito, decisão tomada por consenso. O escopo da versão 1.0 fica restrito a PIX e Cartão. Mariana lidera o fechamento dos testes até dia 5 de novembro, e Lucas inicia as campanhas de pré-inscrição na próxima segunda-feira. Próximo alinhamento nesta sexta.`,
  },
];
