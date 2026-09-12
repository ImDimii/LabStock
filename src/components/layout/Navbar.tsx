import React from 'react';
import { Operator } from '../../types';
import { 
  Search, 
  AlertTriangle,
  LogOut,
  Menu
} from 'lucide-react';

interface NavbarProps {
  onLockSession: () => void;
  activeOperator: Operator | null;
  lowStockCount: number;
  onOpenLowStock: () => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLockSession,
  activeOperator,
  lowStockCount,
  onOpenLowStock,
  searchTerm,
  onSearchChange,
  onOpenMobileMenu
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 shrink-0 shadow-sm">
      
      {/* Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white shrink-0 active:scale-95 cursor-pointer"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca reagenti, CAS, lotti..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Right status items */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Low Stock Quick Alert */}
        <button
          onClick={onOpenLowStock}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
            lowStockCount > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
              : 'bg-slate-800/60 border-slate-700 text-slate-400'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${lowStockCount > 0 ? 'animate-bounce text-rose-400' : ''}`} />
          <span className="hidden sm:inline">{lowStockCount > 0 ? `${lowStockCount} Sotto Scorta` : 'Scorte Regolari'}</span>
          <span className="sm:hidden font-extrabold">{lowStockCount}</span>
        </button>

        {/* Active Operator info & Lock Button */}
        {activeOperator && (
          <button
            onClick={onLockSession}
            title="Blocca sessione / Esci"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-all cursor-pointer active:scale-95"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden xs:block" />
            <span className="font-bold hidden sm:inline max-w-[120px] truncate">{activeOperator.first_name}</span>
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
          </button>
        )}

      </div>

    </header>
  );
};
