/** Tipos do Manual da plataforma (conteúdo em abas). */

export interface IndicadorDoc {
  /** Nome do indicador como aparece na tela */
  nome: string;
  /** O que é, em 1-2 frases simples (linguagem leiga) */
  oQueE: string;
  /** Como ler os valores/cores/faixas na prática */
  comoLer: string;
  /** O que sugere oportunidade de compra (se aplicável) */
  sinalCompra?: string;
  /** O que sugere risco/realização (se aplicável) */
  sinalVenda?: string;
  /** Pegadinha ou limitação que o iniciante precisa saber */
  cuidado?: string;
}

export interface PaginaDoc {
  /** id único (usado como âncora) */
  id: string;
  titulo: string;
  /** rota no app, ex: /dashboard/on-chain */
  rota: string;
  plano: "Grátis" | "Pro";
  /** O que a página faz, em 2-3 frases simples */
  resumo: string;
  /** Passo a passo de uso, frases curtas */
  comoUsar: string[];
  /** Todos os indicadores/métricas visíveis nessa página */
  indicadores: IndicadorDoc[];
  /** Dicas práticas de quem já usa (opcional) */
  dicas?: string[];
}

export interface AbaManual {
  /** id único da aba */
  id: string;
  /** título curto da aba, ex: "On-Chain" */
  titulo: string;
  /** 1 frase do que essa aba cobre */
  descricao: string;
  paginas: PaginaDoc[];
}
