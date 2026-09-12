import { Chemical, Operator, StockMovement, AuditLog } from '../types';

// Operatore Amministratore / Responsabile Sanitario di default per il primo avvio del sistema
export const DEFAULT_ADMIN_OPERATOR: Operator = {
  id: 'op-admin-01',
  pin: '0000',
  first_name: 'Responsabile',
  last_name: 'Sanitario',
  role: 'Responsabile Sanitario / Magazzino',
  badge_color: 'from-cyan-500 to-blue-600',
  email: 'direzione@laboratorio.sanitario.it',
  department: 'Direzione Sanitaria & Laboratorio',
  active: true,
  created_at: new Date().toISOString()
};

export const INITIAL_OPERATORS: Operator[] = [
  DEFAULT_ADMIN_OPERATOR
];

export const INITIAL_CHEMICALS: Chemical[] = [];

export const generateInitialMovements = (): StockMovement[] => [];

export const generateInitialAuditLogs = (): AuditLog[] => [
  {
    id: `log-init-${Date.now()}`,
    operator_id: DEFAULT_ADMIN_OPERATOR.id,
    operator_name: `${DEFAULT_ADMIN_OPERATOR.first_name} ${DEFAULT_ADMIN_OPERATOR.last_name}`,
    action: 'CREATE_OPERATOR',
    details: 'Inizializzazione sistema LabStock e configurazione operatore master',
    created_at: new Date().toISOString()
  }
];
