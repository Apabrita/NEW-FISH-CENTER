/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import {
  PlusCircle,
  Search,
  User,
  CreditCard,
  ChevronRight,
  Check,
  X,
  ShieldAlert,
  CheckSquare,
  RefreshCcw,
  DollarSign,
  Award,
} from "lucide-react";
import { User as DbUser } from "../db";

interface BuyerPanelProps {
  activeUser: DbUser | null;
  isAuthenticated: boolean;
}

export const BuyerPanel: React.FC<BuyerPanelProps> = ({
  activeUser,
  isAuthenticated,
}) => {
  const { data, write, appDate } = useData();
  const [showAddBuyerForm, setShowAddBuyerForm] = useState(false);

  // New Buyer Form States
  const [buyerNickname, setBuyerNickname] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  // Selected Buyer details and edit state
  const [selectedBuyerId, setSelectedBuyerId] = useState<
    string | number | null
  >(null);
  const [editNickname, setEditNickname] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCreditLimit, setEditCreditLimit] = useState("");

  // Daily Collection Form States
  const [collectBuyerId, setCollectBuyerId] = useState("");
  const [collectAmount, setCollectAmount] = useState("");
  const [collectDate, setCollectDate] = useState(appDate);

  // Sync collectDate with appDate when appDate changes
  React.useEffect(() => {
    setCollectDate(appDate);
  }, [appDate]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");

  const buyers = data?.buyers || [];

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerNickname || !creditLimit) return;

    const limitNum = parseFloat(creditLimit);
    const newBuyer = {
      id: `temp_b_${Date.now()}`,
      nickname: buyerNickname,
      lifetime_debt: 0,
      credit_limit: limitNum,
    };

    await write("buyers", "insert", newBuyer);

    setBuyerNickname("");
    setCreditLimit("");
    setShowAddBuyerForm(false);
  };

  const handleSelectBuyer = (b: any) => {
    setSelectedBuyerId(b.id === selectedBuyerId ? null : b.id);
    setEditNickname(b.nickname || "");
    setEditMobile(b.mobile || "");
    setEditCreditLimit(String(b.credit_limit || 100000));
  };

  const handleSaveBuyerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyerId) return;
    const b = buyers.find((x) => x.id === selectedBuyerId);
    if (!b) return;

    const updated = {
      ...b,
      nickname: editNickname.trim(),
      mobile: editMobile.trim(),
      credit_limit: parseFloat(editCreditLimit) || 100000,
    };

    await write("buyers", "update", updated);
    alert("Buyer profile context saved successfully!");
  };

  // Filter, determine 'today' buyers, and sort
  const todayBuyerIds = new Set(
    (data?.transactions || [])
      .filter((t) => t.date === appDate)
      .map((t) => String(t.buyer_id)),
  );

  const filteredBuyers = buyers
    .filter((b) => b.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aToday = todayBuyerIds.has(String(a.id));
      const bToday = todayBuyerIds.has(String(b.id));
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;
      return a.nickname.localeCompare(b.nickname);
    });

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`buyerlist-letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Derive active selected buyer variables
  const selectedBuyer = buyers.find(
    (x) => String(x.id) === String(selectedBuyerId),
  );
  const buyerTxns = selectedBuyer
    ? (data?.transactions || []).filter(
        (t) => String(t.buyer_id) === String(selectedBuyer.id),
      )
    : [];
  const buyerCollections = selectedBuyer
    ? (data?.daily_collections || []).filter(
        (c) => String(c.buyer_id) === String(selectedBuyer.id),
      )
    : [];

  const totalBoughtWeight = buyerTxns.reduce(
    (sum, t) => sum + (t.weight || 0),
    0,
  );
  const totalBoughtValue = buyerTxns.reduce(
    (sum, t) => sum + (t.total_price || t.weight * t.price_per_kg || 0),
    0,
  );
  const totalPaidApproved = buyerCollections
    .filter((c) => c.is_approved)
    .reduce((sum, c) => sum + (c.amount_paid || 0), 0);

  const todayBoughtValue = buyerTxns
    .filter((t) => t.date === appDate)
    .reduce(
      (sum, t) => sum + (t.total_price || t.weight * t.price_per_kg || 0),
      0,
    );
  const todayPaidApproved = buyerCollections
    .filter((c) => c.date === appDate && c.is_approved)
    .reduce((sum, c) => sum + (c.amount_paid || 0), 0);
  const todayOwed = Math.max(0, todayBoughtValue - todayPaidApproved);

  const dailyCollections = (data?.daily_collections || []).filter(
    (c: any) => c.date === appDate,
  );

  const isAdmin = activeUser?.role === "admin" && isAuthenticated;
  const isAuthorizedToCollect =
    isAuthenticated &&
    (activeUser?.role === "admin" || activeUser?.role === "collector");

  return (
    <div className="space-y-6" id="buyers-collections-panel">
      {/* Dynamic stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel border border-divider p-5 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-[24px]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-faint font-medium font-sans">
                Total Outstanding Buyer Debts
              </div>
              <div className="text-lg font-bold font-mono text-main">
                ₹{" "}
                {buyers
                  .reduce((sum, b) => sum + (b.lifetime_debt || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel border border-divider p-5 rounded-[24px] flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-[24px]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-faint font-medium font-sans">
                Pending Approvals
              </div>
              <div className="text-lg font-bold font-mono text-amber-700">
                {dailyCollections.filter((c) => !c.is_approved).length} Receipts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer actions block */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-panel-dark backdrop-blur-sm border border-divider/80 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full sm:max-w-xs transition-all duration-300 focus-within:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search buyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full text-sm text-main glass-panel border border-divider rounded-[24px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow duration-200"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
          {/* Add Buyer Button */}
          <button
            onClick={() => {
              if (!isAdmin) {
                alert(
                  "Only authenticated Administrators can add system buyers!",
                );
                return;
              }
              setShowAddBuyerForm(!showAddBuyerForm);
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-[24px] shadow-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
              isAdmin
                ? showAddBuyerForm
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "bg-panel-hover hover:glass-panel text-main"
                : "bg-panel-hover text-muted border border-divider cursor-not-allowed"
            }`}
            id="btn-add-buyer"
          >
            {showAddBuyerForm ? (
              <Check className="w-4 h-4" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            Add Buyer
          </button>
        </div>
      </div>

      {/* Forms Drawer: Add Buyer */}
      {showAddBuyerForm && (
        <form
          onSubmit={handleAddBuyer}
          className="glass-panel border border-divider relative p-6 rounded-3xl space-y-5 animate-slideDown shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="absolute top-0 right-0 p-4">
            <button
              type="button"
              onClick={() => setShowAddBuyerForm(false)}
              className="text-muted hover:text-faint transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 pb-3 border-b border-divider">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <User className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.1em] text-main font-sans">
              Register New Buyer Profile
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-sans font-bold text-faint uppercase tracking-wider block">
                Buyer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={buyerNickname}
                onChange={(e) => setBuyerNickname(e.target.value)}
                placeholder="e.g. Moni Fish Co."
                required
                className="w-full text-sm text-main bg-panel-dark border border-divider rounded-[24px] p-3 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-muted"
                id="form-buyer-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-sans font-bold text-faint uppercase tracking-wider block">
                Credit Limit (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-muted font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="150000"
                  required
                  className="w-full text-sm font-mono text-main bg-panel-dark border border-divider rounded-[24px] py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-muted"
                  id="form-buyer-credit"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-main text-sm font-bold rounded-[16px] shadow-lg shadow-teal-500/30 transition-all duration-200 cursor-pointer flex items-center gap-2"
              id="btn-save-buyer"
            >
              <Check className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Main Content stacked */}
      <div className="flex flex-col gap-6 w-full">
        {/* Buyer List Panel - Full width */}
        <div className="glass-panel border border-divider rounded-[24px] overflow-hidden shadow-sm flex flex-col w-full">
          <div className="px-5 py-4 glass-panel border-b border-divider">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-main">
              Arat Buyers Accounts
            </h4>
          </div>
          <div className="divide-y divide-zinc-100 flex-grow max-h-[500px] overflow-y-auto relative pr-6 custom-scrollbar">
            {filteredBuyers.length === 0 ? (
              <div className="p-8 text-center text-muted text-xs">
                No buyers found.
              </div>
            ) : (
              filteredBuyers.map((b, index, arr) => {
                const percentage = Math.min(
                  100,
                  Math.round(
                    ((b.lifetime_debt || 0) / (b.credit_limit || 1)) * 100,
                  ),
                );
                const limitWarning = percentage > 85;
                const isSelected = b.id === selectedBuyerId;
                const isToday = todayBuyerIds.has(String(b.id));
                const isFirstOfInitial =
                  index === 0 ||
                  b.nickname[0].toUpperCase() !==
                    arr[index - 1].nickname[0].toUpperCase();

                return (
                  <React.Fragment key={b.id}>
                    {isFirstOfInitial && !isToday && (
                      <div
                        id={`buyerlist-letter-${b.nickname[0].toUpperCase()}`}
                        className="px-5 py-1 text-faint font-bold text-[10px] glass-panel border-b border-divider"
                      >
                        {b.nickname[0].toUpperCase()}
                      </div>
                    )}
                    <div
                      onClick={() => handleSelectBuyer(b)}
                      className={`p-4 transition duration-150 space-y-2 cursor-pointer border-l-4 ${
                        isSelected
                          ? "bg-teal-50/40 border-teal-600 font-semibold"
                          : isToday
                            ? "bg-teal-900/5 hover:bg-teal-900/10 border-l-transparent"
                            : "hover:glass-panel border-l-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-teal-50 text-teal-600 rounded-[24px] flex items-center justify-center font-bold text-xs">
                            {b.nickname.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-main flex items-center gap-2">
                              {b.nickname}
                              {isToday && (
                                <span className="bg-teal-500 text-teal-950 text-[8px] px-1.5 font-bold rounded-sm uppercase tracking-wider">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-faint font-mono">
                              ID: {String(b.id).substring(0, 8)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-main font-mono">
                          ₹ {b.lifetime_debt.toLocaleString()}
                        </span>
                      </div>

                      {/* Credit Gauge bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-faint uppercase tracking-wider font-semibold">
                          <span>Debt Ratio: {percentage}%</span>
                          <span>Limit: ₹{b.credit_limit.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-panel-hover rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              limitWarning
                                ? "bg-rose-500 font-bold"
                                : "bg-teal-500"
                            }`}
                          ></div>
                        </div>
                        {limitWarning && (
                          <div className="text-[9px] text-rose-500 font-semibold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>
                              Close to credit ceiling limit! Lock sales.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            {/* A-Z fast scroller */}
            {filteredBuyers.length > 0 && (
              <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center text-[9px] font-bold text-muted gap-0.5 z-10 p-1 bg-panel-dark backdrop-blur-sm">
                {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter) => (
                  <div
                    key={letter}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToLetter(letter);
                    }}
                    className="cursor-pointer hover:text-teal-600 hover:scale-125 transition-transform text-center"
                  >
                    {letter}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conditional stacked detail view vs selected buyer ledger */}
        {selectedBuyerId && selectedBuyer ? (
          <div className="glass-panel border border-divider rounded-[24px] overflow-hidden shadow-sm flex flex-col animate-scaleUp w-full">
            {/* Dossier Header */}
            <div className="px-5 py-4 glass-panel border-b border-divider flex justify-between items-center select-none">
              <div>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-main">
                  Client Profile: {selectedBuyer.nickname}
                </h4>
                <p className="text-[10px] text-muted font-mono">
                  Member ID: {selectedBuyer.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBuyerId(null)}
                className="px-3 py-1.5 text-[10.5px] uppercase font-bold bg-panel-dark hover:bg-panel-dark text-main rounded-[24px] transition shrink-0 select-none cursor-pointer flex items-center gap-1"
              >
                ← Back to ledger
              </button>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
              {/* Profile Fields form for Admin info */}
              <form
                onSubmit={handleSaveBuyerDetails}
                className="glass-panel border border-divider p-5 rounded-3xl space-y-5 shadow-sm"
              >
                <div className="border-b border-divider pb-3 flex justify-between items-center select-none">
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-teal-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-600" /> Buyer Information
                  </h5>
                  <span className="text-[9px] font-black text-muted bg-panel-hover px-2 py-0.5 rounded-full border border-divider font-sans tracking-wide">
                    ADMIN EDIT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold text-faint uppercase tracking-widest block select-none">
                      Name (নাম)
                    </label>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="Haji Mohammad Ali"
                      className="w-full text-sm text-main bg-panel-dark border border-divider rounded-[24px] p-3 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-sans placeholder:text-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold text-faint uppercase tracking-widest block select-none">
                      Mobile Number (মোবাইল)
                    </label>
                    <input
                      type="text"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      placeholder="+880 1888-999000"
                      className="w-full text-sm font-mono text-main bg-panel-dark border border-divider rounded-[24px] p-3 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold text-faint uppercase tracking-widest block select-none">
                      Credit Limit (ঋণ সীমা)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-muted font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={editCreditLimit}
                        onChange={(e) => setEditCreditLimit(e.target.value)}
                        className="w-full text-sm font-mono text-main bg-panel-dark border border-divider rounded-[24px] py-3 pl-8 pr-4 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-muted"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-5 py-3 bg-teal-600 hover:bg-teal-700 text-main rounded-[24px] text-xs font-black tracking-wide cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 select-none"
                  >
                    <Check className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 select-none">
                <div className="bg-rose-50/10 border border-rose-150 p-3 rounded-[24px] flex flex-col justify-between">
                  <span className="text-[9px] text-rose-500 block font-semibold uppercase tracking-wider font-sans">
                    Owe Us For Today
                  </span>
                  <span className="text-sm font-bold font-mono text-rose-600 block mt-1">
                    ₹{Math.round(todayOwed).toLocaleString()}
                  </span>
                </div>
                <div className="bg-rose-50/10 border border-rose-150 p-3 rounded-[24px] flex flex-col justify-between">
                  <span className="text-[9px] text-rose-500 block font-semibold uppercase tracking-wider font-sans">
                    Outstanding Debt (Ledger)
                  </span>
                  <span className="text-sm font-bold font-mono text-rose-600 block mt-1">
                    ₹
                    {Math.round(
                      selectedBuyer.lifetime_debt || 0,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-main border-b border-zinc-150 pb-1.5 flex justify-between items-center font-sans select-none">
                  <span>Recent Auction Records</span>
                  <span className="text-[9px] text-muted font-normal select-none">
                    Total {buyerTxns.length} entries
                  </span>
                </h5>
                <div className="max-h-[160px] overflow-y-auto border border-divider rounded-[24px] divide-y divide-zinc-100 custom-scrollbar">
                  {buyerTxns.length === 0 ? (
                    <div className="p-6 text-center text-muted text-xs py-8 select-none">
                      No fish purchased in recent auctions.
                    </div>
                  ) : (
                    [...buyerTxns].reverse().map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 px-3 flex justify-between items-center text-xs font-sans hover:bg-panel-dark"
                      >
                        <div>
                          <div className="font-bold text-main font-sans">
                            {t.fish_type}
                          </div>
                          <div className="text-[9.5px] text-faint font-mono">
                            Date: {t.date}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="font-mono font-bold text-main">
                            ₹{t.total_price.toLocaleString()}
                          </div>
                          <div className="text-[9.5px] text-faint font-mono">
                            {t.weight} kg @ ₹{t.price_per_kg}/kg
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Collections History HIDDEN AS REQUESTED */}
              {/*
              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-main border-b border-zinc-150 pb-1.5 flex justify-between items-center font-sans select-none">
                  <span>Receipts & Daily Collections Log</span>
                  <span className="text-[9px] text-muted font-normal select-none font-sans font-sans">Total {buyerCollections.length} pays</span>
                </h5>
                <div className="max-h-[160px] overflow-y-auto border border-divider rounded-[24px] divide-y divide-zinc-100 custom-scrollbar font-sans">
                  {buyerCollections.length === 0 ? (
                    <div className="p-6 text-center text-muted text-xs py-8 font-sans select-none">No collections registered for this buyer.</div>
                  ) : (
                    [...buyerCollections].reverse().map((col) => (
                      <div key={col.id} className="p-2.5 px-3 flex justify-between items-center text-xs hover:bg-panel-dark font-sans">
                        <div>
                          <span className="text-[9.5px] text-muted font-mono block select-none">{col.date}</span>
                          <span className={`text-[10px] font-bold block ${col.is_approved ? "text-teal-600" : col.is_rolled_over ? "text-amber-500" : "text-faint"}`}>
                            {col.is_approved ? "✅ Approved by Admin" : col.is_rolled_over ? "🔁 Rolled Over in Session" : "⏳ Pending review"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-main text-emerald-800">₹{col.amount_paid.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              */}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
