"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function GlowOrbs() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 50,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 50,
    damping: 20,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030308]">
      {/* Base */}
      <div className="absolute inset-0 bg-[#030308]" />

      {/* Deep radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(124,58,237,0.18),transparent_45%)]" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 80%)",
        }}
      />

      {/* Top purple orb */}
      <motion.div
        className="absolute -left-40 -top-48 h-[650px] w-[650px] rounded-full bg-purple-600/30 blur-[150px]"
        animate={{
          x: [0, 80, -30, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.35, 0.65, 0.4, 0.35],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Cyan orb */}
      <motion.div
        className="absolute -right-48 top-[15%] h-[600px] w-[600px] rounded-full bg-cyan-500/25 blur-[160px]"
        animate={{
          x: [0, -90, 30, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.9, 1.12, 1],
          opacity: [0.3, 0.6, 0.35, 0.3],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Pink orb */}
      <motion.div
        className="absolute left-[35%] top-[20%] h-[420px] w-[420px] rounded-full bg-fuchsia-500/15 blur-[140px]"
        animate={{
          x: [-50, 80, -20, -50],
          y: [30, -60, 70, 30],
          scale: [0.9, 1.2, 0.95, 0.9],
          opacity: [0.2, 0.45, 0.25, 0.2],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bottom violet orb */}
      <motion.div
        className="absolute -bottom-60 left-[15%] h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[150px]"
        animate={{
          x: [0, 100, -50, 0],
          scale: [1, 1.15, 0.9, 1],
          opacity: [0.25, 0.5, 0.3, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mouse-follow ambient glow */}
      <motion.div
        className="absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]"
        style={{
          left: smoothX,
          top: smoothY,
        }}
      />

      {/* Mouse-follow inner light */}
      <motion.div
        className="absolute h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.06] blur-[70px]"
        style={{
          left: smoothX,
          top: smoothY,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 45 }).map((_, index) => {
          const positions = [
            { left: "5%", top: "12%" },
            { left: "12%", top: "72%" },
            { left: "18%", top: "35%" },
            { left: "24%", top: "88%" },
            { left: "31%", top: "18%" },
            { left: "38%", top: "63%" },
            { left: "44%", top: "9%" },
            { left: "51%", top: "82%" },
            { left: "57%", top: "31%" },
            { left: "64%", top: "68%" },
            { left: "71%", top: "14%" },
            { left: "78%", top: "52%" },
            { left: "85%", top: "28%" },
            { left: "92%", top: "76%" },
            { left: "97%", top: "42%" },
          ];

          const position = positions[index % positions.length];

          return (
            <motion.span
              key={index}
              className="absolute h-[2px] w-[2px] rounded-full bg-white/30"
              style={position}
              animate={{
                opacity: [0.1, 0.7, 0.1],
                scale: [0.5, 1.5, 0.5],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3 + (index % 5),
                repeat: Infinity,
                delay: (index % 7) * 0.5,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Horizontal light beams */}
      <motion.div
        className="absolute left-[-20%] top-[42%] h-px w-[140%] bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
        animate={{
          x: ["-10%", "10%", "-10%"],
          opacity: [0.2, 0.7, 0.2],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute left-[-20%] top-[58%] h-px w-[140%] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
        animate={{
          x: ["10%", "-10%", "10%"],
          opacity: [0.1, 0.5, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Center focus */}
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025] shadow-[inset_0_0_150px_rgba(124,58,237,0.04)]" />

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(3,3,8,0.45)_70%,rgba(3,3,8,0.9)_100%)]" />

      {/* Top / bottom cinematic fade */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#030308] to-transparent opacity-60" />

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#030308] to-transparent opacity-70" />

      {/* Subtle noise */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}