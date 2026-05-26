export interface CropOption {
  key: string;
  name: string;
  scientificName: string;
  description: string;
  icon: string; // Lucide icon name
  symptomPresets: string[];
}

export const CROP_OPTIONS: CropOption[] = [
  {
    key: "Milho",
    name: "Milho (Zea mays)",
    scientificName: "Zea mays L.",
    description: "Cereal de alta exigência nutricional em nitrogênio e potássio. Sensível à lagarta-do-cartucho.",
    icon: "Corn",
    symptomPresets: [
      "Folhas inferiores com amarelecimento em formato de 'V' invertido que começa na ponta e vai pela nervura central (Sinal de deficiência de Nitrogênio)",
      "Bordas das folhas mais velhas amareladas e posteriormente necrosadas/secas (Sinal de deficiência de Potássio)",
      "Lagarta comendo o miolo do cartucho da planta, deixando furos simétricos e serragem",
      "Manchas foliares brancas e circulares (Mancha branca / Phaeosphaeria)",
      "Encurtamento de nós e folhas novas com riscas cloróticas amareladas paralelas (Possível deficiência de Zinco)"
    ]
  },
  {
    key: "Soja",
    name: "Soja (Glycine max)",
    scientificName: "Glycine max (L.) Merr.",
    description: "Leguminosa fixadora de nitrogênio. Exigente em fósforo e micronutrientes como o cobalto/molibdênio.",
    icon: "Sprout",
    symptomPresets: [
      "Clorose internerval nas folhas mais jovens (folhas amarelas mas as nervuras continuam verdes; sinal de deficiência de Ferro ou Manganês)",
      "Lagarta dobradora ou mastigadora devorando as folhas da soja",
      "Pequenos pontos escuros ou manchas circulares pardas que causam desfolha precoce (Mancha Parda / Septoriose ou Crestamento)",
      "Planta com folhas verde-escuras, mas com crescimento atrofiado e folhas avermelhadas/roxas (Sinal de deficiência de Fósforo)",
      "Rachadura nas hastes ou abortamento de flores (Possível deficiência de Boro)"
    ]
  },
  {
    key: "Pasto Brachiaria",
    name: "Pasto Brachiaria",
    scientificName: "Urochloa decumbens / brizantha",
    description: "Gramínea amplamente utilizada na pecuária nacional. Sensível à cigarrinha-das-pastagens.",
    icon: "Leaf",
    symptomPresets: [
      "Pastagem rala, amarelada e com crescimento completamente travado mesmo após chuvas (Degradação de pasto / falta de Nitrogênio e Fósforo)",
      "Presença de espuma branca e pegajosa rente à base das plantas (Cigarrinha-das-pastagens)",
      "Pontas das folhas avermelhadas, roxas ou bronzeadas (Falta de fósforo ou estresse térmico/frio severo)",
      "Morte generalizada do capim em reboleiras (Manchas circulares onde o capim seca e morre repentinamente)",
      "Folhas jovens que nascem retorcidas, estreitas e opacas"
    ]
  },
  {
    key: "Outras Culturas",
    name: "Outra Cultura ou Pastagem",
    scientificName: "Especificação Livre",
    description: "Insira uma hortaliça, árvore frutífera ou cultivo anual personalizado.",
    icon: "PlusCircle",
    symptomPresets: [
      "Amarelecimento generalizado das folhas mais velhas",
      "Manchas escuras concêntricas ou mofos na face inferior da folha",
      "Ataque visível de insetos raspadores ou pulgões nos brotos novos",
      "Queda de folhas verdes e abortamento de flores após período de seca"
    ]
  }
];

export const SOIL_OPTIONS = [
  { key: "Arenoso", label: "Arenoso (Leve / Baixa retenção de água e nutrientes)", details: "Suscetível à lixiviação rápida de nitrogênio e potássio." },
  { key: "Argiloso", label: "Argiloso (Pesado / Alta retenção, risco de compactação)", details: "Pode fixar fósforo fortemente, tornando-o indisponível." },
  { key: "Misto / Franco", label: "Misto ou Franco (Equilibrado, excelente drenagem)", details: "Ideal para a maioria dos cultivos comerciais." },
  { key: "Orgânico / Humoso", label: "Orgânico ou Humoso (Rico em matéria orgânica)", details: "Excelente fertilidade natural e atividade biológica ativa." }
];

export const CLIMATE_OPTIONS = [
  { key: "Época de Seca", label: "Época de Seca (Estresse Hídrico)", icon: "Sun" },
  { key: "Época de Chuvas", label: "Época de Chuvas Intensas", icon: "CloudRain" },
  { key: "Alta Temperatura / Veranico", label: "Alta Temperatura / Período Sem Chuva no Verão", icon: "Thermometer" },
  { key: "Frio / Geada", label: "Frio Intenso ou Incidência de Geadas", icon: "CloudSnow" }
];

export const STAGE_OPTIONS = [
  { key: "Plântula / Emergência", label: "Plântula / Emergência (Início da vida)" },
  { key: "Desenvolvimento Vegetativo", label: "Desenvolvimento Vegetativo (Crescimento de folhas/ramos)" },
  { key: "Floração", label: "Floração (Fase crítica para estresse hídrico)" },
  { key: "Frutificação / Enchimento de Grãos", label: "Frutificação / Enchimento de Grãos" },
  { key: "Colheita / Senescência", label: "Fase Final / Pré-Colheita" }
];
