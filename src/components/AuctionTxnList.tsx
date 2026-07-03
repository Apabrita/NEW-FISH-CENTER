import React from "react";
import { Transaction } from "../db";
import { formatCurrency as fmt } from "../utils/formatters";

interface AuctionTxnListProps {
  buyers: any[];
  activeTxns: Transaction[];
  deviceId: string;
  expandFishType: (code: string) => string;
  canEdit: boolean;
  onEdit: (tx: Transaction) => void;
}

export const AuctionTxnList: React.FC<AuctionTxnListProps> = ({
  buyers,
  activeTxns,
  deviceId,
  expandFishType,
  canEdit,
  onEdit,
}) => {
  const localTxns = activeTxns;

  if (localTxns.length === 0) {
    return (
      <div className="text-center py-20 text-faint text-xs font-sans space-y-2 select-none">
        <div className="text-2xl animate-bounce">🎣</div>
        <div className="font-bold">
          No transactions logged by you in this source yet.
        </div>
        <p className="text-[10.5px] text-faint max-w-sm mx-auto">
          Select or register a source chip above, pick your buyer nickname at
          the bottom, and enter weights on the custom keypad.
        </p>
      </div>
    );
  }

  const sortedTxns = [...localTxns].sort(
    (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
  );

  const crateOrder: string[] = [];
  const grouped = sortedTxns.reduce(
    (acc, t) => {
      const key = t.fish_type || "Unspecified Crate";
      if (!acc[key]) {
        acc[key] = [];
      } else {
        // Move crate to the bottom since it has a new transaction
        const idx = crateOrder.indexOf(key);
        if (idx !== -1) crateOrder.splice(idx, 1);
      }
      crateOrder.push(key);
      acc[key].push(t);
      return acc;
    },
    {} as Record<string, typeof sortedTxns>,
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-4">
      {crateOrder.map((crateName) => {
        const txns = grouped[crateName];
        const crateKg = txns.reduce((sum, t) => sum + (t.weight || 0), 0);
        const crateAmt = txns.reduce((sum, t) => sum + (t.total_price || 0), 0);
        const crateMean = crateKg > 0 ? crateAmt / crateKg : 0;

        return (
          <div key={crateName} className="space-y-2">
            {/* Crate Header */}
            <div className="flex items-center justify-between border-b border-divider pb-1 mb-2 px-1">
              <div className="font-extrabold text-xs text-sky-500 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                📦 {crateName}{" "}
                <span className="text-[10px] text-faint lowercase tracking-normal">
                  ({expandFishType(crateName)})
                </span>
              </div>
              <div className="text-[10px] text-faint font-mono tracking-wider flex items-center gap-2">
                <span>
                  Total:{" "}
                  <strong className="text-main">
                    {crateKg.toFixed(1)}kg
                  </strong>
                </span>
                <span className="opacity-40">|</span>
                <span>
                  Sum:{" "}
                  <strong className="text-main">{fmt(crateAmt)}</strong>
                </span>
                <span className="opacity-40">|</span>
                <span>
                  Avg:{" "}
                  <strong className="text-main">{fmt(crateMean)}/kg</strong>
                </span>
              </div>
            </div>

            {/* List */}
            {txns.map((t) => {
              const bgIntensity = Math.min(
                100,
                Math.floor(((t.weight || 0) / 100) * 100),
              );
              return (
                <div
                  key={t.id}
                  className={`border rounded-[24px] p-2.5 flex items-center justify-between shadow-sm relative overflow-hidden group transition ${t.is_pending_price ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-700' : 'glass-panel border-divider hover:border-zinc-700'}`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-sky-500/10 transition-all"
                    style={{ width: `${bgIntensity}%` }}
                  />
                  <div className="flex items-center gap-3 relative z-10 w-full max-w-[65%]">
                    <div className={`min-w-[48px] h-10 px-1 rounded-[16px] glass-panel border flex flex-col items-center justify-center shrink-0 shadow-inner ${t.is_pending_price ? 'border-amber-500/50' : 'border-zinc-700'}`}>
                      <span className={`text-[8px] font-black uppercase tracking-tighter leading-none mb-0.5 ${t.is_pending_price ? 'text-amber-500' : 'text-muted'}`}>
                        {t.is_pending_price ? 'PENDING' : '₹/KG'}
                      </span>
                      {!t.is_pending_price && (
                        <span className="text-sm font-black text-sky-500 font-mono leading-tight">
                          {t.price_per_kg}
                        </span>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-extrabold text-main capitalize font-mono text-amber-500">
                        {t.weight} kg
                      </div>
                      <div className="text-[10px] text-faint font-sans tracking-wide truncate">
                        👤 Buyer:{" "}
                        {(() => {
                          // Try to resolve name from component if needed, but it was resolved locally in TransactionPanel!
                          // Wait, the original code had:
                          // const bObj = store.buyers.find(b => String(b.id) === String(t.buyer_id)); return bObj ? bObj.nickname : t.buyer_id;
                          const bObj = buyers.find(
                            (b: any) => String(b.id) === String(t.buyer_id),
                          );
                          return bObj ? bObj.nickname : t.buyer_id;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`text-xs md:text-sm font-black font-mono text-right ${t.is_pending_price ? 'text-amber-500 animate-pulse text-[10px]' : 'text-emerald-500'}`}>
                      {t.is_pending_price ? 'WAITING' : fmt(t.total_price)}
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => onEdit(t)}
                        className="p-1.5 glass-panel border border-divider hover:border-zinc-700 text-muted hover:text-main rounded-[24px] cursor-pointer transition text-[11px]"
                        title="Adjust Record"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
