import * as XLSX from 'xlsx';
import { BottleWithDetails } from '@/lib/types';

interface ExcelRow {
  Producer: string;
  Wine: string;
  Vintage: number | string;
  Color: string;
  Stock: number;
  'Estimate price': number;
  'Note (100)': string;
  Country: string;
  Region: string;
  Appellation: string;
  Grapes: string;
  'Bottle format': string;
  'Service temperature': string;
  'Apogee from': string;
  'Apogee to': string;
  'Degree of alcohol': string;
  Classification: string;
  Cuvee: string;
  Reference: string;
  Tags: string;
  Comments: string;
  'Entry date': string;
  'Purchase price': number;
  Vendor: string;
}

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function transformBottleToRow(bottle: BottleWithDetails): ExcelRow {
  const varietals = bottle.wine.wine_varietal
    ?.map(wv => wv.varietal.name)
    .join(', ') || '';
  
  const tags = bottle.tags?.join(', ') || '';
  
  return {
    Producer: bottle.wine.producer.name,
    Wine: bottle.wine.name,
    Vintage: bottle.vintage || '',
    Color: capitalizeFirst(bottle.wine.colour),
    Stock: bottle.quantity,
    'Estimate price': bottle.price,
    'Note (100)': '',
    Country: bottle.wine.producer.country?.name || '',
    Region: bottle.wine.producer.region?.name || '',
    Appellation: '',
    Grapes: varietals,
    'Bottle format': `${bottle.size}ml`,
    'Service temperature': '',
    'Apogee from': '',
    'Apogee to': '',
    'Degree of alcohol': '',
    Classification: '',
    Cuvee: '',
    Reference: '',
    Tags: tags,
    Comments: '',
    'Entry date': formatDate(bottle.created_at),
    'Purchase price': bottle.price,
    Vendor: '',
  };
}

export function exportCollectionToExcel(bottles: BottleWithDetails[]): void {
  // Transform all bottles to Excel rows
  const rows = bottles.map(transformBottleToRow);
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 25 }, // Producer
    { wch: 30 }, // Wine
    { wch: 8 },  // Vintage
    { wch: 10 }, // Color
    { wch: 6 },  // Stock
    { wch: 14 }, // Estimate price
    { wch: 10 }, // Note (100)
    { wch: 15 }, // Country
    { wch: 20 }, // Region
    { wch: 15 }, // Appellation
    { wch: 25 }, // Grapes
    { wch: 12 }, // Bottle format
    { wch: 18 }, // Service temperature
    { wch: 12 }, // Apogee from
    { wch: 10 }, // Apogee to
    { wch: 16 }, // Degree of alcohol
    { wch: 14 }, // Classification
    { wch: 15 }, // Cuvee
    { wch: 12 }, // Reference
    { wch: 20 }, // Tags
    { wch: 30 }, // Comments
    { wch: 12 }, // Entry date
    { wch: 14 }, // Purchase price
    { wch: 15 }, // Vendor
  ];
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Collection');
  
  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const filename = `wine-collection-${date}.xlsx`;
  
  // Trigger download
  XLSX.writeFile(workbook, filename);
}
