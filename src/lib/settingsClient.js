export const STORAGE_KEY = 'ai_user_settings_v1';
export const SETTINGS_UPDATE_KEY = '__ai_settings_update_ts';

export function getLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { categories: [], aiPromptAddition: '', generateInstructions: '', minFollowers: 0 };
    const parsed = JSON.parse(raw);
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      aiPromptAddition: typeof parsed.aiPromptAddition === 'string' ? parsed.aiPromptAddition : '',
      generateInstructions: typeof parsed.generateInstructions === 'string' ? parsed.generateInstructions : '',
      minFollowers: Number(parsed.minFollowers || 0),
    };
  } catch (e) {
    console.warn('Failed to read settings from localStorage', e);
    return { categories: [], aiPromptAddition: '', generateInstructions: '', minFollowers: 0 };
  }
}

export function saveLocalSettings(settings) {
  try {
    const payload = {
      categories: settings.categories || [],
      aiPromptAddition: settings.aiPromptAddition || '',
      generateInstructions: settings.generateInstructions || '',
      minFollowers: Number(settings.minFollowers || 0),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    try { localStorage.setItem(SETTINGS_UPDATE_KEY, String(Date.now())); } catch {}
    return true;
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
    return false;
  }
}

export function clearLocalSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    try { localStorage.setItem(SETTINGS_UPDATE_KEY, String(Date.now())); } catch {}
    return true;
  } catch (e) {
    console.error('Failed to clear settings', e);
    return false;
  }
}
