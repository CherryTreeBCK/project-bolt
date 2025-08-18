import fs from 'fs';
import path from 'path';
import { supabase } from '../src/lib/supabaseClient.js'; // Adjust path as needed
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportTableToCSV(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*');

  if (error) {
    throw new Error('Failed to fetch followers for CSV export: ' + error.message);
  }

  if (!data || data.length === 0) {
    console.log(`No data found in ${tableName} to export.`);
    return;
  }

  const csvString = convertToCSV(data);

  const folderPath = path.resolve(__dirname, '..', 'data');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

    const filePath = path.join(folderPath, `${tableName}.csv`);


  fs.writeFileSync(filePath, csvString, 'utf8');

  console.log(`CSV export complete! File saved to ${filePath}`);
}

// CSV conversion helper (same as before)
function convertToCSV(arr) {
  const keys = Object.keys(arr[0]);
  const csvRows = [];

  csvRows.push(keys.join(','));

  for (const row of arr) {
    const values = keys.map(key => {
      const val = row[key];
      if (val === null || val === undefined) return '';
      const stringVal = val.toString().replace(/"/g, '""');
      return stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') ? `"${stringVal}"` : stringVal;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export {exportTableToCSV }
