import React, { useState, useEffect } from 'react';
import { Operator } from '../../types';
import { StorageService } from '../../lib/storage';
import { KeyRound, ShieldCheck, User, Sparkles, AlertCircle, Delete, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PinPadModalProps {
  onSuccess: (operator: Operator) => void;
  isOpen: boolean;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({ onSuccess, isOpen }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedQuickOp, setSelectedQuickOp] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setSelectedQuickOp(null);
      StorageService.getOperators().then(ops => setOperators(ops.filter(o => o.active !== false)));
    }
  }, [isOpen]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError(null);
      if (newPin.length >= 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
    setSelectedQuickOp(null);
  };

  const verifyPin = async (inputPin: string) => {
    setLoading(true);
    try {
      const op = await StorageService.authenticatePin(inputPin);
      if (op) {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 }
        });
        setTimeout(() => {
          onSuccess(op);
          setLoading(false);
        }, 200);
      } else {
        if (inputPin.length >= 4) {
          setError('PIN errato. Verifica il codice assegnato.');
        }
        setLoading(false);
      }
    } catch (e) {
      setError('Errore durante la verifica');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col">
        
        {/* Header Medical Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm mb-3 shadow-inner">
            <KeyRound className="w-8 h-8 text-cyan-200 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">LabStock • Controllo Accesso</h2>
          <p className="text-xs text-cyan-100 mt-1 font-medium">Inserisci il tuo PIN personale per sbloccare la sessione</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Operator Selection (Facilita il cambio turno rapido) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Seleziona Operatore o Digita PIN:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {operators.map(op => {
                const isSelected = selectedQuickOp?.id === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuickOp(op);
                      setPin(op.pin);
                      verifyPin(op.pin);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs ${
                      isSelected 
                        ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300' 
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${op.badge_color || 'from-teal-500 to-cyan-600'} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow`}>
                      {op.first_name[0]}{op.last_name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold truncate">{op.first_name} {op.last_name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{op.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input Dots Display */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full transition-all duration-200 border-2 ${
                    pin.length > i
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400 border-cyan-400 scale-110 shadow-lg shadow-cyan-500/50'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium bg-rose-950/30 px-3 py-1 rounded-lg border border-rose-900/50 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-lg font-bold text-slate-100 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-2xl bg-slate-800/20 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center uppercase tracking-wider"
            >
              Canc
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700 active:bg-cyan-600 border border-slate-700 text-lg font-bold text-slate-100 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-slate-800/20 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-slate-500">
              💡 PIN Demo predefiniti: <strong className="text-cyan-400">1234</strong> (E. Conti), <strong className="text-cyan-400">5678</strong> (M. Bianchi), <strong className="text-cyan-400">9999</strong> (G. Ferrari)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
