import React, { useState } from 'react';
import { Chemical, Operator } from '../../types';
import { 
  AlertOctagon, 
  Copy, 
  Check, 
  PackagePlus, 
  CheckCircle2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { formatQuantity } from '../../utils/formatters';
import { exportInventoryToExcel, exportInventoryToPDF } from '../../utils/exportHelpers';

interface ReorderListProps {
  chemicals: Chemical[];
  activeOperator: Operator | null;
  onRestock: (chemicalId: string) => void;
}

export const ReorderList: React.FC<ReorderListProps> = ({
  chemicals,
  activeOperator,
  onRestock
}) => {
  const [copied, setCopied] = useState(false);

  const lowStockItems = chemicals.filter(c => Number(c.current_quantity) <= Number(c.min_threshold));

  const generatePurchaseOrderText = () => {
    let txt = `PROSPETTO ORDINE REAGENTI LABORATORIO SANITARIO - LABSTOCK\n`;
    txt += `Data: ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}\n`;
    txt += `Richiedente: ${activeOperator ? `${activeOperator.first_name} ${activeOperator.last_name} (${activeOperator.role})` : 'Laboratorio'}\n`;
    txt += `========================================================================\n\n`;

    lowStockItems.forEach((c, idx) => {
      const needed = Math.max(c.min_threshold * 2 - c.current_quantity, c.min_threshold);
      txt += `${idx + 1}. [${c.code}] ${c.name}\n`;
      txt += `   - Categoria: ${c.category}\n`;
      txt += `   - Fornitore: ${c.supplier || 'N/D'}\n`;
      txt += `   - Giacenza: ${c.current_quantity} ${c.unit} (Minimo: ${c.min_threshold} ${c.unit})\n`;
      txt += `   - Q.TA SUGGERITA DA ORDINARE: +${needed} ${c.unit}\n`;
      txt += `   - Ubicazione: ${c.storage_location}\n\n`;
    });

    return txt;
  };

  const handleCopyClipboard = () => {
    const txt = generatePurchaseOrderText();
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner with EXCEL, PDF & COPY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>Approvvigionamenti Sanitari</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Prodotti in Esaurimento & Riordino</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Reagenti sotto la soglia di sicurezza con calcolo volumi d'ordine ed esportazione ufficiale.
          </p>
        </div>

        {lowStockItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportInventoryToExcel(chemicals, 'low_stock')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Ordine</span>
            </button>

            <button
              onClick={() => exportInventoryToPDF(chemicals, activeOperator, 'low_stock')}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>PDF Ordine</span>
            </button>

            <button
              onClick={handleCopyClipboard}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copiato!' : 'Copia Testo'}</span>
            </button>
          </div>
        )}
      </div>

      {lowStockItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Tutte le Scorte Sono Regolari!</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Nessun reagente si trova attualmente sotto la soglia minima di sicurezza.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Codice / Reagente</th>
                  <th className="py-3.5 px-4">Fornitore & Ubicazione</th>
                  <th className="py-3.5 px-4">Giacenza Residua</th>
                  <th className="py-3.5 px-4">Soglia Minima</th>
                  <th className="py-3.5 px-4">Q.tà Consigliata</th>
                  <th className="py-3.5 px-4 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lowStockItems.map(c => {
                  const suggestedOrder = Math.max(c.min_threshold * 2 - c.current_quantity, c.min_threshold);

                  return (
                    <tr key={c.id} className="hover:bg-rose-950/10 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-cyan-400">{c.code}</span>
                        <div className="font-bold text-slate-100 text-sm mt-0.5">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.category}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">{c.supplier || 'Fornitore Standard'}</div>
                        <div className="text-[10px] text-slate-500">{c.storage_location}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-base font-extrabold text-rose-400">
                          {formatQuantity(c.current_quantity)} {c.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {formatQuantity(c.min_threshold)} {c.unit}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                          <span>+ {formatQuantity(suggestedOrder)} {c.unit}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onRestock(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 ml-auto transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>Carica Arrivo</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
