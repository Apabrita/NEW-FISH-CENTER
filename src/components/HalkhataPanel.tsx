/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../contexts/DataContext";
import { User as DbUser, expandFishType } from "../db";
import {
  FileText,
  Printer,
  ChevronRight,
  TrendingDown,
  User,
  Activity,
  Award,
  BookOpen,
  ShoppingBag,
  Landmark,
  BadgeAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Percent,
  Search,
  Edit2,
  X,
} from "lucide-react";

interface HalkhataPanelProps {
  activeUser: DbUser | null;
  isAuthenticated: boolean;
}

export const HalkhataPanel: React.FC<HalkhataPanelProps> = ({
  activeUser,
  isAuthenticated,
}) => {
  const { data, write, appDate, setAppDate } = useData();
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [showCloseDaySection, setShowCloseDaySection] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [buyerSearchQuery, setBuyerSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const buyers = data?.buyers || [];

  // Synchronize on buyer change
  React.useEffect(() => {
    if (selectedBuyerId) {
      const active = buyers.find((b) => b.id === selectedBuyerId);
      if (active) {
        setBuyerSearchQuery(
          `${active.nickname} (Debt: ₹${active.lifetime_debt.toLocaleString()})`,
        );
      }
    } else {
      setBuyerSearchQuery("");
    }
  }, [selectedBuyerId, buyers]);

  // Handle outside clicks to close search suggestions
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const el = document.getElementById("buyer-search-container");
      if (el && !el.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredBuyers = buyers.filter(
    (b) =>
      (b.nickname || "")
        .toLowerCase()
        .includes(String(buyerSearchQuery).toLowerCase()) ||
      String(b.id || "")
        .toLowerCase()
        .includes(String(buyerSearchQuery).toLowerCase()),
  );
  const transactions = data?.transactions || [];
  const collections = data?.daily_collections || [];
  const sources = data?.sources || [];

  const settings = data?.settings || [];
  const isDayClosed =
    settings.find((s) => s.key === `day_closed_${appDate}`)?.value === "true";

  // Calculations for Close Day
  const sourcePaymentsForDay =
    data?.source_payments?.filter((p) => String(p.date) === String(appDate)) ||
    [];
  const amountPaidToSources = sourcePaymentsForDay.reduce(
    (sum, p) => sum + Number(p.amount_paid_to_source || 0),
    0,
  );

  const collectionsForDay = collections.filter(
    (c) => String(c.date) === String(appDate),
  );
  const amountReceivedFromBuyers = collectionsForDay.reduce(
    (sum, c) => sum + Number(c.amount_paid || 0),
    0,
  );
  const approvedCollectionsForDay = collectionsForDay
    .filter((c) => c.is_approved)
    .reduce((sum, c) => sum + Number(c.amount_paid || 0), 0);
  const pendingCollectionsForDay = collectionsForDay
    .filter((c) => !c.is_approved)
    .reduce((sum, c) => sum + Number(c.amount_paid || 0), 0);

  const salesForDay = transactions.filter(
    (t) => String(t.date) === String(appDate),
  );
  const totalSalesToday = salesForDay.reduce(
    (sum, t) => sum + Number(t.total_price || 0),
    0,
  );
  const amountOwedToUs = Math.max(
    0,
    totalSalesToday - approvedCollectionsForDay,
  );

  // Cash Box Logic
  let storedOpeningCashStr = "0";
  const todaySetting = settings.find(
    (s) => s.key === `cash_box_opening_${appDate}`,
  );
  if (todaySetting) {
    storedOpeningCashStr = todaySetting.value;
  } else {
    // Dynamically calculate from previous day if today's is not explicitly saved yet
    const prevDate = new Date(new Date(appDate).getTime() - 86400000)
      .toISOString()
      .split("T")[0];
    const prevSettingStr =
      settings.find((s) => s.key === `cash_box_opening_${prevDate}`)?.value ||
      "0";
    const prevOpeningCash = parseFloat(prevSettingStr) || 0;

    const prevSourcePayments =
      data?.source_payments?.filter(
        (p) => String(p.date) === String(prevDate),
      ) || [];
    const prevPaidToSources = prevSourcePayments.reduce(
      (sum, p) => sum + Number(p.amount_paid_to_source || 0),
      0,
    );

    const prevCollections = collections.filter(
      (c) => String(c.date) === String(prevDate),
    );
    const prevReceivedFromBuyers = prevCollections
      .filter((c) => c.is_approved)
      .reduce((sum, c) => sum + Number(c.amount_paid || 0), 0);

    const prevClosingCashBox =
      prevOpeningCash + prevReceivedFromBuyers - prevPaidToSources;
    storedOpeningCashStr = prevClosingCashBox.toString();
  }

  const [openingCashInput, setOpeningCashInput] =
    useState(storedOpeningCashStr);
  const [isEditingOpeningCash, setIsEditingOpeningCash] = useState(false);
  const openingCash = parseFloat(storedOpeningCashStr) || 0;

  // Update state if settings load newly
  React.useEffect(() => {
    setOpeningCashInput(storedOpeningCashStr);
  }, [storedOpeningCashStr]);

  const closingCashBox =
    openingCash + approvedCollectionsForDay - amountPaidToSources;

  // Jer Khata Logic
  const totalCommissionsToday = sourcePaymentsForDay.reduce((sum, p) => sum + (Number(p.commission) || 0), 0);
  
  const storedOtherExpensesStr = settings.find((s) => s.key === `daily_other_expenses_${appDate}`)?.value || "0";
  const [otherExpensesInput, setOtherExpensesInput] = useState(storedOtherExpensesStr);
  const [isEditingOtherExpenses, setIsEditingOtherExpenses] = useState(false);
  const otherExpenses = parseFloat(storedOtherExpensesStr) || 0;

  // Crate counts logic
  const crateTypesToday = Array.from(new Set(salesForDay.map(tx => tx.fish_type || 'Unspecified')));
  
  const storedCrateChargesStr = settings.find((s) => s.key === `daily_crate_charges_${appDate}`)?.value || "{}";
  let storedCrateCharges: Record<string, number> = {};
  try {
    storedCrateCharges = JSON.parse(storedCrateChargesStr);
  } catch(e) {}
  const [crateChargesInput, setCrateChargesInput] = useState<Record<string, number>>(storedCrateCharges);
  const [isEditingCrateCharges, setIsEditingCrateCharges] = useState(false);

  // Calculate total custom charges
  const totalCrateCharges = salesForDay.reduce((sum, tx) => {
    const type = tx.fish_type || 'Unspecified';
    const charge = Number(storedCrateCharges[type]) || 0;
    return sum + charge; // 1 transaction = 1 crate
  }, 0);

  const actualIncome = (totalCommissionsToday + totalCrateCharges) - otherExpenses;

  React.useEffect(() => {
    setOtherExpensesInput(storedOtherExpensesStr);
  }, [storedOtherExpensesStr]);

  React.useEffect(() => {
    setCrateChargesInput(storedCrateCharges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedCrateChargesStr]);

  const saveOpeningCash = async () => {
    const key = `cash_box_opening_${appDate}`;
    const settingObj = data?.settings?.find((s: any) => s.key === key);
    if (settingObj) {
      await write("settings", "update", {
        ...settingObj,
        value: String(openingCashInput),
      });
    } else {
      await write("settings", "insert", {
        id: `set_${Date.now()}`,
        key: key,
        value: String(openingCashInput),
        updated_at: new Date().toLocaleString(),
      });
    }
    setIsEditingOpeningCash(false);
    setFeedbackMsg(`Saved opening cash balance for ${appDate}`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const saveJerKhata = async () => {
    const expensesKey = `daily_other_expenses_${appDate}`;
    const expensesObj = data?.settings?.find((s: any) => s.key === expensesKey);
    if (expensesObj) {
      await write("settings", "update", { ...expensesObj, value: String(otherExpensesInput) });
    } else {
      await write("settings", "insert", { id: `set_${Date.now()}_exp`, key: expensesKey, value: String(otherExpensesInput), updated_at: new Date().toLocaleString() });
    }

    const chargesKey = `daily_crate_charges_${appDate}`;
    const chargesObj = data?.settings?.find((s: any) => s.key === chargesKey);
    if (chargesObj) {
      await write("settings", "update", { ...chargesObj, value: JSON.stringify(crateChargesInput) });
    } else {
      await write("settings", "insert", { id: `set_${Date.now()}_chg`, key: chargesKey, value: JSON.stringify(crateChargesInput), updated_at: new Date().toLocaleString() });
    }

    setIsEditingOtherExpenses(false);
    setIsEditingCrateCharges(false);
    setFeedbackMsg(`Saved Jer Khata details for ${appDate}`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const exportDayExcel = async () => {
    try {
      const getBuyerName = (id: any) =>
        data?.buyers?.find((b) => String(b.id) === String(id))?.nickname ||
        String(id);
      const getSourceName = (id: any) =>
        data?.sources?.find((s) => String(s.id) === String(id))?.name ||
        String(id);
      const getUserName = (id: any) =>
        data?.users?.find((u) => String(u.id) === String(id))?.name ||
        String(id);

      const sheets = [];

      // 1. Transactions (Auctions) for this specific day
      const txData = [...salesForDay]
        .sort((a, b) => {
          const sA = getSourceName(a.source_id);
          const sB = getSourceName(b.source_id);
          if (sA !== sB) return sA.localeCompare(sB);

          const fA = a.fish_type || "Unspecified";
          const fB = b.fish_type || "Unspecified";
          if (fA !== fB) return fA.localeCompare(fB);

          return String(b.date).localeCompare(String(a.date));
        })
        .map((tx) => ({
          Time: new Date(tx.date).toLocaleTimeString(),
          "Source Name": getSourceName(tx.source_id),
          "Crate / Fish Type": expandFishType(tx.fish_type),
          "Buyer Name": getBuyerName(tx.buyer_id),
          "Authorizing Operator": getUserName(tx.added_by),
          "Lot Weight (Kg)": tx.weight,
          "Rate Per Kg (BDT)": tx.price_per_kg,
          "Total Amount (BDT)": tx.total_price,
        }));
      sheets.push({ name: "Daily Auctions", data: txData });

      // 2. Collections (Jama) for this specific day
      const colData = [...collectionsForDay]
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .map((col) => ({
          Time: new Date(col.date).toLocaleTimeString(),
          "Buyer Name": getBuyerName(col.buyer_id),
          "Amount Paid (BDT)": col.amount_paid,
          "Total Outstanding": col.total_owed_today,
          "Approval Status": col.is_approved ? "Approved" : "Pending",
        }));
      sheets.push({ name: "Daily Collections", data: colData });

      // 3. Source Payments for this specific day
      const spForDay =
        data?.source_payments?.filter((s) => s.date.startsWith(appDate)) || [];
      const spData = [...spForDay]
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .map((sp) => ({
          Time: new Date(sp.date).toLocaleTimeString(),
          "Source Name": getSourceName(sp.source_id),
          "Gross Sale (BDT)": sp.sale_total,
          "Commission (BDT)": sp.commission,
          "Net Paid to Source (BDT)": sp.amount_paid_to_source,
          "Settlement Status": sp.is_settled ? "Settled" : "Unsettled",
        }));
      sheets.push({ name: "Source Payments", data: spData });

      const { downloadXLSX } = await import("../utils/fileExport");
      await downloadXLSX(sheets, `NFC_DAILY_REPORT_${appDate}.xlsx`);
    } catch (err) {
      console.error("Failed to export Excel", err);
    }
  };

  const handleCloseDayToggle = async () => {
    if (!isAuthenticated || activeUser?.role !== "admin") {
      alert(
        "Administrator privileges are required to lock or close the business day reporting sheets.",
      );
      return;
    }

    if (!isDayClosed) {
      // Trying to close the day
      const currentHour = new Date().getHours();
      let shouldProceed = true;
      if (currentHour > 6 && currentHour <= 23) {
        // rough check for "not past 12 AM" (assuming market runs during day and closes late night/early morning)
        shouldProceed = window.confirm(
          "It's not past 12 AM yet. Are you sure you want to proceed closing the day?",
        );
      }

      if (!shouldProceed) return;

      await exportDayExcel();
      await write("settings", "upsert", {
        key: `day_closed_${appDate}`,
        value: "true",
      });

      setFeedbackMsg(`🔒 Day ${appDate} successfully committed and closed!`);

      // Auto advance to next day
      const d = new Date(appDate);
      d.setDate(d.getDate() + 1);
      const nextDateStr = d.toISOString().split("T")[0];
      setTimeout(() => {
        setAppDate(nextDateStr);
        setFeedbackMsg("");
      }, 2000);
    } else {
      // Reopen
      await write("settings", "upsert", {
        key: `day_closed_${appDate}`,
        value: "false",
      });
      setFeedbackMsg(
        `🔓 Day ${appDate} reopened for ledger entry modifications!`,
      );
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  const handlePrint = () => {
    // We simulate beautiful printable receipt overlay or print window action
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 600);
  };

  // Find active selected buyer
  const activeBuyer = buyers.find((b) => b.id === selectedBuyerId);

  // Compile chronological timeline statement of purchases and payments
  let timelineItems: {
    type: "purchase" | "payment";
    id: string | number;
    date: string;
    description: string;
    weight?: number;
    pricePerKg?: number;
    chargeAmount: number;
    creditAmount: number;
    approved?: boolean;
    operator?: string;
  }[] = [];

  if (activeBuyer) {
    // 1. Grab purchases/transactions
    const buyerTxs = transactions.filter(
      (tx) => String(tx.buyer_id) === String(selectedBuyerId),
    );
    buyerTxs.forEach((tx) => {
      timelineItems.push({
        type: "purchase",
        id: tx.id,
        date: tx.date || appDate,
        description: `Crate: ${tx.fish_type ? expandFishType(tx.fish_type) : "-"}`,
        weight: tx.weight,
        pricePerKg: tx.price_per_kg,
        chargeAmount: tx.total_price,
        creditAmount: 0,
        operator: tx.added_by,
      });
    });

    // 2. Grab collections
    const buyerCollections = collections.filter(
      (col) => String(col.buyer_id) === String(selectedBuyerId),
    );
    buyerCollections.forEach((col) => {
      timelineItems.push({
        type: "payment",
        id: col.id,
        date: col.date || appDate,
        description: "Cash Receipt Payment Received",
        chargeAmount: 0,
        creditAmount: col.amount_paid,
        approved: col.is_approved,
        operator: "Collector Station",
      });
    });

    // Sort chronologically (oldest to newest or vice-versa)
    timelineItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  // Running balance calculation helper
  const totalPurchases = timelineItems.reduce(
    (sum, item) => sum + item.chargeAmount,
    0,
  );
  const totalApprovedPayments = timelineItems
    .filter((item) => item.type === "payment" && item.approved)
    .reduce((sum, item) => sum + item.creditAmount, 0);

  const calculatedDeficit = totalPurchases - totalApprovedPayments;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Selector Heading */}
      <div className="glass-panel border border-divider p-5 rounded-[24px] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left flex-grow">
          <h3 className="text-sm font-sans font-extrabold uppercase tracking-wider text-main flex items-center gap-1.5 justify-center md:justify-start">
            <Search className="w-4.5 h-4.5 text-teal-500" /> ক্রেতার খাতা
            অনুসন্ধান (Search Buyer Ledger)
          </h3>
          <p className="text-[10.5px] text-faint">
            Type nickname or details below to audit outstanding buyer debt
            timelines and statements
          </p>
        </div>

        <div className="w-full md:w-80 relative" id="buyer-search-container">
          <div className="relative">
            <input
              type="text"
              value={buyerSearchQuery}
              onFocus={() => {
                setShowSuggestions(true);
                // Clear query if user starts typing again so they see all suggestions
                if (selectedBuyerId) {
                  setBuyerSearchQuery("");
                }
              }}
              onChange={(e) => {
                setBuyerSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="🔍 Search buyer (e.g. Kashem, Raju)..."
              className="w-full text-xs text-main glass-panel border border-divider rounded-[24px] p-3 pr-10 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
            />
            {selectedBuyerId && (
              <button
                onClick={() => {
                  setSelectedBuyerId("");
                  setBuyerSearchQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-[10.5px] font-black uppercase hover:text-rose-500 transition"
                type="button"
              >
                Clear
              </button>
            )}
          </div>

          {showSuggestions && (
            <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto glass-panel border border-divider rounded-[24px] shadow-2xl divide-y divide-zinc-800 custom-scrollbar">
              {filteredBuyers.length === 0 ? (
                <div className="p-4 text-xs text-faint text-center font-sans">
                  No matching buyers registered.
                </div>
              ) : (
                filteredBuyers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBuyerId(String(b.id));
                      setBuyerSearchQuery(
                        `${b.nickname} (Debt: ₹${b.lifetime_debt.toLocaleString()})`,
                      );
                      setShowSuggestions(false);
                    }}
                    type="button"
                    className="w-full text-left p-3 text-xs text-main hover:glass-panel transition flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-main">
                        {b.nickname}
                      </div>
                      <div className="text-[9px] text-faint font-mono">
                        ID: #{String(b.id).substring(0, 6)}
                      </div>
                    </div>
                    <span className="font-mono text-teal-500 font-extrabold bg-panel-dark border border-divider px-2 py-1 rounded">
                      ₹{b.lifetime_debt.toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close the Day Action Panel */}
      <div className="glass-panel border border-divider rounded-[24px] shadow-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-divider pb-3">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              দিনের সমাপ্তি সমাপ্তিকরণ এবং লক (Close Day Ledger Lock)
            </h4>
            <p className="text-[10px] text-faint font-sans">
              Review aggregate receipts, outstanding debts, and disbursements
              before closing business operations.
            </p>
          </div>

          <button
            onClick={() => setShowCloseDaySection(!showCloseDaySection)}
            className="w-full sm:w-auto px-4 py-2 text-[11px] font-bold rounded-[24px] glass-panel border border-divider text-main hover:bg-panel-hover transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            {showCloseDaySection ? "Hide Day Summary" : "Show Day Summary"}
          </button>
        </div>

        {feedbackMsg && (
          <div className="p-3.5 rounded-[24px] border bg-teal-950/40 border-teal-800/60 text-teal-300 text-xs font-semibold font-sans animate-pulse">
            {feedbackMsg}
          </div>
        )}

        {(showCloseDaySection || isDayClosed) && (
          <div className="space-y-6 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stat 1: Disbursed to sources */}
              <div className="glass-panel border border-divider p-4 rounded-[24px] space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Disbursed to Sources (আড়তে পরিশোধ)
                </div>
                <div className="text-xl font-bold font-mono text-rose-500">
                  ₹ {amountPaidToSources.toLocaleString()}
                </div>
                <div className="text-[9px] text-faint font-sans">
                  Total settled payments disbursed to loaders/fisherman groups
                </div>
              </div>

              {/* Stat 2: Received from buyers */}
              <div className="glass-panel border border-divider p-4 rounded-[24px] space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Received from Buyers (ক্রেতাদের থেকে আদায়)
                </div>
                <div className="text-xl font-bold font-mono text-emerald-500">
                  ₹ {amountReceivedFromBuyers.toLocaleString()}
                </div>
                <div className="text-[9px] text-faint font-sans flex items-center gap-1">
                  <span>
                    Approved: ₹{approvedCollectionsForDay.toLocaleString()}
                  </span>
                  <span className="text-faint">|</span>
                  <span className="text-muted">
                    Pending: ₹{pendingCollectionsForDay.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Stat 3: Amount the day owes us */}
              <div className="glass-panel border border-divider p-4 rounded-[24px] space-y-1">
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  What the Day Owes Us (আজকের বাকি)
                </div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  ₹ {amountOwedToUs.toLocaleString()}
                </div>
                <div className="text-[9px] text-faint font-sans">
                  Today's total sales (₹{totalSalesToday.toLocaleString()})
                  minus cash collected
                </div>
              </div>
            </div>

            {/* Cash Box Track */}
            <div className="bg-panel-dark border border-divider rounded-[24px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Opening Cash Box (দিনের শুরুতে ক্যাশ)
                </div>
                {isEditingOpeningCash ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-muted">
                      ₹
                    </span>
                    <input
                      type="number"
                      className="glass-panel border border-zinc-700 text-main text-sm font-mono rounded-[16px] px-3 py-1 font-bold w-32 focus:outline-none focus:border-indigo-500"
                      value={openingCashInput}
                      onChange={(e) => setOpeningCashInput(e.target.value)}
                    />
                    <button
                      onClick={saveOpeningCash}
                      className="bg-indigo-600 hover:bg-indigo-500 text-main text-[10px] font-bold px-3 py-1.5 rounded-[16px] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingOpeningCash(false);
                        setOpeningCashInput(storedOpeningCashStr);
                      }}
                      className="text-muted hover:text-main px-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold font-mono text-main">
                      ₹ {openingCash.toLocaleString()}
                    </div>
                    {!isDayClosed && (
                      <button
                        onClick={() => setIsEditingOpeningCash(true)}
                        className="text-indigo-500 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded-[12px] cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                )}
                <div className="text-[9px] text-faint font-sans">
                  The starting balance in your physical cash box today.
                </div>
              </div>

              <div className="hidden md:flex text-faint items-center justify-center font-black">
                + Collections - Payouts =
              </div>

              <div className="space-y-1.5 flex-1 md:text-right">
                <div className="text-[10px] uppercase font-bold text-teal-500/80 tracking-wider">
                  Final Cash Box (দিনের শেষে ক্যাশ)
                </div>
                <div className="text-2xl font-black font-mono text-teal-500 drop-shadow-md">
                  ₹ {closingCashBox.toLocaleString()}
                </div>
                <div className="text-[9px] text-faint font-sans">
                  Expected cash in the box after all physical transactions.
                </div>
              </div>
            </div>

            {/* Quick Action Locks */}
            <div className="p-4 bg-panel-dark border border-divider rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isDayClosed
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-500"
                      : "bg-amber-950 border border-amber-800 text-amber-400 animate-pulse"
                  }`}
                >
                  {isDayClosed ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Unlock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-main">
                    Day Operations Status:{" "}
                    {isDayClosed
                      ? "CLOSED & SECURED (দিনের হিসাব বন্ধ)"
                      : "OPEN & ACTIVE (দিনের হিসাব चालू)"}
                  </div>
                  <p className="text-[9.5px] text-faint max-w-sm font-sans mt-0.5 leading-relaxed">
                    {isDayClosed
                      ? "This date is locked. Auction logs and manual buyer payments for this day are frozen in read-only audit mode."
                      : "The system is currently accepting bazaar trades, payments, and credit adjustments."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={exportDayExcel}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-[24px] shadow-sm transition border cursor-pointer flex items-center justify-center gap-1.5 shrink-0 bg-blue-900/50 hover:bg-blue-800 text-blue-300 border-blue-800"
                >
                  📥 Download Data (.xlsx)
                </button>
                {activeUser?.role === "admin" && isAuthenticated ? (
                  <button
                    onClick={handleCloseDayToggle}
                    className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-[24px] shadow-sm transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                      isDayClosed
                        ? "bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                        : "bg-emerald-600 hover:bg-emerald-700 text-main"
                    }`}
                  >
                    {isDayClosed ? (
                      <Unlock className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    {isDayClosed ? "Reopen Day" : "Close Day"}
                  </button>
                ) : (
                  <div className="text-[10px] text-amber-500 bg-amber-950/60 p-2 border border-amber-900 rounded font-bold font-sans shrink-0">
                    ⚠️ Admin role required to lock dates.
                  </div>
                )}
              </div>
            </div>

            {/* Daily Jer Khata P&L Section */}
            <div className="border-t border-divider pt-6 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-main">
                  জের খাতা (Daily Profit & Loss)
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Costing Block */}
                <div className="bg-panel-dark border border-divider rounded-[24px] p-4 space-y-4 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold text-muted uppercase border-b border-divider pb-2 mb-3">
                      Daily Costing (খরচ)
                    </h5>
                    <div className="flex justify-between items-center text-xs mb-3">
                      <span className="text-muted">Total Fish Price (আড়তে পরিশোধ)</span>
                      <span className="font-mono text-main">₹{amountPaidToSources.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col text-xs mb-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted flex items-center gap-1.5">
                          Other Expenses (Fuel, Tiffin, etc)
                          {!isEditingOtherExpenses && !isDayClosed && (
                            <button onClick={() => setIsEditingOtherExpenses(true)} className="text-indigo-500 hover:text-indigo-300">
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                        {!isEditingOtherExpenses && (
                          <span className="font-mono text-rose-500">₹{otherExpenses.toLocaleString()}</span>
                        )}
                      </div>
                      {isEditingOtherExpenses && (
                        <div className="flex items-center gap-2 justify-end glass-panel p-2 rounded-[12px] border border-divider">
                          <input
                            type="number"
                            className="glass-panel border border-zinc-700 text-main text-[11px] font-mono rounded px-2 py-1 w-24 focus:outline-none focus:border-indigo-500 text-right"
                            value={otherExpensesInput}
                            onChange={(e) => setOtherExpensesInput(e.target.value)}
                          />
                          <button onClick={saveJerKhata} className="bg-indigo-600 hover:bg-indigo-500 text-main text-[10px] font-bold px-3 py-1 rounded">Save</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-divider flex justify-between items-center text-sm font-bold">
                    <span className="text-main">Total Costing</span>
                    <span className="font-mono text-rose-500">₹{(amountPaidToSources + otherExpenses).toLocaleString()}</span>
                  </div>
                </div>

                {/* Earnings Block */}
                <div className="bg-panel-dark border border-divider rounded-[24px] p-4 space-y-4 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold text-muted uppercase border-b border-divider pb-2 mb-3">
                      Today's Earnings (আয়)
                    </h5>
                    <div className="flex justify-between items-center text-xs mb-3">
                      <span className="text-muted">Total Commissions</span>
                      <span className="font-mono text-emerald-500">₹{totalCommissionsToday.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col text-xs space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted flex items-center gap-1.5">
                          Crate Custom Charges
                          {!isEditingCrateCharges && !isDayClosed && (
                            <button onClick={() => setIsEditingCrateCharges(true)} className="text-indigo-500 hover:text-indigo-300">
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                        {!isEditingCrateCharges && (
                          <span className="font-mono text-emerald-500">₹{totalCrateCharges.toLocaleString()}</span>
                        )}
                      </div>
                      
                      {isEditingCrateCharges && (
                        <div className="space-y-2 mt-2 p-3 glass-panel rounded-[12px] border border-divider">
                          {crateTypesToday.length === 0 ? (
                            <div className="text-[10px] text-faint text-center">No crates sold today.</div>
                          ) : (
                            crateTypesToday.map(type => {
                              const count = salesForDay.filter(tx => (tx.fish_type || 'Unspecified') === type).length;
                              return (
                                <div key={type} className="flex justify-between items-center gap-4 text-[10px]">
                                  <div className="flex items-center gap-2 w-28 truncate">
                                    <span className="font-bold text-main truncate">{expandFishType(type)}</span>
                                    <span className="text-faint font-mono">({count})</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-faint text-[9px] uppercase tracking-wider">Rate ₹</span>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      className="glass-panel border border-zinc-700 text-main font-mono rounded px-2 py-1 w-16 focus:outline-none focus:border-indigo-500 text-right"
                                      value={crateChargesInput[type] || ""}
                                      onChange={(e) => setCrateChargesInput(prev => ({...prev, [type]: Number(e.target.value)}))}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <button onClick={saveJerKhata} className="bg-indigo-600 hover:bg-indigo-500 font-bold text-main text-[10px] px-3 py-1.5 rounded w-full mt-2">Save Custom Rates</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-divider flex justify-between items-center text-sm font-bold">
                    <span className="text-main">Total Earnings</span>
                    <span className="font-mono text-emerald-500">₹{(totalCommissionsToday + totalCrateCharges).toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Net Profit Banner */}
              <div className={`mt-4 p-4 rounded-[24px] border flex flex-col md:flex-row items-center justify-between gap-4 ${actualIncome >= 0 ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-rose-950/30 border-rose-900/50'}`}>
                <div>
                  <div className="text-xs uppercase font-black tracking-wider text-main">
                    Actual Income (প্রকৃত আয়)
                  </div>
                  <div className="text-[10px] text-faint mt-1">
                    Total Earnings minus Other Expenses
                  </div>
                </div>
                <div className={`text-2xl font-black font-mono tracking-tight drop-shadow-md ${actualIncome >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {actualIncome >= 0 ? '+' : '-'} ₹{Math.abs(actualIncome).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!activeBuyer ? (
        <div className="text-center py-20 glass-panel rounded-[24px] border border-dashed border-divider text-faint text-xs">
          💡 Select a client buyer account from the dropdown above to display
          their operational statement audit books.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Detailed capacity card - 4 cols */}
          <div className="lg:col-span-4 glass-panel border border-divider rounded-[24px] p-5 shadow-2xl shadow-black/10 space-y-5">
            <div className="space-y-1 pb-3 border-b border-divider text-center">
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-wider uppercase glass-panel border border-divider px-2 py-0.5 rounded-full">
                Ledger profile
              </span>
              <h2 className="text-lg font-black text-main uppercase pt-2">
                {activeBuyer.nickname}
              </h2>
              <p className="text-[10px] text-faint font-mono">
                System Account ID: #{activeBuyer.id}
              </p>
            </div>

            {/* Financial summaries list */}
            <div className="space-y-3.5 text-xs">
              <div className="bg-panel-dark p-2.5 rounded-[24px] border border-divider flex justify-between items-center">
                <span className="text-muted">
                  জের খাতা (Outstanding Balance):
                </span>
                <span className="font-mono font-bold text-main text-rose-500 text-sm">
                  ₹ {activeBuyer.lifetime_debt.toLocaleString()}
                </span>
              </div>

              <div className="bg-panel-dark p-2.5 rounded-[24px] border border-divider flex justify-between items-center">
                <span className="text-muted">Calculated Log Deficit:</span>
                <span className="font-mono font-bold text-teal-500">
                  ₹ {calculatedDeficit.toLocaleString()}
                </span>
              </div>

              <div className="bg-panel-dark p-2.5 rounded-[24px] border border-divider flex justify-between items-center">
                <span className="text-muted">Permitted Credit Limit:</span>
                <span className="font-mono font-bold text-indigo-300">
                  ₹ {activeBuyer.credit_limit.toLocaleString()}
                </span>
              </div>

              {/* Progress indicator */}
              <div className="space-y-1.5 pt-1.5">
                <div className="flex justify-between items-center text-[10px] text-faint">
                  <span>Capacity Consumption Rate</span>
                  <span>
                    {Math.round(
                      (activeBuyer.lifetime_debt / activeBuyer.credit_limit) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 w-full glass-panel rounded-full overflow-hidden border border-divider">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      activeBuyer.lifetime_debt > activeBuyer.credit_limit
                        ? "bg-rose-600 animate-pulse"
                        : "bg-indigo-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (activeBuyer.lifetime_debt / activeBuyer.credit_limit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-divider">
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-[24px] glass-panel hover:bg-panel-hover text-main font-sans font-bold text-xs shadow-md border border-divider transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-teal-500" /> Print Formal Arat
                Receipt
              </button>
            </div>
          </div>

          {/* Timeline transaction statements - 8 cols */}
          <div className="lg:col-span-8 glass-panel border border-divider rounded-[24px] p-5 shadow-2xl shadow-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="space-y-0.5">
                <h4 className="text-xs font-sans font-extrabold uppercase tracking-wider text-main flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" /> Ledger
                  Statement Balance Sheet
                </h4>
                <p className="text-[10px] text-faint">
                  Recent activities in chronological sequencing descending order
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted glass-panel px-2 py-0.5 rounded border border-divider">
                Sum: {timelineItems.length} logs
              </span>
            </div>

            {timelineItems.length === 0 ? (
              <div className="text-center py-24 text-faint text-xs font-sans border border-dashed border-divider rounded-[24px]">
                No purchases or payment collections exist on files yet for{" "}
                {activeBuyer.nickname}.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {timelineItems.map((item, index) => {
                  const isPurchase = item.type === "purchase";
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="glass-panel border border-divider p-3.5 rounded-[24px] flex items-start justify-between gap-4 hover:border-divider transition duration-150 font-sans"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-[24px] mt-0.5 ${isPurchase ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
                        >
                          {isPurchase ? (
                            <ArrowUpCircle className="w-4 h-4" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-main">
                            {item.description}
                          </div>
                          {isPurchase && item.weight && item.pricePerKg && (
                            <div className="text-[10.5px] text-muted font-mono">
                              Calculation: {item.weight} kg × ₹{item.pricePerKg}
                              /kg
                            </div>
                          )}
                          <div className="text-[10px] text-faint font-mono flex items-center gap-2">
                            <span>Date: {item.date}</span>
                            <span>•</span>
                            <span>
                              Recorded by: {item.operator || "Station"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div
                          className={`text-xs font-mono font-bold tracking-tight ${isPurchase ? "text-rose-500 text-rose-500" : "text-emerald-500"}`}
                        >
                          {isPurchase
                            ? `+ ₹${item.chargeAmount.toLocaleString()}`
                            : `- ₹${item.creditAmount.toLocaleString()}`}
                        </div>
                        {!isPurchase && (
                          <span
                            className={`text-[8.5px] uppercase font-mono tracking-wider px-1 py-0.5 rounded font-extrabold ${
                              item.approved
                                ? "bg-emerald-950/20 text-emerald-500"
                                : "bg-amber-950/20 text-amber-500 animate-pulse"
                            }`}
                          >
                            {item.approved ? "Approved" : "Pending Appr"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER INVISIBLE BEAUTIFUL INVOICE READY FOR WINDOW.PRINT FOR PHYSICAL ARAT HANDOUTS! */}
      {isPrinting && activeBuyer && (
        <div
          className="fixed inset-0 bg-white text-main z-[200] p-12 flex flex-col justify-between font-sans print:static print:inset-auto print:w-full print:h-auto print:transform-none"
          id="printable-statement-sheet-view"
        >
          <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                body * {
                  visibility: hidden !important;
                }
                #printable-statement-sheet-view, #printable-statement-sheet-view * {
                  visibility: visible !important;
                }
                #printable-statement-sheet-view {
                  display: block !important;
                  position: static !important;
                  width: 100% !important;
                  height: auto !important;
                  background: white !important;
                  color: black !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: visible !important;
                }
              }
          `}</style>
          <div className="space-y-6">
            {/* Invoice header */}
            <div className="flex justify-between items-start border-b-2 border-divider pb-5">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-main uppercase">
                  NEW FISH CENTER
                </h1>
                <p className="text-[10px] text-main font-extrabold tracking-wider font-mono uppercase">
                  Commission Agent and Wholesaler • Proprietor: Chanchal Das
                </p>
                <p className="text-[10px] text-faint mt-0.5 uppercase">
                  BALIA, Chakdaha, Nadia
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-md font-bold uppercase text-main">
                  Buyer Halkhata Account Sheet
                </h2>
                <p className="text-[10px] font-mono mt-1">
                  Print Session: {new Date().toLocaleDateString()}
                </p>
                <p className="text-[10px] font-mono">
                  Operator ID: {activeUser?.name || "System"}
                </p>
              </div>
            </div>

            {/* Buyer/Arat context info */}
            <div className="grid grid-cols-2 gap-6 bg-panel-hover p-4 rounded-[24px] border border-divider">
              <div className="text-xs space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-faint font-bold">
                  Party Details (Buyer Account)
                </div>
                <div className="font-bold text-sm text-main">
                  {activeBuyer.nickname}
                </div>
                <div className="text-faint">
                  Merchant Account ID: #{activeBuyer.id}
                </div>
              </div>
              <div className="text-xs space-y-1 text-right">
                <div className="text-[9px] uppercase tracking-wider text-faint font-bold">
                  Party Liability Summary
                </div>
                <div className="font-bold text-sm text-rose-700">
                  জের খাতা (Owed Today): ₹{activeBuyer.lifetime_debt.toLocaleString()}
                </div>
                <div className="text-faint">
                  Original Capacity Limit: ₹
                  {activeBuyer.credit_limit.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Invoiced items list table */}
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase font-bold text-main tracking-wider">
                Current Account Statements
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-divider bg-panel-dark p-2 font-bold select-none text-main">
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Activity Description</th>
                    <th className="py-2.5 px-2 text-right">Debit Owed (+)</th>
                    <th className="py-2.5 px-2 text-right">Credit paid (-)</th>
                    <th className="py-2.5 px-2 text-right">Approved Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineItems.slice(0, 15).map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-divider hover:bg-zinc-50"
                    >
                      <td className="py-2 px-2 font-mono text-[10px]">
                        {item.date}
                      </td>
                      <td className="py-2 px-2 font-semibold">
                        {item.description}
                        {item.weight && (
                          <span className="font-mono text-[9px] text-faint block">
                            Calculated: {item.weight}kg @ ₹{item.pricePerKg}/kg
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-rose-700">
                        {item.chargeAmount > 0
                          ? `₹${item.chargeAmount.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-700">
                        {item.creditAmount > 0
                          ? `₹${item.creditAmount.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="py-2 px-2 text-right uppercase font-mono text-[9px] font-bold text-faint">
                        {item.approved !== undefined
                          ? item.approved
                            ? "Closed"
                            : "Pending"
                          : "Confirmed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures block footer */}
          <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
            <div className="space-y-1.5">
              <div className="h-0.5 bg-panel-dark mx-auto w-3/4"></div>
              <div className="font-bold text-main">
                Receiver Party Signee
              </div>
              <div className="text-[10px] text-faint font-mono">
                For {activeBuyer.nickname}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-0.5 bg-panel-dark mx-auto w-3/4"></div>
              <div className="font-bold text-main">
                Arat Authorized Cashier
              </div>
              <div className="text-[10px] text-faint font-mono">
                New Fish Center Accounts Team
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
