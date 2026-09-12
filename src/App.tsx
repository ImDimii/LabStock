import React, { useState, useEffect } from 'react';
import { Chemical, Operator, StockMovement, AuditLog } from './types';
import { StorageService } from './lib/storage';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChemicalList } from './components/inventory/ChemicalList';
import { ChemicalModal } from './components/inventory/ChemicalModal';
import { QuickUsageModal } from './components/inventory/QuickUsageModal';
import { RestockModal } from './components/inventory/RestockModal';
import { ReorderList } from './components/lowStock/ReorderList';
import { AuditLogsView } from './components/logs/AuditLogsView';
import { OperatorManager } from './components/operators/OperatorManager';
import { LockScreen } from './components/auth/LockScreen';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeOperator, setActiveOperator] = useState<Operator | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Data State
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [chemicalModalOpen, setChemicalModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [quickUsageOpen, setQuickUsageOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [selectedChemIdForAction, setSelectedChemIdForAction] = useState<string | undefined>(undefined);

  const loadAllData = async () => {
    const [chems, ops, movs, logs] = await Promise.all([
      StorageService.getChemicals(),
      StorageService.getOperators(),
      StorageService.getMovements(),
      StorageService.getAuditLogs()
    ]);
    setChemicals(chems);
    setOperators(ops);
    setMovements(movs);
    setAuditLogs(logs);

    const active = StorageService.getActiveOperator();
    if (active) {
      const match = ops.find(o => o.id === active.id);
      setActiveOperator(match || null);
    } else {
      setActiveOperator(null);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Lock session (Logout / Switch operator)
  const handleLockSession = () => {
    StorageService.setActiveOperator(null);
    setActiveOperator(null);
  };

  const handleUnlock = (op: Operator) => {
    setActiveOperator(op);
    loadAllData();
  };

  const handleOpenNewProduct = () => {
    setEditingChemical(null);
    setChemicalModalOpen(true);
  };

  const handleEditProduct = (chem: Chemical) => {
    setEditingChemical(chem);
    setChemicalModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    await StorageService.deleteChemical(id);
    loadAllData();
  };

  const handleOpenQuickUsage = (chemId?: string) => {
    setSelectedChemIdForAction(chemId);
    setQuickUsageOpen(true);
  };

  const handleOpenRestock = (chemId?: string) => {
    setSelectedChemIdForAction(chemId);
    setRestockOpen(true);
  };

  const lowStockCount = chemicals.filter(c => Number(c.current_quantity) <= Number(c.min_threshold)).length;

  // BLOCCO TOTALE PER PROTEZIONE DATI SE NON AUTENTICATO
  if (!activeOperator) {
    return (
      <LockScreen
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      
      {/* Sidebar Navigazione */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeOperator={activeOperator}
        onLockSession={handleLockSession}
        onOpenNewProduct={handleOpenNewProduct}
        onOpenQuickUsage={() => handleOpenQuickUsage()}
        lowStockCount={lowStockCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Navbar */}
        <Navbar
          onLockSession={handleLockSession}
          activeOperator={activeOperator}
          lowStockCount={lowStockCount}
          onOpenLowStock={() => setCurrentTab('lowStock')}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-slate-900/30 to-slate-950">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <DashboardView
                chemicals={chemicals}
                movements={movements}
                operators={operators}
                onOpenQuickUsage={() => handleOpenQuickUsage()}
                onOpenNewProduct={handleOpenNewProduct}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'inventory' && (
              <ChemicalList
                chemicals={chemicals}
                activeOperator={activeOperator}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onQuickUsage={(id) => handleOpenQuickUsage(id)}
                onRestock={(id) => handleOpenRestock(id)}
                searchTerm={searchTerm}
              />
            )}

            {currentTab === 'lowStock' && (
              <ReorderList
                chemicals={chemicals}
                activeOperator={activeOperator}
                onRestock={(id) => handleOpenRestock(id)}
              />
            )}

            {currentTab === 'logs' && (
              <AuditLogsView
                logs={auditLogs}
                movements={movements}
                operators={operators}
              />
            )}

            {currentTab === 'operators' && (
              <OperatorManager
                operators={operators}
                activeOperator={activeOperator}
                onRefresh={loadAllData}
              />
            )}
          </div>
        </main>

      </div>

      {/* Modali Operative */}
      <ChemicalModal
        isOpen={chemicalModalOpen}
        onClose={() => setChemicalModalOpen(false)}
        chemical={editingChemical}
        onSuccess={loadAllData}
      />

      <QuickUsageModal
        isOpen={quickUsageOpen}
        onClose={() => setQuickUsageOpen(false)}
        chemicals={chemicals}
        activeOperator={activeOperator}
        onSuccess={loadAllData}
        preselectedChemicalId={selectedChemIdForAction}
      />

      <RestockModal
        isOpen={restockOpen}
        onClose={() => setRestockOpen(false)}
        chemicals={chemicals}
        activeOperator={activeOperator}
        onSuccess={loadAllData}
        preselectedChemicalId={selectedChemIdForAction}
      />

    </div>
  );
}

export default App;
