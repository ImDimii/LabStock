import React, { useState } from 'react';
import { Chemical, HazardType, ChemicalCategory } from '../../types';
import { StorageService } from '../../lib/storage';
import { STANDARD_CHEMICAL_CATALOG, StandardChemicalPreset } from '../../utils/chemicalPresets';
import { 
  FlaskRound, 
  X, 
  AlertTriangle, 
  Sparkles,
  ListFilter,
  Check
} from 'lucide-react';
import { GHS_LABELS } from '../../utils/ghsHazardIcons';

interface ChemicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemical?: Chemical | null;
  onSuccess: () => void;
}

const CATEGORIES: ChemicalCategory[] = [
  'Solventi & Liquidi Organici',
  'Acidi & Basi Forti',
  'Coloranti & Fissativi Istologici',
  'Buffer, Sali & Soluzioni Tampone',
  'Standard, Calibratori & Controlli',
  'Kit Diagnostici & Enzimi',
  'Disinfettanti & Decontaminanti'
];

const ALL_HAZARDS: HazardType[] = [
  'flammable',
  'corrosive',
  'toxic',
  'health_hazard',
  'irritant',
  'oxidizing',
  'explosive',
  'environmental',
  'biohazard'
];

export const ChemicalModal: React.FC<ChemicalModalProps> = ({
  isOpen,
  onClose,
  chemical,
  onSuccess
}) => {
  const isEditing = !!chemical;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ChemicalCategory>('Solventi & Liquidi Organici');
  const [casNumber, setCasNumber] = useState('');
  const [hazardSymbols, setHazardSymbols] = useState<HazardType[]>([]);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1000);
  const [minThreshold, setMinThreshold] = useState<number>(500);
  const [unit, setUnit] = useState<Chemical['unit']>('ml');
  const [storageLocation, setStorageLocation] = useState('Armadio Ventilato A1');
  const [expirationDate, setExpirationDate] = useState('2027-12-31');
  const [lotNumber, setLotNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset selector
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  React.useEffect(() => {
    if (chemical) {
      setName(chemical.name);
      setCode(chemical.code);
      setCategory(chemical.category);
      setCasNumber(chemical.cas_number || '');
      setHazardSymbols(chemical.hazard_symbols || []);
      setCurrentQuantity(chemical.current_quantity);
      setMinThreshold(chemical.min_threshold);
      setUnit(chemical.unit);
      setStorageLocation(chemical.storage_location);
      setExpirationDate(chemical.expiration_date);
      setLotNumber(chemical.lot_number);
      setSupplier(chemical.supplier || '');
      setNotes(chemical.notes || '');
      setSelectedPreset('');
    } else {
      setName('');
      setCode(`REA-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory('Solventi & Liquidi Organici');
      setCasNumber('');
      setHazardSymbols(['flammable']);
      setCurrentQuantity(1000);
      setMinThreshold(500);
      setUnit('ml');
      setStorageLocation('Armadio Ventilato A1');
      setExpirationDate(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]);
      setLotNumber(`LOT-${Math.floor(10000 + Math.random() * 90000)}`);
      setSupplier('Sigma-Aldrich / Merck');
      setNotes('');
      setSelectedPreset('');
    }
  }, [chemical, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = STANDARD_CHEMICAL_CATALOG.find(p => p.name === presetName);
    if (found) {
      setName(found.name);
      setCategory(found.category);
      setCasNumber(found.cas_number);
      setHazardSymbols(found.hazard_symbols);
      setUnit(found.unit);
      setMinThreshold(found.default_min_threshold);
      setStorageLocation(found.default_storage_location);
      setSupplier(found.default_supplier);
      setNotes(found.notes);
    }
  };

  const toggleHazard = (hazard: HazardType) => {
    if (hazardSymbols.includes(hazard)) {
      setHazardSymbols(hazardSymbols.filter(h => h !== hazard));
    } else {
      setHazardSymbols([...hazardSymbols, hazard]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Inserisci il nome del reagente');
      return;
    }

    setLoading(true);
    try {
      await StorageService.saveChemical({
        id: chemical?.id,
        code: code.trim(),
        name: name.trim(),
        category,
        cas_number: casNumber.trim(),
        hazard_symbols: hazardSymbols,
        current_quantity: Number(currentQuantity),
        min_threshold: Number(minThreshold),
        unit,
        storage_location: storageLocation.trim(),
        expiration_date: expirationDate,
        lot_number: lotNumber.trim(),
        supplier: supplier.trim(),
        notes: notes.trim()
      });

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Responsive */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FlaskRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {isEditing ? `Modifica Scheda: ${chemical.code}` : 'Nuovo Reagente Sanitario'}
              </h3>
              <p className="text-[11px] sm:text-xs text-cyan-100">Compila la scheda o seleziona dal catalogo standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Preset Fast Selector (SOLO IN CREAZIONE) */}
          {!isEditing && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Seleziona da Catalogo Predefinito (Auto-compilazione):</span>
              </div>
              <select
                value={selectedPreset}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-cyan-500/40 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-medium"
              >
                <option value="">-- Seleziona un prodotto comune (es. Etanolo, Formalina, Acido Cloridrico, Taq...) --</option>
                {STANDARD_CHEMICAL_CATALOG.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name} [{p.category}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nome e Codice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nome del Reagente *
              </label>
              <input
                type="text"
                required
                placeholder="Es. Etanolo Assoluto 99.8%"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Codice Univoco / SKU
              </label>
              <input
                type="text"
                required
                placeholder="REA-1001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Categoria e Numero CAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Categoria Chimica / Sanitaria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ChemicalCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Numero CAS
              </label>
              <input
                type="text"
                placeholder="Es. 64-17-5"
                value={casNumber}
                onChange={(e) => setCasNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Quantità, Soglia Minima, Unità di Misura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Scorta Iniziale
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-400 block mb-1">
                Soglia Allerta Riordino
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-rose-900/60 text-rose-300 text-xs font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Unità di Misura
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Chemical['unit'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="ml">ml (Millilitri)</option>
                <option value="L">L (Litri)</option>
                <option value="g">g (Grammi)</option>
                <option value="kg">kg (Chilogrammi)</option>
                <option value="flaconi">flaconi</option>
                <option value="fiale">fiale</option>
                <option value="kit">kit</option>
                <option value="pezzi">pezzi</option>
              </select>
            </div>
          </div>

          {/* Ubicazione, Lotto, Scadenza, Fornitore */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Posizione / Ubicazione
              </label>
              <input
                type="text"
                placeholder="Es. Frigo +4°C A, Armadio Ventilato A1"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Data di Scadenza
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Numero di Lotto
              </label>
              <input
                type="text"
                placeholder="Es. LOT-9904A"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Fornitore / Produttore
              </label>
              <input
                type="text"
                placeholder="Es. Sigma-Aldrich, Merck, Bio-Optica"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Pittogrammi GHS */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Pittogrammi di Pericolo GHS:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_HAZARDS.map(hazard => {
                const isSelected = hazardSymbols.includes(hazard);
                const info = GHS_LABELS[hazard];
                return (
                  <button
                    key={hazard}
                    type="button"
                    onClick={() => toggleHazard(hazard)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? `${info.bg} ${info.border} ${info.text} ring-2 ring-cyan-500/50 scale-105`
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {info.icon}
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Note o Istruzioni d'uso:
            </label>
            <textarea
              rows={2}
              placeholder="DPI richiesti, modalità di smaltimento, protocolli..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Salvataggio...' : isEditing ? 'Aggiorna Reagente' : 'Salva nel Magazzino'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
