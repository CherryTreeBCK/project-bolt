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
  priority: number;
}

export async function loadFollowersFromCSV(): Promise<FollowerData[]> {
  try {
    const response = await fetch('/src/data/followers_duplicate_new.csv');
    const csvText = await response.text();

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
      let profilePicUrl = '';
      try {
        let j = row['JSON from followers'] as string;
        if (j.startsWith('"{') && j.endsWith('}"')) {
          j = j.slice(1, -1).replace(/\\"/g, '"');
        }
        j = j.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
        if (j.startsWith('{') && j.endsWith('}')) {
        }
      } catch {
        profilePicUrl = '';
      }
      if (!profilePicUrl) {
        const hash = hashCode(row.username || `user${i}`);
        const imageId = 1000000 + Math.abs(hash % 9000000);
        profilePicUrl = `https://images.pexels.com/photos/${imageId}/pexels-photo-${imageId}.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop`;
      }

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
    hash = hash & hash;
  }
  return hash;
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