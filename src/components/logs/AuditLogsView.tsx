import React, { useState } from 'react';
import { AuditLog, StockMovement, Operator } from '../../types';
import { 
  History, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  KeyRound, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  SlidersHorizontal,
  Clock,
  UserCheck
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface AuditLogsViewProps {
  logs: AuditLog[];
  movements: StockMovement[];
  operators: Operator[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  movements,
  operators
}) => {
  const [activeTab, setActiveTab] = useState<'movements' | 'audit'>('movements');
  const [filterOp, setFilterOp] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'LOGIN_PIN':
        return <span className="px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">ACCESSO PIN</span>;
      case 'RECORD_USAGE':
        return <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">PRELIEVO / USO</span>;
      case 'RESTOCK':
        return <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">CARICO MAGAZZINO</span>;
      case 'CREATE_PRODUCT':
        return <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold">NUOVO PRODOTTO</span>;
      case 'UPDATE_PRODUCT':
        return <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">MODIFICA SCHEDA</span>;
      case 'DELETE_PRODUCT':
        return <span className="px-2 py-0.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">ELIMINAZIONE</span>;
      case 'CREATE_OPERATOR':
        return <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">NUOVO OPERATORE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-bold">{action}</span>;
    }
  };

  const filteredMovements = movements.filter(m => {
    const matchesOp = filterOp === 'all' || m.operator_id === filterOp;
    const matchesSearch = 
      (m.chemical_name && m.chemical_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.operator_name && m.operator_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.purpose_protocol && m.purpose_protocol.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesOp && matchesSearch;
  });

  const filteredLogs = logs.filter(l => {
    const matchesOp = filterOp === 'all' || l.operator_id === filterOp;
    const matchesSearch = 
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.operator_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOp && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Tracciabilità & Registro Modifiche (Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Storico completo e immutabile di prelievi, carichi, accessi operatore e modifiche d'inventario.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/60 border border-slate-800">
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'movements' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Movimenti Carico/Scarico ({filteredMovements.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audit' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Log Globale ({filteredLogs.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca per reagente, operatore, protocollo o causale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tutti gli Operatori</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>
                {op.first_name} {op.last_name} ({op.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MOVEMENTS TABLE */}
      {activeTab === 'movements' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Data & Ora</th>
                  <th className="py-3.5 px-4">Operatore</th>
                  <th className="py-3.5 px-4">Tipo Movimento</th>
                  <th className="py-3.5 px-4">Reagente Chimico</th>
                  <th className="py-3.5 px-4">Quantità Movimentata</th>
                  <th className="py-3.5 px-4">Giacenza Dopo</th>
                  <th className="py-3.5 px-4">Protocollo / Motivazione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Nessuna movimentazione registrata con i filtri attuali.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(m => {
                    const isUsage = m.type === 'usage';
                    const isRestock = m.type === 'restock';

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {formatDateTime(m.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-200">{m.operator_name || 'Operatore'}</span>
                        </td>
                        <td className="py-3 px-4">
                          {isUsage ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>Prelievo / Uso</span>
                            </span>
                          ) : isRestock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Rifornimento</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-slate-700 text-slate-300 font-bold text-[11px]">
                              {m.type}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-100">
                          {m.chemical_name || 'Reagente'}
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-sm">
                          <span className={isUsage ? 'text-rose-400' : 'text-emerald-400'}>
                            {isUsage ? '-' : '+'}{m.quantity} {m.chemical_unit || ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {m.new_quantity} {m.chemical_unit || ''}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {m.purpose_protocol}
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
        /* AUDIT LOG LIST */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl divide-y divide-slate-800/60">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nessun evento registrato nel log.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 rounded-2xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.action)}
                      <span className="font-bold text-xs text-slate-200">{log.operator_name}</span>
                    </div>
                    <p className="text-xs text-slate-300">{log.details}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono sm:text-right shrink-0">
                  {formatDateTime(log.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
