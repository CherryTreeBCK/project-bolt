import { supabase } from '../lib/supabase.ts';


export async function initDB() {
  const { data, error } = await supabase.from('accounts').select('count').limit(1);
  if (error) {
    console.error('Supabase connection error:', error);
    throw new Error('Failed to connect to Supabase. Please check your configuration.');
  }
  console.log('Supabase connection successful');
  return true;
}

export async function getAllAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('username');

  if (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }

  return data || [];
}

export async function upsertAccount({ id, username, full_name, profile_image_url }) {
  const { data, error } = await supabase
    .from('accounts')
    .upsert({
      id,
      username,
      full_name,
      profile_image_url
    })
    .select();

  if (error) {
    console.error('Error upserting account:', error);
    throw error;
  }

  return data;
}

export async function updateAccountId(oldId, newId) {
  const { error: accountError } = await supabase
    .from('accounts')
    .update({ id: newId })
    .eq('id', oldId);

  if (accountError) {
    console.error('Error updating account ID:', accountError);
    throw accountError;
  }

  const { error: followersError } = await supabase
    .from('followers')
    .update({ account_id: newId })
    .eq('account_id', oldId);

  if (followersError) {
    console.error('Error updating followers account_id:', followersError);
    throw followersError;
  }

  console.log(`Updated account ID from ${oldId} to ${newId}`);
}

export async function importFollowers(account_id, file) {
  const Papa = await import("papaparse");
  const { data } = Papa.parse(await file.text(), { header: true, skipEmptyLines: true });

  const { error: deleteError } = await supabase
    .from('followers')
    .delete()
    .eq('account_id', account_id);

  if (deleteError) {
    console.error('Error deleting existing followers:', deleteError);
    throw deleteError;
  }

  const followersData = data.map(r => ({
    id: parseInt(r["ID"]) || Math.floor(Math.random() * 1000000000),
    account_id,
    username: r["Username"] || "",
    full_name: r["Full Name"] || "",
    follower_count: parseInt(r["follower count"]) || 0,
    following_count: parseInt(r["following count"]) || 0,
    posts_count: parseInt(r["posts count"]) || 0,
    is_verified: bool(r["is verified"]),
    is_private: bool(r["is private"]),
    biography: r["biography"] || "",
    external_url: r["external url"] || "",
    category: r["category"] || "",
    priority: r["priority"] || "",
    profile_image_url: r["profile image url"] || ""
  }));

  const batchSize = 1000;
  let insertedCount = 0;

  for (let i = 0; i < followersData.length; i += batchSize) {
    const batch = followersData.slice(i, i + batchSize);
    const { error } = await supabase
      .from('followers')
      .insert(batch);

    if (error) {
      console.error('Error inserting followers batch:', error);
      throw error;
    }

    insertedCount += batch.length;
  }

  return insertedCount;
}

function bool(v) { 
  return v === "true" || v === "1" || v === 1 || v === true; 
}

export async function followersByAccount(account_id) {
  console.log('Looking for followers with account_id:', account_id);
  
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      contacts (
        status,
        archived,
        last_contact_date,
        notes
      )
    `)
    .eq('account_id', account_id)
    .order('follower_count', { ascending: false });

  if (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }

  const followersWithContacts = (data || []).map(follower => ({
    ...follower,
    status: follower.contacts?.status || null,
    archived: follower.contacts?.archived || false,
    last_contact_date: follower.contacts?.last_contact_date || null,
    notes: follower.contacts?.notes || null
  }));

  console.log(`Query result for account_id ${account_id}: ${followersWithContacts.length} followers found`);
  
  return followersWithContacts;
}

export async function getFollowerWithContact(follower_id) {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      contacts (
        status,
        archived,
        last_contact_date,
        notes,
        draft_outreach,
        next_steps
      )
    `)
    .eq('id', follower_id)
    .single();

  if (error) {
    console.error('Error fetching follower with contact:', error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    status: data.contacts?.status || null,
    archived: data.contacts?.archived || false,
    last_contact_date: data.contacts?.last_contact_date || null,
    notes: data.contacts?.notes || null,
    draft_outreach: data.contacts?.draft_outreach || null,
    next_steps: data.contacts?.next_steps || null
  };
}

export async function upsertContact(follower_id, fields) {
  const { data, error } = await supabase
    .from('contacts')
    .upsert({
      follower_id,
      ...fields
    })
    .select();

  if (error) {
    console.error('Error upserting contact:', error);
    throw error;
  }

  return data;
}

export async function searchFollowers(account_id, query) {
  const { data, error } = await supabase
    .from('followers')
    .select(`
      *,
      contacts (
        status,
        archived,
        last_contact_date,
        notes
      )
    `)
    .eq('account_id', account_id)
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,category.ilike.%${query}%`)
    .order('follower_count', { ascending: false });

  if (error) {
    console.error('Error searching followers:', error);
    throw error;
  }

  return (data || []).map(follower => ({
    ...follower,
    status: follower.contacts?.status || null,
    archived: follower.contacts?.archived || false,
    last_contact_date: follower.contacts?.last_contact_date || null,
    notes: follower.contacts?.notes || null
  }));
}

export async function validateSignupToken(token) {
  const { data, error } = await supabase
    .from("account_access_tokens")
    .select("id, account_id, token, used, expires_at")
    .eq("token", token)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();  

  if (error) {
    console.error("Token validation error:", error);
    return null;
  }

  if (!data) return null;

  return {
    accountUUID: data.id,        
    username: data.account_id,   
  };
}

export async function markTokenAsUsed(token) {
  const { error } = await supabase
    .from('account_access_tokens')
    .update({ used: true })
    .eq('token', token);

  if (error) {
    console.error('Error marking token as used:', error);
    throw error;
  }
}

export async function exportDatabase() {
  try {
    const [accountsResult, followersResult, contactsResult] = await Promise.all([
      supabase.from('accounts').select('*'),
      supabase.from('followers').select('*'),
      supabase.from('contacts').select('*')
    ]);

    const exportData = {
      accounts: accountsResult.data || [],
      followers: followersResult.data || [],
      contacts: contactsResult.data || [],
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-crm-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
}

export async function generateAccountToken(accountId) {
  const { data, error } = await supabase
    .rpc('generate_account_token', { p_account_id: accountId });

  if (error) {
    console.error('Error generating account token:', error);
    throw error;
  }

  return data;
}

export async function getAccountTokens(accountId) {
  const { data, error } = await supabase
    .from('account_access_tokens')
    .select('*')
    .eq('account_id', accountId)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching account tokens:', error);
    throw error;
  }

  return data || [];
}