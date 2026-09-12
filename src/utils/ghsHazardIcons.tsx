import React from 'react';
import { HazardType } from '../types';
import { Flame, Skull, Biohazard, ShieldAlert, AlertTriangle, Radiation, Zap, Wind, Waves } from 'lucide-react';

export const GHS_LABELS: Record<HazardType, { label: string; bg: string; border: string; text: string; icon: React.ReactNode }> = {
  flammable: {
    label: 'Infiammabile',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    icon: <Flame className="w-3.5 h-3.5" />
  },
  corrosive: {
    label: 'Corrosivo',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: <ShieldAlert className="w-3.5 h-3.5" />
  },
  toxic: {
    label: 'Tossico Acuto',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: <Skull className="w-3.5 h-3.5" />
  },
  health_hazard: {
    label: 'Pericolo Salute',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    icon: <AlertTriangle className="w-3.5 h-3.5" />
  },
  irritant: {
    label: 'Irritante',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: <AlertTriangle className="w-3.5 h-3.5" />
  },
  oxidizing: {
    label: 'Comburente',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    icon: <Zap className="w-3.5 h-3.5" />
  },
  explosive: {
    label: 'Esplosivo',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: <Radiation className="w-3.5 h-3.5" />
  },
  environmental: {
    label: 'Inquinante',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: <Waves className="w-3.5 h-3.5" />
  },
  biohazard: {
    label: 'Rischio Biologico',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    icon: <Biohazard className="w-3.5 h-3.5" />
  }
};

export const HazardBadge: React.FC<{ type: HazardType; showLabel?: boolean }> = ({ type, showLabel = true }) => {
  const info = GHS_LABELS[type] || {
    label: type,
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    icon: <AlertTriangle className="w-3.5 h-3.5" />
  };

  return (
    <span 
      title={`Pittogramma GHS: ${info.label}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${info.bg} ${info.border} ${info.text}`}
    >
      {info.icon}
      {showLabel && <span>{info.label}</span>}
    </span>
  );
};
