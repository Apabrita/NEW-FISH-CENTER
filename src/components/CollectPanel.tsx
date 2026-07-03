/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../contexts/DataContext";
import { User as DbUser } from "../db";
import {
  PlusCircle,
  Landmark,
  CheckCircle,
  Clock,
  User,
  ShieldCheck,
  Percent,
  RefreshCw,
  TrendingDown,
  Calculator,
  Search,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  X,
} from "lucide-react";

import { triggerHaptic } from "../utils/haptics";

interface CollectPanelProps {
  activeUser: DbUser | null;
  isAuthenticated: boolean;
}

export const CollectPanel: React.FC<CollectPanelProps> = ({
  activeUser,
  isAuthenticated,
}) => {
  const { data, write, appDate } = useData();

  const [showForm, setShowForm] = useState(true); // default to open for direct floor use

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  // Ledger search for existing list
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Form states
  const [buyerId, setBuyerId] = useState("");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [collectionDate, setCollectionDate] = useState(appDate);

  // Sync collectionDate with appDate when appDate changes
  React.useEffect(() => {
    setCollectionDate(appDate);
  }, [appDate]);
  const [editingCollectionId, setEditingCollectionId] = useState<
    string | number | null
  >(null);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);

  // Fast scroll to letter
  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`buyer-letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buyers = data?.buyers || [];
  const collections = (data?.daily_collections || []).filter(
    (c: any) => c.date === appDate,
  );

  // Determine who bought today
  const transactions = data?.transactions || [];
  const todayBuyerIds = new Set(
    transactions
      .filter((t) => t.date === appDate)
      .map((t) => String(t.buyer_id)),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerId || !amountPaidInput) {
      alert("Please fill in the collection amount and select a buyer.");
      return;
    }

    const payAmount = parseFloat(amountPaidInput);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert("Please enter a valid monetary amount.");
      return;
    }

    const selectedBuyer = buyers.find((b) => b.id === buyerId);
    if (!selectedBuyer) return;

    if (editingCollectionId) {
      // Modifying an existing collection ledger row
      const oldCol = collections.find((c) => c.id === editingCollectionId);
      if (oldCol) {
        const updatedCollection = {
          ...oldCol,
          amount_paid: payAmount,
          date: collectionDate,
          created_at: oldCol.created_at || new Date().toLocaleString(),
        };
        await write("daily_collections", "update", updatedCollection);
      }
      setEditingCollectionId(null);
    } else {
      // Find if an unapproved collection for this buyer already exists today on this date
      const existingDraft = collections.find(
        (c) =>
          String(c.buyer_id) === String(buyerId) &&
          c.date === collectionDate &&
          !c.is_approved,
      );
      
      const isAdmin = activeUser?.role === "admin";

      if (existingDraft) {
        if (isAdmin) {
          const updated = {
            ...existingDraft,
            amount_paid: payAmount,
            is_approved: true,
            created_at: existingDraft.created_at || new Date().toLocaleString(),
          };
          const updatedBuyer = {
            ...selectedBuyer,
            lifetime_debt: Math.max(0, (selectedBuyer.lifetime_debt || 0) - payAmount),
          };
          // Write both independently since writeBatch might not be in scope or we can just await write twice
          await write("daily_collections", "update", updated);
          await write("buyers", "update", updatedBuyer);
        } else {
          const updated = {
            ...existingDraft,
            amount_paid: payAmount,
            created_at: existingDraft.created_at || new Date().toLocaleString(),
          };
          await write("daily_collections", "update", updated);
        }
      } else {
        const newCollection = {
          id: `temp_col_${Date.now()}`,
          buyer_id: buyerId,
          date: collectionDate,
          total_owed_today: selectedBuyer.lifetime_debt,
          amount_paid: payAmount,
          is_rolled_over: false,
          is_approved: isAdmin,
          created_at: new Date().toLocaleString(),
        };
        
        if (isAdmin) {
          const updatedBuyer = {
            ...selectedBuyer,
            lifetime_debt: Math.max(0, (selectedBuyer.lifetime_debt || 0) - payAmount),
          };
          await write("daily_collections", "insert", newCollection);
          await write("buyers", "update", updatedBuyer);
        } else {
          await write("daily_collections", "insert", newCollection);
        }
      }
    }

    triggerHaptic("success");
    setIsSuccessAnimated(true);
    setTimeout(() => setIsSuccessAnimated(false), 500);

    // Reset Form
    setBuyerId("");
    setAmountPaidInput("");
    setSearchQuery("");
    setShowForm(true);
  };

  const handleApprove = async (colId: string | number) => {
    if (!activeUser || !isAuthenticated || activeUser.role !== "admin") {
      alert(
        "Only an authenticated Administrator operator can approve daily collection sheets!",
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to approve this collection to the vault? This will officially deduct the buyer's outstanding debt.",
      )
    )
      return;

    const col = collections.find((c) => String(c.id) === String(colId));
    if (!col) return;

    // Reduce buyer lifetime debt
    const buyer = buyers.find((b) => String(b.id) === String(col.buyer_id));
    if (buyer) {
      const updatedBuyer = {
        ...buyer,
        lifetime_debt: Math.max(
          0,
          (buyer.lifetime_debt || 0) - (col.amount_paid || 0),
        ),
      };
      await write("buyers", "update", updatedBuyer);
    }

    // Update approval status
    const updatedCollection = {
      ...col,
      is_approved: true,
    };
    await write("daily_collections", "update", updatedCollection);
  };

  const handleDeleteDraft = async (colId: string | number) => {
    if (!activeUser || !isAuthenticated || activeUser.role !== "admin") {
      alert("Only authenticated Administrators can prune drafts.");
      return;
    }
    if (
      !window.confirm("Are you sure you want to delete this collection draft?")
    )
      return;
    await write("daily_collections", "delete", { id: colId });
  };

  const isAuthorizedToLog =
    isAuthenticated &&
    (activeUser?.role === "admin" || activeUser?.role === "collector");
  const isAdmin = isAuthenticated && activeUser?.role === "admin";

  // Calculate key metrics
  const totalCollectionsToday = collections.reduce(
    (sum, c) => sum + (c.amount_paid || 0),
    0,
  );
  const todaysSales = transactions
    .filter((t) => t.date === appDate)
    .reduce((sum, t) => sum + (t.total_price || 0), 0);
  const todaysOutstanding = todaysSales - totalCollectionsToday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Overview summaries - Compact Single Box */}
      <div className="glass-panel border border-divider rounded-[24px] p-3 shadow-md overflow-x-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 min-w-[600px] divide-x divide-zinc-800/60">
          {/* Total Collections Today */}
          <div className="flex items-center space-x-3 px-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-[16px] shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] text-[#3b82f6] font-sans font-black uppercase tracking-wider">
                Total Collection
              </div>
              <div className="text-sm font-black font-mono text-blue-400 mt-0.5 leading-none">
                ₹ {totalCollectionsToday.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Approved Collections Column */}
          <div className="flex items-center space-x-3 px-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-[16px] shrink-0">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] text-[#22c55e] font-sans font-black uppercase tracking-wider">
                Approved Collections
              </div>
              <div className="text-sm font-black font-mono text-emerald-500 mt-0.5 leading-none">
                ₹{" "}
                {collections
                  .filter((c) => c.is_approved)
                  .reduce((sum, c) => sum + (c.amount_paid || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          {/* Unapproved / Drafts Column */}
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-[16px] shrink-0">
                <Clock className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <div className="text-[9px] text-amber-550 text-amber-500 font-sans font-black uppercase tracking-wider flex items-center gap-1.5">
                  Unapproved Drafts
                </div>
                <div className="text-sm font-black font-mono text-amber-500 mt-0.5 leading-none">
                  ₹{" "}
                  {collections
                    .filter((c) => !c.is_approved)
                    .reduce((sum, c) => sum + (c.amount_paid || 0), 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Outstanding Balance Column */}
          <div className="flex items-center space-x-3 px-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-[16px] shrink-0">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-[9px] text-[#6366f1] font-sans font-black uppercase tracking-wider">
                Today's Outstanding
              </div>
              <div className="text-sm font-black font-mono text-indigo-500 mt-0.5 leading-none">
                ₹ {todaysOutstanding.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations Block: Logging Box & Pending Receipts Grid */}
      <div className="flex flex-col gap-6 w-full">
        {/* Collection Form Panel - Full width */}
        <div className="glass-panel border border-divider rounded-[24px] p-5 shadow-2xl shadow-black/10 space-y-4 w-full">
          <div className="flex items-center justify-between pb-3 border-b border-divider">
            <h3 className="text-xs font-sans font-extrabold uppercase tracking-wider text-main flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-teal-500" /> Book Client Cash
              Collections
            </h3>
            {isAuthorizedToLog && (
              <button
                type="button"
                onClick={() => {
                  setBuyerId("");
                  setAmountPaidInput("");
                  setEditingCollectionId(null);
                  setSearchQuery("");
                }}
                className="text-[10px] uppercase font-mono tracking-wider font-bold text-teal-500 hover:underline cursor-pointer"
              >
                Reset Clear
              </button>
            )}
          </div>

          {!isAuthorizedToLog ? (
            <div className="p-4 bg-panel-dark border border-divider rounded-[24px] text-center text-xs text-muted font-medium">
              🔒 Locked Operator Account. Please authorize your collector or
              administrator PIN first.
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {/* Note about active role */}
              <div className="text-[9.5px] uppercase font-mono text-faint flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Stamped
                Operator: {activeUser?.name} ({activeUser?.role})
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Search / Selection input block - ALWAYS VISIBLE */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <label className="text-muted block font-bold">
                      Search Debtor Account:
                    </label>
                    <span className="text-[9.5px] text-faint uppercase font-mono">
                      Alphabetic Order
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type client's name or nickname..."
                      className="w-full text-xs text-main glass-panel border border-divider rounded-[24px] p-3 pl-9 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <Search className="w-4 h-4 text-faint absolute left-3 top-3.5" />
                  </div>

                  {/* Filtered buyers list with touch selectors */}
                  <div className="relative">
                    <div
                      className="space-y-1.5 max-h-[300px] overflow-y-auto border border-divider rounded-[24px] p-2 glass-panel pr-6 custom-scrollbar"
                      id="buyers-scroll-container"
                    >
                      {buyers
                        .filter(
                          (b) =>
                            searchQuery === "" ||
                            b.nickname
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        )
                        .sort((a, b) => {
                          const aToday = todayBuyerIds.has(String(a.id));
                          const bToday = todayBuyerIds.has(String(b.id));
                          if (aToday && !bToday) return -1;
                          if (!aToday && bToday) return 1;
                          return a.nickname.localeCompare(b.nickname);
                        })
                        .map((b, index, arr) => {
                          const isFirstOfInitial =
                            index === 0 ||
                            b.nickname[0].toUpperCase() !==
                              arr[index - 1].nickname[0].toUpperCase();
                          const isToday = todayBuyerIds.has(String(b.id));

                          return (
                            <React.Fragment key={b.id}>
                              {isFirstOfInitial && !isToday && (
                                <div
                                  id={`buyer-letter-${b.nickname[0].toUpperCase()}`}
                                  className="px-2 py-1 text-faint font-bold text-[10px] mt-2"
                                >
                                  {b.nickname[0].toUpperCase()}
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setBuyerId(String(b.id));
                                  setSearchQuery("");
                                }}
                                className={`w-full text-left p-2.5 rounded-[24px] transition flex justify-between items-center border ${
                                  isToday
                                    ? "bg-teal-900/20 border-teal-800/30 hover:bg-teal-900/30"
                                    : "bg-transparent border-transparent hover:glass-panel hover:border-divider"
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-main truncate pr-2 flex items-center gap-2">
                                    {b.nickname}
                                    {isToday && (
                                      <span className="bg-teal-500 text-teal-950 text-[8px] px-1.5 font-bold rounded-sm uppercase tracking-wider">
                                        Today
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-teal-500 text-muted shrink-0 glass-panel px-2 py-0.5 rounded border border-divider">
                                  Owed: ₹{b.lifetime_debt.toLocaleString()}
                                </span>
                              </button>
                            </React.Fragment>
                          );
                        })}
                      {buyers.filter(
                        (b) =>
                          searchQuery === "" ||
                          b.nickname
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      ).length === 0 && (
                        <div className="text-center py-6 text-[11px] text-faint font-medium">
                          No matching active debtors found.
                        </div>
                      )}
                    </div>

                    {/* A-Z fast scroller */}
                    <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center text-[7px] font-bold text-faint gap-0.5">
                      {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(
                        (letter) => (
                          <div
                            key={letter}
                            onClick={() => scrollToLetter(letter)}
                            className="cursor-pointer hover:text-teal-500 text-center px-1 py-0.5"
                          >
                            {letter}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* MODAL FOR COLLECTION ENTRY */}
                <AnimatePresence>
                  {buyerId &&
                    (() => {
                      const selectedBuyer = buyers.find(
                        (b) => String(b.id) === String(buyerId),
                      );
                      if (!selectedBuyer) return null;
                      return (
                        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-sm p-2 sm:p-0">
                          <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{
                              type: "spring",
                              damping: 25,
                              stiffness: 300,
                            }}
                            className="w-full sm:max-w-md glass-panel border border-divider rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[95vh] overflow-y-auto"
                          >
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <div className="text-[10px] text-faint font-bold uppercase tracking-wider">
                                  Collecting from
                                </div>
                                <div className="text-sm font-black text-main">
                                  {selectedBuyer.nickname}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setBuyerId("");
                                  setAmountPaidInput("");
                                  setEditingCollectionId(null);
                                }}
                                className="w-8 h-8 flex items-center justify-center glass-panel border border-divider text-muted hover:text-main rounded-full transition cursor-pointer shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="bg-panel-dark border border-divider rounded-[16px] p-2.5">
                                <div className="text-[9px] text-faint uppercase font-bold tracking-wider mb-1">
                                  Lifetime Debt
                                </div>
                                <div className="font-mono font-black text-rose-500 text-sm">
                                  ₹
                                  {(
                                    selectedBuyer.lifetime_debt || 0
                                  ).toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-panel-dark border border-divider rounded-[16px] p-2.5">
                                <div className="text-[9px] text-faint uppercase font-bold tracking-wider mb-1">
                                  Today's Sales
                                </div>
                                <div className="font-mono font-black text-amber-500 text-sm">
                                  ₹
                                  {transactions
                                    .filter(
                                      (t) =>
                                        String(t.buyer_id) ===
                                          String(selectedBuyer.id) &&
                                        t.date === appDate,
                                    )
                                    .reduce(
                                      (sum, t) => sum + (t.total_price || 0),
                                      0,
                                    )
                                    .toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {/* Quick Full Payment Button */}
                            {selectedBuyer.lifetime_debt > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAmountPaidInput(
                                    selectedBuyer.lifetime_debt.toString(),
                                  );
                                }}
                                className="w-full py-2.5 px-3 mb-4 bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500/20 rounded-[16px] font-bold text-xs cursor-pointer transition flex justify-between items-center"
                              >
                                <span>⚡ Full Payment</span>
                                <span className="font-mono text-sm">
                                  ₹
                                  {selectedBuyer.lifetime_debt.toLocaleString()}
                                </span>
                              </button>
                            )}

                            <div className="space-y-1 relative mb-4">
                              <label className="text-[10px] font-bold text-faint uppercase tracking-wider block mb-1">
                                Amount Paid (₹)
                              </label>
                              <input
                                type="number"
                                value={amountPaidInput}
                                onChange={(e) => setAmountPaidInput(e.target.value)}
                                placeholder="0"
                                className="w-full text-2xl text-teal-500 glass-panel border border-divider rounded-[24px] py-3 px-4 focus:outline-none focus:border-teal-500 font-mono font-black text-right shadow-inner placeholder:text-main"
                                required
                              />

                              <div className="flex gap-2 mt-4">
                                <button
                                  type="submit"
                                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-[16px] font-bold shadow-lg flex items-center justify-center gap-2"
                                >
                                  <PlusCircle className="w-5 h-5" />
                                  <span className="uppercase tracking-wider">Save Collection</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })()}
                </AnimatePresence>
              </form>
            </div>
          )}
        </div>

        {/* Collections Ledger Audit List - Full width */}
        <div className="glass-panel border border-divider rounded-[24px] p-5 shadow-2xl shadow-black/10 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-divider gap-2.5">
            <div className="space-y-0.5">
              <h3 className="text-xs font-sans font-extrabold uppercase tracking-wider text-main">
                Collections Audit & Approvals
              </h3>
              <p className="text-[10px] text-faint">
                Outstanding cash receipts queued in system ledger
              </p>
            </div>

            {/* Search option on the collection history ledger list too */}
            <div className="relative">
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search ledger..."
                className="text-[10px] text-main glass-panel border border-divider rounded-[24px] p-1.5 pl-7 focus:outline-none focus:ring-1 focus:ring-teal-500 w-full sm:w-40 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-faint absolute left-2 top-2" />
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-20 bg-panel-dark rounded-[24px] border border-dashed border-divider text-faint text-xs text-muted">
              No collection logs registered in the physical database yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {collections
                  .filter((col) => {
                    if (!ledgerSearch) return true;
                    const buyer = buyers.find(
                      (b) =>
                        String(b.id).trim().toLowerCase() ===
                        String(col.buyer_id).trim().toLowerCase(),
                    );
                    return (buyer?.nickname || (buyer as any)?.name || "")
                      .toLowerCase()
                      .includes(ledgerSearch.toLowerCase());
                  })
                  .map((col) => {
                    const buyer = buyers.find(
                      (b) =>
                        String(b.id).trim().toLowerCase() ===
                        String(col.buyer_id).trim().toLowerCase(),
                    );
                    return (
                      <motion.div
                        key={col.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="glass-panel border border-divider p-3 rounded-[24px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-main">
                              {buyer
                                ? buyer.nickname ||
                                  (buyer as any).name ||
                                  (buyer as any).fullname
                                : !String(col.buyer_id).startsWith("temp_")
                                  ? col.buyer_id
                                  : "Unknown Buyer"}
                            </span>
                            {col.is_approved ? (
                              <span className="text-[9px] bg-emerald-950/50 text-emerald-500 border border-emerald-900/40 px-1.5 py-0.5 rounded-full uppercase font-mono font-bold">
                                Approved
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-950/50 text-amber-500 border border-amber-900/30 px-1.5 py-0.5 rounded-full uppercase font-mono font-semibold animate-pulse">
                                Pending Approval
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-faint font-mono flex flex-wrap gap-x-2">
                            <span>Date: {col.date}</span>
                            {col.created_at && (
                              <>
                                <span>•</span>
                                <span className="text-teal-500">
                                  Time: {col.created_at}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              Draft ID: #{String(col.id).substring(0, 8)}
                            </span>
                          </div>

                          <div className="text-[11px] font-bold text-muted">
                            Amount Paid:{" "}
                            <span className="text-teal-500 font-mono font-black">
                              ₹{(col.amount_paid || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Approvals and Rollovers triggers */}
                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          {(!col.is_approved || isAdmin) && (
                            <button
                              onClick={() => {
                                setBuyerId(String(col.buyer_id));
                                setAmountPaidInput(String(col.amount_paid));
                                setCollectionDate(col.date);
                                setEditingCollectionId(col.id);
                                setShowForm(true);
                              }}
                              className="px-2.5 py-1.5 rounded-[24px] text-[10px] font-bold bg-indigo-950/40 border border-indigo-900/40 text-indigo-500 hover:bg-indigo-950/80 transition cursor-pointer"
                              title="Edit booked cash amount"
                            >
                              Edit
                            </button>
                          )}
                          {!col.is_approved ? (
                            <>
                              <button
                                onClick={() => handleApprove(col.id)}
                                className={`px-2.5 py-1.5 rounded-[24px] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                                  isAdmin
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-main shadow-sm"
                                    : "glass-panel border border-divider text-faint cursor-not-allowed"
                                }`}
                                title={
                                  isAdmin
                                    ? "Approve cash & deduct debtor balance"
                                    : "Admin credentials required to clear receipt"
                                }
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteDraft(col.id)}
                                  className="px-2 py-1.5 rounded-[24px] text-[10px] glass-panel hover:bg-rose-950/30 text-faint hover:text-rose-500 border border-divider hover:border-rose-900/40 transition cursor-pointer"
                                >
                                  Prune
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {isAdmin && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm("Undo approval? This will revert the buyer's balance reduction.")) {
                                      const buyer = buyers.find((b) => String(b.id) === String(col.buyer_id));
                                      if (buyer) {
                                        const updatedBuyer = {
                                          ...buyer,
                                          lifetime_debt: (buyer.lifetime_debt || 0) + (col.amount_paid || 0),
                                        };
                                        await write("buyers", "update", updatedBuyer);
                                      }
                                      await write("daily_collections", "update", { ...col, is_approved: false });
                                    }
                                  }}
                                  className="px-2 py-1.5 rounded-[24px] text-[10px] bg-amber-950/30 hover:bg-amber-900/50 text-amber-500 border border-amber-900/40 transition cursor-pointer"
                                >
                                  Undo
                                </button>
                              )}
                              <div className="text-[10px] text-emerald-500/80 font-mono flex items-center gap-0.5 bg-emerald-950/10 px-2 py-1 border border-emerald-900/30 rounded-[24px]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                Settled
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
