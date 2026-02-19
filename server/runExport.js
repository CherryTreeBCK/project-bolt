import { exportTableToCSV } from './saveCsv.js';

exportTableToCSV().catch(err => {
  console.error('❌ Error exporting followers:', err);
});
