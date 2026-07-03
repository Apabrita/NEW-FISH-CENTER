import { triggerHaptic } from "../utils/haptics";
import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface TransactionNumpadProps {
  isNumpadDown?: boolean;
  field: "weight" | "price";
  isSuccessAnimated: boolean;
  onKeyTap: (key: string) => void;
}

export const TransactionNumpad: React.FC<TransactionNumpadProps> = ({
  isNumpadDown = false,
  field,
  isSuccessAnimated,
  onKeyTap,
}) => {
  if (isNumpadDown) return null;

  return (
    <div className="grid grid-cols-4 gap-1.5 shrink-0 select-none animate-fadeIn">
      {/* Row 1 */}
      <button
        onClick={() => onKeyTap("7")}
        className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
      >
        7
      </button>
      <button
        onClick={() => onKeyTap("8")}
        className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
      >
        8
      </button>
      <button
        onClick={() => onKeyTap("9")}
        className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
      >
        9
      </button>
      <button
        onClick={() => onKeyTap("back")}
        className="py-2.5 text-sm font-extrabold glass-panel hover:bg-panel-hover border border-divider text-rose-500 rounded-[24px] cursor-pointer flex items-center justify-center font-mono"
      >
        ⌫
      </button>

      {/* Row 2 */}
      <button
        onClick={() => onKeyTap("4")}
        className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
      >
        4
      </button>
      <button
        onClick={() => onKeyTap("5")}
        className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
      >
        5
      </button>
      <button
        onClick={() => onKeyTap("6")}
        className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
      >
        6
      </button>
      <button
        onClick={() => onKeyTap("C")}
        className="py-2.5 text-xs font-black glass-panel hover:bg-panel-hover border border-divider text-rose-500 rounded-[24px] cursor-pointer flex items-center justify-center"
      >
        C
      </button>

      {/* Row 3 and 4 with spanning NEXT button */}
      <div className="col-span-3 grid grid-cols-3 gap-1.5">
        <button
          onClick={() => onKeyTap("1")}
          className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
        >
          1
        </button>
        <button
          onClick={() => onKeyTap("2")}
          className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
        >
          2
        </button>
        <button
          onClick={() => onKeyTap("3")}
          className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
        >
          3
        </button>

        <button
          onClick={() => onKeyTap("0")}
          className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => onKeyTap(".")}
          className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
        >
          .
        </button>
        <button
          onClick={() => onKeyTap("00")}
          className="py-2.5 text-sm md:text-base font-black font-mono glass-panel hover:bg-panel-hover border border-divider hover:border-zinc-700 rounded-[24px] cursor-pointer"
        >
          00
        </button>
      </div>

      {/* Spanned Actions element */}
      <div className="flex flex-col gap-1.5 h-full">
        {field === "weight" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Hack to trigger save directly from parent
              const btn = document.getElementById('hidden-save-btn');
              if (btn) btn.click();
            }}
            className="flex-1 py-1 text-[10px] md:text-xs font-black text-amber-500 bg-amber-950/20 hover:bg-amber-900/40 border border-amber-900/50 rounded-[24px] cursor-pointer transition-all uppercase flex flex-col justify-center items-center shadow-lg gap-0.5 select-none"
          >
            <span>WAIT P.</span>
            <span className="text-[8px] font-bold">✔</span>
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          animate={
            isSuccessAnimated && field === "price"
              ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }
              : {}
          }
          transition={{ duration: 0.3 }}
          onClick={() => onKeyTap("NEXT")}
          className={`flex-1 ${field !== "weight" ? "py-6" : "py-2"} text-xs md:text-sm font-black text-main hover:opacity-90 rounded-[24px] cursor-pointer transition-all uppercase flex flex-col justify-center items-center shadow-lg gap-1 select-none relative overflow-hidden ${
            field === "weight"
              ? "bg-amber-600 shadow-amber-900/30"
              : isSuccessAnimated
                ? "bg-teal-500 shadow-teal-900/40"
                : "bg-emerald-600 shadow-emerald-900/30"
          }`}
        >
          <AnimatePresence>
            {isSuccessAnimated && field === "price" && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-white/25 rounded-[24px] pointer-events-none"
              />
            )}
          </AnimatePresence>
          <span className="relative z-10">
            {field === "weight" ? "NEXT" : isSuccessAnimated ? "SAVED!" : "SAVE"}
          </span>
          <span className="text-[9px] font-bold relative z-10">
            {field === "weight" ? "➔" : isSuccessAnimated ? "✔" : "✔"}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
