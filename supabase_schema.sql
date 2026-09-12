-- ==============================================================================
-- SCHEMA SUPABASE: LABSTOCK (REAGENTI E MAGAZZINO SANITARIO)
-- Esegui questo script nell'SQL Editor del tuo progetto Supabase.
-- ==============================================================================

-- 1. TABELLA OPERATORI
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pin VARCHAR(10) NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  badge_color TEXT DEFAULT 'from-blue-500 to-indigo-600',
  email TEXT DEFAULT '',
  department TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELLA PRODOTTI CHIMICI & REAGENTI
CREATE TABLE IF NOT EXISTS chemicals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cas_number TEXT DEFAULT '',
  hazard_symbols TEXT[] DEFAULT '{}',
  current_quantity NUMERIC NOT NULL DEFAULT 0,
  min_threshold NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  storage_location TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  lot_number TEXT NOT NULL,
  supplier TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELLA MOVIMENTI MAGAZZINO
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chemical_id TEXT REFERENCES chemicals(id) ON DELETE CASCADE,
  chemical_name TEXT,
  chemical_unit TEXT,
  operator_id TEXT,
  operator_name TEXT,
  type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  previous_quantity NUMERIC NOT NULL,
  new_quantity NUMERIC NOT NULL,
  purpose_protocol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELLA AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  operator_id TEXT,
  operator_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ROW LEVEL SECURITY: Permetti accesso con anon key
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public all operators" ON operators;
DROP POLICY IF EXISTS "Public all chemicals" ON chemicals;
DROP POLICY IF EXISTS "Public all stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Public all audit_logs" ON audit_logs;

CREATE POLICY "Public all operators" ON operators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all chemicals" ON chemicals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Inserisci operatore master iniziale se non presente
INSERT INTO operators (id, pin, first_name, last_name, role, department, active)
VALUES ('op-admin-master', '0000', 'Responsabile', 'Sanitario', 'Responsabile Sanitario / Magazzino', 'Direzione Sanitaria', true)
ON CONFLICT (pin) DO NOTHING;
