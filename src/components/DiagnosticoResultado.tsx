import React, { useState } from "react";
import {
  Clock,
  UserCheck,
  ShieldAlert,
  Copy,
  Printer,
  Sparkles,
  Check,
  Volume2,
  VolumeX,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { DiagnosticoResponse } from "../types";

interface DiagnosticoResultadoProps {
  resultado: DiagnosticoResponse;
}

export const DiagnosticoResultado: React.FC<DiagnosticoResultadoProps> = ({
  resultado,
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const [speaking, setSpeaking] = useState(false);

  // Derive highest confidence probability
  const maxProbability = resultado.causasPossiveis.length > 0
    ? Math.max(...resultado.causasPossiveis.map(c => c.probabilidadePercentual))
    : 85;

  // Let's make the danger level labels friendly and clear for rural users
  const getPerigoManejo = (gravidade: string) => {
    switch (gravidade) {
      case "Crítica":
        return {
          banner: "border-l-red-650 bg-red-100/90 text-red-950",
          badge: "bg-red-600 text-white",
          label: "🔥 PERIGO GRAVE: Aja Hoje Mesmo",
          sublabel: "Sua produção corre risco alto. Faça o manejo imediatamente.",
        };
      case "Alta":
        return {
          banner: "border-l-orange-550 bg-orange-100/90 text-orange-950",
          badge: "bg-orange-600 text-white",
          label: "⚠️ PERIGO ALTO: Resolver Rápido",
          sublabel: "Não deixe passar desta semana para evitar que espalhe.",
        };
      case "Média":
        return {
          banner: "border-l-amber-550 bg-amber-100/90 text-amber-950",
          badge: "bg-amber-500 text-slate-900",
          label: "⚡ ATENÇÃO MÉDIA: Fique de Olho",
          sublabel: "Acompanhe e aplique as correções para acalmar a planta.",
        };
      case "Baixa":
      default:
        return {
          banner: "border-l-emerald-600 bg-emerald-100/90 text-emerald-950",
          badge: "bg-emerald-600 text-white",
          label: "🟢 MONITORAMENTO: Sem Pressa",
          sublabel: "Problema leve. Siga as orientações na rotina normal.",
        };
    }
  };

  const perigo = getPerigoManejo(resultado.gravidade);

  // Friendly type labels
  const translateType = (tipo: string) => {
    switch (tipo) {
      case "Nutricional":
        return "Fome da Planta (Falta de Adubo/Nutrientes) 🧪";
      case "Praga":
        return "Ataque de Insetos ou Lagarta 🐛";
      case "Doença":
        return "Doença de Fungo, Bactéria ou Vírus 🦠";
      case "Fisiológico":
        return "Estresse do Tempo (Calor, Seca ou Frio) ☀️";
      default:
        return "Outros Fatores do Campo 🌿";
    }
  };

  // Speaks out the diagnosis aloud for accessibility
  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      const text = `
        Diagnóstico do Arado para o cultivo de ${resultado.cultura}.
        O provável problema identificado é: ${resultado.diagnostico}.
        Nível de alerta: ${resultado.gravidade}.
        
        As causas apontadas são: 
        ${resultado.causasPossiveis.map(c => `${c.nome}, catalogado como ${translateType(c.tipo)}. ${c.descricao}`).join(". ")}.
        
        Recomendações importantes de trabalho que você deve fazer:
        ${resultado.acoesManejo.map((a, i) => `Ação número ${i + 1}: ${a.titulo} no prazo ${a.prazo}. Detalhes: ${a.detalhes}`).join(". ")}.
        
        Aviso do consultor técnico agrônomo: ${resultado.recomendacaoTecnica}.
      `;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Seu navegador não suporta leitura de voz no momento.");
    }
  };

  const handleCopy = () => {
    const textToCopy = `🌱 *Arado - Relatório Agronômico Simplificado* 🌱
----------------------------------------
👉 *O que está acontecendo:* ${resultado.diagnostico}
👉 *Cultura:* ${resultado.cultura}
👉 *Nível de Perigo:* ${resultado.gravidade} (Certeza: ${maxProbability}%)

📋 *O que fazer na lavoura (Plano de Trabalho):*
${resultado.acoesManejo
  .map(
    (a, idx) =>
      `${idx + 1}. [${a.prazo}] *${a.titulo}*\n   --> Como aplicar: ${a.detalhes}`
  )
  .join("\n\n")}

🍎 *Causas Prováveis:*
${resultado.causasPossiveis
  .map(
    (c) =>
      `• *${c.nome}* (${translateType(c.tipo)}) - ${c.descricao}`
  )
  .join("\n")}

🌾 *Mensagem do Agrônomo Técnico:*
"${resultado.recomendacaoTecnica}"

⚠️ *Alertas de Cuidado:*
${resultado.alertasCriticos.map((al) => `- ${al}`).join("\n")}
----------------------------------------
_Gerado de forma simples via Arado Inteligência_`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAction = (idx: number) => {
    setCheckedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-6 print:p-0" id="diagnostic-report-card">
      
      {/* Voice Reading & Quick Actions Header Panel (Very friendly!) */}
      <div className="bg-emerald-800 text-white rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border-2 border-emerald-900">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="text-2xl">📢</span>
            <h3 className="text-lg font-black tracking-tight font-sans">
              O Arado leu os sinais da planta!
            </h3>
          </div>
          <p className="text-xs text-emerald-100 font-medium">
            Abaixo está a receita de manejo. Se preferir ouvir tudo falado por áudio, clique no botão ao lado.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
          <button
            onClick={handleSpeak}
            id="tts-voice-btn"
            className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-sm transition-all cursor-pointer ${
              speaking 
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                : "bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold"
            }`}
          >
            {speaking ? (
              <>
                <VolumeX className="w-5 h-5 shrink-0" />
                Parar Voz de Leitura
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 shrink-0 animate-bounce" />
                🔊 Ouvir Diagnóstico (Voz)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Big Banner: The result itself inside a warm clipboard container */}
      <div className="bg-amber-50 border-4 border-emerald-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        
        {/* Clipboard mock hanging circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-12 h-8 bg-emerald-850 rounded-b-xl border-x border-b border-emerald-950 flex items-center justify-center text-white font-mono text-[9px] font-bold" />

        <div className="space-y-4 pt-1">
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-dashed border-emerald-200 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-850 uppercase tracking-wider font-mono bg-emerald-100 px-3 py-1 rounded-full">
                Resultado do Seu Exame para: <strong>{resultado.cultura}</strong>
              </span>
              <h2 className="text-2.5xl md:text-3xl font-black text-emerald-950 font-display tracking-tight pt-2">
                🩺 {resultado.diagnostico}
              </h2>
            </div>
            
            <div className="shrink-0 flex items-center gap-2.5 bg-emerald-900 text-white px-4 py-2.5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold font-mono">Grau de Certeza:</span>
              <span className="text-xl font-black font-mono text-amber-300">
                {maxProbability}%
              </span>
            </div>
          </div>

          {/* Large Friendly Danger Warning Block */}
          <div className={`p-5 rounded-2xl border-l-8 ${perigo.banner} space-y-1 shadow-inner`}>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">⚠️</span>
              <h4 className="text-base font-extrabold tracking-tight">
                {perigo.label}
              </h4>
            </div>
            <p className="text-xs font-bold opacity-90 leading-relaxed pl-7">
              {perigo.sublabel}
            </p>
          </div>

        </div>

        {/* Dynamic Section: Simplified Explanation of Causes */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b-2 border-emerald-850/10 pb-2">
            <span className="text-xl">💡</span>
            <h3 className="font-extrabold text-base text-emerald-950">
              O que pode estar gerando essa reação na planta:
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="causes-list">
            {resultado.causasPossiveis.map((causa, index) => (
              <div
                key={index}
                className="bg-white hover:bg-emerald-50/50 border-2 border-emerald-800/10 hover:border-emerald-700/55 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 rounded-lg">
                      {translateType(causa.tipo)}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-md font-mono">
                      Certeza: {causa.probabilidadePercentual}%
                    </span>
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-sm md:text-base">
                    {causa.nome}
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {causa.descricao}
                  </p>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${causa.probabilidadePercentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Giant Interactive Work Checklist (Super friendly for growers!) */}
        <div className="bg-white border-2 border-emerald-800/15 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚜</span>
              <h3 className="font-black text-base text-emerald-950 font-sans">
                O que você deve fazer (Receita de Manejo):
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
              Toque no quadradinho para riscar a tarefa
            </span>
          </div>

          <p className="text-xs text-slate-650 leading-relaxed font-medium">
            O Arado reuniu esses trabalhos fundamentais práticos para salvar sua planta. Marque as que você já cumpriu:
          </p>

          <div className="space-y-3">
            {resultado.acoesManejo.map((acao, index) => {
              const isChecked = !!checkedActions[index];
              const getPrazoTag = (prazo: string) => {
                switch (prazo) {
                  case "Imediato":
                    return "bg-red-100 text-red-900 border-red-200";
                  case "Curto Prazo":
                    return "bg-amber-100 text-amber-900 border-amber-200";
                  default:
                    return "bg-emerald-100 text-emerald-900 border-emerald-200";
                }
              };

              return (
                <div
                  key={index}
                  onClick={() => toggleAction(index)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                    isChecked
                      ? "bg-slate-50 border-slate-300 opacity-65 grayscale line-through"
                      : "bg-white hover:bg-emerald-50/20 border-emerald-800/10 shadow-sm hover:shadow"
                  }`}
                >
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all ${
                      isChecked
                        ? "bg-slate-400 border-slate-500 text-white"
                        : "bg-white border-emerald-700 text-emerald-800"
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 font-black stroke-[3]" />}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getPrazoTag(acao.prazo)}`}>
                        Prazo: {acao.prazo === "Imediato" ? "Urgente" : acao.prazo === "Curto Prazo" ? "Nesta Semana" : "No Próximo Ciclo/Safra"}
                      </span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">
                      {acao.titulo}
                    </h5>
                    <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                      {acao.detalhes}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security / Agro care tips section */}
        {resultado.alertasCriticos && resultado.alertasCriticos.length > 0 && (
          <div className="p-5 bg-red-50 border-2 border-red-200 rounded-3xl space-y-2.5">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h5 className="font-extrabold text-xs uppercase tracking-wider font-sans">
                Atenção: Cuidados Importantes de Segurança e Proteção do Sítio
              </h5>
            </div>
            <ul className="space-y-1.5 pl-2 text-xs text-red-955 font-semibold leading-relaxed">
              {resultado.alertasCriticos.map((alerta, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 shrink-0">•</span>
                  <span>{alerta}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warm Personal Consulting suggestion banner */}
        <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 p-5 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300 text-2xl">
            🤠
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h5 className="font-black text-sm text-emerald-950 uppercase tracking-tight">Conselho do Seu Amigo Agrônomo Local</h5>
            <p className="text-xs text-emerald-900 italic leading-relaxed font-bold">
              "{resultado.recomendacaoTecnica}"
            </p>
          </div>
        </div>

        {/* Print, share and utility tools row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-emerald-100 pt-5 print:hidden">
          <p className="text-[10px] text-slate-500 font-bold font-mono">
            Este laudo está salvo no seu histórico do Arado.
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              id="res-whatsapp-copy"
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-850 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer"
              title="Copiar texto pronto para colar no WhatsApp"
            >
              <Copy className="w-4 h-4 shrink-0" />
              {copied ? "Texto Copiado!" : "Copiar para o WhatsApp"}
            </button>
            <button
              onClick={() => window.print()}
              id="res-print-diag"
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-705 border-2 border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Imprimir laudo técnico em papel"
            >
              <Printer className="w-4 h-4 shrink-0" />
              Imprimir Laudo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
