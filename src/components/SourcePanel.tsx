/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import {
  PlusCircle,
  Search,
  Anchor,
  Scale,
  Landmark,
  Percent,
  Receipt,
  Lock,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Archive,
  Trash2,
  Calendar,
  TrendingUp,
  Printer,
} from "lucide-react";
import { User as DbUser } from "../db";
import { shareAsPDF } from "../utils/pdf";
import { SourcePaymentFlow } from "./SourcePaymentFlow";

interface SourcePanelProps {
  activeUser: DbUser | null;
  isAuthenticated: boolean;
}

const SourceBillGenerator: React.FC<{
  source: any;
  transactions: any[];
  appDate: string;
  payment?: any;
}> = ({ source, transactions, appDate, payment }) => {
  const [items, setItems] = useState<
    { id: string; fishType: string; weight: string; rate: string }[]
  >([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    const rawItems: {
      id: string;
      fishType: string;
      weight: string;
      rate: string;
    }[] = [];
    const fishTypes = Array.from(
      new Set(transactions.map((t: any) => t.fish_type || "Unsorted")),
    ) as string[];

    fishTypes.forEach((ft, idx) => {
      const fTx = transactions.filter(
        (t) => (t.fish_type || "Unsorted") === ft,
      );
      const wt = fTx.reduce((sum, t) => sum + (t.weight || 0), 0);
      rawItems.push({
        id: idx.toString(),
        fishType: ft,
        weight: wt.toString(),
        rate: source.rate_per_kg.toString(),
      });
    });

    if (rawItems.length === 0) {
      rawItems.push({
        id: "0",
        fishType: "Unsorted Catch",
        weight: "0",
        rate: source.rate_per_kg.toString(),
      });
    }

    setItems(rawItems);
  }, [source, transactions]);

  const totalGrossP = items.reduce(
    (sum, it) =>
      sum + (parseFloat(it.weight) || 0) * (parseFloat(it.rate) || 0),
    0,
  );
  const commissionDeducted = payment?.commission_amount || 0;
  // We deduce advance paid backward if we know net_paid and commission, since net_paid = total - commission - advance.
  const advanceDeducted = payment
    ? totalGrossP - commissionDeducted - payment.net_paid
    : 0;
  const netDueP = payment ? payment.net_paid : totalGrossP;

  const handlePrint = async () => {
    setLoadingPdf(true);
    setIsPrinting(true);
    // Let react render the print version briefly
    setTimeout(async () => {
      try {
        await shareAsPDF(
          `source-bill-${source.id}`,
          `Payout_Bill_${source.name.replace(/\s+/g, "_")}_${appDate}.pdf`,
          `Source Payout Invoice: ${source.name}`,
          `Generated electronic payout invoice for ${source.name} on ${appDate}.`,
          "download",
        );
      } catch (err) {
        console.error("PDF generation failed", err);
        alert("Warning: Could not create PDF. Falling back to native print.");
        window.print();
      } finally {
        setIsPrinting(false);
        setLoadingPdf(false);
      }
    }, 150);
  };

  return (
    <div className="mt-3 p-3 glass-panel border-2 border-divider shadow-sm rounded-[24px] space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-black text-main uppercase text-xs">
          🧾 Source Payout Bill
        </h4>
      </div>

      {/* Read-Only Views */}
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-1.5 p-2 glass-panel border border-divider rounded-[24px] text-[10px]"
          >
            <div className="col-span-6">
              <span className="text-[8px] font-bold text-faint uppercase block mb-0.5">
                Item/Fish Type
              </span>
              <div className="font-sans font-bold text-main">
                {item.fishType}
              </div>
            </div>
            <div className="col-span-3">
              <span className="text-[8px] font-bold text-faint uppercase block mb-0.5">
                Weight (KG)
              </span>
              <div className="font-mono text-main">
                {parseFloat(item.weight).toLocaleString()} kg
              </div>
            </div>
            <div className="col-span-3">
              <span className="text-[8px] font-bold text-faint uppercase block mb-0.5">
                Rate/KG (₹)
              </span>
              <div className="font-mono text-main">
                ₹
                {parseFloat(item.rate).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2">
        <div className="glass-panel p-3 rounded-[24px] border border-divider shadow-sm text-xs space-y-1">
          <div className="flex justify-between text-faint">
            <span>Gross Purchase Value:</span>
            <span className="font-mono text-main font-bold">
              ₹
              {totalGrossP.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          {commissionDeducted > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Less - Commission Deducted:</span>
              <span className="font-mono">
                - ₹
                {commissionDeducted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
          {advanceDeducted > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Less - Advance Paid:</span>
              <span className="font-mono">
                - ₹
                {advanceDeducted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
          <div className="flex justify-between font-black text-emerald-800 pt-2 border-t border-divider mt-2">
            <span>Net Paid To Source:</span>
            <span className="font-mono">
              ₹{netDueP.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handlePrint}
          disabled={loadingPdf}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-main font-bold py-2 px-4 rounded-[24px] text-xs flex items-center justify-center gap-1.5 w-full shadow"
        >
          {loadingPdf ? (
            <span className="animate-pulse">Building PDF...</span>
          ) : (
            <>
              <Printer className="w-3.5 h-3.5" /> Generates PDF Invoice
            </>
          )}
        </button>
      </div>

      {/* Hidden Print Canvas Area */}
      <div className="fixed -left-[4000px] top-0 opacity-0 pointer-events-none">
        <div
          id={`source-bill-${source.id}`}
          className="glass-panel p-8 space-y-6 font-sans w-[800px] max-w-none print:w-full select-text text-main border-2 border-transparent"
        >
          <div className="border-b-2 border-divider pb-4 flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-main uppercase">
                NEW FISH CENTER
              </h3>
              <p className="text-[10px] text-main font-extrabold tracking-wider font-mono uppercase">
                Commission Agent and Wholesaler • Proprietor: Chanchal Das
              </p>
              <p className="text-[10px] text-faint mt-0.5 uppercase">
                BALIA, Chakdaha, Nadia
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-main font-mono tracking-wider">
                PAYOUT BILL
              </div>
              <div className="text-xs text-faint font-semibold font-mono mt-1">
                Date: {appDate}
              </div>
              <div className="text-[10px] text-faint font-mono">
                Invoice #: S-{source.id.toString().slice(-6)}
              </div>
            </div>
          </div>

          <div className="bg-panel-hover p-3 rounded-[24px] border border-divider flex justify-between items-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-faint">
                Source / Vessel Name
              </div>
              <div className="text-lg font-black text-indigo-900">
                {source.name}
              </div>
            </div>
          </div>

          <table className="w-full text-sm border-collapse font-sans mt-4">
            <thead>
              <tr className="glass-panel text-main uppercase text-[10px] font-bold tracking-wider">
                <th className="text-left py-2 px-3">Fish Type / Details</th>
                <th className="text-right py-2 px-3">Weight (KG)</th>
                <th className="text-right py-2 px-3">Rate/KG (₹)</th>
                <th className="text-right py-2 px-3">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const w = parseFloat(it.weight) || 0;
                const r = parseFloat(it.rate) || 0;
                return (
                  <tr
                    key={it.id}
                    className={`border-b ${i % 2 === 0 ? "glass-panel" : "glass-panel"} border-divider text-[11px] font-bold text-main`}
                  >
                    <td className="py-2.5 px-3 uppercase">{it.fishType}</td>
                    <td className="text-right py-2.5 px-3 font-mono">
                      {w.toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 px-3 font-mono">
                      {r.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-right py-2.5 px-3 font-mono text-main">
                      ₹
                      {(w * r).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-4">
            <div className="w-1/2 space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold text-main py-1">
                <span className="uppercase text-[9px] tracking-wider">
                  Gross Purchase Value:
                </span>
                <span className="font-mono">
                  ₹
                  {totalGrossP.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {commissionDeducted > 0 && (
                <div className="flex justify-between items-center font-bold text-red-600 py-1">
                  <span className="uppercase text-[9px] tracking-wider">
                    Less - Commission Deducted:
                  </span>
                  <span className="font-mono">
                    - ₹
                    {commissionDeducted.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-red-600 py-1 border-b border-divider pb-2">
                <span className="uppercase text-[9px] tracking-wider">
                  Less - Advance Paid:
                </span>
                <span className="font-mono">
                  - ₹
                  {advanceDeducted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center font-black text-lg text-emerald-800 py-2">
                <span className="uppercase text-[12px] tracking-wider">
                  Total Net Paid:
                </span>
                <span className="font-mono">
                  ₹
                  {netDueP.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 mb-4 pt-16 flex justify-between items-end border-t-2 border-divider px-6">
            <div className="text-center">
              <div className="w-32 border-b border-zinc-400 mb-1"></div>
              <div className="text-[9px] font-bold text-faint uppercase tracking-widest">
                Receiver Signature
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-main italic font-mono">
                Chanchal Das
              </div>
              <div className="w-32 border-b border-zinc-400 my-1 mx-auto"></div>
              <div className="text-[9px] font-bold text-faint uppercase tracking-widest">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SourcePanel: React.FC<SourcePanelProps> = ({
  activeUser,
  isAuthenticated,
}) => {
  const { data, write, appDate } = useData();
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [activeSettleSourceId, setActiveSettleSourceId] = useState<
    string | number | null
  >(null);
  const [expandedReportSourceId, setExpandedReportSourceId] = useState<
    string | number | null
  >(null);

  // New Source form states
  const [sourceName, setSourceName] = useState("");
  const [sourceDate, setSourceDate] = useState(appDate);

  // Sync sourceDate with appDate when appDate changes
  React.useEffect(() => {
    setSourceDate(appDate);
  }, [appDate]);

  // Credit Settlement Form States
  const [amountPaidToSource, setAmountPaidToSource] = useState("");
  const [customCommission, setCustomCommission] = useState("");
  const [settleMethod, setSettleMethod] = useState<"auto" | "manual">("auto");
  const [manualWeight, setManualWeight] = useState("");
  const [manualRatePerKg, setManualRatePerKg] = useState("");
  const [commissionType, setCommissionType] = useState<"percent" | "flat">(
    "flat",
  );
  const [commissionPercent, setCommissionPercent] = useState("5");

  const sources = (data?.sources || []).filter((s: any) => s.date === appDate);
  const transactions = (data?.transactions || []).filter(
    (tx: any) => tx.date === appDate,
  );
  const sourcePayments = (data?.source_payments || []).filter(
    (p: any) => p.date === appDate,
  );

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName) return;

    const newSource = {
      id: `temp_s_${Date.now()}`,
      name: sourceName,
      date: sourceDate,
      is_completed: false,
      is_archived: false,
    };

    await write("sources", "insert", newSource);

    setSourceName("");
    setShowAddSourceForm(false);
  };

  const handleArchiveSource = async (srcId: string | number) => {
    const src = sources.find((s) => s.id === srcId);
    if (!src) return;

    const updated = { ...src, is_completed: true, is_archived: true };
    await write("sources", "update", updated);
  };

  const isAdmin = activeUser?.role === "admin" && isAuthenticated;
  const isAuthorizedToLog =
    isAuthenticated &&
    (activeUser?.role === "admin" ||
      activeUser?.role === "auctioneer" ||
      activeUser?.role === "collector");

  return (
    <div className="space-y-6" id="sources-logistics-panel">
      {/* 1. Header and Quick Stats */}
      <div className="glass-panel border border-divider p-3 rounded-[24px] flex items-center justify-between shadow-sm text-xs font-sans">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-indigo-600" />
          <span className="text-faint font-medium whitespace-nowrap">
            Active In Harbor:
          </span>
          <span className="font-bold text-main">
            {sources.filter((s) => !s.is_completed).length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-l border-divider pl-3">
          <Receipt className="w-4 h-4 text-teal-600" />
          <span className="text-faint font-medium whitespace-nowrap">
            Market Commissions:
          </span>
          <span className="font-bold text-emerald-700 font-mono">
            ₹
            {sourcePayments
              .reduce((sum, p) => sum + (p.commission || 0), 0)
              .toLocaleString()}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-l border-divider pl-3">
          <Percent className="w-4 h-4 text-blue-600" />
          <span className="text-faint font-medium whitespace-nowrap">
            Settled Outflow:
          </span>
          <span className="font-bold text-main font-mono">
            ₹
            {sourcePayments
              .reduce((sum, p) => sum + (p.amount_paid_to_source || 0), 0)
              .toLocaleString()}
          </span>
        </div>
      </div>

      {/* Primary Actions Drawer Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel border border-divider p-4 rounded-[24px]">
        <div className="text-xs text-faint italic">
          ⚓ Register Sources representing raw suppliers or hatcheries before
          selling.
        </div>

        <button
          onClick={() => {
            if (!isAuthorizedToLog) {
              alert(
                "Your current operator role does not have authorization to add fishing sources! Swapping to Admin, Auctioneer, or Collector is required.",
              );
              return;
            }
            setShowAddSourceForm(!showAddSourceForm);
          }}
          className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-[24px] shadow-sm flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer ${
            isAuthorizedToLog
              ? "bg-indigo-600 hover:bg-indigo-700 text-main"
              : "bg-panel-dark text-muted border border-divider cursor-not-allowed"
          }`}
          id="btn-add-source"
        >
          <PlusCircle className="w-4 h-4" />
          Add Incoming Source / Loader
        </button>
      </div>

      {/* Add Source Form Drawer */}
      {showAddSourceForm && (
        <form
          onSubmit={handleAddSource}
          className="glass-panel border border-divider p-5 rounded-[24px] space-y-4 animate-slideDown shadow-inner"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-divider">
            <PlusCircle className="w-4 h-4 text-indigo-600 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-main font-sans">
              Register Incoming Fish Source / Source Group
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-sans font-bold text-faint block">
                Source Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Digha Estuary Source 04"
                required
                className="w-full text-xs text-main glass-panel border border-divider rounded-[24px] p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                id="form-source-name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-sans font-bold text-faint block">
                Arrival Unloading Date
              </label>
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                className="w-full text-xs text-main glass-panel border border-divider rounded-[24px] p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-divider">
            <button
              type="button"
              onClick={() => setShowAddSourceForm(false)}
              className="px-4 py-2 bg-panel-dark hover:bg-panel-dark text-main text-xs font-semibold rounded-[24px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-main text-xs font-semibold rounded-[24px] shadow cursor-pointer"
              id="btn-save-source"
            >
              Create Source Group
            </button>
          </div>
        </form>
      )}

      {/* Main layout: active sources and settlements stacked */}
      <div className="flex flex-col gap-6 w-full">
        {/* Unsettled active sources - Full width */}
        <div className="glass-panel border border-divider rounded-[24px] overflow-hidden shadow-sm flex flex-col w-full">
          <div className="px-5 py-4 glass-panel border-b border-divider flex items-center justify-between">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-main">
              Active Fish Sources in Harbor
            </h4>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
              In Stock / Loading
            </span>
          </div>

          <div className="divide-y divide-zinc-100 flex-grow max-h-[500px] overflow-y-auto">
            {sources.filter((s) => !s.is_archived).length === 0 ? (
              <div className="p-12 text-center text-muted text-xs text-sans">
                No active fishing sources logged. Add an incoming source to
                start.
              </div>
            ) : (
              sources
                .filter((s) => !s.is_archived)
                .map((src) => {
                  const srcTx = transactions.filter(
                    (tx) => String(tx.source_id) === String(src.id),
                  );
                  const kgSum = srcTx.reduce(
                    (sum, tx) => sum + (tx.weight || 0),
                    0,
                  );
                  const saleSum = srcTx.reduce(
                    (sum, tx) => sum + (tx.total_price || 0),
                    0,
                  );

                  const paymentDetails = sourcePayments.find(
                    (p) => String(p.source_id) === String(src.id),
                  );
                  const isSettled = paymentDetails?.is_settled;

                  const displayKg =
                    isSettled && paymentDetails
                      ? paymentDetails.total_kg
                      : kgSum;
                  const displaySale =
                    isSettled && paymentDetails
                      ? paymentDetails.sale_total
                      : saleSum;
                  const netPayout =
                    isSettled && paymentDetails
                      ? paymentDetails.amount_paid_to_source
                      : null;

                  return (
                    <div
                      key={src.id}
                      className="p-4 hover:glass-panel transition duration-150 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-[24px] flex items-center justify-center text-main ${
                              src.is_completed
                                ? "bg-zinc-400 animate-none"
                                : "bg-indigo-600 animate-pulse"
                            }`}
                          >
                            <Anchor className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-main font-sans">
                              {src.name}
                            </div>
                            <div className="text-[10px] text-faint font-semibold flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5" /> {src.date}
                            </div>
                          </div>
                        </div>

                        {src.is_completed ? (
                          <span className="text-[10px] bg-panel-hover text-faint px-2 py-0.5 rounded-full border border-divider font-semibold text-center leading-tight">
                            {isSettled
                              ? "Auction Closed\n& Paid"
                              : "Auction\nClosed"}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-100 font-bold text-center leading-tight">
                            Active
                            <br />
                            Auction
                          </span>
                        )}
                      </div>

                      {/* Display recent fish types summary */}
                      {srcTx.length > 0 && (
                        <div className="glass-panel border border-divider rounded-[16px] p-2.5 space-y-1.5 shadow-sm mt-2">
                          <div className="text-[9px] font-bold text-faint uppercase tracking-widest border-b border-divider pb-1 mb-1">
                            Live Auction Details • Crates Sold: {new Set(srcTx.map((t) => t.fish_type || "Unsorted")).size}
                          </div>
                          {Array.from(
                            new Set(
                              srcTx.map((t) => t.fish_type || "Unsorted"),
                            ),
                          )
                            .slice(0, 3)
                            .map((fishType, idx) => {
                              const specificTx = srcTx.filter(
                                (t) => (t.fish_type || "Unsorted") === fishType,
                              );
                              const fishKg = specificTx.reduce(
                                (sum, t) => sum + (t.weight || 0),
                                0,
                              );
                              const fishRev = specificTx.reduce(
                                (sum, t) => sum + (t.total_price || 0),
                                0,
                              );
                              const fishMean =
                                fishKg > 0 ? fishRev / fishKg : 0;
                              return (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-[10px] font-mono"
                                >
                                  <span className="font-bold text-main font-sans uppercase truncate w-24">
                                    {fishType}
                                  </span>
                                  <span className="text-blue-700">
                                    {fishKg.toLocaleString()} kg
                                  </span>
                                  <span className="text-faint">
                                    @ ₹{fishMean.toFixed(0)}/kg
                                  </span>
                                  <span className="text-emerald-700 font-bold">
                                    ₹{fishRev.toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                          {Array.from(
                            new Set(
                              srcTx.map((t) => t.fish_type || "Unsorted"),
                            ),
                          ).length > 3 && (
                            <div className="text-[9px] text-muted italic text-center pt-1">
                              + more types inside
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 glass-panel rounded-[24px] p-2.5 text-center text-[10px] text-faint font-mono mt-2">
                        <div>
                          <div className="text-faint uppercase font-sans font-bold text-[8px]">
                            Summary Sold Out
                          </div>
                          <div className="font-bold text-blue-700 text-sm mt-0.5">
                            {displayKg.toLocaleString()} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-faint uppercase font-sans font-bold text-[8px]">
                            {isSettled
                              ? "Settled Net Payout"
                              : "Current Est. Yield"}
                          </div>
                          <div className="font-bold text-emerald-700 text-sm mt-0.5">
                            ₹{" "}
                            {(isSettled
                              ? netPayout
                              : displaySale
                            )?.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Yield Report toggle */}
                      <div className="glass-panel rounded-[16px] p-2.5 border border-divider mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReportSourceId(
                              expandedReportSourceId === src.id ? null : src.id,
                            )
                          }
                          className="w-full text-center text-xs font-bold text-indigo-500 hover:text-indigo-500 transition flex items-center justify-center gap-1 cursor-pointer select-none py-1.5 glass-panel border border-divider rounded-[12px] shadow-sm"
                        >
                          {expandedReportSourceId === src.id
                            ? "▲ Close"
                            : isSettled
                              ? "Review Payment"
                              : "Pay the Source"}
                        </button>

                        {expandedReportSourceId === src.id && (
                          <div className="pt-3 animate-slideDown">
                            <SourcePaymentFlow
                              source={src}
                              transactions={srcTx}
                              appDate={appDate}
                              onClose={() => setExpandedReportSourceId(null)}
                              existingPayment={sourcePayments.find(
                                (p) => String(p.source_id) === String(src.id),
                              )}
                            />
                          </div>
                        )}
                      </div>

                      {/* Settle Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleArchiveSource(src.id)}
                          className="text-[10px] text-faint hover:text-main flex items-center gap-1 cursor-pointer"
                          title="Hide from dashboard view"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive Source</span>
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Structured Payments History table */}
      <div className="glass-panel border border-divider rounded-[24px] overflow-hidden shadow-sm">
        <div className="px-5 py-4 glass-panel border-b border-divider flex justify-between items-center">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-main">
            Historic Source Settlement History ({sourcePayments.length})
          </h4>
          <span className="text-[10px] text-faint">
            Audit logs of market pay-outs
          </span>
        </div>

        {sourcePayments.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs">
            No payments settled yet.
          </div>
        ) : (
          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="glass-panel text-faint font-sans border-b border-divider text-[10px] tracking-wider uppercase font-bold">
                  <th className="p-4 text-left">Source ID</th>
                  <th className="p-4 text-right">Aggr. Weight logged</th>
                  <th className="p-4 text-right">gross auction proceeds</th>
                  <th className="p-4 text-right">Market Commission Deducted</th>
                  <th className="p-4 text-right font-bold text-indigo-500">
                    net cash paid outflow
                  </th>
                  <th className="p-4 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-main">
                {sourcePayments.map((pay) => {
                  const source = sources.find(
                    (s) => String(s.id) === String(pay.source_id),
                  );
                  return (
                    <tr
                      key={pay.id}
                      className="hover:glass-panel transition duration-150"
                    >
                      <td className="p-4 font-bold text-indigo-500 flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-muted" />
                        <span>
                          {source ? source.name : `Source (#${pay.source_id})`}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-medium">
                        {pay.total_kg} kg
                      </td>
                      <td className="p-4 text-right font-mono font-medium">
                        ₹{pay.sale_total.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-mono text-emerald-700 font-bold">
                        ₹{pay.commission.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-mono text-indigo-500 font-bold">
                        ₹{pay.amount_paid_to_source.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <span className="bg-indigo-50 border border-indigo-150 text-[10px] text-indigo-500 px-2.5 py-0.5 rounded-full font-bold">
                          {pay.date || appDate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
