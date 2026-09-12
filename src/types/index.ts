export type HazardType = 
  | 'flammable' 
  | 'corrosive' 
  | 'toxic' 
  | 'health_hazard' 
  | 'irritant' 
  | 'oxidizing' 
  | 'explosive' 
  | 'environmental' 
  | 'biohazard';

export type ChemicalCategory = 
  | 'Solventi & Liquidi Organici'
  | 'Acidi & Basi Forti'
  | 'Coloranti & Fissativi Istologici'
  | 'Buffer, Sali & Soluzioni Tampone'
  | 'Standard, Calibratori & Controlli'
  | 'Kit Diagnostici & Enzimi'
  | 'Disinfettanti & Decontaminanti';

export interface Chemical {
  id: string;
  code: string;
  name: string;
  category: ChemicalCategory;
  cas_number?: string;
  hazard_symbols: HazardType[];
  current_quantity: number;
  min_threshold: number;
  unit: 'ml' | 'L' | 'g' | 'kg' | 'flaconi' | 'fiale' | 'kit' | 'pezzi';
  storage_location: string;
  expiration_date: string; // ISO date string (YYYY-MM-DD)
  lot_number: string;
  supplier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type OperatorRole = 
  | 'Tecnico di Laboratorio'
  | 'Biologo / Chimico'
  | 'Responsabile Sanitario / Magazzino'
  | 'Infermiere Sanitario'
  | 'Specializzando / Ricercatore';

export interface Operator {
  id: string;
  pin: string; // 4 to 6 digit code
  first_name: string;
  last_name: string;
  role: OperatorRole;
  badge_color: string;
  email?: string;
  department?: string;
  active: boolean;
  created_at?: string;
}

export type MovementType = 'usage' | 'restock' | 'adjustment' | 'disposal';

export interface StockMovement {
  id: string;
  chemical_id: string;
  chemical_name?: string;
  chemical_unit?: string;
  operator_id: string;
  operator_name?: string;
  type: MovementType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  purpose_protocol: string;
  created_at: string; // ISO timestamp
}

export type AuditAction = 
  | 'LOGIN_PIN'
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'RECORD_USAGE'
  | 'RESTOCK'
  | 'INVENTORY_ADJUSTMENT'
  | 'CREATE_OPERATOR'
  | 'UPDATE_OPERATOR'
  | 'EXPORT_REPORT';

export interface AuditLog {
  id: string;
  operator_id: string;
  operator_name: string;
  action: AuditAction;
  details: string;
  target_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
