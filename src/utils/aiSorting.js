import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../lib/supabaseClient.js';
import { Parser } from 'json2csv';
import OpenAI from 'openai';
import { parse } from 'csv-parse/sync';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BATCH_SIZE = 10;

const fields = [
  'username',
  'full_name',
  'id',
  'follower_count',
  'following_count',
  'posts_count',
  'is_verified',
  'is_private',
  'biography',
  'external_url',
  'category',
  'priority',
];

const json2csvParser = new Parser({ fields, excelStrings: true });

const buildPrompt = (csvSubset) => `
You are a classification agent.

Your task is to complete the "category" and "priority" columns for each account in the provided CSV. The data includes: username, full name, ID, follower count, following count, posts count, is_verified, is_private, biography, external URL, and two blank columns: category and priority.

---

CATEGORY INSTRUCTIONS:

Choose exactly one of these 15 categories:
1. real estate  
2. dental  
3. medspa  
4. restaurant  
5. home services  
6. health  
7. exercise  
8. beauty  
9. fashion  
10. coaching  
11. art  
12. photography  
13. music  
14. education  
15. other business  

Choose **"other business"** only if none of the first 14 categories apply, but at least **two** of the following are true:
- The bio mentions a business or professional role (e.g., owner, founder, coach, etc.)
- The bio advertises a service, product, or brand
- An external URL is present and likely business-related

Leave the category **blank** only if the account is clearly personal (no signs of business, no business-related bio or URL).

---

PRIORITY INSTRUCTIONS:

Priority must be a number from 5 (highest) to 1 (lowest), calculated with the following logic:

• Start with priority = 3  
• Add 1 if follower_count > 10,000  
• Add 1 if is_verified is true  
• Add 1 if external_url is present (not blank)  
• Subtract 1 if is_private is true  
• Subtract 1 if the account is clearly personal (no signs of business, no business-related bio or URL)
• Subtract 1 if posts_count < 10

---

FORMAT INSTRUCTIONS:

- Return the **entire CSV**, including the header row and all rows.
- Keep the **same column order** as provided: username, full_name, id, follower_count, following_count, posts_count, is_verified, is_private, biography, external_url, category, priority
- Separate fields with **commas**, wrap fields in quotes **only when needed** (e.g., for commas inside text).
- Return the output as plain text **CSV** — no code blocks, no markdown, no commentary before or after.

---

Here is the data to classify:
${csvSubset}
`;

async function classifyFollowers() {
  const { data, error } = await supabase
    .from('followers_duplicate')
    .select('*');

  if (error || !data || data.length === 0) {
    console.error('❌ Supabase fetch error or no data:', error || 'empty');
    return;
  }

  const total = data.length;
  console.log(`📦 Total rows to process: ${total}`);

  for (let start = 0; start < total; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, total);
    const subset = data.slice(start, end);
    const csvSubset = json2csvParser.parse(subset);

    const prompt = buildPrompt(csvSubset);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that processes CSV data.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 4096,
      });

      const csvResult = completion.choices[0].message.content.trim();

      const parsed = parse(csvResult, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      });

      for (const row of parsed) {
        const id = parseInt(row.id);
        const category = row.category || null;
        const priority = row.priority ? parseInt(row.priority) : null;

        const { error } = await supabase
          .from('followers_duplicate')
          .update({ category, priority })
          .eq('id', id);

        if (error) {
          console.error(`❌ Failed to update id ${id}:`, error.message);
        } else {
          console.log(`✅ Updated id ${id}: category=${category}, priority=${priority}`);
        }
      }

      console.log(`✅ Block ${start}–${end} classified and updated.`);
    } catch (error) {
      console.error('OpenAI request error:', error.response?.data || error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500)); // pause to avoid rate limits
  }

  console.log('🎉 All batches complete!');
}

export { classifyFollowers };
