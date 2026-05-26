import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sprout,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Droplets,
  Search,
  Database,
  ChevronRight,
  ChevronLeft,
  History,
  FileText,
  PlusCircle,
  Calendar,
  Trash2,
  HardDrive,
  UserCheck,
  Check,
} from "lucide-react";
import {
  CROP_OPTIONS,
  SOIL_OPTIONS,
  CLIMATE_OPTIONS,
  STAGE_OPTIONS,
} from "./data/agronomyData";
import { CulturaSelector } from "./components/CulturaSelector";
import { DiagnosticoResultado } from "./components/DiagnosticoResultado";
import { DiagnosticoRequest, DiagnosticoResponse, DiagnosticoSalvo } from "./types";

// Import our signature generated countryside field background
// @ts-ignore
import aradoBg from "./assets/images/arado_green_agro_bg_1779798852982.png";

export default function App() {
  // Navigation tabs: "novo" (form), "laudo" (result report), "historico" (history)
  const [activeTab, setActiveTab] = useState<"novo" | "laudo" | "historico">("novo");

  // Step wizard states for New Diagnosis: Step 1 (Cultura), Step 2 (Ambiente), Step 3 (Sintomas)
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Form states
  const [cultura, setCultura] = useState<string>("Milho");
  const [customCultura, setCustomCultura] = useState<string>("");
  const [sintomaVisual, setSintomaVisual] = useState<string>("");
  const [tipoSolo, setTipoSolo] = useState<string>("Misto / Franco");
  const [faseCultura, setFaseCultura] = useState<string>("Desenvolvimento Vegetativo");
  const [irrigacao, setIrrigacao] = useState<boolean>(false);
  const [climaAtual, setClimaAtual] = useState<string>("Época de Seca");

  // App API & history states
  const [resultado, setResultado] = useState<DiagnosticoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DiagnosticoSalvo[]>([]);

  // Premium loading simulation steps
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const loadingMessages = [
    "Sondando solo e microclima da propriedade...",
    "Correlacionando teor de argila e fase de crescimento...",
    "Analisando anomalias celulares nos sintomas visuais...",
    "Simulando estresses bióticos e carências de minerais...",
    "Restauração do histórico e validação ecológica...",
    "Consolidando plano estratégico de cobertura com IA..."
  ];

  // Load history from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agro_diagnosticos_historico");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Falha ao carregar histórico local:", e);
    }
  }, []);

  // Cycle loading status text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Fill quick symptom preset
  const handlePresetClick = (presetText: string) => {
    setSintomaVisual(presetText);
  };

  const currentCropPresets = CROP_OPTIONS.find((c) => c.key === cultura)?.symptomPresets || [];

  // Reset Form
  const handleResetForm = () => {
    setCultura("Milho");
    setCustomCultura("");
    setSintomaVisual("");
    setTipoSolo("Misto / Franco");
    setFaseCultura("Desenvolvimento Vegetativo");
    setIrrigacao(false);
    setClimaAtual("Época de Seca");
    setError(null);
    setWizardStep(1);
  };

  // Submit diagnosis request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    const targetCulturaName = cultura === "Outras Culturas" ? customCultura || "Cultura Geral" : cultura;

    if (!sintomaVisual.trim()) {
      setError("Por favor, selecione ou escreva os sintomas visuais observados.");
      setLoading(false);
      return;
    }

    const payload: DiagnosticoRequest = {
      cultura: targetCulturaName,
      sintomaVisual: sintomaVisual,
      tipoSolo: tipoSolo,
      faseCultura: faseCultura,
      irrigacao: irrigacao,
      climaAtual: climaAtual,
    };

    try {
      const response = await fetch("/api/diagnostico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ocorreu um erro ao gerar conselho de manejo.");
      }

      const data: DiagnosticoResponse = await response.json();
      setResultado(data);

      const novoLaudo: DiagnosticoSalvo = {
        id: Math.random().toString(36).substring(2, 5) + Math.floor(Math.random() * 900 + 100),
        data: new Date().toISOString(),
        requisicao: payload,
        resultado: data,
      };

      const updatedHistory = [novoLaudo, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("agro_diagnosticos_historico", JSON.stringify(updatedHistory));
      
      // Auto-navigate to result tab fluidly
      setActiveTab("laudo");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro de contato com o servidor de diagnóstico.");
    } finally {
      setLoading(false);
    }
  };

  // Select Item from history
  const handleSelectHistoryItem = (item: DiagnosticoSalvo) => {
    setResultado(item.resultado);
    setCultura(item.requisicao.cultura === "Milho" || item.requisicao.cultura === "Soja" || item.requisicao.cultura === "Pasto Brachiaria" ? item.requisicao.cultura : "Outras Culturas");
    if (item.requisicao.cultura !== "Milho" && item.requisicao.cultura !== "Soja" && item.requisicao.cultura !== "Pasto Brachiaria") {
      setCustomCultura(item.requisicao.cultura);
    }
    setSintomaVisual(item.requisicao.sintomaVisual);
    setTipoSolo(item.requisicao.tipoSolo);
    setFaseCultura(item.requisicao.faseCultura);
    setIrrigacao(item.requisicao.irrigacao);
    setClimaAtual(item.requisicao.climaAtual);
    setError(null);
    setActiveTab("laudo");
  };

  // Delete Item from history
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("agro_diagnosticos_historico", JSON.stringify(updated));
  };

  // Clear all items
  const handleClearAllHistory = () => {
    if (window.confirm("Deseja realmente apagar todos os laudos salvos para limpar o histórico do Arado?")) {
      setHistory([]);
      localStorage.removeItem("agro_diagnosticos_historico");
      setResultado(null);
    }
  };

  return (
    <div className="min-h-screen bg-soil-50 text-moss-950 flex flex-col antialiased relative selection:bg-moss-250 selection:text-moss-950">
      
      {/* Absolute Decorative Layer: Beautiful plowed land background generated image */}
      <div className="absolute inset-x-0 top-0 h-[460px] overflow-hidden pointer-events-none z-0">
        <img
          src={aradoBg}
          alt="Rural horizon"
          className="w-full h-full object-cover object-bottom opacity-[0.22] blur-[1px] animate-drift filter sepia-[15%]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-soil-50/70 to-soil-50" />
      </div>

      {/* Elegant, floating leaves absolute vector decorativos */}
      <div className="absolute top-20 left-[8%] w-10 h-10 pointer-events-none opacity-15 rotate-12 animate-float-leaf text-moss-600 hidden md:block">
        <Sprout className="w-full h-full" />
      </div>
      <div className="absolute top-44 right-[10%] w-8 h-8 pointer-events-none opacity-10 -rotate-12 animate-float-leaf text-moss-700 delay-1000 hidden md:block">
        <Sprout className="w-full h-full" />
      </div>

      {/* Spacious Soft Header with rural editorial personality */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b-2 border-emerald-800/20 py-5 px-4 sm:px-8 shrink-0 print:border-none print:bg-transparent">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌾</span>
              <div>
                <h1 className="text-2.5xl font-black tracking-tight text-emerald-950 font-sans leading-tight">
                  Arado
                </h1>
                <p className="text-xs font-bold tracking-tight text-emerald-900">
                  Ajudante virtual simples de lavoura, pasto e plantações
                </p>
              </div>
            </div>
          </div>

          {/* Premium custom Tab Navigation Switch with organic look */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 self-start shadow-inner print:hidden relative">
            <button
              onClick={() => setActiveTab("novo")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-black rounded-xl transition-all cursor-pointer relative z-10 ${
                activeTab === "novo"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-800 hover:text-emerald-950 hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              📝 Novo Exame
            </button>
            <button
              onClick={() => setActiveTab("laudo")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-black rounded-xl transition-all cursor-pointer relative z-10 ${
                activeTab === "laudo"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-800 hover:text-emerald-950 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              📋 Ver Receita e Laudo
              {resultado && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("historico")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-black rounded-xl transition-all cursor-pointer relative z-10 ${
                activeTab === "historico"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-800 hover:text-emerald-950 hover:bg-slate-50"
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              📦 Guardados ({history.length})
            </button>
          </div>

        </div>
      </header>

      {/* Main Single Column Workspace - Focused, clean and less tiring */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:py-12 relative z-15">
        
        {/* Animated slide transitions for content switches */}
        <AnimatePresence mode="wait">
          
          {/* Active loader overlay */}
          {loading && (
            <motion.div
              key="sorting"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/90 backdrop-blur border border-soil-200 rounded-2xl p-10 text-center space-y-7 shadow-xl flex flex-col items-center justify-center min-h-[420px]"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-moss-200 animate-ping opacity-30" />
                <div className="p-6 bg-moss-50 rounded-full border border-moss-200 relative z-10">
                  <Sprout className="w-12 h-12 text-moss-700 animate-spin" style={{ animationDuration: "4s" }} />
                </div>
              </div>

              <div className="space-y-3.5 max-w-sm">
                <h3 className="text-sm font-bold text-soil-800 tracking-widest uppercase font-mono">
                  Lavrando os dados de campo
                </h3>
                <div className="h-1 bg-soil-100 rounded-full overflow-hidden w-48 mx-auto">
                  <div
                    className="bg-moss-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-moss-700 font-bold font-mono italic h-8 flex items-center justify-center gap-1.5 px-3 select-none">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  {loadingMessages[loadingStep]}
                </p>
              </div>

              <p className="text-[10px] text-soil-600 max-w-xs leading-relaxed font-semibold">
                Análise em progresso. O Arado está estruturando cronogramas de fitossanidade e correção química.
              </p>
            </motion.div>
          )}

          {/* STEPPER WIZARD: FORM ENTRY */}
          {!loading && activeTab === "novo" && (
            <motion.div
              key="novo-form-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              
              {/* Progress guide indicators */}
              <div className="flex items-center justify-between pb-3 border-b border-soil-200/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-soil-600 uppercase tracking-widest font-mono">
                    Formulário de Entrada • Passo {wizardStep} de 3
                  </span>
                  <span className="text-xs font-bold text-moss-950 font-display">
                    {wizardStep === 1 ? "Lauda Técnica: Cultura" : wizardStep === 2 ? "Fatores de Solo e Clima" : "Sintomas e Pistas Visuais"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full transition-all ${wizardStep >= 1 ? "bg-moss-750" : "bg-soil-200"}`} />
                  <div className={`w-6 h-0.5 rounded ${wizardStep >= 2 ? "bg-moss-750" : "bg-soil-200"}`} />
                  <div className={`w-3 h-3 rounded-full transition-all ${wizardStep >= 2 ? "bg-moss-750" : "bg-soil-200"}`} />
                  <div className={`w-6 h-0.5 rounded ${wizardStep >= 3 ? "bg-moss-750" : "bg-soil-200"}`} />
                  <div className={`w-3 h-3 rounded-full transition-all ${wizardStep >= 3 ? "bg-moss-750" : "bg-soil-200"}`} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" id="wizard-form">
                
                <AnimatePresence mode="wait">
                  {/* STEP 1: SELECT CROP */}
                  {wizardStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white border border-soil-200 rounded-2xl p-6 md:p-8 space-y-6 min-h-[300px] shadow-sm"
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-soil-950 font-display">Qual cultura deseja avaliar?</h3>
                        <p className="text-xs text-soil-600">Escolha uma cultura mapeada para carregar sintomas comuns e atalhos de diagnóstico.</p>
                      </div>

                      <CulturaSelector
                        selectedCrop={cultura}
                        onSelectCrop={(cropKey) => {
                          setCultura(cropKey);
                          setSintomaVisual(""); // Reset presets to avoid misalignment
                        }}
                      />

                      {cultura === "Outras Culturas" && (
                        <div className="space-y-1.5 pt-1.5" id="custom-crop-input-wrapper">
                          <label className="text-xs font-bold text-soil-800">Especifique o Vegetal ou Pasto <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={customCultura}
                            onChange={(e) => setCustomCultura(e.target.value)}
                            placeholder="Ex: Videira, Café, Tomateiro, Capim Mombaça..."
                            className="w-full bg-soil-50/50 border border-soil-200 hover:border-soil-600 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-moss-600 focus:bg-white focus:outline-none transition-colors"
                          />
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex justify-end pt-4 border-t border-soil-100">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2.5 bg-moss-700 hover:bg-moss-850 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          Próximo Passo
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: ATMOSPHERIC VARIABLES */}
                  {wizardStep === 2 && (
                    <motion.div
                      key="step1.5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white border-2 border-emerald-800/15 rounded-3xl p-6 md:p-8 space-y-7 shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black tracking-widest text-emerald-800 font-mono uppercase bg-emerald-50 px-2.5 py-1 rounded">
                          PASSO 2 de 3
                        </span>
                        <h3 className="text-xl font-black text-emerald-950 font-sans tracking-tight">
                          Como está o pedaço de chão e o tempo?
                        </h3>
                        <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                          O tipo da terra, o tempo e o clima ajudam a IA a saber se a planta está com sede, calor ou sofrendo com pragas de época.
                        </p>
                      </div>

                      {/* Top Selection Review */}
                      <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-between text-xs text-emerald-950 font-bold">
                        <span>Planta escolhida no Passo 1: <strong className="text-emerald-900">{cultura === "Outras Culturas" ? customCultura || "Outra planta" : cultura}</strong></span>
                        <button type="button" onClick={() => setWizardStep(1)} className="text-[11px] font-black text-emerald-800 underline hover:text-emerald-950">Mudar</button>
                      </div>

                      {/* Land Type Grid */}
                      <div className="space-y-3">
                        <label className="text-sm font-black text-emerald-950 block">
                          1️⃣ Qual é a terra (solo) da sua propriedade?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SOIL_OPTIONS.map((opt) => {
                            const isSel = tipoSolo === opt.key;
                            const getSoilEmoji = (k: string) => {
                              if (k.includes("Arenoso")) return "🏜️";
                              if (k.includes("Argiloso")) return "🧱";
                              if (k.includes("Misto")) return "🪵";
                              return "🍃";
                            };
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setTipoSolo(opt.key)}
                                className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                                  isSel 
                                    ? "bg-emerald-600 border-emerald-800 text-white shadow-md transform scale-[1.01]" 
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                                }`}
                              >
                                <span className="text-2.5xl shrink-0">{getSoilEmoji(opt.key)}</span>
                                <div className="space-y-0.5 min-w-0">
                                  <strong className="text-sm block font-extrabold">{opt.key}</strong>
                                  <p className={`text-xs leading-snug ${isSel ? "text-emerald-100" : "text-slate-500"} font-medium`}>
                                    {opt.label.includes("(") ? opt.label.split("(")[1].replace(")", "") : opt.label}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Climate / Weather Grid */}
                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-black text-emerald-950 block">
                          2️⃣ Como está o tempo e a chuva por aí agora?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {CLIMATE_OPTIONS.map((opt) => {
                            const isSel = climaAtual === opt.key;
                            const getClimEmoji = (k: string) => {
                              if (k.includes("Seca")) return "☀️";
                              if (k.includes("Chuva")) return "🌧️";
                              if (k.includes("Calor")) return "🥵";
                              return "❄️";
                            };
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setClimaAtual(opt.key)}
                                className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                                  isSel 
                                    ? "bg-emerald-600 border-emerald-800 text-white shadow-md transform scale-[1.01]" 
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                                }`}
                              >
                                <span className="text-2.5xl shrink-0">{getClimEmoji(opt.key)}</span>
                                <div className="space-y-0.5 min-w-0">
                                  <strong className="text-sm block font-extrabold">{opt.key}</strong>
                                  <p className={`text-xs leading-snug ${isSel ? "text-emerald-100" : "text-slate-500"} font-medium`}>
                                    {opt.key === "Época de Seca" ? "Terra seca e pouca chuva" : 
                                     opt.key === "Época de Chuvas" ? "Chuva direta e terra molhada" : 
                                     opt.key === "Alta Temperatura / Veranico" ? "Muito calor e sol estalando" : 
                                     "Frio forte de inverno ou geadas"}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Plant Stage Grid */}
                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-black text-emerald-950 block">
                          3️⃣ Como está o tamanho / tamanho de crescimento da planta?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {STAGE_OPTIONS.map((opt) => {
                            const isSel = faseCultura === opt.key;
                            const getStageEmoji = (k: string) => {
                              if (k.includes("Plântula")) return "🌱";
                              if (k.includes("Vegetativo")) return "🌿";
                              if (k.includes("Floração")) return "🌸";
                              if (k.includes("Frutificação")) return "🌽";
                              return "🚜";
                            };
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setFaseCultura(opt.key)}
                                className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                                  isSel 
                                    ? "bg-emerald-600 border-emerald-800 text-white shadow-md transform scale-[1.01]" 
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                                }`}
                              >
                                <span className="text-2.5xl shrink-0">{getStageEmoji(opt.key)}</span>
                                <div className="space-y-0.5 min-w-0">
                                  <strong className="text-sm block font-extrabold">{opt.key.split("/")[0]}</strong>
                                  <p className={`text-xs leading-snug ${isSel ? "text-emerald-100" : "text-slate-500"} font-medium`}>
                                    {opt.label.includes("(") ? opt.label.split("(")[1].replace(")", "") : opt.label}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Irrigation toggle box (made HUGE) */}
                      <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-200/80 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2.5xl">💧</span>
                          <div>
                            <h4 className="text-sm font-black text-emerald-950">Você mole/irriga a área por conta própria?</h4>
                            <p className="text-[11px] text-slate-650 font-bold leading-relaxed">
                              Marque sim se você tem aspersor, gotejamento ou irriga manualmente na lavoura.
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={irrigacao}
                            onChange={(e) => setIrrigacao(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700" />
                        </label>
                      </div>

                      {/* Navigation Controls (Large Buttons) */}
                      <div className="flex justify-between pt-4 border-t-2 border-dashed border-slate-200">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="px-5 py-3 border-2 border-slate-300 hover:bg-slate-150 text-slate-800 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Voltar para Plantas
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-850 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          Ir para os Sintomas
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: SYMPTOMS VISUAL PRESET & WRITING */}
                  {wizardStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white border-2 border-emerald-800/15 rounded-3xl p-6 md:p-8 space-y-7 shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-black tracking-widest text-emerald-800 font-mono uppercase bg-emerald-50 px-2.5 py-1 rounded">
                          PASSO 3 de 3
                        </span>
                        <h3 className="text-xl font-black text-emerald-950 font-sans tracking-tight">
                          O que as folhas e ramos estão mostrando?
                        </h3>
                        <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                          Último passo! Escolha uma das frases prontas abaixo se for parecida com o seu caso, ou explique detalhadamente com a sua própria escrita.
                        </p>
                      </div>

                      {/* Scopes resume row */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 font-bold uppercase font-sans">
                        <div className="truncate text-center">🌱 Planta: {cultura === "Outras Culturas" ? customCultura || "Outra" : cultura}</div>
                        <div className="truncate text-center">🧱 Terra: {tipoSolo.split(" ")[0]}</div>
                        <div className="truncate text-center">☀️ Tempo: {climaAtual.split(" ")[0]}</div>
                      </div>

                      {/* Fastpresets buttons */}
                      {currentCropPresets.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-xs font-black text-emerald-950 uppercase tracking-tight block">
                            💡 Atalho Rápido: Toque na frase que mais parece com a sua planta:
                          </span>
                          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1" id="symptoms-presets-container">
                            {currentCropPresets.map((preset, index) => {
                              const isFilled = sintomaVisual === preset;
                              let shortLabel = preset.split("(")[0].trim();
                              let parenthetical = preset.includes("(") ? " (" + preset.split("(")[1] : "";
                              
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handlePresetClick(preset)}
                                  id={`symptom-tag-${index}`}
                                  className={`p-4 text-xs font-bold rounded-2xl text-left border-2 cursor-pointer transition-all leading-relaxed ${
                                    isFilled
                                      ? "bg-emerald-600 border-emerald-800 text-white shadow-md transform scale-[1.01]"
                                      : "bg-white hover:bg-slate-50 border-slate-250 text-slate-800"
                                  }`}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-base">🔎</span>
                                    <div>
                                      <span>{shortLabel}</span>
                                      {parenthetical && (
                                        <span className={`text-[10px] block mt-0.5 ${isFilled ? "text-emerald-100" : "text-slate-500"} font-medium italic`}>
                                          {parenthetical.replace("(", "").replace(")", "")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-black text-emerald-950 block">
                          📝 Ou descreva com as suas próprias palavras o que está acontecendo:
                        </label>
                        <textarea
                          required
                          value={sintomaVisual}
                          onChange={(e) => setSintomaVisual(e.target.value)}
                          placeholder="Exemplo: As folhas de baixo estão com as bordas secas e amarelas... Tem umas lagartas pequenas comendo o miolo da planta..."
                          rows={4}
                          className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-0 focus:outline-none rounded-2xl p-4 text-xs md:text-sm font-bold leading-relaxed transition-all"
                        />
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-950 font-bold">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <p>{error}</p>
                        </div>
                      )}

                      {/* Controls bar */}
                      <div className="flex justify-between pt-4 border-t-2 border-dashed border-slate-200">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-3 border-2 border-slate-300 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Voltar ao Solo/Tempo
                        </button>
                        
                        <button
                          type="submit"
                          id="submit-form-btn"
                          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-850 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          <Search className="w-4 h-4" />
                          🔍 Descobrir Problema com IA
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </form>
            </motion.div>
          )}

          {/* TAB 2: LAUDO ATIVO DIAGNOSIS PRESENTATION */}
          {!loading && activeTab === "laudo" && (
            <motion.div
              key="laudo-result-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-4"
            >
              {resultado ? (
                <DiagnosticoResultado resultado={resultado} />
              ) : (
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center">
                  <div className="p-4 bg-emerald-50 rounded-full border-2 border-emerald-250 text-emerald-800 text-3xl">
                    📋
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-base font-black text-emerald-950 font-sans">
                      Sua receita de trabalho está em branco!
                    </h3>
                    <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                      Você ainda não examinou nenhuma planta nesta sessão. Toque no botão verde <strong className="text-emerald-850">"📝 Novo Exame"</strong> no topo da página para começar o passo a passo!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("novo")}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-850 text-white rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer"
                  >
                    Começar Meu Exame 🌾
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: HISTORY LIST AND ARCHIVE */}
          {!loading && activeTab === "historico" && (
            <motion.div
              key="historico-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-5"
            >
              
              {/* Header slot */}
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-emerald-950 font-sans">Histórico de Exames Salvos</h3>
                  <p className="text-[11px] text-slate-500 font-bold font-mono">Estes laudos estão gravados na memória do seu aparelho.</p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-xs font-black text-red-600 hover:text-red-700 cursor-pointer uppercase tracking-wider font-mono bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200"
                    id="clear-all-history"
                  >
                    Apagar Tudo
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 text-center space-y-5 shadow-sm min-h-[250px] flex flex-col items-center justify-center">
                  <div className="p-4 bg-slate-50 rounded-full text-4xl">
                    📦
                  </div>
                  <h4 className="text-base font-black text-emerald-950 font-sans">
                    Você ainda não tem exames salvos!
                  </h4>
                  <p className="text-xs text-slate-650 max-w-xs leading-relaxed font-semibold">
                    Assim que você fizer um diagnóstico para o seu milho, soja ou capim, o resultado vai ficar guardado nesta gavetinha de forma bem organizada para você ler quando quiser!
                  </p>
                </div>
              ) : (
                <div className="space-y-3" id="history-items-container">
                  {history.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="bg-white hover:bg-soil-50/70 border border-soil-200 hover:border-soil-600 p-4.5 rounded-xl shadow-sm hover:shadow text-left transition-all cursor-pointer flex justify-between items-center gap-4 hover:-translate-y-0.5"
                      id={`select-history-${item.id}`}
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                            item.resultado.gravidade === "Crítica" ? "bg-red-50 text-red-900 border-red-200" :
                            item.resultado.gravidade === "Alta" ? "bg-orange-50 text-orange-900 border-orange-200" :
                            item.resultado.gravidade === "Média" ? "bg-amber-50 text-amber-900 border-amber-200" :
                            "bg-emerald-50 text-emerald-900 border-emerald-200"
                          }`}>
                            {item.resultado.gravidade}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-soil-600">ID#{item.id.toUpperCase()}</span>
                          <span className="text-[10px] text-soil-600">•</span>
                          <span className="text-moss-700 text-xs font-bold font-mono">{item.requisicao.cultura}</span>
                        </div>

                        <h4 className="font-bold text-sm text-soil-950 leading-snug font-display">
                          {item.resultado.diagnostico}
                        </h4>

                        <p className="text-xs text-soil-600 leading-snug line-clamp-1 italic font-medium">
                          "{item.requisicao.sintomaVisual}"
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-soil-600 font-bold font-mono">
                          <Calendar className="w-3.5 h-3.5 text-moss-600" />
                          <span>
                            {new Date(item.data).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-center">
                        <button
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          className="p-2 text-soil-200 hover:text-red-550 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir do histórico"
                          id={`delete-history-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-soil-600" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Informative Step: Manual of Agro guidelines */}
        {!loading && activeTab === "novo" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white border border-soil-200 rounded-2xl p-6 md:p-8 space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-soil-100 pb-3">
              <span className="px-2 py-0.5 bg-soil-100 border border-soil-200 text-soil-600 text-[9px] font-black uppercase tracking-wider font-mono rounded">Guia Arado</span>
              <h3 className="text-xs font-black tracking-widest text-soil-700 uppercase font-mono">
                Manual de Pré-Diagnóstico Sustentável
              </h3>
            </div>
            <p className="text-xs text-soil-600 leading-relaxed font-bold">
              Como lavrar hipóteses sólidas e saudáveis para auxiliar a fertilidade biológica do solo e apoiar o manejo ecológico:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-soil-50 border border-soil-200 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-soil-600 font-mono block">MÉTODO 01 /// SELEÇÃO</span>
                <h5 className="font-bold text-xs text-soil-800 leading-tight">Escolha e Solo</h5>
                <p className="text-[10px] text-soil-650 leading-snug font-medium">
                  Identifique a cultura desejada e escolha as propriedades climáticas certas para balizar a análise de estresse hídrico ou térmico.
                </p>
              </div>

              <div className="p-3.5 bg-soil-50 border border-soil-200 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-soil-600 font-mono block">MÉTODO 02 /// SINAIS</span>
                <h5 className="font-bold text-xs text-soil-800 leading-tight">Provas do Campo</h5>
                <p className="text-[10px] text-soil-650 leading-snug font-medium">
                  Use nossos atalhos preparados para cobrir deficiências nutricionais (N, P, K) e controle de lagarta, ou digite livremente o que vê nas folhas.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex gap-3 text-xs text-amber-950 font-medium">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h5 className="font-bold text-amber-900 uppercase text-[10px] tracking-wider font-mono">Salvaguarda Agronômica Oficial</h5>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Os diagnósticos automatizados do Arado sugerem orientações de apoio e prevenção. Eles não substituem a análise laboratorial de terra ou a assistência direta de Engenheiros Agrônomos. Lembre-se de obter prescrição do CREA antes de aplicar defensivos regulamentados.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Spacious Footer */}
      <footer className="bg-soil-950 text-soil-200 text-center py-10 border-t border-soil-800 px-4 print:hidden shrink-0 mt-auto relative z-10">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-xs font-semibold leading-normal font-display">
            Arado &copy; {new Date().getFullYear()} • Inteligência para a Sustentabilidade do Campo
          </p>
          <p className="text-[10px] text-soil-200/60 max-w-md mx-auto leading-relaxed">
            Desenvolvido com diretrizes de engenharia agronômica e fomento ecológico. Buscando tornar o diagnóstico e o planejamento tático do produtor mais fluidos e práticos.
          </p>
        </div>
      </footer>
    </div>
  );
}
