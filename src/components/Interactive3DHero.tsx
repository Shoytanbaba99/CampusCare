"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { Terminal, Shield, Sparkles, Activity } from "lucide-react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function Interactive3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    "perspective(1000px) rotateX(4deg) rotateY(-2deg) scale3d(1, 1, 1)"
  );
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxRotate = 8;
    const rotateX = -((y - centerY) / centerY) * maxRotate;
    const rotateY = ((x - centerX) / centerX) * maxRotate;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2
      )}deg) scale3d(1.02, 1.02, 1.02)`
    );

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(4deg) rotateY(-2deg) scale3d(1, 1, 1)");
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev.slice(-4), newRipple]);

    setPingStatus(`SIGNAL PING: POS (${x.toFixed(0)}, ${y.toFixed(0)}) ACKNOWLEDGED`);
    setTimeout(() => {
      setPingStatus(null);
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative max-w-5xl mx-auto rounded-2xl border border-[#1D4A38] bg-[#0E2219] shadow-[0_30px_70px_rgba(0,0,0,0.7)] p-2 sm:p-3 overflow-hidden cursor-crosshair transition-all duration-300 ease-out active:scale-[0.99]"
      style={{
        transform: transformStyle,
        transformStyle: "preserve-3d",
        transition: "transform 160ms var(--ease-out), box-shadow 300ms ease-out",
      }}
    >
      {/* Dynamic Cursor Glare Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(16, 185, 129, ${glarePosition.opacity}), transparent 50%)`,
        }}
      />

      {/* Click Phosphor Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-[#10B981] bg-[#10B981]/20 pointer-events-none z-30 animate-ping"
          style={{ left: `${r.x}px`, top: `${r.y}px` }}
        />
      ))}

      {/* Terminal Viewport Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1D4A38] bg-[#07130E] rounded-t-xl text-xs text-[#A7F3D0]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#10B981]" />
          <span className="font-bold text-[#ECFDF5] font-display">3D INTERACTIVE VIEWPORT</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {pingStatus ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#34D399] border border-emerald-500/30 font-semibold animate-pulse">
              <Activity className="w-3.5 h-3.5" />
              <span>{pingStatus}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#153326] text-[#34D399] border border-[#1D4A38] font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
              <span>CLICK TO INTERACT</span>
            </span>
          )}
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
        </div>
      </div>

      {/* Hero Showcase Image */}
      <div className="relative overflow-hidden rounded-b-xl border border-[#1D4A38]">
        <Image
          src="/images/hero.jpg"
          alt="CampusCare 3D Operations Dashboard"
          width={1280}
          height={720}
          priority
          unoptimized
          className="w-full h-auto object-cover select-none pointer-events-none"
        />

        {/* Floating Weightless Badges inside 3D Viewport */}
        <div
          className="absolute bottom-4 left-4 p-3.5 rounded-xl bg-[#07130E]/90 border border-[#1D4A38] text-xs space-y-1 backdrop-blur-md shadow-xl hidden sm:block"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center gap-2 text-[#10B981] font-bold">
            <Shield className="w-4 h-4" />
            <span>REAL-TIME REPAIR ENGINE</span>
          </div>
          <p className="text-xs text-[#A7F3D0]/80">Non-recursive PostgreSQL RLS &bull; &lt;8ms query</p>
        </div>
      </div>
    </div>
  );
}
