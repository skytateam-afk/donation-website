import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export to CSV
export const exportToCSV = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

// Export to Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Export to JSON
export const exportToJSON = (data: any[], filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

// Export to PDF
export const exportToPDF = (
  data: any[],
  filename: string,
  title: string,
  columns: { header: string; dataKey: string }[]
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Add table
  autoTable(doc, {
    startY: 35,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey] || '')),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] }, // Indigo color
  });
  
  doc.save(`${filename}.pdf`);
};

// Export referrers data
export const exportReferrers = (
  referrers: any[],
  format: 'csv' | 'excel' | 'json' | 'pdf'
) => {
  const data = referrers.map(ref => ({
    'First Name': ref.firstName,
    'Last Name': ref.lastName,
    'Email': ref.email,
    'Codes Count': ref.codesCount,
    'Total Usage': ref.totalUsage,
  }));
  
  const filename = `referrers_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename, 'Referrers');
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'pdf':
      exportToPDF(
        data,
        filename,
        'Referrers Report',
        [
          { header: 'First Name', dataKey: 'First Name' },
          { header: 'Last Name', dataKey: 'Last Name' },
          { header: 'Email', dataKey: 'Email' },
          { header: 'Codes', dataKey: 'Codes Count' },
          { header: 'Usage', dataKey: 'Total Usage' },
        ]
      );
      break;
  }
};

// Export codes data
export const exportCodes = (
  codes: any[],
  format: 'csv' | 'excel' | 'json' | 'pdf'
) => {
  const data = codes.map(code => ({
    'Code': code.code,
    'Referrer Name': `${code.referrerFirstName} ${code.referrerLastName}`,
    'Email': code.referrerEmail,
    'Status': code.status,
    'Usage Count': code.usageCount,
    'Created': new Date(code.createdAt).toLocaleDateString(),
  }));
  
  const filename = `codes_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename, 'Codes');
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'pdf':
      exportToPDF(
        data,
        filename,
        'Referral Codes Report',
        [
          { header: 'Code', dataKey: 'Code' },
          { header: 'Referrer', dataKey: 'Referrer Name' },
          { header: 'Email', dataKey: 'Email' },
          { header: 'Status', dataKey: 'Status' },
          { header: 'Usage', dataKey: 'Usage Count' },
          { header: 'Created', dataKey: 'Created' },
        ]
      );
      break;
  }
};

// Export analytics report
export const exportAnalyticsReport = (
  summary: any,
  usageData: any[],
  topPerformers: any[],
  platformStats: any[]
) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Analytics Report', 14, 22);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Summary section
  doc.setFontSize(14);
  doc.text('Summary', 14, 45);
  doc.setFontSize(10);
  doc.text(`Total Codes: ${summary.totalCodes}`, 14, 55);
  doc.text(`Active Codes: ${summary.activeCodes}`, 14, 62);
  doc.text(`Total Referrers: ${summary.totalReferrers}`, 14, 69);
  doc.text(`Period Usage: ${summary.periodUsage}`, 14, 76);
  doc.text(`Usage Growth: ${summary.usageGrowth}%`, 14, 83);
  
  // Top Performers
  doc.setFontSize(14);
  doc.text('Top Performers', 14, 100);
  autoTable(doc, {
    startY: 105,
    head: [['Code', 'Usage', 'Status']],
    body: topPerformers.slice(0, 10).map(p => [p.name, p.value, p.status || 'N/A']),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] },
  });
  
  // Platform Stats
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(14);
  doc.text('Platform Distribution', 14, finalY + 15);
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Platform', 'Count', 'Percentage']],
    body: platformStats.map(p => [p.name, p.value, `${p.percentage}%`]),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] },
  });
  
  const filename = `analytics_report_${new Date().toISOString().split('T')[0]}`;
  doc.save(`${filename}.pdf`);
};
