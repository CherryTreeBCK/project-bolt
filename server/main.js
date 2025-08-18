import { main, enrichProfileData, getSelfProfileData } from './index.js';
import { classifyFollowers } from './aiSorting.js';
import { exportTableToCSV } from './saveCsv.js';

export async function runAllTasks(progressCallback) {
  try {
    progressCallback?.({ status: 'Running basic followers fetch...', progress: 0 });
    await main(progressCallback);

    progressCallback?.({ status: 'Running profile data enrichment...', progress: 0 });
    await enrichProfileData(progressCallback);

    progressCallback?.({ status: 'Running AI classification...', progress: 0 });
    await classifyFollowers(progressCallback);

    progressCallback?.({ status: 'Exporting followers to CSV...', progress: 0 });
    await exportTableToCSV('followers_duplicate');

    progressCallback?.({ status: 'All tasks completed!', progress: 1, done: true });
  } catch (error) {
    progressCallback?.({ status: `Error: ${error.message}`, error: true });
    throw error;
  }
}

