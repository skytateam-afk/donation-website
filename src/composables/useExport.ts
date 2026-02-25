/**
 * Export composable for exporting data to various formats
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface ExportColumn {
  header: string
  key: string
  width?: number
}

export interface ExportOptions {
  filename: string
  title?: string
  columns: ExportColumn[]
  data: any[]
  orientation?: 'portrait' | 'landscape'
}

export function useExport() {
  /**
   * Export data to PDF
   */
  const exportToPDF = (options: ExportOptions) => {
    const { filename, title, columns, data, orientation = 'landscape' } = options

    // Create new PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    })

    // Add title if provided
    if (title) {
      doc.setFontSize(16)
      doc.text(title, 14, 15)
    }

    // Prepare table data
    const headers = columns.map(col => col.header)
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key]
        return value !== null && value !== undefined ? String(value) : 'N/A'
      })
    )

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title ? 25 : 15,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 15, right: 10, bottom: 10, left: 10 }
    })

    // Add footer with timestamp
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      )
    }

    // Save the PDF
    doc.save(`${filename}.pdf`)
  }

  /**
   * Export data to Excel
   */
  const exportToExcel = (options: ExportOptions) => {
    const { filename, title, columns, data } = options

    // Prepare worksheet data
    const headers = columns.map(col => col.header)
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key]
        return value !== null && value !== undefined ? value : 'N/A'
      })
    )

    // Create worksheet
    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title || 'Data')

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    saveAs(blob, `${filename}.xlsx`)
  }

  /**
   * Export data to CSV
   */
  const exportToCSV = (options: ExportOptions) => {
    const { filename, columns, data } = options

    // Prepare CSV content
    const headers = columns.map(col => col.header).join(',')
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key]
        const stringValue = value !== null && value !== undefined ? String(value) : 'N/A'
        // Escape commas and quotes
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue
      }).join(',')
    ).join('\n')

    const csvContent = `${headers}\n${rows}`

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${filename}.csv`)
  }

  return {
    exportToPDF,
    exportToExcel,
    exportToCSV
  }
}
