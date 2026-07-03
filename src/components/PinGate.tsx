/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Waves,
  User,
  Landmark,
  HelpCircle,
} from "lucide-react";
import { User as DbUser, authenticateUserWithPIN } from "../db";
import { useData } from "../contexts/DataContext";
import { VirtualNumpad } from "./VirtualNumpad";

interface PinGateProps {
  activeUser: DbUser | null;
  setActiveUser: (user: DbUser | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
}

import { SeaBackground } from "./SeaBackground";

export const PinGate: React.FC<PinGateProps> = ({
  activeUser,
  setActiveUser,
  isAuthenticated,
  setIsAuthenticated,
}) => {
  const { data, loading } = useData();
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);

  const users = data?.users || [];

  // Automatically pre-select default user if none selected
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      if (activeUser) {
        setSelectedUser(activeUser);
      } else {
        const adminUser = users.find((u) => u.role === "admin") || users[0];
        setSelectedUser(adminUser);
      }
    }
  }, [users, selectedUser, activeUser]);

  const handleUserSelect = (u: DbUser) => {
    setSelectedUser(u);
    setPinInput("");
    setPinError(false);
  };

  const handleVerify = async () => {
    if (!selectedUser) return;
    const { success, user: validatedUser } = await authenticateUserWithPIN(
      selectedUser.id,
      pinInput,
    );
    if (success && validatedUser) {
      setActiveUser(validatedUser);
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
      setPinInput("");
      // Simple error animation re-triggering via state flash
      setTimeout(() => setPinError(false), 800);
    }
  };

  if (isAuthenticated && activeUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-2 md:p-8 overflow-y-auto">
      <SeaBackground />
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(13,148,136,0.08),transparent_50%)] z-[-1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(79,70,229,0.08),transparent_50%)] z-[-1]" />

      <div className="relative max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 glass-panel backdrop-blur-md border border-divider rounded-3xl p-4 md:p-10 shadow-2xl my-auto">
        {/* Glow Element */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* LEFT Column - Info & Brand (Moved down on Mobile) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4 md:space-y-8 z-10">
          <div className="space-y-2 md:space-y-4 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-teal-500 to-indigo-600 p-2.5 md:p-3 rounded-[24px] md:rounded-[24px] shadow-2xl shadow-black/10 shrink-0">
                <Waves className="w-5 h-5 md:w-6 md:h-6 text-main" />
              </div>
              <div>
                <span className="text-[9px] md:text-[10px] tracking-widest font-mono font-bold text-teal-500 uppercase">
                  AQUATRADE ENTERPRISE SUITE
                </span>
                <h1 className="text-lg md:text-2xl font-black text-main tracking-tight uppercase leading-tight">
                  Fishery Central Hub
                </h1>
              </div>
            </div>

            <p className="hidden md:block text-xs text-muted leading-relaxed font-sans pt-2">
              Welcome to the centralized fish wholesale management portal.
              Please authorize your operational role to access enterprise
              trades, landing logistics, and collections processing.
            </p>
          </div>

          {/* User selector list */}
          <div className="space-y-2 md:space-y-3">
            <div className="text-[10px] md:text-[11px] font-sans font-bold text-muted tracking-wider uppercase flex items-center gap-1.5 pb-0.5 md:pb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Choose
              Your Station Operator
            </div>

            {loading && users.length === 0 ? (
              <div className="flex items-center gap-2.5 py-3.5 px-4 glass-panel border border-divider rounded-[24px] text-muted text-xs font-mono">
                <div className="w-3.5 h-3.5 rounded-full border border-teal-500 border-t-transparent animate-spin shrink-0" />
                <span>Loading operator profiles...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-3 px-4 bg-rose-950/15 border border-rose-900/30 rounded-[24px] text-rose-500 text-xs font-mono text-center">
                <span>No operators configured. Synchronizing database...</span>
              </div>
            ) : (
              <div className="flex flex-row overflow-x-auto md:flex-col gap-2 md:gap-2 max-h-none md:overflow-y-auto md:max-h-none pr-1 pb-2 custom-scrollbar flex-nowrap">
                {users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <motion.button
                      key={u.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleUserSelect(u)}
                      className={`text-left p-2.5 md:p-3 rounded-[24px] border transition-all duration-150 flex items-center justify-between cursor-pointer shrink-0 w-[200px] md:w-full ${
                        isSelected
                          ? "bg-panel-hover border-teal-500 text-main shadow-lg ring-1 ring-teal-500/30"
                          : "glass-panel border-divider/70 text-muted hover:glass-panel hover:text-main"
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3 shrink-0 min-w-0 mr-2">
                        <div
                          className={`p-1.5 md:p-2 rounded-[24px] shrink-0 ${isSelected ? "bg-teal-500/10 text-teal-500" : "glass-panel text-faint"}`}
                        >
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] md:text-xs font-bold font-sans truncate pr-1">
                            {u.name}
                          </div>
                          <div className="text-[8.5px] md:text-[10px] font-mono text-faint uppercase lowercase whitespace-nowrap">
                            {u.role}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden md:flex text-[10px] text-faint font-mono leading-tight items-center gap-1.5 glass-panel p-3 rounded-[24px] border border-divider">
            <Lock className="w-4 h-4 text-muted shrink-0" />
            <span>Station requires role-secure clearance.</span>
          </div>
        </div>

        {/* RIGHT Column - PIN Numpad Access (Moved up on Mobile) */}
        <div className="md:col-span-7 flex flex-col justify-center items-center glass-panel rounded-[24px] border border-divider p-4 md:p-6 z-10 space-y-3 md:space-y-4">
          {selectedUser && (
            <div className="text-center w-full max-w-xs space-y-0.5 md:space-y-1">
              <span className="text-[9px] md:text-[10px] uppercase font-mono tracking-widest text-indigo-500">
                Security Clearance
              </span>
              <h2 className="text-xs md:text-sm font-bold text-main font-sans">
                Authenticating:{" "}
                <span className="text-teal-500 font-extrabold">
                  {selectedUser.name}
                </span>
              </h2>
            </div>
          )}

          <motion.div
            animate={pinError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xs scale-90 md:scale-100 origin-center"
          >
            <VirtualNumpad
              value={pinInput}
              onChange={(val) => {
                if (val.length <= 6) {
                  setPinInput(val.replace(/\D/g, ""));
                  setPinError(false);
                }
              }}
              onEnter={handleVerify}
              placeholder="••••"
            />
          </motion.div>

          {pinError ? (
            <span className="text-[10px] md:text-xs font-bold text-rose-500 bg-rose-950/30 px-3 py-1.5 rounded-[24px] border border-rose-900/40 animate-pulse text-center">
              Invalid passcode entered. Please retry!
            </span>
          ) : (
            <span className="text-[9px] md:text-[10px] text-faint font-mono italic text-center">
              Tap checkmark after inputting 4 digits.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
