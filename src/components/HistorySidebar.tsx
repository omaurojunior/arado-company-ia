import React from "react";
import { History, Calendar, Trash2, ChevronRight, HardDrive } from "lucide-react";
import { DiagnosticoSalvo } from "../types";

interface HistorySidebarProps {
  history: DiagnosticoSalvo[];
  onSelect: (item: DiagnosticoSalvo) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
  activeId,
}) => {
  const getBadgeColor = (gravidade: string) => {
    switch (gravidade) {
      case "Crítica":
        return "bg-red-900 border-red-700 text-red-100";
      case "Alta":
        return "bg-orange-950 border-orange-750 text-orange-200";
      case "Média":
        return "bg-amber-950 border-amber-850 text-amber-200";
      case "Baixa":
      default:
        return "bg-emerald-950 border-emerald-850 text-emerald-200";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const capacityPercent = Math.min((history.length / 50) * 100, 100);

  return (
    <div className="space-y-4" id="history-panel">
      {/* High Density Memory Stats Box */}
      <div className="bg-slate-900 rounded p-4 text-white border border-slate-950 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <HardDrive className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Últimas Amostras</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
            {history.length}/50 slots
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500" 
              style={{ width: `${history.length === 0 ? 0 : Math.max(capacityPercent, 5)}%` }}
            />
          </div>
          
          {history.length === 0 ? (
            <p className="text-[10px] font-mono leading-normal text-slate-400">
              Banco local vazio. Realize um diagnóstico para gerar amostras.
            </p>
          ) : (
            <p className="text-[10px] font-mono leading-tight text-slate-300">
              Amostra ativa: <span className="text-emerald-300">ID#{history[0].id.toUpperCase()} ({history[0].requisicao.cultura})</span>
            </p>
          )}
        </div>
      </div>

      {/* Main Historical List */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-col space-y-3">
        <div className="flex items-center justify-between border-b border-slate-250 pb-2">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Laudos Gravados Localmente
            </h3>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase cursor-pointer tracking-wider"
              id="clear-all-history"
            >
              Limpar banco
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-slate-200 rounded text-slate-400 space-y-1">
            <p className="text-[10px] font-mono">Status: Sem registros salvos</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-0.5" id="history-items-container">
            {history.map((item) => {
              const isSelected = activeId === item.id;
              return (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between p-2 rounded border transition-all ${
                    isSelected
                      ? "bg-slate-100 border-slate-400"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex-1 text-left flex flex-col min-w-0 cursor-pointer"
                    id={`select-history-${item.id}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1 text-[8px] font-extrabold uppercase font-mono rounded tracking-wider border ${getBadgeColor(item.resultado.gravidade)}`}>
                        {item.resultado.gravidade}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        ID#{item.id.toUpperCase()}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-[11px] text-slate-800 line-clamp-1 leading-snug mt-0.5">
                      {item.resultado.diagnostico}
                    </h4>
                    
                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-450 mt-0.5">
                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                      <span>{formatDate(item.data)}</span>
                      <span>•</span>
                      <span className="text-emerald-800 font-bold">{item.requisicao.cultura}</span>
                    </div>
                  </button>

                  <div className="flex items-center pl-1 shrink-0">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-slate-300 hover:text-red-650 hover:bg-red-50 rounded transition-colors"
                      title="Apagar"
                      id={`delete-history-${item.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="p-0.5 text-slate-400 group-hover:text-emerald-800"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
