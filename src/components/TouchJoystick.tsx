import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

interface TouchJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const TouchJoystick: React.FC<TouchJoystickProps> = ({ onMove }) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activePointer = useRef<number | null>(null);

  const maxRadius = 42;
  const deadzone = 0.12;

  const updateStick = (clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnob({ x: dx, y: dy });

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;
    const mag = Math.hypot(normX, normY);
    if (mag < deadzone) {
      onMove(0, 0);
    } else {
      onMove(normX, normY);
    }
  };

  const resetStick = (target?: HTMLDivElement | null, pointerId?: number) => {
    if (target && pointerId !== undefined) {
      try {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
      } catch {
        // Ignore if pointer capture already released
      }
    }
    activePointer.current = null;
    setIsActive(false);
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        if (activePointer.current !== null) return;
        e.stopPropagation();
        activePointer.current = e.pointerId;
        setIsActive(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Ignore unsupported pointer capture
        }
        updateStick(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (activePointer.current !== e.pointerId) return;
        e.stopPropagation();
        updateStick(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (activePointer.current !== e.pointerId) return;
        e.stopPropagation();
        resetStick(e.currentTarget, e.pointerId);
      }}
      onPointerCancel={(e) => {
        if (activePointer.current !== e.pointerId) return;
        resetStick(e.currentTarget, e.pointerId);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing shadow-xl transition-colors ${
        isActive
          ? 'bg-slate-950/65 border-amber-300/80'
          : 'bg-slate-950/45 border-white/35'
      }`}
      role="application"
      aria-label="Joystick Gerak Karakter"
    >
      {/* Inner directional ring & cardinal cues */}
      <div className="absolute inset-4 rounded-full border border-white/15 pointer-events-none" />
      <ChevronUp className="w-4 h-4 text-white/45 absolute top-1.5 left-1/2 -translate-x-1/2 pointer-events-none" />
      <ChevronDown className="w-4 h-4 text-white/45 absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none" />
      <ChevronLeft className="w-4 h-4 text-white/45 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <ChevronRight className="w-4 h-4 text-white/45 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Tactile center thumb knob */}
      <div
        className={`w-13 h-13 rounded-full border-2 shadow-lg pointer-events-none flex items-center justify-center ${
          isActive
            ? 'bg-amber-400 border-white scale-105'
            : 'bg-amber-400/90 border-white/90'
        }`}
        style={{
          transform: `translate(${knob.x}px, ${knob.y}px)`,
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/45" />
      </div>
    </div>
  );
};
