import Papa from 'papaparse';

export interface FollowerData {
  id: number;
  username: string;
  name: string;
  avatar: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  category: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  leadScore: number;
  leadStatus: string;
  lastActivity: string;
  tags: string[];
  potentialValue: string;
  followedDate: string;
  mutualConnections: number;
  verified: boolean;
  isPrivate: boolean;
  externalUrl?: string;
  priority: string;
}

export async function loadFollowersFromCSV(): Promise<FollowerData[]> {
  try {
    // 1. Fetch CSV text
    const response = await fetch('/src/data/followers_duplicate.csv');
    const csvText = await response.text();

    // 2. Parse with PapaParse
    const { data: rows, errors } = Papa.parse<any>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().replace(/"/g, ''),
      transform: v => v.trim().replace(/^"|"$/g, ''),
    });

    if (errors.length) {
      console.error('CSV parsing errors:', errors);
      throw new Error('Failed to parse CSV properly');
    }

    const followers: FollowerData[] = rows.map((row, i) => {
      // === your existing JSON‑from‑followers extraction ===
      let profilePicUrl = '';
      try {
        let j = row['JSON from followers'] as string;
        if (j.startsWith('"{') && j.endsWith('}"')) {
          j = j.slice(1, -1).replace(/\\"/g, '"');
        }
        j = j.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        if (j.startsWith('{') && j.endsWith('}')) {
          const js = JSON.parse(j);
          profilePicUrl = js.profile_pic_url || '';
        }
      } catch {
        profilePicUrl = '';
      }
      if (!profilePicUrl) {
        const hash = hashCode(row.username || `user${i}`);
        const imageId = 1000000 + Math.abs(hash % 9000000);
        profilePicUrl = `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop`;
      }

      // === your existing numeric / engagement / lead scoring ===
      const followerCount = parseInt(row['follower_count']) || 0;
      const followingCount = parseInt(row['following_count']) || 0;
      const postsCount    = parseInt(row['posts_count'])    || 0;

      const baseEngagement  = 2 + Math.random() * 4;
      const followerBonus   = Math.min(followerCount / 100000, 1) * 2;
      const verifiedBonus   = row.is_verified === 'true' ? 1 : 0;
      const engagementRate  = Math.round((baseEngagement + followerBonus + verifiedBonus) * 100) / 100;

      const leadScore = Math.min(100, Math.round(
        (Math.log(followerCount + 1) / Math.log(1_000_000)) * 35 +
        Math.min(engagementRate * 8, 25) +
        (row.is_verified === 'true' ? 15 : 0) +
        (row.is_private  === 'false' ? 10 : 0) +
        (row.external_url ? 8 : 0) +
        (row.priority === 'high'   ? 7 :
         row.priority === 'medium' ? 4 : 0)
      ));

      let leadStatus = 'Cold Lead';
      if (leadScore >= 75 || row.priority === 'high')   leadStatus = 'Hot Lead';
      else if (leadScore >= 50 || row.priority === 'medium') leadStatus = 'Warm Lead';

      let potentialValue = 'Low';
      if (leadScore >= 70 && followerCount > 50000)      potentialValue = 'High';
      else if (leadScore >= 50 || followerCount > 20000) potentialValue = 'Medium';

      // === assemble final object ===
      return {
        id:            i + 1,
        username:      row.username || `@user${i + 1}`,
        name:          row.full_name  || row.username?.replace('@','') || `User ${i + 1}`,
        avatar:        profilePicUrl,
        followers:     followerCount,
        following:     followingCount,
        posts:         postsCount,
        engagement:    engagementRate,
        category:      row.category  || 'Lifestyle',
        bio:           row.biography || 'No bio available',
        tags:          getTags(row.category, row.is_verified === 'true', leadScore, row.priority),
        potentialValue,
        followedDate:  getRandomDate(),
        mutualConnections: Math.floor(Math.random() * 15),
        verified:      row.is_verified === 'true',
        isPrivate:     row.is_private  === 'true',
        externalUrl:   row.external_url || undefined,
        priority:      row.priority   || 'low',
        leadScore,
        leadStatus,
      } as FollowerData;
    });

    console.log(`Loaded ${followers.length} followers.`);
    return followers;
  } catch (err) {
    console.error('Error loading CSV:', err);
    return [];
  }
}


function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function extractLocation(bio: string): string | null {
  if (!bio) return null;
  
  // Common location patterns in bios
  const locationPatterns = [
    /📍\s*([^|•\n]+)/i,
    /based in\s+([^|•\n]+)/i,
    /from\s+([^|•\n]+)/i,
    /living in\s+([^|•\n]+)/i,
    /(\w+,\s*\w+)/i // City, State pattern
  ];
  
  for (const pattern of locationPatterns) {
    const match = bio.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

function getRandomLocation(): string {
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
    'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
    'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
    'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
    'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
    'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
    'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateEmail(username: string): string {
  const cleanUsername = username.replace('@', '').replace(/[^a-zA-Z0-9]/g, '');
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${cleanUsername}@${domain}`;
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1 (${areaCode}) ${exchange}-${number}`;
}

function getRandomActivity(): string {
  const activities = [
    '2 hours ago', '5 hours ago', '8 hours ago', '12 hours ago', '1 day ago', 
    '2 days ago', '3 days ago', '5 days ago', '1 week ago', '2 weeks ago', 
    '3 weeks ago', '1 month ago', '6 weeks ago', '2 months ago'
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}

function getRandomDate(): string {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function getTags(category: string, verified: boolean, leadScore: number, priority: string): string[] {
  const tags: string[] = [];
  
  if (category && category !== 'undefined') tags.push(category);
  if (verified) tags.push('Verified');
  if (leadScore >= 75) tags.push('High Engagement');
  if (leadScore >= 85) tags.push('VIP');
  if (priority === 'high') tags.push('Priority');
  if (leadScore >= 60) tags.push('Influencer');
  
  return tags;
}