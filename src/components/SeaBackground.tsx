import React from "react";
import { useData } from "../contexts/DataContext";

export const SeaBackground: React.FC = () => {
  const { theme } = useData();
  const isLight = theme === "light";

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-[-1] ${isLight ? "bg-sky-50" : "bg-app-bg"}`}>
      {/* Deep Sea Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${isLight ? "from-sky-100 via-sky-50 to-white" : "from-[#02101e] via-[#051b30] to-[#010b14]"}`} />

      {/* Animated Waves */}
      <div className={`absolute bottom-0 left-0 w-[200%] h-32 opacity-20 animate-wave`}
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='${isLight ? "%230ea5e9" : "%2338bdf8"}'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: '400px 100%' }} />
      <div className={`absolute bottom-0 left-0 w-[200%] h-40 opacity-10 animate-wave-slow`}
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-.2-31.6z' fill='${isLight ? "%230284c7" : "%230ea5e9"}'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: '400px 100%', animationDelay: '-2s' }} />

      {/* Floating Bubbles */}
      <div className="bubbles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isLight ? "bg-sky-400/20" : "bg-white/20"} animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Swimming Fish */}
      <div className="absolute top-1/4 left-[-10%] w-8 h-4 opacity-30 animate-swim">
        <svg viewBox="0 0 24 24" fill="none" stroke={isLight ? "#0284c7" : "#38bdf8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13c-.96 0-1.87-.2-2.73-.55C2.1 12 1.35 11.14 1 10c0-1.66 1.34-3 3-3 1.88 0 3.65.62 5.09 1.67L12 11c1.24 0 2.45-.19 3.61-.55l.89-.28C17.65 9.85 19 8.54 19 6.94V6c0-1.66 1.34-3 3-3v8c0 1.66-1.34 3-3 3h-1c-1.24 0-2.45-.19-3.61-.55l-.89-.28C12.35 12.85 11 11.54 11 9.94v-.94l-2.09 1.67A8.96 8.96 0 0 1 6 13z"/>
          <path d="M2 10h2"/>
        </svg>
      </div>
      <div className="absolute top-2/3 right-[-10%] w-12 h-6 opacity-20 animate-swim-reverse" style={{ animationDelay: '3s' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={isLight ? "#0369a1" : "#0ea5e9"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
          <path d="M6 13c-.96 0-1.87-.2-2.73-.55C2.1 12 1.35 11.14 1 10c0-1.66 1.34-3 3-3 1.88 0 3.65.62 5.09 1.67L12 11c1.24 0 2.45-.19 3.61-.55l.89-.28C17.65 9.85 19 8.54 19 6.94V6c0-1.66 1.34-3 3-3v8c0 1.66-1.34 3-3 3h-1c-1.24 0-2.45-.19-3.61-.55l-.89-.28C12.35 12.85 11 11.54 11 9.94v-.94l-2.09 1.67A8.96 8.96 0 0 1 6 13z"/>
        </svg>
      </div>
    </div>
  );
};
