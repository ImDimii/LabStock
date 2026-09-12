import React, { useState } from 'react';
import { Chemical, Operator } from '../../types';
import { StorageService } from '../../lib/storage';
import { 
  PackagePlus, 
  X, 
  AlertTriangle, 
  Hash
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemicals: Chemical[];
  activeOperator: Operator | null;
  onSuccess: () => void;
  preselectedChemicalId?: string;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  chemicals,
  activeOperator,
  onSuccess,
  preselectedChemicalId
}) => {
  const [selectedId, setSelectedId] = useState<string>(preselectedChemicalId || '');
  const [quantity, setQuantity] = useState<string>('');
  const [lotNumber, setLotNumber] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [protocol, setProtocol] = useState<string>('Rifornimento magazzino');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (preselectedChemicalId) {
      setSelectedId(preselectedChemicalId);
      const c = chemicals.find(item => item.id === preselectedChemicalId);
      if (c) {
        setLotNumber(c.lot_number || '');
        setExpirationDate(c.expiration_date || '');
      }
    } else if (chemicals.length > 0 && !selectedId) {
      setSelectedId(chemicals[0].id);
      setLotNumber(chemicals[0].lot_number || '');
      setExpirationDate(chemicals[0].expiration_date || '');
    }
  }, [preselectedChemicalId, chemicals, isOpen]);

  if (!isOpen) return null;

  const selectedChem = chemicals.find(c => c.id === selectedId);
  const qtyNumber = parseFloat(quantity) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChem) {
      setError('Seleziona un reagente');
      return;
    }
    if (qtyNumber <= 0) {
      setError('Inserisci una quantità valida da caricare');
      return;
    }

    setLoading(true);
    try {
      await StorageService.recordStockMovement({
        chemicalId: selectedChem.id,
        type: 'restock',
        quantity: qtyNumber,
        purposeProtocol: protocol.trim() || 'Arrivo nuovo lotto fornitore',
        newLotNumber: lotNumber.trim() || undefined,
        newExpirationDate: expirationDate || undefined,
        operator: activeOperator || undefined
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setLoading(false);
      setQuantity('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante il carico magazzino');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Carico Magazzino / Rifornimento</h3>
              <p className="text-[11px] sm:text-xs text-emerald-100">Aggiungi scorte, aggiorna lotto e scadenza</p>
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
          
          {/* Select Chemical */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Reagente da Rifornire:
            </label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const c = chemicals.find(it => it.id === e.target.value);
                if (c) {
                  setLotNumber(c.lot_number);
                  setExpirationDate(c.expiration_date);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-medium"
            >
              {chemicals.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — Attuale: {c.current_quantity} {c.unit} (Min: {c.min_threshold} {c.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity to Add */}
          {selectedChem && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Quantità in Entrata da Aggiungere:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="Es. 1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full pl-4 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                  {selectedChem.unit}
                </span>
              </div>
            </div>
          )}

          {/* Lot Number & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Nuovo Lotto (Opzionale):
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="LOT-..."
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Data di Scadenza:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Notes / Documento di Trasporto */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Riferimento DDT / Fattura / Fornitore:
            </label>
            <input
              type="text"
              placeholder="Es. DDT n. 8892 Fornitore Sigma Aldrich"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Salvataggio...' : 'Conferma Carico'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
