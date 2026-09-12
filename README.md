# LabStock - Piattaforma Gestione Magazzino Chimico Laboratorio Sanitario

LabStock è un'applicazione web ultra-moderna ideata per laboratori analisi cliniche, ospedali e centri di ricerca per la gestione rigorosa e tracciata di tutti i reagenti e prodotti chimici.

---

## ✨ Funzionalità Principali

1. **🔐 Controllo Accessi Rapido con PIN Sanitario**:
   - Tastierino numerico PIN-pad stile clinico.
   - Identificazione istantanea operatore: Nome, Cognome, Ruolo, Reparto.
   - Ogni azione (prelievo, carico, modifica) viene firmata digitalmente con l'operatore autenticato.
   - PIN demo inclusi: `1234` (Dr.ssa Elena Conti), `5678` (Marco Bianchi), `9999` (Dr.ssa Giulia Ferrari), `2468` (Dr. Alessandro Russo).

2. **📊 Dashboard & Statistiche Temporali**:
   - KPI in tempo reale: Giacenze totali, Reagenti sotto soglia, Prodotti in scadenza (<30 giorni), Prelievi settimanali.
   - **Grafico Consumi Settimanali (Weekly Usage vs Restock)**.
   - **Ripartizione per Categoria Chimica** (Solventi, Acidi/Basi, Coloranti & Fissativi, Buffer, Kit Diagnostici, ecc.).

3. **🧪 Inventario Reagenti Completo**:
   - Ricerca universale per nome, codice interno, **numero CAS**, **numero di lotto**, data di scadenza e locazione (es. Frigo +4°C, Stipo Acidi).
   - Visualizzazione a **Tabella ad alta densità** o a **Schede visive**.
   - Classificazione con **pittogrammi di pericolo GHS standard** (Infiammabile, Corrosivo, Tossico, Rischio Biologico, ecc.).

4. **⚡ Scarico & Prelievo Rapido (1-Click)**:
   - Registrazione prelievi con calcolo in tempo reale della rimanenza residua.
   - Allarme immediato se l'uso fa scendere il prodotto sotto la soglia minima.
   - Registrazione causale/protocollo d'esame.

5. **📦 Sezione Riordino Scorte in Esaurimento**:
   - Rilevamento automatico di tutti i prodotti sotto scorta.
   - Calcolo suggerito della quantità da ordinare.
   - **Esportazione in CSV** e **Copia negli Appunti** per invio immediato all'ufficio acquisti.

6. **📜 Registro Audit Log Immutabile**:
   - Tracciamento cronologico completo di ogni azione: data, ora, operatore, variazione prima/dopo.
   - Filtri avanzati per operatore e per testo.

7. **☁️ Supabase PostgreSQL + Local Storage Fallback**:
   - File `supabase_schema.sql` pronto per essere eseguito con 1 clic in Supabase.
   - Pannello impostazioni dedicato per inserire URL e Anon Key in runtime.
   - Fallback offline integrato con persistenza locale e dataset dimostrativo.

---

## 🚀 Avvio Rapido

```bash
# Installa dipendenze (se necessario)
npm install

# Avvia server di sviluppo
npm run dev

# Compilazione produzione
npm run build
```
