import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { supabase } from '../src/lib/supabaseClient.js';

const USER_ID = 'goldengategymnastics';

async function addFollowersToDB(followersBatch, tableName) {
  try {
    if (!followersBatch || followersBatch.length === 0) return;

    // Map followers to objects matching your Supabase table columns
    const values = followersBatch.map(follower => ({
    username: follower.username || '',
    full_name: follower.full_name || '',
    id: follower.id || ''   
    }));

    const { data, error } = await supabase
      .from(tableName)
      .insert(values);

    if (error) {
        console.error('❌ Error inserting into Supabase:', error.message);
        throw error;
    }

    if (!data) {
        console.error('❌ Insert returned no data');
        return;
    }

    console.log(`✅ Successfully inserted ${data.length} followers into Supabase.`);

  } catch (error) {
    console.error('Error adding followers to DB:', error.message);
    throw error;
  }
}

async function addProfileDataToTable(username, profileData, tableName) {
  try {
    if (!username) throw new Error('Missing username to update profile data.');

    const updatedFields = {
      follower_count: profileData.data.follower_count || 0,
      following_count: profileData.data.following_count || 0,
      posts_count: profileData.data.media_count || 0,
      is_verified: profileData.data.is_verified || false,
      is_private: profileData.data.is_private || false,
      biography: profileData.data.biography || '',
      external_url: profileData.data.external_url || ''
    };

    const { data, error } = await supabase
      .from(tableName)
      .update(updatedFields)
      .eq('username', username)
      .select(); // <- Add .select() to return rows

    if (error) {
      console.error('Supabase update error:', error.message);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding profile data to Supabase:', error.message);
    throw error;
  }
}

// Ensure sheet has enough rows and columns
async function ensureSheetSize(sheets, spreadsheetId, sheetName, minRows, minColumns = 26) {
    try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
        
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }

        const currentRows = sheet.properties.gridProperties.rowCount;
        const currentColumns = sheet.properties.gridProperties.columnCount;
        
        if (currentRows < minRows || currentColumns < minColumns) {
            console.log(`📏 Expanding "${sheetName}" sheet from ${currentRows}x${currentColumns} to ${Math.max(minRows, currentRows)}x${Math.max(minColumns, currentColumns)}`);
            
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [{
                        updateSheetProperties: {
                            properties: {
                                sheetId: sheet.properties.sheetId,
                                gridProperties: {
                                    rowCount: Math.max(minRows, currentRows),
                                    columnCount: Math.max(minColumns, currentColumns)
                                }
                            },
                            fields: 'gridProperties.rowCount,gridProperties.columnCount'
                        }
                    }]
                }
            });
            
            console.log(`✅ Sheet "${sheetName}" expanded successfully`);
        }
    } catch (error) {
        console.error('Error ensuring sheet size:', error.message);
        throw error;
    }
}

// Add followers data to main sheet
async function addFollowersToSheet(sheets, spreadsheetId, followers, startRow, sheetName = 'followers') {
    try {
        const values = followers.map(follower => [
            follower.username || '',
            follower.full_name || '',
            follower.id || '',
            JSON.stringify(follower) // Store the complete JSON object
        ]);

        if (values.length > 0) {
            // Ensure sheet has enough rows before writing
            const requiredRows = startRow + values.length;
            await ensureSheetSize(sheets, spreadsheetId, sheetName, requiredRows + 100); // Add buffer
            
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A${startRow}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            console.log(`✅ Added ${values.length} followers to main sheet (rows ${startRow}-${startRow + values.length - 1})`);
        }

        return startRow + values.length;
    } catch (error) {
        console.error('Error adding followers to sheet:', error.message);
        throw error;
    }
}

// Add API call response to pages sheet
async function addApiResponseToSheet(sheets, spreadsheetId, requestNumber, response, startRow, sheetName = 'follower pages') {
    try {
        const values = [[
            requestNumber,
            JSON.stringify(response) // Store the complete API response
        ]];

        // Ensure sheet has enough rows before writing
        await ensureSheetSize(sheets, spreadsheetId, sheetName, startRow + 50); // Add buffer

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${startRow}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        console.log(`✅ Added API response #${requestNumber} to pages sheet`);
        return startRow + 1;
    } catch (error) {
        console.error('Error adding API response to sheet:', error.message);
        throw error;
    }
}

async function getSelfProfileData() {
  try {
    const profileData = await getUserProfileData(USER_ID);

    // Use profileData.data for the actual profile info
    if (!profileData.data.id) {
      const selfAsFollower = [{
        username: profileData.data.username || '',
        full_name: profileData.data.full_name || '',
        id: profileData.data.id || ''
      }];

      await addFollowersToDB(selfAsFollower, 'account_info');
    }

    await addProfileDataToTable(USER_ID, profileData, 'account_info');
  } catch (error) {
    console.error("❌ Failed to fetch self profile data:", error.message);
  }
}


getSelfProfileData();


// Fetch Instagram followers with pagination
async function saveAllBasicFollowerDataToDB(username, maxPages = 10, progressCallback) {
    const allFollowers = [];
    let paginationToken = null;
    let pageCount = 0;

    try {
        do {
            console.log(`📄 Fetching page ${pageCount + 1}${paginationToken ? ` (token: ...${paginationToken.slice(-20)})` : ''}`);
            
            const options = {
                method: 'GET',
                url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/followers',
                params: {
                    username_or_id_or_url: username,
                    ...(paginationToken && { pagination_token: paginationToken })
                },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
                }
            };

            const response = await axios.request(options);
            const data = response.data;
            
            if (data.data && data.data.items) {
                const followers = data.data.items;
                allFollowers.push(...followers);
                
                // Save followers to the main sheet in batches
                const batchSize = 25;
                for (let i = 0; i < followers.length; i += batchSize) {
                    const batch = followers.slice(i, i + batchSize);
                    await addFollowersToDB(batch, 'followers_duplicate');

                    progressCallback?.({
                        status: `Getting follower ${i} of ${allFollowers.length}`,
                        progress: i / allFollowers.length,
                        current: i,
                        total: allFollowers.length,
                    });
                    
                    // Small delay between batches
                    if (i + batchSize < followers.length) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
                
                console.log(`✅ Fetched ${followers.length} followers (total: ${allFollowers.length})`);
            }

            // Get pagination token for next page
            paginationToken = data.pagination_token || null;
            pageCount++;

            // Add a delay to avoid rate limiting
            if (paginationToken && pageCount <= maxPages) {
                console.log('⏳ Waiting 0.33 seconds before next request...'); 
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Safety check to avoid infinite loops
            if (pageCount >= maxPages) {
                console.log(`⚠️  Reached maximum pages limit (${maxPages}). Use maxPages parameter to fetch more.`);
                break;
            }

        } while (paginationToken);

        console.log(`🎉 Finished! Total followers fetched: ${allFollowers.length}`);
        return allFollowers;

    } catch (error) {
        console.error('Error fetching followers:', error.response?.data || error.message);
        throw error;
    }
}

// Original function for testing without sheets
async function getAllFollowers(username, maxPages = 10) {
    const allFollowers = [];
    let paginationToken = null;
    let pageCount = 0;

    try {
        do {
            console.log(`📄 Fetching page ${pageCount + 1}${paginationToken ? ` (token: ...${paginationToken.slice(-20)})` : ''}`);
            
            const options = {
                method: 'GET',
                url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/followers',
                params: {
                    username_or_id_or_url: username,
                    ...(paginationToken && { pagination_token: paginationToken })
                },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
                }
            };

            const response = await axios.request(options);
            const data = response.data;
            
            if (data.data && data.data.items) {
                const followers = data.data.items;
                allFollowers.push(...followers);
                console.log(`✅ Fetched ${followers.length} followers (total: ${allFollowers.length})`);
            }

            // Get pagination token for next page
            paginationToken = data.data?.pagination_token || null;
            pageCount++;

            // Add a small delay to avoid rate limiting
            if (paginationToken && pageCount < maxPages) {
                console.log('⏳ Waiting 0.33 seconds before next request...');
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Safety check to avoid infinite loops
            if (pageCount >= maxPages) {
                console.log(`⚠️  Reached maximum pages limit (${maxPages}). Use maxPages parameter to fetch more.`);
                break;
            }

        } while (paginationToken);

        console.log(`🎉 Finished! Total followers fetched: ${allFollowers.length}`);
        return allFollowers;

    } catch (error) {
        console.error('Error fetching followers:', error.response?.data || error.message);
        throw error;
    }
}

// Main execution function
async function main(progressCallback) {
    console.log('🚀 Starting Instagram Followers to Supabase');
    
    // Check if API key is configured
    if (!process.env.RAPIDAPI_KEY) {
        console.error('❌ RAPIDAPI_KEY not found in environment variables!');
        console.log('Please add your RapidAPI key to the .env file');
        return;
    }

    try {
        // Fetch all followers with pagination and save to db
        console.log(`📱 Fetching followers for: ${USER_ID}`);
        const maxPages = parseInt(process.env.MAX_PAGES) || 5; // Default to 5 pages
        const followers = await saveAllBasicFollowerDataToDB(USER_ID, maxPages, progressCallback);

        if (followers.length === 0) {
            console.log('ℹ️  No followers found or user may be private');
            return;
        }

        console.log(`\n🎉 Successfully processed ${followers.length} followers!`);

    } catch (error) {
        console.error('❌ Application error:', error.message);
    }
}

// Helper function for testing individual API calls
async function testFollowersAPI() {
    try {
        const options = {
            method: 'GET',
            url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/followers',
            params: {
                username_or_id_or_url: USER_ID
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
            }
        };

        console.log('Testing followers API...');
        const response = await axios.request(options);
        console.log('API Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Error testing API:', error.response?.data || error.message);
        throw error;
    }
}

// Enrich existing followers with detailed profile data
async function enrichProfileData(progressCallback) {
    console.log('🔍 Starting profile data enrichment for existing followers...');
    
    // Check if API key is configured
    if (!process.env.RAPIDAPI_KEY) {
        console.error('❌ RAPIDAPI_KEY not found in environment variables!');
        console.log('Please add your RapidAPI key to the .env file');
        return;
    }

    try {
        console.log('📖 Reading followers from Supabase where follower_count is missing...');

        const { data: followers, error } = await supabase
            .from('followers_duplicate')
            .select('*')
            .is('follower_count', null) // Only those missing follower_count

        if (error) {
            console.error('❌ Error fetching followers:', error);
            return;
        }

        if (!followers || followers.length === 0) {
            console.log('ℹ️  All followers already have profile data. Nothing to process.');
            return;
        }

        const followersToProcess = followers.filter(f => {
            try {
            const profileJson = f.profile_json;
            if (!profileJson) return true;
            const parsed = JSON.parse(profileJson);
            return parsed.status !== 'not_found';
            } catch {
            return true;
            }
        });

        console.log(`📊 Found ${followersToProcess.length} followers that need profile data enrichment`);
        
        if (followersToProcess.length === 0) {
            console.log('ℹ️  All followers already have profile data. Nothing to process.');
            return;
        }
        
        let processedCount = 0;
        const maxToProcess = parseInt(process.env.MAX_PROFILE_USERS) || 100; // Default to 100 users
        
        // Limit followers to process
        const followersToActuallyProcess = followersToProcess.slice(0, maxToProcess);
        console.log(`🚀 Processing ${followersToActuallyProcess.length} users sequentially with no delays`);
        
        for (const follower of followersToActuallyProcess) {
            try {
                const { username, rowNumber } = follower;
                console.log(`🔍 Processing ${processedCount + 1}/${followersToActuallyProcess.length}: ${username}`);
                
                // Get detailed profile data for this user
                const profileData = await getUserProfileData(username);
                
                if (profileData && profileData.data && !profileData.error) {
                    // Update the row with profile data in columns E-L
                    await addProfileDataToTable(username, profileData, 'followers_duplicate');
                    processedCount++;
                    console.log(`✅ Enriched ${username} with profile data (${processedCount}/${followersToActuallyProcess.length})`);

                    progressCallback?.({
                        status: `Enriching profile ${processedCount} of ${followersToActuallyProcess.length}`,
                        progress: processedCount / followersToActuallyProcess.length,
                        current: processedCount,
                        total: followersToActuallyProcess.length,
                    });
                } else if (profileData && (profileData.detail === 'Not found' || (profileData.error && profileData.error.includes('Not found')))) {
                    // User was deleted/not found - save marker so we don't try again
                    const notFoundMarker = {
                        status: 'not_found',
                        detail: 'User not found (likely deleted)',
                        username: username,
                        checked_at: new Date().toISOString()
                    };
                    await addNotFoundMarkerToSheet(sheets, spreadsheetId, rowNumber, notFoundMarker);
                    console.log(`🗑️  User ${username} not found (likely deleted) - marked to skip in future runs`);
                } else {
                    if (profileData && (profileData.error === 'no cookie available for use' || profileData.status === 'error')) {
                        console.log(`🍪 API error for ${username} - ${profileData.error || 'API may need time to recover'}`);
                    } else {
                        console.log(`⚠️  No profile data found for ${username}`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing ${follower.username}:`, error.message);
                // Continue with next user
            }
        }

        console.log(`\n🎉 Successfully enriched ${processedCount}/${followersToActuallyProcess.length} followers with profile data!`);

    } catch (error) {
        console.error('❌ Application error:', error.message);
    }
}

// Setup metadata sheet
async function setupMetadataSheet(sheets, spreadsheetId, sheetName = 'metadata') {
    try {
        // First, check if the sheet exists, if not create it
        let sheetExists = false;
        try {
            const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
            sheetExists = spreadsheet.data.sheets.some(sheet => 
                sheet.properties.title === sheetName
            );
        } catch (error) {
            console.log('Error checking sheets:', error.message);
        }

        // Create the sheet if it doesn't exist
        if (!sheetExists) {
            console.log(`📄 Creating "${sheetName}" sheet...`);
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: sheetName
                            }
                        }
                    }]
                }
            });
            console.log(`✅ Created "${sheetName}" sheet`);
        } else {
            // Try to clear existing data first
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: `${sheetName}!A:Z`,
            });
        }

        // Add headers for metadata
        const headers = [
            'Username',
            'Full Name',
            'Follower Count',
            'Following Count',
            'Posts Count',
            'Is Verified',
            'Is Private',
            'Biography',
            'External URL',
            'Profile Pic URL',
            'Category',
            'Complete JSON'
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [headers]
            }
        });

        console.log(`✅ Metadata sheet "${sheetName}" set up with headers`);
        return 2; // Next row to write data
    } catch (error) {
        console.error('Error setting up metadata sheet:', error.message);
        throw error;
    }
}

// Get detailed user profile data (primary method using instagram-scraper-api2)
async function getUserProfileData(username) {
    try {
        const options = {
            method: 'GET',
            url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
            params: {
                username_or_id_or_url: username
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        const errorData = error.response?.data;
        console.error(`Error fetching profile data for ${username}:`, errorData || error.message);
        
        // Return the error data so we can check for "Not found" in the calling function
        if (errorData) {
            return errorData;
        }
        return null;
    }
}

// Backup profile data method (using instagram-scrapper-posts-reels-stories-downloader)
async function getUserProfileDataBackup(username) {
    try {
        const options = {
            method: 'GET',
            url: `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/profile_by_username?username=${username}`,
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(`Error fetching backup profile data for ${username}:`, error.response?.data || error.message);
        return null;
    }
}

// Add profile data to followers sheet (columns E-L)
async function addProfileDataToFollowersSheet(sheets, spreadsheetId, rowNumber, profileData) {
    try {
        // Extract data from profile response (handle both API formats)
        const userData = profileData.data || profileData; // New API has data nested under "data" field
        
        // Prepare JSON string and check if it's too large for Google Sheets
        let jsonString = JSON.stringify(profileData);
        const maxCharsPerCell = 50000; // Google Sheets limit
        
        if (jsonString.length > maxCharsPerCell) {
            console.log(`⚠️  JSON data too large (${jsonString.length} chars), trimming to ${maxCharsPerCell} chars`);
            jsonString = jsonString.substring(0, maxCharsPerCell - 100) + '...[TRIMMED]';
        }
        
        const values = [[
            jsonString, // Column E - JSON from profile (possibly trimmed)
            userData.follower_count || '', // Column F - follower count
            userData.following_count || '', // Column G - following count
            userData.media_count || '', // Column H - posts count
            userData.is_verified || false, // Column I - is verified
            userData.is_private || false, // Column J - is private
            userData.biography || '', // Column K - biography
            userData.external_url || '' // Column L - external url
        ]];

        // Ensure sheet has enough columns
        await ensureSheetSize(sheets, spreadsheetId, 'followers', rowNumber + 10, 12); // 12 columns for A-L

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `followers!E${rowNumber}:L${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        return true;
    } catch (error) {
        console.error('Error adding profile data to followers sheet:', error.message);
        throw error;
    }
}

// Add "not found" marker to followers sheet
async function addNotFoundMarkerToSheet(sheets, spreadsheetId, rowNumber, notFoundMarker) {
    try {
        const values = [[
            JSON.stringify(notFoundMarker), // Column E - "not found" marker
            '', // Column F - follower count (empty)
            '', // Column G - following count (empty)
            '', // Column H - posts count (empty)
            '', // Column I - is verified (empty)
            '', // Column J - is private (empty)
            '', // Column K - biography (empty)
            '' // Column L - external url (empty)
        ]];

        // Ensure sheet has enough columns
        await ensureSheetSize(sheets, spreadsheetId, 'followers', rowNumber + 10, 12); // 12 columns for A-L

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `followers!E${rowNumber}:L${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        return true;
    } catch (error) {
        console.error('Error adding not found marker to followers sheet:', error.message);
        throw error;
    }
}

// Add metadata to sheet (kept for backwards compatibility)
async function addMetadataToSheet(sheets, spreadsheetId, username, metadata, startRow, sheetName = 'metadata') {
    try {
        const user = metadata.data || metadata;
        
        const values = [[
            username,
            user.full_name || '',
            user.follower_count || 0,
            user.following_count || 0,
            user.media_count || 0,
            user.is_verified || false,
            user.is_private || false,
            user.biography || '',
            user.external_url || '',
            user.profile_pic_url || '',
            user.category || '',
            JSON.stringify(metadata)
        ]];

        // Ensure sheet has enough rows before writing
        await ensureSheetSize(sheets, spreadsheetId, sheetName, startRow + 50); // Add buffer

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${startRow}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        return startRow + 1;
    } catch (error) {
        console.error('Error adding metadata to sheet:', error.message);
        throw error;
    }
}

/* Run the application
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        console.log('🧪 Running API test...');
        testFollowersAPI();
    } else if (args.includes('--profile_data') || args.includes('--profile-data')) {
        console.log('🔍 Running profile data enrichment...');
        enrichProfileData();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log(`
📖 Instagram Followers Tool Usage:

🚀 Basic Commands:
  npm start                    Fetch followers list (basic data)
  npm run profile_data         Enrich existing followers with detailed profile data
  npm run test-api            Test API connection

🔧 Advanced Commands:
  node index.js --test         Test API connection
  node index.js --profile_data Enrich followers with profile data
  node index.js --profile-data Same as --profile_data
  node index.js --help         Show this help

📊 Process:
  1. First run: npm start (fetches all followers)
  2. Then run: npm run profile_data (gets detailed profile info for each follower)

📋 Data Storage:
  - "followers" sheet: Basic follower list + profile data (columns E-L)
  - "follower pages" sheet: API call logs

🔧 APIs Used:
  - Followers: instagram-scraper-api2 (/v1/followers)
  - Profile Data: instagram-scraper-api2 (/v1/info)

⚙️  Configuration:
  - MAX_PROFILE_USERS: Max users to process (default: 100)
  - Processing: Sequential with no delays between requests
        `);
    } else {
        console.log('🚀 Running basic followers fetch...');
        main();
    }
}
*/

export {
  getAllFollowers,
  saveAllBasicFollowerDataToDB,
  ensureSheetSize,
  addFollowersToSheet,
  addApiResponseToSheet,
  testFollowersAPI,
  enrichProfileData,
  addProfileDataToFollowersSheet,
  addNotFoundMarkerToSheet,
  getUserProfileData,
  getUserProfileDataBackup,
  setupMetadataSheet,
  addMetadataToSheet,
  main,
  getSelfProfileData
};
