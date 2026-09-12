import React, { useState } from 'react';
import { Operator, OperatorRole } from '../../types';
import { StorageService } from '../../lib/storage';
import { 
  Users, 
  KeyRound, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Mail, 
  Building, 
  CheckCircle2, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OperatorManagerProps {
  operators: Operator[];
  activeOperator: Operator | null;
  onRefresh: () => void;
}

const ROLES: OperatorRole[] = [
  'Tecnico di Laboratorio',
  'Biologo / Chimico',
  'Responsabile Sanitario / Magazzino',
  'Infermiere Sanitario',
  'Specializzando / Ricercatore'
];

const COLORS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600'
];

export const OperatorManager: React.FC<OperatorManagerProps> = ({
  operators,
  activeOperator,
  onRefresh
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<Operator | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<OperatorRole>('Tecnico di Laboratorio');
  const [badgeColor, setBadgeColor] = useState(COLORS[0]);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAdd = () => {
    setEditingOp(null);
    setFirstName('');
    setLastName('');
    setPin(Math.floor(1000 + Math.random() * 9000).toString());
    setRole('Tecnico di Laboratorio');
    setBadgeColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setEmail('');
    setDepartment('Laboratorio Analisi Cliniche');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (op: Operator) => {
    setEditingOp(op);
    setFirstName(op.first_name);
    setLastName(op.last_name);
    setPin(op.pin);
    setRole(op.role);
    setBadgeColor(op.badge_color || COLORS[0]);
    setEmail(op.email || '');
    setDepartment(op.department || '');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Nome e cognome obbligatori');
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError('Il PIN deve essere di almeno 4 cifre');
      return;
    }

    // Check duplicate PIN
    const duplicate = operators.find(o => o.pin === pin.trim() && o.id !== editingOp?.id);
    if (duplicate) {
      setError(`Il PIN ${pin} è già assegnato a ${duplicate.first_name} ${duplicate.last_name}`);
      return;
    }

    setLoading(true);
    try {
      await StorageService.saveOperator({
        id: editingOp?.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        pin: pin.trim(),
        role,
        badge_color: badgeColor,
        email: email.trim() || undefined,
        department: department.trim() || undefined,
        active: true
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });

      setLoading(false);
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Errore salvataggio operatore');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Personale Sanitario & Sicurezza</span>
          </div>
          <h2 className="text-xl font-bold text-white">Gestione Operatori & PIN di Accesso</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Ogni operatore possiede un PIN univoco per autenticarsi rapidamente ai terminali di laboratorio e firmare le movimentazioni di magazzino.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo Operatore Sanitario</span>
        </button>
      </div>

      {/* Operator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map(op => {
          const isActiveSession = activeOperator?.id === op.id;

          return (
            <div
              key={op.id}
              className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                isActiveSession ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${op.badge_color || 'from-teal-500 to-cyan-600'} flex items-center justify-center text-white font-extrabold text-base shadow-md`}>
                    {op.first_name[0]}{op.last_name[0]}
                  </div>
                  {isActiveSession ? (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Sessione Attiva
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">ID: {op.id}</span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white">{op.first_name} {op.last_name}</h3>
                <div className="text-xs text-cyan-400 font-semibold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{op.role}</span>
                </div>

                <div className="mt-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PIN Personale:</span>
                    <span className="font-mono font-extrabold text-sm px-2 py-0.5 bg-slate-800 rounded-lg text-emerald-400 border border-slate-700">
                      {op.pin}
                    </span>
                  </div>
                  {op.department && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Reparto:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[150px]">{op.department}</span>
                    </div>
                  )}
                  {op.email && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Email:</span>
                      <span className="text-slate-200 truncate max-w-[150px]">{op.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(op)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifica Dati & PIN</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAZIONE / MODIFICA OPERATORE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingOp ? `Modifica Operatore: ${editingOp.first_name}` : 'Registra Nuovo Operatore'}
                  </h3>
                  <p className="text-xs text-cyan-100">Configura credenziali e PIN sanitario</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mario"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cognome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  PIN di Accesso (4-6 Cifre) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-emerald-500/40 text-emerald-300 font-mono text-sm font-bold tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Ruolo Professionale</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as OperatorRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reparto / Settore</label>
                <input
                  type="text"
                  placeholder="Es. Ematologia, Microbiologia, Tossicologia"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email (Opzionale)</label>
                <input
                  type="email"
                  placeholder="mario.rossi@laboratorio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Badge Gradient Color Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Colore Badge Avatar</label>
                <div className="flex items-center gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBadgeColor(c)}
                      className={`w-7 h-7 rounded-xl bg-gradient-to-br ${c} transition-all ${
                        badgeColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Salvataggio...' : 'Salva Operatore'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
