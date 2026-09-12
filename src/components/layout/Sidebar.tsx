import React from 'react';
import { Operator } from '../../types';
import { 
  FlaskConical, 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  History, 
  Users, 
  LogOut, 
  ShieldCheck, 
  PlusCircle,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeOperator: Operator | null;
  onLockSession: () => void;
  onOpenNewProduct: () => void;
  onOpenQuickUsage: () => void;
  lowStockCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeOperator,
  onLockSession,
  onOpenNewProduct,
  onOpenQuickUsage,
  lowStockCount,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Statistiche', icon: LayoutDashboard },
    { id: 'inventory', label: 'Magazzino Reagenti', icon: Boxes },
    { 
      id: 'lowStock', 
      label: 'Prodotti da Riordinare', 
      icon: ShoppingCart, 
      badge: lowStockCount > 0 ? lowStockCount : null 
    },
    { id: 'logs', label: 'Audit Log & Storico', icon: History },
    { id: 'operators', label: 'Gestione Operatori / PIN', icon: Users },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full select-none shrink-0 transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
              <FlaskConical className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                LabStock <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">PRO</span>
              </h1>
              <p className="text-[11px] text-slate-400">Magazzino Sanitario</p>
            </div>
          </div>

          {/* Close mobile sidebar */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="p-4 space-y-2 border-b border-slate-800/60">
          <button
            onClick={() => {
              onOpenQuickUsage();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Registra Prelievo / Uso</span>
          </button>

          <button
            onClick={() => {
              onOpenNewProduct();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nuovo Reagente</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Principale
          </div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Operator Profile & Lock Session */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          {activeOperator && (
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeOperator.badge_color || 'from-teal-500 to-cyan-600'} flex items-center justify-center text-white font-extrabold text-xs shadow shrink-0`}>
                  {activeOperator.first_name[0]}{activeOperator.last_name[0]}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {activeOperator.first_name} {activeOperator.last_name}
                  </div>
                  <div className="text-[10px] text-cyan-400 truncate flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span>{activeOperator.role}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLockSession}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Blocca / Esci</span>
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
