import { supabase } from "@/lib/supabase";

export async function getMaxPriority(ownerAccount?: string): Promise<number | null> {
  try {
    let query = supabase
      .from("followers_duplicate_new")
      .select("priority")
      .not("priority", "is", null)
      .order("priority", { ascending: false })
      .limit(1);

    if (ownerAccount) {
      query = query.eq("owner_account", ownerAccount);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching max priority:", error);
      return null;
    }
    if (!data || data.length === 0) return null;
    return data[0].priority;
  } catch (err) {
    console.error("getMaxPriority unexpected error:", err);
    return null;
  }
}

export const fetchTopFollowers = async (ownerAccount: string): Promise<any[]> => {
  if (!ownerAccount) {
    console.warn("fetchTopFollowers called without ownerAccount");
    return [];
  }

  const maxPriority = await getMaxPriority(ownerAccount);
  if (maxPriority === null) return [];

  const { data: topFollowers, error: topFollowersError } = await supabase
    .from("followers_duplicate_new")
    .select("*")
    .eq("owner_account", ownerAccount)
    .eq("priority", maxPriority)
    .eq("has_been_messaged", false);

  if (topFollowersError || !topFollowers) {
    if (topFollowersError) console.error("Error fetching top followers:", topFollowersError);
    return [];
  }

  let combinedFollowers = topFollowers;


  if (topFollowers.length < 4 && maxPriority > 0) {
    const { data: lowerPriorityFollowers, error: lowerError } = await supabase
      .from("followers_duplicate_new")
      .select("*")
      .eq("owner_account", ownerAccount)
      .eq("priority", maxPriority - 1)
      .eq("has_been_messaged", false);

    if (lowerError) {
      console.error("Error fetching lower priority followers:", lowerError);
    } else if (lowerPriorityFollowers && lowerPriorityFollowers.length > 0) {
      combinedFollowers = [...topFollowers, ...lowerPriorityFollowers];
    }
  }

  console.log("combined top followers for", ownerAccount, combinedFollowers);
  return combinedFollowers;
};
