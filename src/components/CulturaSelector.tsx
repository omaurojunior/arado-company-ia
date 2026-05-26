import React from "react";
import { Sprout, Leaf, PlusCircle, Check, HelpCircle } from "lucide-react";
import { CROP_OPTIONS } from "../data/agronomyData";

interface CulturaSelectorProps {
  selectedCrop: string;
  onSelectCrop: (cropKey: string) => void;
}

export const CulturaSelector: React.FC<CulturaSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
}) => {
  // Get natural icons or emojis for rural users
  const getCropMeta = (key: string) => {
    switch (key) {
      case "Milho":
        return { emoji: "🌽", colorClass: "border-amber-300 bg-amber-50" };
      case "Soja":
        return { emoji: "🌱", colorClass: "border-emerald-300 bg-emerald-50" };
      case "Pasto Brachiaria":
        return { emoji: "🌾", colorClass: "border-lime-300 bg-lime-50" };
      default:
        return { emoji: "🌿", colorClass: "border-sky-300 bg-sky-50" };
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-emerald-900 block tracking-tight">
        Passo 1: Qual é a planta que você quer examinar hoje? <span className="text-red-500">*</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="cultura-selector-group">
        {CROP_OPTIONS.map((crop) => {
          const isSelected = selectedCrop === crop.key;
          const meta = getCropMeta(crop.key);
          
          return (
            <button
              key={crop.key}
              type="button"
              id={`crop-${crop.key.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => onSelectCrop(crop.key)}
              className={`relative flex items-center gap-4 p-5 rounded-2xl text-left cursor-pointer transition-all border-2 text-base ${
                isSelected
                  ? "bg-emerald-600 border-emerald-800 text-white shadow-md transform scale-[1.02]"
                  : "bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-800"
              }`}
            >
              {/* Massive tactile icon */}
              <div className={`text-3xl p-3 rounded-xl shrink-0 ${isSelected ? "bg-white/20" : "bg-slate-100"}`}>
                {meta.emoji}
              </div>
              
              <div className="space-y-1 min-w-0 flex-grow">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base tracking-tight leading-tight">
                    {crop.key === "Pasto Brachiaria" ? "Capim e Pasto (Brachiaria)" : crop.key === "Outras Culturas" ? "Outros Tipos de Plantas" : crop.key}
                  </h4>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-emerald-800 flex items-center justify-center p-0.5 shrink-0">
                      <Check className="w-4 h-4 font-black" />
                    </div>
                  )}
                </div>
                <p className={`text-xs ${isSelected ? "text-emerald-100 font-medium" : "text-slate-500"} leading-snug`}>
                  {crop.key === "Milho" && "Milho verde, pipoca ou silagem"}
                  {crop.key === "Soja" && "Lavoura de soja"}
                  {crop.key === "Pasto Brachiaria" && "Capim do gado e pastagem"}
                  {crop.key === "Outras Culturas" && "Hortaliças, frutas ou outros"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
