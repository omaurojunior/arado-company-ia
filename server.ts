import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware global para processamento de JSON
app.use(express.json());

// Lista de chaves dadas pelo usuário que serão revezadas para evitar limites de requisição
const CHAVES_GEMINI = [
  "AIzaSyCJGQBJOfdibFLPtq52eEDPbP6bSMz5uws",
  "AIzaSyA2getLEXpxj5jMHyC7bIb8Y2MWMeJP9Pg",
  "AIzaSyBJQVVFnyheuw2xeuod8dyDeAMJgjO98KU",
  "AIzaSyBqItmC0AubISGsgzSkQCh0NqPhdUFoYHc",
  "AIzaSyDyAqgP4Gyb3XM1QQ8nik6djVoLPSz8kfI"
];

let indiceChaveAtual = 0;

// Função para obter e alternar as chaves de API
function obterChaveAPI(): string {
  // Se houver uma chave configurada no sistema/ambiente, dá preferência a ela
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    return process.env.GEMINI_API_KEY;
  }
  
  // Senão, faz o revezamento automático (rotativo) entre as chaves fornecidas
  const chaveSelected = CHAVES_GEMINI[indiceChaveAtual];
  console.log(`[Arado Log] Usando chave API de índice ${indiceChaveAtual} para esta chamada.`);
  indiceChaveAtual = (indiceChaveAtual + 1) % CHAVES_GEMINI.length;
  return chaveSelected;
}

// Rota da API: Diagnóstico rápido de culturas/pastagem
  app.post("/api/diagnostico", async (req, res) => {
    try {
      const {
        cultura,
        sintomaVisual,
        tipoSolo,
        faseCultura,
        irrigacao,
        climaAtual,
      } = req.body;

      if (!cultura || !sintomaVisual) {
        res.status(400).json({
          error: "Por favor, selecione a cultura e descreva os sintomas visuais observados.",
        });
        return;
      }

      const apiKey = obterChaveAPI();
      if (!apiKey) {
        res.status(500).json({
          error: "Ocorreu um problema com a configuração das chaves de API. Verifique suas credenciais.",
        });
        return;
      }

      // Inicializa o SDK do Gemini de forma tardia (apenas quando necessário)
      const { GoogleGenAI, Type, ThinkingLevel } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Monta o prompt de contexto agronômico com base nas respostas do produtor
      const userPrompt = `
        Por favor, analise as seguintes condições da plantação/pastagem de campo:
        - **Cultura**: ${cultura}
        - **Sintoma Visual Relatado**: "${sintomaVisual}"
        - **Tipo de Solo**: ${tipoSolo || "Não informado"}
        - **Fase de Desenvolvimento**: ${faseCultura || "Não informada"}
        - **Condições de Clima**: ${climaAtual || "Não informado"}
        - **Irrigação**: ${irrigacao ? "Possui sistema de irrigação ativo" : "Não possui irrigação (cultivo de sequeiro / dependente de chuvas)"}

        Sua tarefa é diagnosticar a provável causa, definir prioridades de ação preventiva e apresentar soluções práticas de manejo produtivo de forma técnica e clara.
      `;

      const systemInstruction = 
        "Você é um Engenheiro Agrônomo experiente e consultor de campo renomado. Com base nos sintomas da cultura informados, " +
        "gere um relatório rápido contendo: 1) Possíveis causas (deficiência de nutrientes específicos, pragas, vetores ou estresses fisiológicos); " +
        "2) Primeiras ações corretivas detalhadas de manejo de campo; 3) Uma recomendação amigável e calorosa para consulta presencial de um técnico ou engenheiro agrônomo local. " +
        "Importante: Para economizar processamento e consumo de dados, todas as explicações, descrições e títulos do JSON gerado DEVEM ser extremamente resumidos, com palavras simples e diretas, no máximo com 1 ou 2 frases curtas cada. " +
        "Use uma linguagem técnica profissional, porém extremamente de fácil entendimento para o agricultor ou proprietário de terras do interior. " +
        "Responda estritamente em Português do Brasil utilizando o objeto JSON especificado no esquema.";

      // Solicita a resposta estruturada para o modelo gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW // Utiliza raciocínio reduzido para economizar custo e tokens do produtor
          },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnostico: {
                type: Type.STRING,
                description: "Título conciso resumindo o diagnóstico principal (ex: Deficiência Severa de Nitrogênio, Infestação de Lagarta-do-Cartucho, etc.).",
              },
              cultura: {
                type: Type.STRING,
                description: "A cultura analisada.",
              },
              gravidade: {
                type: Type.STRING,
                description: "Nível de severidade/urgência do problema.",
                enum: ["Baixa", "Média", "Alta", "Crítica"],
              },
              causasPossiveis: {
                type: Type.ARRAY,
                description: "Array com as principais possíveis causas identificadas com probabilidades.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING, description: "Nome do distúrbio, nutriente em falta, praga ou patógeno." },
                    tipo: { type: Type.STRING, description: "Categoria do fator.", enum: ["Nutricional", "Praga", "Doença", "Fisiológico", "Outro"] },
                    descricao: { type: Type.STRING, description: "Explicação técnica simplificada do sintoma e do dano celular ou fisiológico." },
                    probabilidadePercentual: { type: Type.INTEGER, description: "Porcentagem estimada de probabilidade entre 0 e 100." },
                  },
                  required: ["nome", "tipo", "descricao", "probabilidadePercentual"],
                },
              },
              acoesManejo: {
                type: Type.ARRAY,
                description: "Recomendações técnicas operacionais para manejo corretivo.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    titulo: { type: Type.STRING, description: "Ação de manejo proposta (ex: Adubação nitrogenada foliar de cobertura, Aplicação focal de Bacillus thuringiensis, etc.)." },
                    detalhes: { type: Type.STRING, description: "Passo a passo, métodos de distribuição, dosagem ou cuidados de manejo geral no campo." },
                    prazo: { type: Type.STRING, description: "Momento ideal de intervenção.", enum: ["Imediato", "Curto Prazo", "Próximo Ciclo"] },
                  },
                  required: ["titulo", "detalhes", "prazo"],
                },
              },
              recomendacaoTecnica: {
                type: Type.STRING,
                description: "Mensagem encorajadora e amigável reforçando a importância de contar com assessoria técnica presencial no campo antes de aplicar defensivos regulamentados.",
              },
              alertasCriticos: {
                type: Type.ARRAY,
                description: "Dicas de segurança agronômica, riscos de fitotoxicidade ou orientações de cuidado ecológico.",
                items: { type: Type.STRING },
              },
            },
            required: [
              "diagnostico",
              "cultura",
              "gravidade",
              "causasPossiveis",
              "acoesManejo",
              "recomendacaoTecnica",
              "alertasCriticos",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Não foi possível gerar uma resposta do modelo agrícola. Tente novamente.");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (err: any) {
      console.error("Erro na geração do relatório de lavoura:", err);
      res.status(500).json({
        error: `Erro ao gerar diagnóstico: ${err.message || err}`,
      });
    }
  });

  // Serve arquivos estáticos ou monta o middleware do Vite dependendo do ambiente
  async function setupServer() {
    // Se estiver rodando na Vercel (Serverless), o roteamento de estáticos é feito pela própria CDN da Vercel.
    // Evitamos carregar qualquer lógica do Vite para que o empacotamento da função não quebre nem exceda limite de tamanho.
    if (process.env.VERCEL === "1") {
      console.log("[AgroDiagnostico Server] Ambiente Vercel Serverless detectado. Ignorando setup do Vite/Estáticos.");
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const nomeModuloVite = "vite";
      const { createServer: createViteServer } = await import(nomeModuloVite);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    // Apenas escuta na porta local se não estivermos no ambiente do Vercel Serverless
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[AgroDiagnostico Server] Iniciado na porta http://localhost:${PORT}`);
    });
  }

  setupServer().catch((err) => {
    console.error("[AgroDiagnostico Server] Erro crítico ao carregar setup do servidor:", err);
  });

  export default app;
