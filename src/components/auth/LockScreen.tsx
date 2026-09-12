import React, { useState, useEffect, useRef } from 'react';
import { Operator } from '../../types';
import { StorageService } from '../../lib/storage';
import { 
  FlaskConical, 
  Delete, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LockScreenProps {
  onUnlock: (operator: Operator) => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus automatically
    inputRef.current?.focus();
  }, []);

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
  };

  const verifyPin = async (inputPin: string) => {
    setLoading(true);
    try {
      const op = await StorageService.authenticatePin(inputPin);
      if (op) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        setTimeout(() => {
          onUnlock(op);
          setLoading(false);
        }, 150);
      } else {
        if (inputPin.length >= 4) {
          setError('PIN errato o non autorizzato.');
          setPin('');
        }
        setLoading(false);
      }
    } catch (e) {
      setError('Errore durante la verifica');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Escape') {
      handleClear();
    } else if (/^[0-9]$/.test(e.key)) {
      handleKeyPress(e.key);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 sm:p-6 select-none overflow-y-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Invisible listener for physical keyboard & mobile software keyboards */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        className="opacity-0 absolute -top-9999px left-0 w-1 h-1 pointer-events-none"
        onKeyDown={handleKeyDown}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          if (val.length <= 6) {
            setPin(val);
            if (val.length >= 4) verifyPin(val);
          }
        }}
      />

      {/* Aesthetic Medical Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(6,182,212,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Lock Card */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/70 overflow-hidden relative z-10 backdrop-blur-2xl my-auto">
        
        {/* Card Header */}
        <div className="p-6 text-center border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950/60">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
            <FlaskConical className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            LabStock
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Inserisci il tuo PIN personale per sbloccare
          </p>
        </div>

        {/* PIN pad area */}
        <div className="p-6 space-y-5">
          
          {/* PIN Dots Display */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-3.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/90 shadow-inner">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pin.length > i
                      ? 'bg-cyan-400 scale-110 shadow-lg shadow-cyan-400/80 border-2 border-cyan-200'
                      : 'bg-slate-800 border-2 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-900/60 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Numeric Touch Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleKeyPress(num);
                }}
                className="h-13 sm:h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-cyan-500 active:text-slate-950 active:scale-95 border border-slate-700/80 text-xl font-bold text-slate-100 hover:text-white transition-all shadow flex items-center justify-center cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="h-13 sm:h-14 rounded-2xl bg-slate-800/30 hover:bg-slate-800 active:scale-95 border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center uppercase tracking-wider cursor-pointer"
            >
              Canc
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleKeyPress('0');
              }}
              className="h-13 sm:h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-cyan-500 active:text-slate-950 active:scale-95 border border-slate-700/80 text-xl font-bold text-slate-100 hover:text-white transition-all shadow flex items-center justify-center cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="h-13 sm:h-14 rounded-2xl bg-slate-800/30 hover:bg-slate-800 active:scale-95 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
