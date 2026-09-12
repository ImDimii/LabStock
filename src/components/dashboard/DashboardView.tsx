import React, { useState } from 'react';
import { Chemical, StockMovement, Operator } from '../../types';
import { 
  Boxes, 
  AlertOctagon, 
  TrendingDown, 
  CalendarClock, 
  Activity, 
  CheckCircle2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatQuantity, formatDate, getDaysUntilExpiration } from '../../utils/formatters';
import { exportInventoryToExcel, exportInventoryToPDF } from '../../utils/exportHelpers';

interface DashboardViewProps {
  chemicals: Chemical[];
  movements: StockMovement[];
  operators: Operator[];
  onOpenQuickUsage: () => void;
  onOpenNewProduct: () => void;
  onNavigateToTab: (tab: string) => void;
  activeOperator?: Operator | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  chemicals,
  movements,
  onOpenQuickUsage,
  onOpenNewProduct,
  onNavigateToTab,
  activeOperator = null
}) => {
  const totalProducts = chemicals.length;
  const lowStockItems = chemicals.filter(c => Number(c.current_quantity) <= Number(c.min_threshold));
  const expiringSoonItems = chemicals.filter(c => getDaysUntilExpiration(c.expiration_date) <= 30);
  
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recentMovements = movements.filter(m => new Date(m.created_at).getTime() >= sevenDaysAgo);
  const totalUsagesLast7Days = recentMovements.filter(m => m.type === 'usage').length;

  const daysMap: Record<string, { day: string; usages: number; restocks: number }> = {};
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    const key = d.toISOString().split('T')[0];
    const label = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
    daysMap[key] = { day: label, usages: 0, restocks: 0 };
  }

  movements.forEach(m => {
    const key = m.created_at.split('T')[0];
    if (daysMap[key]) {
      if (m.type === 'usage') {
        daysMap[key].usages += 1;
      } else if (m.type === 'restock') {
        daysMap[key].restocks += 1;
      }
    }
  });

  const weeklyChartData = Object.values(daysMap);

  const categoryCounts: Record<string, number> = {};
  chemicals.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  }));

  const CATEGORY_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Magazzino Reagenti & Chimici Sanitario</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Pannello di Controllo & Statistiche
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Monitoraggio consumi settimanali, scorte critiche, scadenzario e generazione report.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => exportInventoryToExcel(chemicals, 'all')}
              disabled={chemicals.length === 0}
              className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow disabled:opacity-40 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => exportInventoryToPDF(chemicals, activeOperator, 'all')}
              disabled={chemicals.length === 0}
              className="px-3.5 py-2 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow disabled:opacity-40 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onOpenQuickUsage}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
            >
              + Preleva
            </button>
            <button
              onClick={onOpenNewProduct}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
            >
              + Nuovo Reagente
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Products */}
        <div 
          onClick={() => onNavigateToTab('inventory')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:border-slate-700 shadow-md group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prodotti a Catalogo</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-all">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalProducts}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tutte le categorie</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div 
          onClick={() => onNavigateToTab('lowStock')}
          className={`border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-md group ${
            lowStockItems.length > 0 
              ? 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/30 hover:border-rose-500/50' 
              : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Esaurimento</span>
            <div className={`p-2.5 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {lowStockItems.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <TrendingDown className={`w-3.5 h-3.5 ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Sotto la soglia minima</span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Scadenza (&lt;30 gg)</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">{expiringSoonItems.length}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <span>Controllo lotti e stabilità</span>
          </div>
        </div>

        {/* Weekly Movements */}
        <div 
          onClick={() => onNavigateToTab('logs')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:border-slate-700 shadow-md group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prelievi Settimana</span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-all">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">{totalUsagesLast7Days}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <span>Firmati con PIN</span>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Usage vs Restock Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Trend Movimentazioni Settimanali</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Prelievi vs Carichi giorno per giorno</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Prelievi</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Carichi</span>
              </div>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorRestocks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="usages" name="Prelievi" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsages)" />
                <Area type="monotone" dataKey="restocks" name="Carichi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRestocks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white mb-1">Ripartizione per Categoria</h2>
            <p className="text-xs text-slate-400 mb-2">Composizione magazzino</p>
            
            <div className="h-40 sm:h-44 w-full">
              {categoryChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Nessun prodotto presente
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryChartData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span className="text-slate-300 truncate">{c.name}</span>
                </div>
                <span className="font-bold text-slate-400 shrink-0">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
