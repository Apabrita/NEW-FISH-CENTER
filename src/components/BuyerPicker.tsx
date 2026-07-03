import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useData } from "../contexts/DataContext";

interface BuyerPickerProps {
  buyers: any[];
  onSelect: (b: any) => void;
  onClose: () => void;
  onAddAndSelect: (name: string) => Promise<void>;
}

export const BuyerPicker: React.FC<BuyerPickerProps> = ({
  buyers,
  onSelect,
  onClose,
  onAddAndSelect,
}) => {
  const { write } = useData();
  const [search, setSearch] = useState("");
  const [newBuyerName, setNewBuyerName] = useState("");
  const [adding, setAdding] = useState(false);

  // Rename states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const searchLower = search.toLowerCase().trim();
  const filtered = buyers
    .filter((b) => b.nickname.toLowerCase().includes(searchLower))
    .sort((a, b) => {
      if (!searchLower) return a.nickname.localeCompare(b.nickname);
      
      const aLower = a.nickname.toLowerCase();
      const bLower = b.nickname.toLowerCase();
      
      const aExact = aLower === searchLower;
      const bExact = bLower === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = aLower.startsWith(searchLower);
      const bStarts = bLower.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.nickname.localeCompare(b.nickname);
    });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerName.trim()) return;
    setAdding(true);
    await onAddAndSelect(newBuyerName.trim());
    setNewBuyerName("");
    setAdding(false);
  };

  const handleSaveRename = async (
    b: any,
    nameVal: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!nameVal.trim()) return;
    await write("buyers", "update", {
      ...b,
      nickname: nameVal.trim(),
    });
    setEditingId(null);
  };

  return (
    <div className="inset-0 absolute glass-panel backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel border border-divider rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scaleUp">
        {/* Header picker segment */}
        <div className="px-5 py-4 bg-gradient-to-b from-zinc-950 to-zinc-900 border-b border-divider flex justify-between items-center select-none">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-main">
            Wholesale Buyers Directory
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-2 text-[10.5px] font-mono font-bold glass-panel border border-divider hover:bg-panel-hover rounded-[24px] text-muted hover:text-main cursor-pointer select-none"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Directory search filter box */}
        <div className="px-5 py-3 border-b border-divider select-none">
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                if (filtered.length > 0) {
                  onSelect(filtered[0]);
                } else if (search.trim().length > 0) {
                  const cleanName = search.trim();
                  setAdding(true);
                  await onAddAndSelect(cleanName);
                  setSearch("");
                  setAdding(false);
                }
              }
            }}
            placeholder="🔍 Type and press Enter to select or add..."
            className="w-full text-xs font-semibold glass-panel text-main p-2.5 rounded-[24px] border border-divider focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Scrollable list content */}
        <div className="flex-grow overflow-y-auto p-4 divide-y divide-zinc-800/60">
          {filtered.map((b) => {
            const hasOverLimit =
              (b.lifetime_debt || 0) >= (b.credit_limit || 100000);
            const isEditingThis = editingId === b.id;
            return (
              <div
                key={b.id}
                onClick={() => {
                  if (!isEditingThis) onSelect(b);
                }}
                className="py-3 px-2 flex justify-between items-center cursor-pointer hover:bg-panel-hover rounded-[24px] transition duration-150 group"
              >
                <div className="flex-grow mr-2">
                  {isEditingThis ? (
                    <div
                      className="flex gap-1.5 items-center mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value.toUpperCase())}
                        className="glass-panel text-main text-xs p-1.5 rounded border border-divider font-sans w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(b, editingName, e)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-main text-[9.5px] font-bold rounded"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="px-2 py-1 bg-panel-hover text-muted text-[9.5px] rounded"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-extrabold text-main group-hover:text-amber-500 transition-colors uppercase flex items-center gap-1.5">
                        <span>{b.nickname}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(b.id);
                            setEditingName(b.nickname);
                          }}
                          className="p-1 text-faint hover:text-main text-[9.5px] font-normal lowercase font-sans cursor-pointer"
                          title="Rename this buyer"
                        >
                          ✏️ rename
                        </button>
                      </div>
                      <div className="text-[10px] text-faint font-mono mt-1 flex items-center gap-2">
                        <span>
                          Owed:{" "}
                          <strong>
                            ₹{Math.round(b.lifetime_debt || 0).toLocaleString()}
                          </strong>
                        </span>
                        <span className="opacity-45">|</span>
                        <span>
                          Limit: ₹
                          {Math.round(
                            b.credit_limit || 100000,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-1.5 select-none shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {hasOverLimit && (
                    <span className="text-[8px] bg-red-500/10 border border-red-500/30 text-rose-500 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight uppercase">
                      Debt Limit Reached
                    </span>
                  )}
                  <div
                    onClick={() => {
                      if (!isEditingThis) onSelect(b);
                    }}
                    className="p-1.5 glass-panel border border-divider rounded-[24px] text-muted group-hover:text-amber-500 group-hover:border-amber-500/30 transition shadow-inner"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-faint text-xs font-semibold select-none space-y-4">
              <div>No registered buyer matches "{search}".</div>
              {search.trim().length > 0 && (
                <button
                  type="button"
                  onClick={async () => {
                    const cleanName = search.trim();
                    setAdding(true);
                    await onAddAndSelect(cleanName);
                    setSearch("");
                    setAdding(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-main text-xs font-black rounded-[24px] transition duration-150 inline-flex items-center gap-1.5 shadow cursor-pointer select-none"
                >
                  ➕ Create & Select "{search.trim()}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
