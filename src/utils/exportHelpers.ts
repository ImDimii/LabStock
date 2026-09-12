import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chemical, Operator } from '../types';
import { formatQuantity, formatDate, getDaysUntilExpiration } from './formatters';

export type ExportReportType = 'all' | 'low_stock' | 'expiring';

export function exportInventoryToExcel(chemicals: Chemical[], type: ExportReportType = 'all') {
  let filtered = chemicals;
  let filename = 'inventario_totale_labstock.xlsx';
  let title = 'INVENTARIO TOTALE REAGENTI E CHIMICI';

  if (type === 'low_stock') {
    filtered = chemicals.filter(c => Number(c.current_quantity) <= Number(c.min_threshold));
    filename = 'reagenti_esaurimento_riordino.xlsx';
    title = 'REAGENTI IN ESAURIMENTO E SOTTO SOGLIA (PROSPETTO RIORDINO)';
  } else if (type === 'expiring') {
    filtered = chemicals.filter(c => getDaysUntilExpiration(c.expiration_date) <= 30);
    filename = 'reagenti_in_scadenza.xlsx';
    title = 'REAGENTI IN SCADENZA (<30 GIORNI)';
  }

  const rows = filtered.map((c, index) => {
    const daysExp = getDaysUntilExpiration(c.expiration_date);
    const isLow = Number(c.current_quantity) <= Number(c.min_threshold);
    const suggestedOrder = isLow ? Math.max(c.min_threshold * 2 - c.current_quantity, c.min_threshold) : 0;

    return {
      'N°': index + 1,
      'Codice Interno': c.code,
      'Nome Reagente': c.name,
      'Categoria': c.category,
      'N° CAS': c.cas_number || 'N/D',
      'Giacenza Attuale': c.current_quantity,
      'Unità': c.unit,
      'Soglia Minima': c.min_threshold,
      'Q.tà Consigliata Ordine': suggestedOrder > 0 ? suggestedOrder : '-',
      'Stato Scorta': isLow ? 'CRITICO / SOTTO SOGLIA' : 'REGOLARE',
      'Ubicazione': c.storage_location,
      'Lotto': c.lot_number,
      'Data Scadenza': c.expiration_date,
      'Giorni a Scadenza': daysExp < 0 ? 'SCADUTO' : daysExp,
      'Fornitore': c.supplier || 'N/D',
      'Note / Istruzioni': c.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 4 },  // N
    { wch: 14 }, // Codice
    { wch: 38 }, // Nome
    { wch: 28 }, // Categoria
    { wch: 14 }, // CAS
    { wch: 15 }, // Giacenza
    { wch: 8 },  // Unita
    { wch: 14 }, // Soglia
    { wch: 22 }, // Qta ordine
    { wch: 24 }, // Stato
    { wch: 30 }, // Ubicazione
    { wch: 18 }, // Lotto
    { wch: 14 }, // Scadenza
    { wch: 16 }, // Giorni
    { wch: 24 }, // Fornitore
    { wch: 35 }, // Note
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
  XLSX.writeFile(workbook, filename);
}

export function exportInventoryToPDF(chemicals: Chemical[], operator: Operator | null, type: ExportReportType = 'all') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  let filtered = chemicals;
  let title = 'REPORT INVENTARIO REAGENTI E CHIMICI';
  let subtitle = 'Tutti i prodotti attualmente registrati nel laboratorio';
  let filename = 'report_inventario_labstock.pdf';

  if (type === 'low_stock') {
    filtered = chemicals.filter(c => Number(c.current_quantity) <= Number(c.min_threshold));
    title = 'PROSPETTO PRODOTTI IN ESAURIMENTO & RIORDINO';
    subtitle = 'Reagenti sotto soglia minima che necessitano ordine immediato';
    filename = 'prospetto_riordino_reagenti.pdf';
  } else if (type === 'expiring') {
    filtered = chemicals.filter(c => getDaysUntilExpiration(c.expiration_date) <= 30);
    title = 'REPORT REAGENTI IN SCADENZA (<30 GIORNI)';
    subtitle = 'Controllo di stabilità e sostituzione lotti sanitari';
    filename = 'report_reagenti_in_scadenza.pdf';
  }

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(6, 182, 212); // cyan-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LABSTOCK • GESTIONE MAGAZZINO SANITARIO', 14, 11);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 18);

  // Metadata Box
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const dateStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const opStr = operator ? `${operator.first_name} ${operator.last_name} (${operator.role})` : 'Operatore Autorizzato';

  doc.text(`Data Stampa: ${dateStr}`, 14, 30);
  doc.text(`Richiedente / Firma: ${opStr}`, 14, 35);
  doc.text(`Totale Prodotti nel Report: ${filtered.length}`, 220, 30);

  // Table Data
  const tableHeaders = [
    ['Codice', 'Nome Reagente', 'Categoria', 'Giacenza', 'Soglia Min', 'Q.tà Ordine', 'Ubicazione', 'Lotto', 'Scadenza']
  ];

  const tableBody = filtered.map(c => {
    const isLow = Number(c.current_quantity) <= Number(c.min_threshold);
    const suggested = isLow ? Math.max(c.min_threshold * 2 - c.current_quantity, c.min_threshold) : 0;
    
    return [
      c.code,
      c.name,
      c.category,
      `${formatQuantity(c.current_quantity)} ${c.unit}`,
      `${formatQuantity(c.min_threshold)} ${c.unit}`,
      suggested > 0 ? `+${formatQuantity(suggested)} ${c.unit}` : '-',
      c.storage_location,
      c.lot_number,
      formatDate(c.expiration_date)
    ];
  });

  autoTable(doc, {
    head: tableHeaders,
    body: tableBody,
    startY: 40,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 116, 144], // cyan-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      cellPadding: 2.5,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 65 },
      2: { cellWidth: 42 },
      3: { cellWidth: 24, fontStyle: 'bold' },
      4: { cellWidth: 22 },
      5: { cellWidth: 24, fontStyle: 'bold', textColor: [185, 28, 28] },
      6: { cellWidth: 40 },
      7: { cellWidth: 24 },
      8: { cellWidth: 20 }
    }
  });

  doc.save(filename);
}
