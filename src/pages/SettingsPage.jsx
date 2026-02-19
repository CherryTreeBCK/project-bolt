import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { getLocalSettings, saveLocalSettings, clearLocalSettings } from '../lib/settingsClient';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const CATEGORIES = [
  'real estate','dental','medspa','restaurant','home services','health',
  'exercise','beauty','fashion','coaching','art','photography','music','education','other business'
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [aiPromptAddition, setAiPromptAddition] = useState('');
  const [generateInstructions, setGenerateInstructions] = useState('');
  const [minFollowers, setMinFollowers] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [isRunning, setIsRunning] = useState(false);
 
  const pollRef = useRef(null);

  useEffect(() => {
    const s = getLocalSettings();
    setSelectedCategories(s.categories || []);
    setAiPromptAddition(s.aiPromptAddition || '');
    setGenerateInstructions(s.generateInstructions || '');
    setMinFollowers(s.minFollowers || 0);
  }, []);

  function toggleCategory(cat) {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function handleSave(e) {
    e?.preventDefault();
    const ok = saveLocalSettings({ categories: selectedCategories, aiPromptAddition, generateInstructions, minFollowers: Number(minFollowers || 0) });
    setStatusMsg(ok ? 'Saved locally' : 'Save failed ');
    setTimeout(() => setStatusMsg(''), 2000);
  }

  function handleClear() {
    clearLocalSettings();
    setSelectedCategories([]);
    setAiPromptAddition('');
    setGenerateInstructions('');
    setMinFollowers(0);
    setStatusMsg('Cleared local settings');
    setTimeout(() => setStatusMsg(''), 2000);
  }

  async function handleRunClassification() {
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !session?.access_token) {
      alert('Please sign in before running classification.');
      return;
    }
    const accessToken = session.access_token;

    const settings = getLocalSettings();

    try {
      setIsRunning(true);
      setStatusMsg('Starting classification…');
      const resp = await fetch('http://localhost:3001/api/run-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ settings })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Status ${resp.status}`);
      }
      const json = await resp.json();
      setStatusMsg(json.message || 'Classification started');

      startPollingStatus(accessToken);
    } catch (err) {
      console.error('Run classify error', err);
      setStatusMsg('Failed to start classification: ' + (err.message || err));
      setIsRunning(false);
    }
  }

  function startPollingStatus(accessToken) {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const resp = await fetch('http://localhost:3001/api/run-classify/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (!resp.ok) {
          if (resp.status === 404) {
            setStatusMsg('No classification in progress.');
            setIsRunning(false);
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          return;
        }
        const json = await resp.json();
        setStatusMsg(`${json.state} — ${json.message || ''} ${json.progress ? `(${Math.round(json.progress*100)}%)` : ''}`);
        if (json.state === 'done') {
          setIsRunning(false);
          setStatusMsg('Classification finished');
          window.dispatchEvent(new Event('settingsUpdated'));
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (err) {
        console.error('status poll error', err);
      }
    }, 2000);
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleResetAllPriorities() {
    if (!confirm('Are you sure you want to reset the priority of ALL followers to 1? This cannot be undone.')) {
      return;
    }

    setIsRunning(true);
    setStatusMsg('Resetting priorities — fetching IDs…');

    try {
      const { data: idsData, error: idErr } = await supabase
        .from('followers_duplicate_new')
        .select('id');

      if (idErr) {
        throw idErr;
      }

      if (!idsData || idsData.length === 0) {
        setStatusMsg('No rows found to update.');
        setIsRunning(false);
        return;
      }

      const ids = idsData.map(r => r.id).filter(Boolean);
      const chunkSize = 200;
      let updatedCount = 0;

      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        setStatusMsg(`Updating priorities… (${Math.min(i + chunk.length, ids.length)}/${ids.length})`);

        const { error: updErr } = await supabase
          .from('followers_duplicate_new')
          .update({ priority: 1 })
          .in('id', chunk);

        if (updErr) {
          console.error('Error updating chunk', i, updErr);
          setStatusMsg(`Error updating some rows: ${updErr.message || String(updErr)}`);
          setIsRunning(false);
          return;
        }

        updatedCount += chunk.length;
      }

      setStatusMsg(`Priority reset complete — updated ${updatedCount} rows.`);
      localStorage.setItem('__ai_settings_update_ts', String(Date.now()));
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err) {
      console.error('Failed to reset priorities:', err);
      setStatusMsg('Failed to reset priorities: ' + (err.message || err));
    } finally {
      setIsRunning(false);
    }
  }

  const styles = {
    page: {
      maxWidth: 980,
      margin: '28px auto',
      padding: 20,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      color: '#222',
    },
    card: {
      background: '#fff',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 6px 18px rgba(28,30,34,0.06)',
      border: '1px solid rgba(0,0,0,0.04)'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    smallMuted: { color: '#666', fontSize: 13, marginTop: 6 },
    section: { marginBottom: 18 },
    label: { display: 'block', fontWeight: 700, marginBottom: 8 },
    input: {
      width: '100%',
      padding: '10px 12px',
      fontSize: 15,
      borderRadius: 8,
      border: '1px solid #d9d9d9',
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)',
      outline: 'none',
      transition: 'box-shadow .15s, border-color .15s',
    },
    inputFocus: {
      border: '1px solid #6ca6ff',
      boxShadow: '0 4px 12px rgba(108,166,255,0.12)',
    },
    textarea: {
      width: '100%',
      padding: '12px 14px',
      fontSize: 15,
      borderRadius: 8,
      border: '1px solid #d9d9d9',
      minHeight: 120,
      outline: 'none',
      resize: 'vertical',
    },
    chipsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    chip: {
      padding: '8px 12px',
      borderRadius: 999,
      border: '1px solid #e6e6e6',
      background: '#fafafa',
      cursor: 'pointer',
      fontSize: 14,
      transition: 'transform .06s, box-shadow .08s',
    },
    chipSelected: {
      background: '#eef6ff',
      border: '1px solid #bfe0ff',
      boxShadow: '0 4px 8px rgba(102,153,255,0.12)',
    },
    rowButtons: { display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 },
    btnPrimary: {
      background: '#2f6fff',
      color: '#fff',
      border: 'none',
      padding: '10px 14px',
      borderRadius: 10,
      cursor: 'pointer',
      fontWeight: 700,
      boxShadow: '0 6px 18px rgba(47,111,255,0.14)',
    },
    btnSecondary: {
      background: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      padding: '9px 12px',
      borderRadius: 10,
      cursor: 'pointer',
      fontWeight: 600,
    },
    btnDanger: {
      background: '#ff6961',
      color: '#fff',
      border: 'none',
      padding: '9px 12px',
      borderRadius: 10,
      cursor: 'pointer',
      fontWeight: 700,
    },
    statusBox: {
      marginTop: 14,
      padding: 12,
      borderRadius: 8,
      background: '#f7fbff',
      border: '1px solid #e6f0ff',
      color: '#0b3d91',
      fontSize: 14,
    },
    footerNote: { marginTop: 12, color: '#666', fontSize: 13 },
    backButton: { marginRight: 8 },
  };

  const [focusedInput, setFocusedInput] = useState(null);
  const getInputStyle = (name) => (focusedInput === name ? { ...styles.input, ...styles.inputFocus } : styles.input);
  const getTextareaStyle = (name) => (focusedInput === name ? { ...styles.textarea, ...styles.inputFocus } : styles.textarea);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ margin: 0 }}>Settings (saved locally)</h2>
            <div style={styles.smallMuted}>These settings are stored in your browser only. They won't sync to other devices.</div>
          </div>
          <div>
            <button
              style={{ ...styles.btnSecondary, ...styles.backButton }}
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} aria-label="Settings form">
          <section style={styles.section}>
            <label style={styles.label}>Categories to show in Top Followers</label>
            <div style={styles.chipsWrap}>
              {CATEGORIES.map(cat => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    aria-pressed={selected}
                    style={{
                      ...styles.chip,
                      ...(selected ? styles.chipSelected : {}),
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <div style={styles.smallMuted}>Click the categories you want included in the Top Followers view.</div>
          </section>

          <section style={styles.section}>
            <label style={styles.label} htmlFor="aiPrompt">AI Prompt Addition</label>
            <textarea
              id="aiPrompt"
              value={aiPromptAddition}
              onChange={(e) => setAiPromptAddition(e.target.value)}
              onFocus={() => setFocusedInput('aiPrompt')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Extra instructions for the AI (e.g. tone, exclusions, ignore patterns)..."
              style={getTextareaStyle('aiPrompt')}
            />
            <div style={styles.smallMuted}>This will be appended to the prompt used when classifying accounts.</div>
          </section>

          <section style={styles.section}>
            <label style={styles.label} htmlFor="generateInstructions">Message generator — extra instructions</label>
            <textarea
              id="generateInstructions"
              value={generateInstructions}
              onChange={(e) => setGenerateInstructions(e.target.value)}
              onFocus={() => setFocusedInput('generateInstructions')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Extra instructions to include when generating a follower message (tone, do/don'ts, avoid X...)"
              style={getTextareaStyle('generateInstructions')}
            />
            <div style={styles.smallMuted}>
              This will be appended to the prompt used when you press "Generate message" for a follower.
            </div>
          </section>


          <section style={styles.section}>
            <label style={styles.label} htmlFor="minFollowers">Minimum followers</label>
            <input
              id="minFollowers"
              type="number"
              value={minFollowers}
              onChange={(e) => setMinFollowers(Number(e.target.value || 0))}
              onFocus={() => setFocusedInput('minFollowers')}
              onBlur={() => setFocusedInput(null)}
              min={0}
              style={{ ...getInputStyle('minFollowers'), width: 160 }}
            />
            <div style={styles.smallMuted}>Only show accounts with at least this many followers (local filter).</div>
          </section>

          <div style={styles.rowButtons}>
            <button type="submit" style={styles.btnPrimary} disabled={isRunning}>
              Save (local)
            </button>

            <button type="button" style={styles.btnSecondary} onClick={handleClear} disabled={isRunning}>
              Clear local
            </button>

            <button
              type="button"
              style={isRunning ? { ...styles.btnPrimary, opacity: 0.6, cursor: 'not-allowed' } : styles.btnPrimary}
              onClick={() => {
                saveLocalSettings({ categories: selectedCategories, aiPromptAddition, generateInstructions, minFollowers });
                localStorage.setItem('__ai_settings_update_ts', String(Date.now()));
                window.dispatchEvent(new Event('settingsUpdated'));
                handleRunClassification();
              }}
              disabled={isRunning}
            >
              {isRunning ? 'Running…' : 'Run classification (server)'}
            </button>

            <button
              type="button"
              style={isRunning ? { ...styles.btnDanger, opacity: 0.6, cursor: 'not-allowed' } : styles.btnDanger}
              onClick={handleResetAllPriorities}
              disabled={isRunning}
              title="Reset priority for every follower row to 1"
            >
              Reset all priorities to 1
            </button>
          </div>
        </form>

        <div style={styles.statusBox} role="status" aria-live="polite">
          <strong>Status:</strong> {statusMsg || 'Idle'}
        </div>

        <div style={styles.footerNote}>
          <div>Tip: everything here is stored locally — use <strong>Save (local)</strong> to persist changes to this browser.</div>
          <div style={{ marginTop: 8, color: '#999' }}>If you run the classifier, it will execute on the server and update results visible in the Dashboard.</div>
        </div>
      </div>
    </div>
  );
}
