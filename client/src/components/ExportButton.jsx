import React, { useState } from 'react';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportButton = ({ 
  data, 
  filename = 'export', 
  columns = [],
  title = 'Export Data',
  disabled = false,
  loading = false 
}) => {
  const [exportLoading, setExportLoading] = useState(false);

  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      // Prepare table data
      const tableData = data.map(row => 
        columns.map(col => row[col.key] || row[col.accessor] || '')
      );
      
      const tableHeaders = columns.map(col => col.header || col.label || col.key);
      
      // Add table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });
      
      // Save PDF
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Prepare data for Excel
      const excelData = data.map(row => {
        const obj = {};
        columns.forEach(col => {
          obj[col.header || col.label || col.key] = row[col.key] || row[col.accessor] || '';
        });
        return obj;
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Save Excel file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error('Excel export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      // Prepare data for CSV
      const csvData = data.map(row => {
        const obj = {};
        columns.forEach(col => {
          obj[col.header || col.label || col.key] = row[col.key] || row[col.accessor] || '';
        });
        return obj;
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(csvData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Save CSV file
      XLSX.writeFile(workbook, `${filename}.csv`);
    } catch (error) {
      console.error('CSV export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm h-9"
          disabled={disabled || loading || exportLoading || !data || data.length === 0}
        >
          {exportLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF} disabled={exportLoading}>
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} disabled={exportLoading}>
          <Table className="w-4 h-4 mr-2 text-green-500" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} disabled={exportLoading}>
          <FileText className="w-4 h-4 mr-2 text-blue-500" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;