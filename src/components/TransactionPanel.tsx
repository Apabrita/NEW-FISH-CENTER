/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuctionTxnList } from "./AuctionTxnList";
import { TransactionNumpad } from "./TransactionNumpad";
import React, { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import {
  Anchor,
  User,
  Scale,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Check,
  Edit2,
  Play,
  Lock,
  Trash2,
  ArrowRight,
  X,
  ChevronRight,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { User as DbUser, loadAll, expandFishType } from "../db";
import { triggerHaptic } from "../utils/haptics";
import { motion, AnimatePresence } from "motion/react";
import { BuyerPicker } from "./BuyerPicker";
import { EditTxnModal } from "./EditTxnModal";
import { formatCurrency as fmt, formatWeight as fmtKg } from "../utils/formatters";
import { getDeviceId } from "../utils/device";
import { getSmartFishSuggestions, getSmartBuyerSuggestions } from "../utils/suggestions";

interface TransactionPanelProps {
  activeUser: DbUser | null;
  isAuthenticated: boolean;
  deviceMode?: "laptop" | "android";
}

// ─────────────────────────────────────────────────────────────────────────────
// THE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const TransactionPanel: React.FC<TransactionPanelProps> = ({
  activeUser,
  isAuthenticated,
  deviceMode,
}) => {
  const { data, write, writeBatch, appDate } = useData();

  const store = {
    transactions: data?.transactions || [],
    sources: data?.sources || [],
    buyers: data?.buyers || [],
    source_payments: data?.source_payments || [],
  };

  const isAdmin = activeUser?.role === "admin";
  const canWrite =
    isAuthenticated &&
    (activeUser?.role === "admin" || activeUser?.role === "auctioneer");

  // State managers
  const [activeSourceId, setActiveSourceId] = useState<string | number | null>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("nfc_active_source_id");
        return saved ? saved : null;
      }
      return null;
    },
  );

  const store_settings = data?.settings || [];
  const sessionEndedSetting = store_settings.find(
    (s: any) => s.key === `auction_session_ended_${appDate}`,
  );
  const [isAuctionSessionEnded, setIsAuctionSessionEnded] = useState<boolean>(
    () => {
      if (typeof window !== "undefined") {
        return (
          localStorage.getItem(`nfc_auction_session_ended_${appDate}`) ===
          "true"
        );
      }
      return false;
    },
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionEndedSetting) {
        setIsAuctionSessionEnded(sessionEndedSetting.value === "true");
      } else {
        setIsAuctionSessionEnded(
          localStorage.getItem(`nfc_auction_session_ended_${appDate}`) ===
            "true",
        );
      }
    }
  }, [appDate, sessionEndedSetting]);

  const [buyer, setBuyer] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nfc_draft_buyer");
      try {
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [fishType, setFishType] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nfc_draft_fish_type") || "";
    }
    return "";
  });

  const [isFishInputFocused, setIsFishInputFocused] = useState(false);
  const [isEditFishInputFocused, setIsEditFishInputFocused] = useState(false);
  const [weight, setWeight] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nfc_draft_weight") || "";
    }
    return "";
  });

  const [price, setPrice] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nfc_draft_price") || "";
    }
    return "";
  });

  const [field, setField] = useState<"weight" | "price">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nfc_draft_field");
      return saved === "weight" || saved === "price" ? saved : "weight";
    }
    return "weight";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nfc_draft_fish_type", fishType);
      if (activeSourceId && fishType) {
        localStorage.setItem(`nfc_last_crate_${activeSourceId}_${appDate}`, fishType);
      }
    }
  }, [fishType, activeSourceId, appDate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (activeSourceId) {
        localStorage.setItem("nfc_active_source_id", String(activeSourceId));
        const lastCrate = localStorage.getItem(`nfc_last_crate_${activeSourceId}_${appDate}`);
        if (lastCrate) {
          setFishType(lastCrate);
        } else {
          setFishType("");
        }
      } else {
        localStorage.removeItem("nfc_active_source_id");
      }
    }
  }, [activeSourceId, appDate]);

  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (buyer) {
        localStorage.setItem("nfc_draft_buyer", JSON.stringify(buyer));
      } else {
        localStorage.removeItem("nfc_draft_buyer");
      }
    }
  }, [buyer]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nfc_draft_weight", weight);
    }
  }, [weight]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nfc_draft_price", price);
    }
  }, [price]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nfc_draft_field", field);
    }
  }, [field]);

  const [showPicker, setShowPicker] = useState(false);
  const [showSrcInput, setShowSrcInput] = useState(false);
  const [srcName, setSrcName] = useState("");
  const [srcRate, setSrcRate] = useState("");
  const [editTxn, setEditTxn] = useState<any>(null);
  const [flash, setFlash] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isNumpadDown, setIsNumpadDown] = useState(false);
  const [showEndAuctionConfirm, setShowEndAuctionConfirm] = useState(false);

  // Source editing state variables
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [editSourceName, setEditSourceName] = useState("");
  const [editSourceRate, setEditSourceRate] = useState("");

  const lastStateHash = React.useRef<string>("");
  const lastCloudHash = React.useRef<string>("");
  const isIncomingSync = React.useRef<boolean>(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Sync state to Cloud logic - allows casting between devices on same ID
  useEffect(() => {
    if (isIncomingSync.current) {
      isIncomingSync.current = false;
      return;
    }
    if (!activeUser?.name) return;

    const stateObj = {
      activeSourceId: activeSourceId || "",
      buyer,
      fishType,
      weight,
      price,
      field,
    };

    const key = `auction_state_${activeUser.name}`;
    const value = JSON.stringify(stateObj);

    if (lastStateHash.current === value) return; // Ignore exact match triggers
    lastStateHash.current = value;

    // Small timeout to prevent hammering local storage & Firebase on extremely fast typing
    const writeTimer = setTimeout(() => {
      write("settings", "upsert", { key, value }).catch(() => {});
    }, 150);

    return () => clearTimeout(writeTimer);
  }, [
    activeSourceId,
    buyer,
    fishType,
    weight,
    price,
    field,
    activeUser?.name,
    write,
  ]);

  // Read state from Cloud Logic
  useEffect(() => {
    if (!activeUser?.name) return;
    const key = `auction_state_${activeUser.name}`;
    const remoteState = store_settings.find((s: any) => s.key === key);

    if (remoteState && remoteState.value) {
      try {
        if (remoteState.value === lastCloudHash.current) return;

        const parsed = JSON.parse(remoteState.value);
        isIncomingSync.current = true;
        lastCloudHash.current = remoteState.value;
        lastStateHash.current = remoteState.value;

        if (
          parsed.activeSourceId !== undefined &&
          parsed.activeSourceId !== activeSourceId
        )
          setActiveSourceId(parsed.activeSourceId);
        if (parsed.buyer !== undefined) setBuyer(parsed.buyer);
        if (parsed.fishType !== undefined && parsed.fishType !== fishType)
          setFishType(parsed.fishType);
        if (parsed.weight !== undefined && parsed.weight !== weight)
          setWeight(parsed.weight);
        if (parsed.price !== undefined && parsed.price !== price)
          setPrice(parsed.price);
        if (parsed.field !== undefined && parsed.field !== field)
          setField(parsed.field);
      } catch (e) {
        console.warn("Failed to parse remote auction state", e);
      }
    }
  }, [store_settings, activeUser?.name]);

  // Derive dynamic entities
  const activeUserTxns = store.transactions.filter(
    (t) =>
      (t.added_by || "System Staff") === (activeUser?.name || "System Staff") &&
      t.date === appDate,
  );
  const fishSuggestions = getSmartFishSuggestions(
    activeUserTxns,
    activeSourceId,
    buyer?.id,
    appDate,
  );
  const buyerSuggestions = getSmartBuyerSuggestions(
    activeUserTxns,
    store.buyers,
    activeSourceId,
    fishType,
  );
  const todaySources = store.sources.filter((s) => s.date === appDate);
  const activeSrc = store.sources.find(
    (s) => String(s.id) === String(activeSourceId),
  );
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const activeTxns = activeUserTxns.filter(
    (t) => {
      if (showPendingOnly) {
        return t.is_pending_price;
      }
      return String(t.source_id) === String(activeSourceId);
    }
  );
  
  const totalPendingTxnsCount = activeUserTxns.filter(t => t.is_pending_price).length;

  const totalKg = activeTxns.reduce((sum, t) => sum + (t.weight || 0), 0);
  const totalAmt = activeTxns.reduce((sum, t) => sum + (t.total_price || 0), 0);

  // Auto-scroll to bottom when a new transaction is added
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 50);
    }
  }, [activeTxns.length]);

  // Synchronize activeSourceId with appDate
  useEffect(() => {
    if (activeSourceId) {
      const currentActiveSrc = store.sources.find(
        (s) => String(s.id) === String(activeSourceId),
      );
      if (!currentActiveSrc || currentActiveSrc.date !== appDate) {
        const firstActive = todaySources.find((s) => !s.is_completed);
        if (firstActive) {
          setActiveSourceId(firstActive.id);
        } else if (todaySources.length > 0) {
          setActiveSourceId(todaySources[0].id);
        } else {
          setActiveSourceId(null);
        }
      }
    } else if (todaySources.length > 0) {
      const firstActive = todaySources.find((s) => !s.is_completed);
      if (firstActive) {
        setActiveSourceId(firstActive.id);
      } else {
        setActiveSourceId(todaySources[0].id);
      }
    }
  }, [appDate, todaySources, activeSourceId, store.sources]);

  // Compute if target date is within 30 days of June 22, 2026
  const isWithin30Days = (() => {
    try {
      const today = new Date("2026-06-22");
      const target = new Date(appDate);
      const diffTime = Math.abs(today.getTime() - target.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    } catch {
      return true;
    }
  })();

  const doFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 1700);
  };

  const addBuyer = async (name: string, overrideB?: any) => {
    const newId = `buyer_rec_${Date.now()}`;
    const newB = overrideB || {
      id: newId,
      nickname: name,
      lifetime_debt: 0,
      credit_limit: 100000,
    };
    await write("buyers", "insert", newB);
    doFlash("✔ Buyer Registered!");
    return newB;
  };

  const createSource = async () => {
    if (!srcName.trim()) return;
    setLoading(true);
    const newId = `src_rec_${Date.now()}`;
    const src = {
      id: newId,
      name: srcName.trim(),
      rate_per_kg: parseFloat(srcRate) || 0,
      date: appDate,
      is_completed: false,
      is_archived: false,
    };
    await write("sources", "insert", src);
    setActiveSourceId(newId);
    setSrcName("");
    setSrcRate("");
    setShowSrcInput(false);
    setLoading(false);
    doFlash("✔ New Source added!");
  };

  const saveSourceEdit = async () => {
    if (!activeSrc) return;
    if (
      !window.confirm(
        "Are you sure you want to modify this source's rate and name? This will alter related ledger records.",
      )
    )
      return;

    const rate = parseFloat(editSourceRate) || 0;
    await write("sources", "update", {
      ...activeSrc,
      name: editSourceName.trim() || activeSrc.name,
      rate_per_kg: rate,
    });

    // Also update any matching source payments
    const existingPayment = store.source_payments.find(
      (p) => p.source_id === activeSrc.id,
    );
    if (existingPayment) {
      await write("source_payments", "update", {
        ...existingPayment,
        rate_per_kg: rate,
      });
    }

    setIsEditingSource(false);
    doFlash("✔ Source Metadata Updated!");
  };

  const lockSource = async () => {
    if (!activeSrc) return;
    if (
      !window.confirm(
        "Are you sure you want to mark this source as completed? This locks it from further transactions unless reopened by an admin.",
      )
    )
      return;

    await write("sources", "update", { ...activeSrc, is_completed: true });

    // Auto-create or Update source payment slip structure inside ledger
    const existing = store.source_payments.find(
      (p) => p.source_id === activeSrc.id,
    );
    if (!existing) {
      await write("source_payments", "insert", {
        id: `sp_${Date.now()}`,
        source_id: activeSrc.id,
        date: activeSrc.date || appDate,
        total_kg: totalKg,
        rate_per_kg: activeSrc.rate_per_kg || 0,
        sale_total: totalAmt,
        amount_paid_to_source: 0,
        commission: 0,
        is_settled: false,
      });
    } else {
      await write("source_payments", "update", {
        ...existing,
        date: activeSrc.date || existing.date || appDate,
        total_kg: totalKg,
        sale_total: totalAmt,
      });
    }
    doFlash("🔒 Source Marked Sold!");
  };

  const clearAll = async () => {
    setConfirmClear(false);
    doFlash("Archiving all sources... please wait.");

    // We run the updates in the background or await Promise.all
    // so it doesn't leave the UI in a frozen state for a long time
    try {
      await Promise.all(
        todaySources.map((s) =>
          write("sources", "update", {
            ...s,
            is_archived: true,
            is_completed: true,
          }),
        ),
      );
      setActiveSourceId(null);
      doFlash("✔ All sources archived successfully!");
    } catch (e) {
      console.error(e);
      doFlash("Error archiving sources");
    }
  };

  const rebuildCollection = async (buyerId: string, date: string) => {
    // In-memory calculation using the responsive state store for instantaneous speed
    const txns = store.transactions.filter(
      (t) => String(t.buyer_id) === String(buyerId) && t.date === date,
    );
    const total = txns.reduce((sum, t) => sum + (t.total_price || 0), 0);

    const b = store.buyers.find((x) => String(x.id) === String(buyerId));
    const currentDebt = b?.lifetime_debt || 0;

    const dailyCollections = data?.daily_collections || [];
    const existing = dailyCollections.find(
      (c) => String(c.buyer_id) === String(buyerId) && c.date === date,
    );

    if (total > 0) {
      if (existing) {
        await write("daily_collections", "update", {
          ...existing,
          total_owed_today: currentDebt,
        });
      } else {
        await write("daily_collections", "insert", {
          id: `dc_${Date.now()}`,
          buyer_id: buyerId,
          date,
          total_owed_today: currentDebt,
          amount_paid: 0,
          is_rolled_over: false,
          is_approved: false,
        });
      }
    } else if (existing) {
      await write("daily_collections", "update", {
        ...existing,
        total_owed_today: currentDebt,
      });
    }
  };

  const saveTxn = async (overrideBuyer?: any) => {
    if (!canWrite) {
      alert(
        "Unauthorized! Tap user selector in the left column to log in as admin or auctioneer.",
      );
      return;
    }
    
    const targetBuyer = overrideBuyer || buyer;
    if (!targetBuyer || !weight || !activeSourceId) return;

    const w = parseFloat(weight);
    const p = parseFloat(price) || 0;
    const isPendingPrice = !price || isNaN(p) || p <= 0;
    
    const currentBuyer = targetBuyer;
    const currentFishType = fishType;
    const currentActiveSourceId = activeSourceId;

    // Smooth reset of inputs to keep client interaction instantaneous
    setWeight("");
    setPrice("");
    setField("weight");
    setBuyer(null);

    if (isNaN(w) || w <= 0) return;

    setLoading(true);

    try {
      const totalNum = w * p;
      const tempTxId = `tx_${Date.now()}`;

      const targetTxDate = activeSrc ? activeSrc.date : appDate;

      // Build Transaction Payload
      const newTxn = {
        id: tempTxId,
        source_id: currentActiveSourceId,
        buyer_id: currentBuyer.id,
        weight: w,
        price_per_kg: p,
        total_price: totalNum,
        date: targetTxDate,
        fish_type: currentFishType.trim() || "Unsorted Lot",
        timestamp: Date.now(),
        added_by: activeUser?.name || "System Staff",
        device_id: getDeviceId(),
        is_pending_price: isPendingPrice,
      };

      // Build updated Buyer model with cascading lifetime debt
      const updatedBuyer = {
        ...currentBuyer,
        lifetime_debt: (currentBuyer.lifetime_debt || 0) + totalNum,
      };

      // In-memory lookups to compile correct and accurate daily statement increments
      const dailyCollections = data?.daily_collections || [];
      const existingCollection = dailyCollections.find(
        (c: any) =>
          String(c.buyer_id) === String(currentBuyer.id) &&
          c.date === targetTxDate,
      );
      const oldTxns = store.transactions.filter(
        (t: any) =>
          String(t.buyer_id) === String(currentBuyer.id) &&
          t.date === targetTxDate,
      );
      const newTotalOwed =
        oldTxns.reduce((sum, t) => sum + (t.total_price || 0), 0) + totalNum;

      const batchItems: any[] = [
        { table: "transactions", action: "insert", payload: newTxn },
        { table: "buyers", action: "update", payload: updatedBuyer },
      ];

      if (existingCollection) {
        batchItems.push({
          table: "daily_collections",
          action: "update",
          payload: {
            ...existingCollection,
            total_owed_today: newTotalOwed,
          },
        });
      } else {
        batchItems.push({
          table: "daily_collections",
          action: "insert",
          payload: {
            id: `dc_${Date.now()}`,
            buyer_id: currentBuyer.id,
            date: targetTxDate,
            total_owed_today: newTotalOwed,
            amount_paid: 0,
            is_rolled_over: false,
            is_approved: false,
          },
        });
      }

      // Execute as a single atomic batch locally and register for sync
      await writeBatch(batchItems);

      triggerHaptic("success");
      setIsSuccessAnimated(true);
      setTimeout(() => setIsSuccessAnimated(false), 500);
      doFlash("✔ AUCTION COMMIT RECORDED SUCCESSFUL!");
    } catch (err: any) {
      console.error("Save Txn Error:", err);
      alert("An error occurred saving the record: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (changes: any) => {
    const old = editTxn;
    if (!old) return;

    const updatedTxn = { ...old, ...changes };
    const priceDiff =
      (parseFloat(updatedTxn.total_price) || 0) -
      (parseFloat(old.total_price) || 0);

    const batchItems: any[] = [
      { table: "transactions", action: "update", payload: updatedTxn },
    ];

    if (old.buyer_id === updatedTxn.buyer_id && priceDiff !== 0) {
      const b = store.buyers.find(
        (x) => String(x.id) === String(updatedTxn.buyer_id),
      );
      if (b) {
        batchItems.push({
          table: "buyers",
          action: "update",
          payload: {
            ...b,
            lifetime_debt: Math.max(0, (b.lifetime_debt || 0) + priceDiff),
          },
        });
      }
    } else if (old.buyer_id !== updatedTxn.buyer_id) {
      const oldB = store.buyers.find(
        (x) => String(x.id) === String(old.buyer_id),
      );
      if (oldB) {
        batchItems.push({
          table: "buyers",
          action: "update",
          payload: {
            ...oldB,
            lifetime_debt: Math.max(
              0,
              (oldB.lifetime_debt || 0) - (parseFloat(old.total_price) || 0),
            ),
          },
        });
      }
      const newB = store.buyers.find(
        (x) => String(x.id) === String(updatedTxn.buyer_id),
      );
      if (newB) {
        batchItems.push({
          table: "buyers",
          action: "update",
          payload: {
            ...newB,
            lifetime_debt: Math.max(
              0,
              (newB.lifetime_debt || 0) +
                (parseFloat(updatedTxn.total_price) || 0),
            ),
          },
        });
      }
    }

    await writeBatch(batchItems);

    if (old.buyer_id) await rebuildCollection(old.buyer_id, old.date);
    if (changes.buyer_id && changes.buyer_id !== old.buyer_id) {
      await rebuildCollection(changes.buyer_id, old.date);
    }

    setEditTxn(null);
    doFlash("✔ Entry Updated!");
  };

  const handleEditDelete = async () => {
    const t = editTxn;
    if (!t) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      )
    )
      return;

    const b = store.buyers.find((x) => String(x.id) === String(t.buyer_id));
    const batchItems: any[] = [
      { table: "transactions", action: "delete", payload: { id: t.id } },
    ];

    if (b) {
      batchItems.push({
        table: "buyers",
        action: "update",
        payload: {
          ...b,
          lifetime_debt: Math.max(
            0,
            (b.lifetime_debt || 0) - (parseFloat(t.total_price) || 0),
          ),
        },
      });
    }

    await writeBatch(batchItems);

    if (t.buyer_id) await rebuildCollection(t.buyer_id, t.date);

    setEditTxn(null);
    doFlash("✔ Entry Deleted!");
  };

  const numVal = field === "weight" ? weight : price;
  const setNumVal = (v: string) => {
    if (field === "weight") {
      setWeight(v);
    } else {
      setPrice(v);
    }
  };

  // Tactile Virtual Keypad cell handlers
  const handleKeyTap = (key: string) => {
    let current = numVal;
    if (key === "back") {
      setNumVal(current.slice(0, -1));
    } else if (key === "C") {
      setNumVal("");
    } else if (key === "NEXT") {
      if (field === "weight") {
        setField("price");
      } else {
        saveTxn();
      }
    } else if (key === ".") {
      if (!current.includes(".")) {
        setNumVal(current === "" ? "0." : current + ".");
      }
    } else if (key === "00") {
      if (current !== "" && current !== "0") {
        setNumVal(current + "00");
      }
    } else {
      // Avoid starting with multiple zeroes
      if (current === "0") {
        setNumVal(key);
      } else {
        setNumVal(current + key);
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a real input field
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (isAuctionSessionEnded || !activeSourceId) return;
      if (showPicker) return;

      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        handleKeyTap(key);
      } else if (key === ".") {
        handleKeyTap(".");
      } else if (key === "Backspace") {
        handleKeyTap("back");
      } else if (key === "Delete" || key === "Escape") {
        handleKeyTap("C");
      } else if (key === "Enter") {
        e.preventDefault();
        handleKeyTap("NEXT");
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [numVal, field, isAuctionSessionEnded, activeSourceId, showPicker, weight, price, buyer, fishType]);

  if (showPicker) {
    return (
      <BuyerPicker
        buyers={store.buyers}
        onSelect={(b) => {
          setBuyer(b);
          setShowPicker(false);
          if (weight && price) {
            saveTxn(b);
          }
        }}
        onClose={() => setShowPicker(false)}
        onAddAndSelect={async (name) => {
          const newId = `buyer_rec_${Date.now()}`;
          const nb = {
            id: newId,
            nickname: name,
            lifetime_debt: 0,
            credit_limit: 100000,
          };
          setBuyer(nb);
          setShowPicker(false);
          await addBuyer(name, nb);
          if (weight && price) {
            saveTxn(nb);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`flex flex-col ${
        deviceMode === "android" ? "h-full" : "h-[740px] md:h-[800px]"
      } glass-panel border border-divider rounded-[24px] overflow-hidden shadow-2xl relative font-sans text-main`}
    >
      <style>{`
        .pop-flash {
          animation: popMsg 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popMsg {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Edit and override Modal */}
      {editTxn && (
        <EditTxnModal
          txn={editTxn}
          buyers={store.buyers}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          onClose={() => setEditTxn(null)}
          onAddBuyer={addBuyer}
        />
      )}

      {/* 1. Source Unloading Session bar */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-divider p-3 shrink-0 space-y-2">
        {/* Consolidated row for dynamic action chips and end session toggle */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 items-center">
            {todaySources.map((src) => {
              const isActive = src.id === activeSourceId;
              const isCompleted = src.is_completed;
              return (
                <button
                  key={src.id}
                  onClick={() => {
                    setActiveSourceId(src.id);
                    setConfirmClear(false);
                  }}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-full border transition flex items-center gap-1.5 cursor-pointer selection:hidden select-none ${
                    isActive
                      ? "bg-sky-600 text-main border-sky-400 font-extrabold shadow-md transform scale-102"
                      : isCompleted
                        ? "glass-panel text-faint border-divider line-through decoration-slate-600"
                        : "glass-panel text-main border-divider hover:bg-panel-hover"
                  }`}
                >
                  {isCompleted ? (
                    <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                  ) : (
                    <Anchor className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                  )}
                  <span>{src.name}</span>
                  {(src as any).rate_per_kg > 0 && (
                    <span className="opacity-60 text-[9px] font-mono">
                      ₹{(src as any).rate_per_kg}
                    </span>
                  )}
                </button>
              );
            })}

            {!showSrcInput && (
              <button
                onClick={() => {
                  setSrcName("");
                  setSrcRate("");
                  setShowSrcInput(true);
                }}
                className="px-3 py-1.5 text-[11px] font-bold border border-dashed border-amber-600 rounded-full text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition cursor-pointer select-none"
              >
                + New Source
              </button>
            )}
          </div>

          {!isAuctionSessionEnded && (
            <button
              onClick={() => setShowEndAuctionConfirm(true)}
              className="px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-main font-extrabold rounded-full text-[9px] tracking-wide uppercase transition duration-150 cursor-pointer shadow-sm border border-rose-500/10 flex items-center justify-center gap-1 shrink-0"
              title="End the auction session for today"
            >
              ✕ Close Today's Auction
            </button>
          )}
        </div>

        {/* Create Source input elements overlay */}
        {showSrcInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createSource();
            }}
            className="p-3.5 glass-panel border border-divider rounded-[24px] flex flex-col sm:flex-row gap-2.5 items-center animate-slideDown shadow-lg"
          >
            <input
              type="text"
              value={srcName}
              onChange={(e) => setSrcName(e.target.value.toUpperCase())}
              placeholder="Source Name (e.g. Robin Kaka)"
              className="w-full sm:flex-grow text-xs text-main glass-panel p-2.5 rounded-[24px] border border-divider focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
              autoFocus
            />
            <input
              type="text"
              value={srcRate}
              onChange={(e) =>
                setSrcRate(e.target.value.replace(/[^\d.]/g, ""))
              }
              placeholder="Rate/kg (optional)"
              className="w-full sm:w-28 text-xs text-main glass-panel p-2.5 rounded-[24px] border border-divider focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
            <div className="flex gap-1.5 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-grow sm:flex-none px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-main font-extrabold rounded-[24px] text-xs tracking-wider cursor-pointer font-sans"
              >
                ADD
              </button>
              <button
                type="button"
                onClick={() => {
                  setSrcName("");
                  setSrcRate("");
                  setShowSrcInput(false);
                }}
                className="px-3 py-2.5 glass-panel hover:bg-panel-hover border border-divider text-muted rounded-[24px] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Source Action controllers (Lock, edit metadata, and settlement triggers) */}
        {todaySources.length > 0 && activeSrc && (
          <div className="flex flex-wrap gap-1.5 items-center justify-between text-[10px] text-muted border-t border-divider pt-2.5 mt-1 select-none">
            {isEditingSource && canWrite ? (
              <div className="flex items-center gap-1 glass-panel border border-divider p-1 rounded-[24px] w-full sm:w-auto">
                <input
                  type="text"
                  value={editSourceName}
                  onChange={(e) => setEditSourceName(e.target.value.toUpperCase())}
                  className="glass-panel text-main text-[10px] px-2 py-1 rounded border border-divider font-sans w-28 focus:outline-none focus:border-amber-500"
                  placeholder="Source Name"
                />
                <input
                  type="text"
                  value={editSourceRate}
                  onChange={(e) =>
                    setEditSourceRate(e.target.value.replace(/[^\d.]/g, ""))
                  }
                  className="glass-panel text-main text-[10px] px-2 py-1 rounded border border-divider font-mono w-16 focus:outline-none focus:border-amber-500"
                  placeholder="Rate/kg"
                />
                <button
                  type="button"
                  onClick={saveSourceEdit}
                  className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-main font-bold rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSource(false)}
                  className="px-2 py-1 bg-panel-hover text-muted rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase">
                  Unloading:{" "}
                  <strong className="text-teal-500">{activeSrc.name}</strong>
                </span>
                {canWrite && (
                  <button
                    onClick={() => {
                      setEditSourceName(activeSrc.name);
                      setEditSourceRate(String(activeSrc.rate_per_kg || ""));
                      setIsEditingSource(true);
                    }}
                    className="p-1 rounded glass-panel hover:bg-panel-hover border border-divider text-muted hover:text-main transition flex items-center justify-center"
                    title="Edit name or base rate"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-1.5 ml-auto sm:ml-0">
              {activeSrc && !activeSrc.is_completed && (
                <button
                  onClick={lockSource}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 hover:text-emerald-300 font-black rounded text-[9.5px] uppercase tracking-wider cursor-pointer transition flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Sold
                </button>
              )}

              {activeSrc && activeSrc.is_completed && canWrite && (
                <button
                  onClick={async () => {
                    await write("sources", "update", {
                      ...activeSrc,
                      is_completed: false,
                    });
                    doFlash("🔓 Source Reopened!");
                  }}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-black rounded text-[9.5px] uppercase tracking-wider cursor-pointer transition flex items-center gap-1"
                  title="Reopen source to add or modify auctions"
                >
                  🔓 Undo
                </button>
              )}

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-2 py-1 hover:glass-panel text-faint hover:text-main rounded text-[9.5px] border border-divider font-sans cursor-pointer transition uppercase"
                  title="Archive all sources for today"
                >
                  Archive All
                </button>
              ) : (
                <div className="flex gap-1 items-center">
                  <span className="text-[9px] text-amber-500 animate-pulse font-bold uppercase">
                    Confirm?
                  </span>
                  <button
                    onClick={clearAll}
                    className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 border border-rose-900 text-rose-500 hover:text-main rounded text-[9px] font-extrabold cursor-pointer transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 hover:glass-panel text-muted rounded text-[9px] font-bold cursor-pointer border border-divider"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation End Session Modal Popup Dialog */}
      {showEndAuctionConfirm && (
        <div className="inset-0 absolute glass-panel backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel border border-divider rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/35 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 text-center">
              <h4 className="font-extrabold text-md uppercase text-main tracking-tight">
                End today's auction?
              </h4>
              <p className="text-muted text-[11px] leading-relaxed">
                Are you sure you want to end the auction for today? This action
                is reversible, but it will clear the active auction screen and
                entries panel until reopened.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  setShowEndAuctionConfirm(false);
                  setIsAuctionSessionEnded(true);
                  if (typeof window !== "undefined") {
                    localStorage.setItem(
                      `nfc_auction_session_ended_${appDate}`,
                      "true",
                    );
                  }

                  // Upsert setting in DB without blocking UI
                  write("settings", "upsert", {
                    key: `auction_session_ended_${appDate}`,
                    value: "true",
                  }).catch(() => {});

                  doFlash("🔒 Auction Session Ended Successfully!");
                }}
                className="flex-grow sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-main text-[11px] font-black rounded-[24px] transition shadow cursor-pointer uppercase tracking-tight"
              >
                Yes, End Session
              </button>
              <button
                onClick={() => setShowEndAuctionConfirm(false)}
                className="flex-grow sm:flex-none px-5 py-2.5 bg-zinc-850 hover:bg-panel-hover border border-divider text-main text-[11px] font-bold rounded-[24px] transition cursor-pointer uppercase tracking-tight"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Scrollable Transaction Audit Log */}
      {isAuctionSessionEnded && !isWithin30Days ? (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-5 select-none bg-gradient-to-b from-zinc-950 to-zinc-900 overflow-y-auto">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 animate-pulse shadow-sm animate-scaleUp">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-sm font-black tracking-tight uppercase text-main">
              Auction Session Closed
            </h4>
            <p className="text-[11px] text-muted leading-relaxed font-sans">
              All transactions have been finalized and the digital auction slate
              has been closed for{" "}
              <span className="font-mono text-amber-500 font-bold">
                {appDate}
              </span>
              . Archival editing limit (30 days) has been exceeded for this
              date.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-2">
            <h5 className="text-[10px] text-faint font-extrabold uppercase tracking-widest text-left px-1">
              Turnover by Auctioneer
            </h5>
            <div className="glass-panel border border-divider p-3 rounded-[24px] flex flex-col gap-2">
              {Object.entries(
                store.transactions
                  .filter((t: any) => t.date === appDate)
                  .reduce((acc: any, t: any) => {
                    const name = t.added_by || "Unknown";
                    if (!acc[name]) acc[name] = 0;
                    acc[name] += t.total_price || 0;
                    return acc;
                  }, {}),
              ).map(([name, total]) => (
                <div
                  key={name}
                  className="flex justify-between items-center text-sm border-b border-divider/50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-bold text-main">{name}</span>
                  <span className="font-mono font-black text-emerald-500">
                    {fmt(total as number)}
                  </span>
                </div>
              ))}
              {store.transactions.filter((t: any) => t.date === appDate)
                .length === 0 && (
                <div className="text-xs text-faint py-2 text-center">
                  No transactions recorded today.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 w-full max-w-xs pt-1 animate-fadeIn">
            <button
              onClick={() => {
                setIsAuctionSessionEnded(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    `nfc_auction_session_ended_${appDate}`,
                    "false",
                  );
                }
                write("settings", "upsert", {
                  key: `auction_session_ended_${appDate}`,
                  value: "false",
                }).catch(() => {});
                doFlash("🔓 Auction Session Reopened!");
              }}
              className="w-full bg-slate-100 hover:bg-white text-main font-black rounded-[16px] py-2.5 text-xs tracking-wider cursor-pointer uppercase transition duration-150 shadow shadow-white/5 border border-white/20 block"
            >
              🔓 Reopen Auction Session
            </button>
            <p className="text-[9.5px] text-faint font-sans leading-normal">
              Reopening will restore custom numeric keypads, source slots, and
              enable active buyer record logging.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
            {totalPendingTxnsCount > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-3 text-left animate-slideDown shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-500 shrink-0 font-black animate-pulse">
                    !
                  </div>
                  <div>
                    <div className="text-xs text-amber-500 font-extrabold uppercase tracking-wider">
                      Pending Prices ({totalPendingTxnsCount})
                    </div>
                    <div className="text-[10px] text-muted">
                      You have crates with pending price entries. Please review and update them.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPendingOnly(!showPendingOnly)}
                  className={`px-3 py-1.5 font-mono font-black text-[9px] rounded-[12px] tracking-wide uppercase transition duration-150 cursor-pointer w-full sm:w-auto text-center shrink-0 border ${showPendingOnly ? 'bg-amber-600 text-main border-amber-500' : 'bg-transparent text-amber-500 border-amber-500 hover:bg-amber-900/30'}`}
                >
                  {showPendingOnly ? 'SHOW ALL' : 'REVIEW PENDING'}
                </button>
              </div>
            )}
            
            {isAuctionSessionEnded && isWithin30Days && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-3 text-left animate-slideDown shadow-md">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs text-amber-500 font-extrabold uppercase tracking-wider">
                      Auction Session Ended
                    </div>
                    <div className="text-[10px] text-muted">
                      This auction session is closed. To make changes, you must
                      reopen the session.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsAuctionSessionEnded(false);
                    if (typeof window !== "undefined") {
                      localStorage.setItem(
                        `nfc_auction_session_ended_${appDate}`,
                        "false",
                      );
                    }
                    await write("settings", "upsert", {
                      key: `auction_session_ended_${appDate}`,
                      value: "false",
                    });
                    doFlash("🔓 Auction Session Reopened!");
                  }}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-main font-mono font-black text-[9px] rounded-[12px] tracking-wide uppercase transition duration-150 cursor-pointer w-full sm:w-auto text-center shrink-0"
                >
                  🔓 Reopen Session
                </button>
              </div>
            )}
            <AuctionTxnList
              activeTxns={activeTxns}
              deviceId={getDeviceId()}
              expandFishType={expandFishType}
              canEdit={canWrite && !isAuctionSessionEnded}
              onEdit={setEditTxn}
              buyers={store.buyers}
            />
          </div>

          {/* 3. Static Tactile POS Entry Drawer */}
          {!isAuctionSessionEnded && (
            <div className="shrink-0 border-t-2 border-divider glass-panel p-3 select-none flex flex-col gap-2.5 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
              <div className="flex gap-1.5 items-center w-full">
                <button
                  onClick={() => setShowPicker(true)}
                  className={`flex-1 h-12 shrink-0 px-4 rounded-[24px] flex items-center justify-between border-2 transition-all duration-150 focus:outline-none shadow-md ${
                    buyer
                      ? "bg-amber-600 text-main border-amber-500 shadow-amber-900/30"
                      : "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 hover:scale-105 shadow-indigo-900/40"
                  }`}
                  title="Search & Add Buyers"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-black uppercase tracking-widest truncate">
                      {buyer ? buyer.nickname : "CHOOSE BUYER"}
                    </span>
                  </div>
                  <span className="text-[10px] glass-panel px-2 py-1 rounded-[12px] font-bold">
                    {buyer ? "CHANGE" : "SEARCH"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNumpadDown(!isNumpadDown)}
                  className={`w-11 shrink-0 py-1.5 border rounded-[24px] font-black text-[10px] uppercase cursor-pointer flex flex-col items-center justify-center select-none transition-all ${
                    isNumpadDown
                      ? "glass-panel text-faint border-divider hover:glass-panel"
                      : "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700"
                  }`}
                  title={isNumpadDown ? "Show Custom Keypad" : "Hide Custom Keypad"}
                >
                  <span className="text-[13px] leading-none mb-0.5">{isNumpadDown ? "⌨️" : "✕"}</span>
                </button>
              </div>

              {/* Crate Name / No. entry & chip helper row */}
              <div className="flex flex-col gap-1.5 relative">
                <div className="flex relative items-center">
                  <input
                    type="text"
                    value={fishType}
                    onChange={(e) => setFishType(e.target.value.toUpperCase())}
                    onFocus={() => setIsFishInputFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsFishInputFocused(false), 200)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                        setField("weight");
                      }
                    }}
                    enterKeyHint="next"
                    placeholder="📦 Enter Crate No. & Type (e.g. 1234RE)"
                    className={`w-full text-xs font-semibold glass-panel p-3 pr-10 text-main placeholder-zinc-600 rounded-[24px] border outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-sans uppercase ${
                      fishType ? "border-sky-500/60" : "border-divider"
                    }`}
                  />
                  {fishType && (
                    <button
                      onClick={() => setFishType("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-faint p-1 hover:text-rose-500 hover:bg-rose-500/10 rounded-full cursor-pointer z-10 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {/* Fast Crate Suggestions Row */}
                {Array.from(new Set(activeTxns.map(t => t.fish_type).filter(Boolean))).length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {Array.from(new Set(activeTxns.map(t => t.fish_type).filter(Boolean))).slice(0, 8).map((crate) => (
                      <button
                        key={crate}
                        type="button"
                        onClick={() => setFishType(crate as string)}
                        className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all ${
                          fishType === crate
                            ? 'bg-sky-500/20 text-sky-500 border-sky-500/50'
                            : 'bg-panel-hover text-muted border-zinc-700/50 hover:bg-panel-hover'
                        }`}
                      >
                        {crate}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Side-by-side WEIGHT (kg) and PRICE/kg box containers */}
              <div className="grid grid-cols-2 gap-2 text-left shrink-0">
                {[
                  ["WEIGHT (kg)", weight, "weight"],
                  ["PRICE/kg (optional)", price, "price"],
                ].map(([label, val, f]) => {
                  const isActive = field === f;
                  return (
                    <div
                      key={f}
                      onClick={() => setField(f as any)}
                      className={`p-2 rounded-[24px] transition duration-155 cursor-pointer flex flex-col justify-between select-none ${
                        isActive
                          ? "bg-zinc-955 border-2 border-amber-500 glass-panel shadow-inner scale-[1.01]"
                          : "glass-panel border-2 border-divider hover:border-divider"
                      }`}
                    >
                      <div className="text-[8px] text-faint font-bold uppercase tracking-wider font-sans select-none">
                        {label}
                      </div>
                      <div className="text-lg md:text-xl font-bold font-mono text-main flex items-baseline justify-between pt-1">
                        <span>
                          {val || <span className="text-main">0</span>}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-4 bg-amber-500 animate-pulse inline-block" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hidden save button for the pending price quick save feature */}
              <button 
                id="hidden-save-btn" 
                className="hidden" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  saveTxn();
                }} 
              />

              {/* Calculated Total summary overlay */}
              {parseFloat(weight) > 0 && parseFloat(price) > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-500 p-2 rounded-[24px] flex justify-between items-center font-mono selection:hidden select-none px-4 shadow-sm">
                  <span className="text-[11px] font-sans font-bold text-emerald-500">
                    Commit Sum:
                  </span>
                  <span className="text-base font-black">
                    {fmt(parseFloat(weight) * parseFloat(price))}
                  </span>
                </div>
              )}

              {/* Saving / update system notifications overlays */}
              {flash && (
                <div className="pop-flash text-center text-emerald-500 font-extrabold text-[11px] tracking-wider font-sans uppercase animate-pulse select-none">
                  {flash}
                </div>
              )}

              {/* Highly tactile specialized mobile numpad layout */}

              <TransactionNumpad
                isNumpadDown={isNumpadDown}
                field={field}
                isSuccessAnimated={isSuccessAnimated}
                onKeyTap={handleKeyTap}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
