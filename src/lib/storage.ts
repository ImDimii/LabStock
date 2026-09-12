import { Chemical, Operator, StockMovement, AuditLog } from '../types';
import { INITIAL_CHEMICALS, INITIAL_OPERATORS, generateInitialMovements, generateInitialAuditLogs } from './mockData';
import { getSupabase } from './supabase';

const STORAGE_KEYS = {
  OPERATORS: 'labstock_operators',
  CHEMICALS: 'labstock_chemicals',
  MOVEMENTS: 'labstock_movements',
  AUDIT_LOGS: 'labstock_audit_logs',
  ACTIVE_OPERATOR: 'labstock_active_operator_session',
};

// ==================== REPOSITORY LAYER ====================

export const StorageService = {
  // ---------------- OPERATORS ----------------
  async getOperators(): Promise<Operator[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('operators').select('*').order('first_name', { ascending: true });
        if (error) {
          console.error('❌ Errore Supabase getOperators:', error);
        } else if (data && data.length > 0) {
          // Sync with local cache
          localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(data));
          return data as Operator[];
        }
      } catch (e) {
        console.error('❌ Eccezione fetch Supabase operators:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.OPERATORS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(INITIAL_OPERATORS));
    return INITIAL_OPERATORS;
  },

  async authenticatePin(pin: string): Promise<Operator | null> {
    const cleanPin = pin.trim();
    
    // Prova query diretta su Supabase se attivo
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('operators').select('*').eq('pin', cleanPin).eq('active', true).maybeSingle();
        if (!error && data) {
          const op = data as Operator;
          this.setActiveOperator(op);
          await this.logAudit({
            operator_id: op.id,
            operator_name: `${op.first_name} ${op.last_name}`,
            action: 'LOGIN_PIN',
            details: `Accesso operatore con PIN (${op.role})`,
            target_id: op.id
          });
          return op;
        }
      } catch (e) {
        console.warn('Supabase auth fallback:', e);
      }
    }

    const operators = await this.getOperators();
    const found = operators.find(op => op.pin === cleanPin && op.active !== false);
    if (found) {
      this.setActiveOperator(found);
      await this.logAudit({
        operator_id: found.id,
        operator_name: `${found.first_name} ${found.last_name}`,
        action: 'LOGIN_PIN',
        details: `Accesso operatore con PIN (${found.role})`,
        target_id: found.id
      });
      return found;
    }
    return null;
  },

  async saveOperator(operator: Omit<Operator, 'id' | 'created_at'> & { id?: string }): Promise<Operator> {
    const newOp: Operator = {
      id: operator.id || `op-${Date.now()}`,
      pin: operator.pin,
      first_name: operator.first_name,
      last_name: operator.last_name,
      role: operator.role,
      badge_color: operator.badge_color || 'from-blue-500 to-indigo-600',
      email: operator.email || '',
      department: operator.department || '',
      active: operator.active !== false,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('operators').upsert(newOp);
        if (error) console.error('❌ Errore Supabase saveOperator:', error);
      } catch (e) {
        console.error('❌ Eccezione saveOperator Supabase:', e);
      }
    }

    const current = await this.getOperators();
    const idx = current.findIndex(o => o.id === newOp.id);
    if (idx >= 0) {
      current[idx] = newOp;
    } else {
      current.push(newOp);
    }
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(current));
    return newOp;
  },

  async deleteOperator(id: string): Promise<boolean> {
    const operators = await this.getOperators();
    const target = operators.find(o => o.id === id);
    if (!target) return false;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('operators').delete().eq('id', id);
        if (error) console.error('❌ Errore Supabase deleteOperator:', error);
      } catch (e) {
        console.error('❌ Eccezione deleteOperator Supabase:', e);
      }
    }

    const updated = operators.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(updated));

    const activeOp = this.getActiveOperator();
    await this.logAudit({
      operator_id: activeOp?.id || 'system',
      operator_name: activeOp ? `${activeOp.first_name} ${activeOp.last_name}` : 'Operatore',
      action: 'UPDATE_OPERATOR',
      details: `Eliminato operatore sanitario: ${target.first_name} ${target.last_name} (${target.role})`,
      target_id: id
    });

    return true;
  },

  getActiveOperator(): Operator | null {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_OPERATOR);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  setActiveOperator(op: Operator | null) {
    if (op) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_OPERATOR, JSON.stringify(op));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_OPERATOR);
    }
  },

  // ---------------- CHEMICALS ----------------
  async getChemicals(): Promise<Chemical[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('chemicals').select('*').order('name', { ascending: true });
        if (error) {
          console.error('❌ Errore Supabase getChemicals:', error);
        } else if (data) {
          localStorage.setItem(STORAGE_KEYS.CHEMICALS, JSON.stringify(data));
          return data as Chemical[];
        }
      } catch (e) {
        console.error('❌ Eccezione Supabase getChemicals:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.CHEMICALS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEYS.CHEMICALS, JSON.stringify(INITIAL_CHEMICALS));
    return INITIAL_CHEMICALS;
  },

  async saveChemical(chem: Partial<Chemical> & { name: string; category: Chemical['category']; unit: Chemical['unit'] }): Promise<Chemical> {
    const isEdit = !!chem.id;
    const item: Chemical = {
      id: chem.id || `chem-${Date.now()}`,
      code: chem.code || `REA-${Math.floor(1000 + Math.random() * 9000)}`,
      name: chem.name,
      category: chem.category,
      cas_number: chem.cas_number || '',
      hazard_symbols: chem.hazard_symbols || [],
      current_quantity: Number(chem.current_quantity || 0),
      min_threshold: Number(chem.min_threshold || 0),
      unit: chem.unit,
      storage_location: chem.storage_location || 'Magazzino Principale',
      expiration_date: chem.expiration_date || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      lot_number: chem.lot_number || `LOT-${Date.now().toString().slice(-6)}`,
      supplier: chem.supplier || '',
      notes: chem.notes || '',
      created_at: chem.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Salvataggio su Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('chemicals').upsert(item);
        if (error) console.error('❌ Errore Supabase saveChemical:', error);
      } catch (e) {
        console.error('❌ Eccezione Supabase saveChemical:', e);
      }
    }

    // Aggiornamento cache locale
    const current = await this.getChemicals();
    const idx = current.findIndex(c => c.id === item.id);
    if (idx >= 0) {
      current[idx] = item;
    } else {
      current.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.CHEMICALS, JSON.stringify(current));

    const activeOp = this.getActiveOperator();
    await this.logAudit({
      operator_id: activeOp?.id || 'system',
      operator_name: activeOp ? `${activeOp.first_name} ${activeOp.last_name}` : 'Operatore',
      action: isEdit ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
      details: isEdit 
        ? `Modificato reagente ${item.name} (${item.code})` 
        : `Registrato nuovo reagente ${item.name} (${item.code}, Scorta: ${item.current_quantity} ${item.unit})`,
      target_id: item.id
    });

    return item;
  },

  async deleteChemical(id: string): Promise<boolean> {
    const chemicals = await this.getChemicals();
    const target = chemicals.find(c => c.id === id);
    if (!target) return false;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('chemicals').delete().eq('id', id);
        if (error) console.error('❌ Errore Supabase deleteChemical:', error);
      } catch (e) {
        console.error('❌ Eccezione Supabase deleteChemical:', e);
      }
    }

    const updated = chemicals.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHEMICALS, JSON.stringify(updated));

    const activeOp = this.getActiveOperator();
    await this.logAudit({
      operator_id: activeOp?.id || 'system',
      operator_name: activeOp ? `${activeOp.first_name} ${activeOp.last_name}` : 'Operatore',
      action: 'DELETE_PRODUCT',
      details: `Eliminato dal magazzino il reagente ${target.name} (Codice: ${target.code})`,
      target_id: id
    });

    return true;
  },

  // ---------------- MOVEMENTS ----------------
  async getMovements(): Promise<StockMovement[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('❌ Errore Supabase getMovements:', error);
        } else if (data) {
          // Merge: i record locali scritti di recente ma non ancora su Supabase
          // (race condition dopo insert) vengono preservati.
          const supaIds = new Set(data.map((m: StockMovement) => m.id));
          const localRaw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
          const localList: StockMovement[] = localRaw ? JSON.parse(localRaw) : [];
          const localOnly = localList.filter(m => !supaIds.has(m.id));
          const merged = [...localOnly, ...data as StockMovement[]];
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(merged.slice(0, 500)));
          return merged;
        }
      } catch (e) {
        console.error('❌ Eccezione Supabase getMovements:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    const init = generateInitialMovements();
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(init));
    return init;
  },

  async recordStockMovement(params: {
    chemicalId: string;
    type: 'usage' | 'restock' | 'adjustment' | 'disposal';
    quantity: number;
    purposeProtocol: string;
    operator?: Operator;
    newLotNumber?: string;
    newExpirationDate?: string;
  }): Promise<StockMovement> {
    const chemicals = await this.getChemicals();
    const chemIndex = chemicals.findIndex(c => c.id === params.chemicalId);
    if (chemIndex === -1) {
      throw new Error('Prodotto chimico non trovato');
    }

    const chem = chemicals[chemIndex];
    const prevQty = Number(chem.current_quantity);
    const qtyChange = Number(params.quantity);
    let newQty = prevQty;

    if (params.type === 'usage' || params.type === 'disposal') {
      newQty = Math.max(0, prevQty - qtyChange);
    } else if (params.type === 'restock') {
      newQty = prevQty + qtyChange;
    } else if (params.type === 'adjustment') {
      newQty = qtyChange;
    }

    chem.current_quantity = newQty;
    if (params.newLotNumber) chem.lot_number = params.newLotNumber;
    if (params.newExpirationDate) chem.expiration_date = params.newExpirationDate;
    chem.updated_at = new Date().toISOString();

    chemicals[chemIndex] = chem;
    localStorage.setItem(STORAGE_KEYS.CHEMICALS, JSON.stringify(chemicals));

    const op = params.operator || this.getActiveOperator();
    const opName = op ? `${op.first_name} ${op.last_name}` : 'Operatore';
    const opId = op?.id || 'op-unknown';

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      chemical_id: chem.id,
      chemical_name: chem.name,
      chemical_unit: chem.unit,
      operator_id: opId,
      operator_name: opName,
      type: params.type,
      quantity: qtyChange,
      previous_quantity: prevQty,
      new_quantity: newQty,
      purpose_protocol: params.purposeProtocol || (params.type === 'usage' ? 'Prelievo analisi' : 'Carico rifornimento'),
      created_at: new Date().toISOString()
    };

    // Salva su Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updateRes = await supabase.from('chemicals').update({
          current_quantity: chem.current_quantity,
          lot_number: chem.lot_number,
          expiration_date: chem.expiration_date,
          updated_at: chem.updated_at
        }).eq('id', chem.id);
        if (updateRes.error) console.error('❌ Errore Supabase update chemical quantity:', updateRes.error);

        const insertRes = await supabase.from('stock_movements').insert(movement);
        if (insertRes.error) console.error('❌ Errore Supabase insert movement:', insertRes.error);
      } catch (e) {
        console.error('❌ Eccezione Supabase update after movement:', e);
      }
    }

    // Leggiamo direttamente da localStorage per evitare race condition con Supabase:
    // se chiamassimo getMovements() farebbe un fetch Supabase che potrebbe non avere ancora
    // il record appena inserito, sovrascrivendo la cache locale e perdendo il movimento.
    const localMovementsRaw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    const movements: StockMovement[] = localMovementsRaw ? JSON.parse(localMovementsRaw) : [];
    movements.unshift(movement);
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements.slice(0, 500)));

    const auditAction = params.type === 'usage' 
      ? 'RECORD_USAGE' 
      : params.type === 'restock' 
      ? 'RESTOCK' 
      : 'INVENTORY_ADJUSTMENT';

    const actionText = params.type === 'usage' 
      ? `Scarico di ${qtyChange} ${chem.unit} di ${chem.name}` 
      : params.type === 'restock' 
      ? `Carico di +${qtyChange} ${chem.unit} di ${chem.name}` 
      : `Rettifica inventario per ${chem.name} a ${newQty} ${chem.unit}`;

    await this.logAudit({
      operator_id: opId,
      operator_name: opName,
      action: auditAction,
      details: `${actionText}. Motivazione: "${params.purposeProtocol}". Scorta residua: ${newQty} ${chem.unit}`,
      target_id: chem.id
    });

    return movement;
  },

  // ---------------- AUDIT LOGS ----------------
  async getAuditLogs(): Promise<AuditLog[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
        if (error) {
          console.error('❌ Errore Supabase getAuditLogs:', error);
        } else if (data) {
          const supaIds = new Set(data.map((l: AuditLog) => l.id));
          const localRaw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
          const localList: AuditLog[] = localRaw ? JSON.parse(localRaw) : [];
          const localOnly = localList.filter(l => !supaIds.has(l.id));
          const merged = [...localOnly, ...data as AuditLog[]];
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(merged.slice(0, 500)));
          return merged;
        }
      } catch (e) {
        console.error('❌ Eccezione Supabase getAuditLogs:', e);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    const init = generateInitialAuditLogs();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(init));
    return init;
  },

  async logAudit(entry: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      operator_id: entry.operator_id,
      operator_name: entry.operator_name,
      action: entry.action,
      details: entry.details,
      target_id: entry.target_id,
      metadata: entry.metadata,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('audit_logs').insert(log);
        if (error) console.error('❌ Errore Supabase logAudit:', error);
      } catch (e) {
        console.error('❌ Eccezione Supabase logAudit:', e);
      }
    }

    try {
      const local = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const list: AuditLog[] = local ? JSON.parse(local) : [];
      list.unshift(log);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list.slice(0, 500)));
    } catch (e) {
      console.error(e);
    }

    return log;
  }
};
