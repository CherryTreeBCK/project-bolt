import { exportTableToCSV } from './saveCsv.js'; // adjust path if needed

exportTableToCSV().catch(err => {
  console.error('❌ Error exporting followers:', err);
});
