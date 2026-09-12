import { HazardType, ChemicalCategory, Chemical } from '../types';

export interface StandardChemicalPreset {
  name: string;
  category: ChemicalCategory;
  cas_number: string;
  hazard_symbols: HazardType[];
  unit: Chemical['unit'];
  default_min_threshold: number;
  default_storage_location: string;
  default_supplier: string;
  notes: string;
}

export const STANDARD_CHEMICAL_CATALOG: StandardChemicalPreset[] = [
  // Solventi & Liquidi Organici
  {
    name: 'Etanolo Assoluto 99.8% (Grado Analisi)',
    category: 'Solventi & Liquidi Organici',
    cas_number: '64-17-5',
    hazard_symbols: ['flammable', 'health_hazard'],
    unit: 'ml',
    default_min_threshold: 2500,
    default_storage_location: 'Armadio Ventilato Antideflagrante A1',
    default_supplier: 'Honeywell / Sigma-Aldrich',
    notes: 'Fissazione istologica, disidratazione vetrini e lavaggi di laboratorio.'
  },
  {
    name: 'Alcool Isopropilico 99.5% (Isopropanolo / 2-Propanolo)',
    category: 'Solventi & Liquidi Organici',
    cas_number: '67-63-0',
    hazard_symbols: ['flammable', 'irritant'],
    unit: 'ml',
    default_min_threshold: 2000,
    default_storage_location: 'Armadio Ventilato Antideflagrante A1',
    default_supplier: 'Merck / PanReac',
    notes: 'Precipitazione acidi nucleici, estrazione RNA e pulizia ottiche microscopio.'
  },
  {
    name: 'Metanolo Grado HPLC / Analisi ≥99.9%',
    category: 'Solventi & Liquidi Organici',
    cas_number: '67-56-1',
    hazard_symbols: ['flammable', 'toxic', 'health_hazard'],
    unit: 'ml',
    default_min_threshold: 1500,
    default_storage_location: 'Armadio Ventilato Antideflagrante A2',
    default_supplier: 'Honeywell Lab Chemicals',
    notes: 'Solvente per cromatografia e fissazione rapida strisci ematologici.'
  },
  {
    name: 'Xilene (Dimetilbenzene miscela isomeri)',
    category: 'Solventi & Liquidi Organici',
    cas_number: '1330-20-7',
    hazard_symbols: ['flammable', 'health_hazard', 'irritant'],
    unit: 'ml',
    default_min_threshold: 3000,
    default_storage_location: 'Stipo Solventi Ventilato A3',
    default_supplier: 'Bio-Optica Milano',
    notes: 'Diafanizzante per inclusione in paraffina e spolimerizzazione coprioggetti.'
  },
  {
    name: 'Acetone Grado Reagente ≥99.5%',
    category: 'Solventi & Liquidi Organici',
    cas_number: '67-64-1',
    hazard_symbols: ['flammable', 'irritant'],
    unit: 'ml',
    default_min_threshold: 2000,
    default_storage_location: 'Armadio Ventilato Antideflagrante A1',
    default_supplier: 'Carlo Erba Reagents',
    notes: 'Sgrassante vetrini, fissaggio rapido e decontaminazione vetreria.'
  },
  {
    name: 'Glicerina (Glicerolo) ≥99.5%',
    category: 'Solventi & Liquidi Organici',
    cas_number: '56-81-5',
    hazard_symbols: ['irritant'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Scaffale Reagenti Organici B1',
    default_supplier: 'Sigma-Aldrich',
    notes: 'Soluzioni crioprotettive ed emulsioni tampone.'
  },

  // Acidi & Basi Forti
  {
    name: 'Acido Cloridrico 37% (HCl Fumante Grado Analisi)',
    category: 'Acidi & Basi Forti',
    cas_number: '7647-01-0',
    hazard_symbols: ['corrosive', 'toxic'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Armadio di Sicurezza Acidi C1',
    default_supplier: 'Merck Millipore',
    notes: 'Molto corrosivo. Utilizzare sotto cappa aspirante con DPI idonei.'
  },
  {
    name: 'Acido Solforico 96-98% (H2SO4)',
    category: 'Acidi & Basi Forti',
    cas_number: '7664-93-9',
    hazard_symbols: ['corrosive'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Armadio di Sicurezza Acidi C1',
    default_supplier: 'Carlo Erba Reagents',
    notes: 'Reazione esotermica a contatto con acqua. Stop solution ELISA.'
  },
  {
    name: 'Acido Nitrico 65% (HNO3)',
    category: 'Acidi & Basi Forti',
    cas_number: '7697-37-2',
    hazard_symbols: ['corrosive', 'oxidizing'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Armadio di Sicurezza Acidi C1',
    default_supplier: 'PanReac AppliChem',
    notes: 'Forte ossidante. Conservare separato da sostanze organiche.'
  },
  {
    name: 'Acido Acetico Glaciale 99-100%',
    category: 'Acidi & Basi Forti',
    cas_number: '64-19-7',
    hazard_symbols: ['corrosive', 'flammable'],
    unit: 'ml',
    default_min_threshold: 1500,
    default_storage_location: 'Armadio di Sicurezza Acidi C1',
    default_supplier: 'Sigma-Aldrich',
    notes: 'Fissativo di Bouin / Carnoy e preparazione tamponi pH.'
  },
  {
    name: 'Idrossido di Sodio (NaOH) in Perle 98%',
    category: 'Acidi & Basi Forti',
    cas_number: '1310-73-2',
    hazard_symbols: ['corrosive'],
    unit: 'g',
    default_min_threshold: 1500,
    default_storage_location: 'Armadio di Sicurezza Basi C2',
    default_supplier: 'Merck Millipore',
    notes: 'Igroscopico. Preparazione soluzioni alcaline e titolazioni.'
  },
  {
    name: 'Idrossido di Potassio (KOH) in Scaglie 85%',
    category: 'Acidi & Basi Forti',
    cas_number: '1310-58-3',
    hazard_symbols: ['corrosive', 'toxic'],
    unit: 'g',
    default_min_threshold: 1000,
    default_storage_location: 'Armadio di Sicurezza Basi C2',
    default_supplier: 'PanReac AppliChem',
    notes: 'Esame microscopico a fresco miceti (chiarificazione KOH).'
  },

  // Coloranti & Fissativi Istologici
  {
    name: 'Formaldeide 4% Tamponata (Formalina Neutra Istologica)',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: '50-00-0',
    hazard_symbols: ['toxic', 'health_hazard', 'corrosive'],
    unit: 'ml',
    default_min_threshold: 5000,
    default_storage_location: 'Stipo Chimici Ventilato B3',
    default_supplier: 'Bio-Optica Milano',
    notes: 'Fissativo standard per biopsie chirurgiche. Lavorare sotto cappa.'
  },
  {
    name: 'Ematossilina di Mayer (Soluzione Colorante)',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: '517-28-2',
    hazard_symbols: ['irritant', 'health_hazard'],
    unit: 'ml',
    default_min_threshold: 2000,
    default_storage_location: 'Stipo Colorazioni Ematologia A3',
    default_supplier: 'Bio-Optica / Carlo Erba',
    notes: 'Colorazione specifica nucleare cellulare.'
  },
  {
    name: 'Eosina Y Soluzione Idroalcolica 1%',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: '17372-87-1',
    hazard_symbols: ['irritant'],
    unit: 'ml',
    default_min_threshold: 2000,
    default_storage_location: 'Stipo Colorazioni Ematologia A3',
    default_supplier: 'Bio-Optica Milano',
    notes: 'Controcolorazione citoplasmatica in ematossilina-eosina (EE).'
  },
  {
    name: 'Colorante di Giemsa Soluzione Pronta',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: '51811-82-6',
    hazard_symbols: ['flammable', 'toxic', 'health_hazard'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Stipo Colorazioni Ematologia A3',
    default_supplier: 'Merck Millipore',
    notes: 'Strisci di sangue periferico, midollare e citodiagnostica parassitologica.'
  },
  {
    name: 'Colorante di May-Grünwald',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: '68988-92-1',
    hazard_symbols: ['flammable', 'toxic'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Stipo Colorazioni Ematologia A3',
    default_supplier: 'Carlo Erba Reagents',
    notes: 'Colorazione MGG combinata per emocitologia.'
  },
  {
    name: 'Blu di Metilene Soluzione Idroalcolica',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: '61-73-4',
    hazard_symbols: ['irritant'],
    unit: 'ml',
    default_min_threshold: 1000,
    default_storage_location: 'Stipo Colorazioni Ematologia A3',
    default_supplier: 'Sigma-Aldrich',
    notes: 'Conteggio reticolociti e colorazione microbiologica batteri.'
  },
  {
    name: 'Kit Colorazione di Gram (Cristalvioletto, Lugol, Decolorante, Safranine)',
    category: 'Coloranti & Fissativi Istologici',
    cas_number: 'N/A',
    hazard_symbols: ['flammable', 'irritant'],
    unit: 'kit',
    default_min_threshold: 5,
    default_storage_location: 'Scaffale Microbiologia D1',
    default_supplier: 'Becton Dickinson / Bio-Rad',
    notes: 'Differenziazione batteri Gram-positivi e Gram-negativi.'
  },

  // Buffer, Sali & Soluzioni Tampone
  {
    name: 'Tampone PBS 10X (Phosphate Buffered Saline pH 7.4)',
    category: 'Buffer, Sali & Soluzioni Tampone',
    cas_number: 'N/A',
    hazard_symbols: ['irritant'],
    unit: 'ml',
    default_min_threshold: 5000,
    default_storage_location: 'Scaffale Soluzioni Reagenti D2',
    default_supplier: 'Sigma-Aldrich / Gibco',
    notes: 'Diluire 1:10 con H2O Milli-Q prima dell\'uso.'
  },
  {
    name: 'Tampone TAE 50X (Tris-Acetato-EDTA)',
    category: 'Buffer, Sali & Soluzioni Tampone',
    cas_number: 'N/A',
    hazard_symbols: ['irritant'],
    unit: 'ml',
    default_min_threshold: 2000,
    default_storage_location: 'Scaffale Biologia Molecolare D3',
    default_supplier: 'Bio-Rad Laboratories',
    notes: 'Elettroforesi su gel d\'agarosio acidi nucleici.'
  },
  {
    name: 'Tampone TBE 10X (Tris-Borato-EDTA)',
    category: 'Buffer, Sali & Soluzioni Tampone',
    cas_number: 'N/A',
    hazard_symbols: ['health_hazard'],
    unit: 'ml',
    default_min_threshold: 2000,
    default_storage_location: 'Scaffale Biologia Molecolare D3',
    default_supplier: 'Thermo Fisher Scientific',
    notes: 'Elettroforesi DNA/RNA ad alta risoluzione.'
  },
  {
    name: 'Cloruro di Sodio (NaCl) Grado Biologico ≥99.5%',
    category: 'Buffer, Sali & Soluzioni Tampone',
    cas_number: '7647-14-5',
    hazard_symbols: [],
    unit: 'g',
    default_min_threshold: 2000,
    default_storage_location: 'Scaffale Sali & Polveri E1',
    default_supplier: 'PanReac AppliChem',
    notes: 'Preparazione soluzione fisiologica 0.9% e soluzioni tampone.'
  },
  {
    name: 'EDTA Sale Disodico Diidrato ≥99%',
    category: 'Buffer, Sali & Soluzioni Tampone',
    cas_number: '6381-92-6',
    hazard_symbols: ['health_hazard', 'irritant'],
    unit: 'g',
    default_min_threshold: 1000,
    default_storage_location: 'Scaffale Sali & Polveri E1',
    default_supplier: 'Sigma-Aldrich',
    notes: 'Chelante ioni bivalenti, anticoagulante e inibitore DNAsi.'
  },
  {
    name: 'Tris Base (Tris(idrossimetil)amminometano) ≥99.8%',
    category: 'Buffer, Sali & Soluzioni Tampone',
    cas_number: '77-86-1',
    hazard_symbols: ['irritant'],
    unit: 'g',
    default_min_threshold: 1000,
    default_storage_location: 'Scaffale Sali & Polveri E1',
    default_supplier: 'Merck Millipore',
    notes: 'Preparazione tamponi Tris-HCl a pH fisiologico.'
  },

  // Kit Diagnostici & Enzimi
  {
    name: 'Taq DNA Polimerasi MasterMix 2X (qPCR / RT-PCR)',
    category: 'Kit Diagnostici & Enzimi',
    cas_number: '9012-90-2',
    hazard_symbols: ['biohazard', 'health_hazard'],
    unit: 'fiale',
    default_min_threshold: 20,
    default_storage_location: 'Freezer -20°C Reparto Virologia',
    default_supplier: 'Thermo Fisher Scientific',
    notes: 'Mantenere su blocco refrigerato durante la preparazione.'
  },
  {
    name: 'Kit Estrazione DNA/RNA Virale Mag-Bind (96 test)',
    category: 'Kit Diagnostici & Enzimi',
    cas_number: 'N/A',
    hazard_symbols: ['irritant', 'health_hazard'],
    unit: 'kit',
    default_min_threshold: 5,
    default_storage_location: 'Frigorifero +4°C Settore Biologia Molecolare',
    default_supplier: 'Qiagen / Omega Bio-Tek',
    notes: 'Per estrattore automatico magnetico di acidi nucleici.'
  },
  {
    name: 'Proteinasi K Liofilizzata ≥30 U/mg',
    category: 'Kit Diagnostici & Enzimi',
    cas_number: '39450-01-6',
    hazard_symbols: ['health_hazard', 'irritant'],
    unit: 'fiale',
    default_min_threshold: 10,
    default_storage_location: 'Frigorifero +4°C Settore Biologia Molecolare',
    default_supplier: 'Roche Diagnostics',
    notes: 'Digestione enzimatica proteine cellulari ed inattivazione nucleasi.'
  },

  // Standard, Calibratori & Controlli
  {
    name: 'Calibratore Multianalita Siero di Controllo (Biochimica)',
    category: 'Standard, Calibratori & Controlli',
    cas_number: 'N/A',
    hazard_symbols: ['biohazard'],
    unit: 'kit',
    default_min_threshold: 10,
    default_storage_location: 'Frigorifero +4°C Settore Analisi',
    default_supplier: 'Roche Diagnostics / Abbott',
    notes: 'Calibrazione fotometri ed analizzatori clinici automatizzati.'
  },
  {
    name: 'Controllo Qualità Sangue Intero Tri-Level (Basso/Norm/Alto)',
    category: 'Standard, Calibratori & Controlli',
    cas_number: 'N/A',
    hazard_symbols: ['biohazard'],
    unit: 'flaconi',
    default_min_threshold: 6,
    default_storage_location: 'Frigorifero +4°C Settore Ematologia',
    default_supplier: 'Sysmex / Beckman Coulter',
    notes: 'Controllo giornaliero per contaglobuli analizzatore ematologico.'
  },

  // Disinfettanti & Decontaminanti
  {
    name: 'Ipoclorito di Sodio 5% (Candeggina Laboratorio Sanitario)',
    category: 'Disinfettanti & Decontaminanti',
    cas_number: '7681-52-9',
    hazard_symbols: ['corrosive', 'environmental'],
    unit: 'ml',
    default_min_threshold: 5000,
    default_storage_location: 'Locale Decontaminazione & Lavaggio',
    default_supplier: 'Diversey Health',
    notes: 'Decontaminazione superfici e inattivazione campioni biologici.'
  },
  {
    name: 'Disinfettante Superfici a Base Alcolica Quaternaria (Spray)',
    category: 'Disinfettanti & Decontaminanti',
    cas_number: 'N/A',
    hazard_symbols: ['flammable', 'irritant'],
    unit: 'flaconi',
    default_min_threshold: 8,
    default_storage_location: 'Stipo Disinfettanti Locale Sanificazione',
    default_supplier: 'Schülke / Borer Chemie',
    notes: 'Disinfezione rapida cappe a flusso laminare e banchi di lavoro.'
  }
];
