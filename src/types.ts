export interface DiagnosticoRequest {
  cultura: string;
  sintomaVisual: string;
  tipoSolo: string;
  faseCultura: string;
  irrigacao: boolean;
  climaAtual: string;
}

export interface CausaPossivel {
  nome: string;
  tipo: "Nutricional" | "Praga" | "Doença" | "Fisiológico" | "Outro";
  descricao: string;
  probabilidadePercentual: number;
}

export interface AcaoManejo {
  titulo: string;
  detalhes: string;
  prazo: "Imediato" | "Curto Prazo" | "Próximo Ciclo";
}

export interface DiagnosticoResponse {
  diagnostico: string;
  cultura: string;
  gravidade: "Baixa" | "Média" | "Alta" | "Crítica";
  causasPossiveis: CausaPossivel[];
  acoesManejo: AcaoManejo[];
  recomendacaoTecnica: string;
  alertasCriticos: string[];
}

export interface DiagnosticoSalvo {
  id: string;
  data: string;
  requisicao: DiagnosticoRequest;
  resultado: DiagnosticoResponse;
}
