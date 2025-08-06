import { main, enrichProfileData, getSelfProfileData } from './index.js';
import { classifyFollowers } from './aiSorting.js';
import { exportTableToCSV } from './saveCsv.js';

(async () => {
  try {
    console.log('🚀 Running basic followers fetch...');
    await main();

    console.log('🔍 Running profile data enrichment...');
    await enrichProfileData();

    console.log('🧠 Running AI classification...');
    await classifyFollowers();

    console.log('📤 Exporting followers to CSV...');
    await exportTableToCSV('followers_duplicate');


    console.log('✅ All tasks completed!');
  } catch (error) {
    console.error('❌ An error occurred during the process:', error);
  }
})();
