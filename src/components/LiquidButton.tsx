"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LiquidButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function LiquidButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: LiquidButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-medium text-sm transition-all duration-300 overflow-hidden select-none border";

  const styles: Record<string, string> = {
    primary:
      "liquid-bg text-white border-white/10 shadow-[0_8px_30px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_45px_rgba(124,58,237,0.6)]",

    secondary:
      "glass text-white border-white/10 hover:bg-white/10 hover:border-white/20 shadow-[0_8px_30px_rgba(255,255,255,0.05)]",

    danger:
      "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 shadow-[0_8px_30px_rgba(239,68,68,0.15)]",

    ghost:
      "text-white/70 hover:text-white hover:bg-white/5 border-transparent",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.04,
              y: -2,
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.96,
              y: 1,
            }
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {/* Animated liquid glow */}
      <motion.span
        className="pointer-events-none absolute -inset-10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-10%", "10%", "-10%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.45), transparent 65%)",
        }}
      />

      {/* Moving shine */}
      <motion.span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 group-hover:translate-x-full"
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      />

      {/* Top glass highlight */}
      <span className="pointer-events-none absolute inset-x-2 top-[1px] h-px rounded-full bg-white/30 opacity-70" />

      {/* Inner glow */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-300" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      {/* Bottom liquid reflection */}
      <motion.span
        className="pointer-events-none absolute bottom-0 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100"
        initial={{ scaleX: 0.5 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}