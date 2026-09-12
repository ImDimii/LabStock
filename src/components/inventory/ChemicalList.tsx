import React, { useState } from 'react';
import { Chemical, Operator, HazardType } from '../../types';
import { 
  Search, 
  Boxes, 
  Minus, 
  PackagePlus, 
  Edit3, 
  Trash2, 
  MapPin, 
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';
import { HazardBadge } from '../../utils/ghsHazardIcons';
import { formatQuantity, formatDate, getDaysUntilExpiration } from '../../utils/formatters';
import { exportInventoryToExcel, exportInventoryToPDF } from '../../utils/exportHelpers';

interface ChemicalListProps {
  chemicals: Chemical[];
  activeOperator: Operator | null;
  onEdit: (chemical: Chemical) => void;
  onDelete: (id: string) => void;
  onQuickUsage: (chemicalId: string) => void;
  onRestock: (chemicalId: string) => void;
  searchTerm: string;
}

export const ChemicalList: React.FC<ChemicalListProps> = ({
  chemicals,
  activeOperator,
  onEdit,
  onDelete,
  onQuickUsage,
  onRestock,
  searchTerm
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const categories = Array.from(new Set(chemicals.map(c => c.category)));

  const filteredChemicals = chemicals.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cas_number && c.cas_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.lot_number && c.lot_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.storage_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.supplier && c.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;

    const isLowStock = Number(c.current_quantity) <= Number(c.min_threshold);
    const isExpiring = getDaysUntilExpiration(c.expiration_date) <= 30;

    let matchesStatus = true;
    if (filterStockStatus === 'low') matchesStatus = isLowStock;
    if (filterStockStatus === 'expiring') matchesStatus = isExpiring;
    if (filterStockStatus === 'normal') matchesStatus = !isLowStock && !isExpiring;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Search & EXPORT BUTTONS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              <span>Inventario Reagenti Sanitario</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredChemicals.length} di {chemicals.length} reagenti a catalogo
            </p>
          </div>

          {/* Export Actions (Excel & PDF) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportInventoryToExcel(chemicals, 'all')}
              disabled={chemicals.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Completo</span>
            </button>

            <button
              onClick={() => exportInventoryToPDF(chemicals, activeOperator, 'all')}
              disabled={chemicals.length === 0}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>PDF Ufficiale</span>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400'
                }`}
              >
                Tabella
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400'
                }`}
              >
                Schede
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtra:</span>
          </div>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            Tutte
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all truncate max-w-[180px] cursor-pointer ${
                selectedCategory === cat ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">Tutti gli stati</option>
            <option value="low">Solo In Esaurimento</option>
            <option value="expiring">Solo In Scadenza (&lt;30gg)</option>
            <option value="normal">Solo Scorte Regolari</option>
          </select>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Codice / Reagente</th>
                  <th className="py-3.5 px-4">Categoria & GHS</th>
                  <th className="py-3.5 px-4">Giacenza / Soglia</th>
                  <th className="py-3.5 px-4">Ubicazione & Lotto</th>
                  <th className="py-3.5 px-4">Scadenza</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredChemicals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Nessun reagente trovato. Clicca su <strong>"+ Nuovo Reagente"</strong> per caricarne uno.
                    </td>
                  </tr>
                ) : (
                  filteredChemicals.map(c => {
                    const isLow = Number(c.current_quantity) <= Number(c.min_threshold);
                    const daysToExp = getDaysUntilExpiration(c.expiration_date);
                    const isExp = daysToExp <= 30;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] text-cyan-400 font-semibold">{c.code}</div>
                          <div className="font-bold text-slate-100 text-sm mt-0.5">{c.name}</div>
                          {c.cas_number && (
                            <div className="text-[10px] text-slate-500 font-mono">CAS: {c.cas_number}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium">{c.category}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.hazard_symbols.map(h => (
                              <HazardBadge key={h} type={h} showLabel={false} />
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-extrabold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {formatQuantity(c.current_quantity)} {c.unit}
                            </span>
                            {isLow && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold animate-pulse">
                                SOTTO SOGLIA
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Minimo: {formatQuantity(c.min_threshold)} {c.unit}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{c.storage_location}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Lotto: {c.lot_number}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className={`font-semibold ${isExp ? 'text-amber-400' : 'text-slate-300'}`}>
                            {formatDate(c.expiration_date)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {daysToExp < 0 ? 'Scaduto!' : `${daysToExp} gg rimasti`}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onQuickUsage(c.id)}
                              title="Registra Prelievo"
                              className="px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                              <span>Preleva</span>
                            </button>
                            <button
                              onClick={() => onRestock(c.id)}
                              title="Carico Magazzino"
                              className="p-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                            >
                              <PackagePlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEdit(c)}
                              title="Modifica Scheda"
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Eliminare definitivamente ${c.name}?`)) {
                                  onDelete(c.id);
                                }
                              }}
                              title="Elimina"
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChemicals.map(c => {
            const isLow = Number(c.current_quantity) <= Number(c.min_threshold);
            const daysToExp = getDaysUntilExpiration(c.expiration_date);

            return (
              <div 
                key={c.id} 
                className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                  isLow ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800 hover:border-slate-750'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-cyan-400 font-bold">{c.code}</span>
                    {isLow && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        SOTTO SOGLIA
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.category}</p>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    {c.hazard_symbols.map(h => (
                      <HazardBadge key={h} type={h} />
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Giacenza:</span>
                      <span className={`font-extrabold text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatQuantity(c.current_quantity)} {c.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Soglia Min:</span>
                      <span>{formatQuantity(c.min_threshold)} {c.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ubicazione:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[140px]">{c.storage_location}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Scadenza:</span>
                      <span className={daysToExp <= 30 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {formatDate(c.expiration_date)} ({daysToExp} gg)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare ${c.name}?`)) onDelete(c.id);
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestock(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 cursor-pointer"
                    >
                      + Carica
                    </button>
                    <button
                      onClick={() => onQuickUsage(c.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                    >
                      Preleva
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
