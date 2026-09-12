import React, { useState } from 'react';
import { Chemical, Operator } from '../../types';
import { StorageService } from '../../lib/storage';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  User,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemicals: Chemical[];
  activeOperator: Operator | null;
  onSuccess: () => void;
  preselectedChemicalId?: string;
}

export const QuickUsageModal: React.FC<QuickUsageModalProps> = ({
  isOpen,
  onClose,
  chemicals,
  activeOperator,
  onSuccess,
  preselectedChemicalId
}) => {
  const [selectedId, setSelectedId] = useState<string>(preselectedChemicalId || '');
  const [quantity, setQuantity] = useState<string>('');
  const [protocol, setProtocol] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (preselectedChemicalId) {
      setSelectedId(preselectedChemicalId);
    } else if (chemicals.length > 0 && !selectedId) {
      setSelectedId(chemicals[0].id);
    }
  }, [preselectedChemicalId, chemicals, isOpen]);

  if (!isOpen) return null;

  const selectedChem = chemicals.find(c => c.id === selectedId);
  const qtyNumber = parseFloat(quantity) || 0;
  const currentStock = selectedChem ? selectedChem.current_quantity : 0;
  const remainingAfterUsage = Math.max(0, currentStock - qtyNumber);
  const willBeUnderThreshold = selectedChem ? remainingAfterUsage <= selectedChem.min_threshold : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChem) {
      setError('Seleziona un reagente');
      return;
    }
    if (qtyNumber <= 0) {
      setError('Inserisci una quantità valida da prelevare');
      return;
    }
    if (qtyNumber > currentStock) {
      setError(`Quantità richiesta (${qtyNumber}) superiore alla scorta disponibile (${currentStock} ${selectedChem.unit})`);
      return;
    }
    if (!protocol.trim()) {
      setError('Specifica il protocollo o la motivazione del prelievo');
      return;
    }

    setLoading(true);
    try {
      await StorageService.recordStockMovement({
        chemicalId: selectedChem.id,
        type: 'usage',
        quantity: qtyNumber,
        purposeProtocol: protocol.trim(),
        operator: activeOperator || undefined
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });

      setLoading(false);
      setQuantity('');
      setProtocol('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Registra Prelievo / Scarico</h3>
              <p className="text-[11px] sm:text-xs text-teal-100">Scarico immediato con aggiornamento scorte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Operator Reminder */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 text-xs">
            <span className="text-slate-400 font-medium">Operatore:</span>
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {activeOperator ? `${activeOperator.first_name} ${activeOperator.last_name}` : 'Operatore'}
            </span>
          </div>

          {/* Select Chemical */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Reagente Chimico:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-medium"
            >
              {chemicals.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — Scorta: {c.current_quantity} {c.unit} ({c.storage_location})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity to withdraw */}
          {selectedChem && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-slate-300">Quantità da prelevare:</label>
                <span className="text-slate-400">
                  Disponibili: <strong className="text-white">{selectedChem.current_quantity} {selectedChem.unit}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={selectedChem.current_quantity}
                  placeholder="Es. 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full pl-4 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400">
                  {selectedChem.unit}
                </span>
              </div>
            </div>
          )}

          {/* Reason / Protocol */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Protocollo / Esame / Paziente / Reparto:
            </label>
            <input
              type="text"
              placeholder="Es. Analisi urine sedimento, PCR Covid-19, Colorazione vetrini..."
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Live Remaining Stock Preview */}
          {selectedChem && qtyNumber > 0 && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              willBeUnderThreshold 
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' 
                : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                {willBeUnderThreshold ? <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>Rimanenza stimata:</span>
              </div>
              <span className="font-extrabold text-sm">{remainingAfterUsage} {selectedChem.unit} {willBeUnderThreshold && '(SOTTO SOGLIA)'}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Salvataggio...' : 'Conferma Prelievo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
