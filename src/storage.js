// Pocket Post storage layer — Supabase-backed so codes work across devices.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('[pocket-post] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing. Notes will not save.');
}

const supabase = createClient(url || '', anonKey || '');

const generateCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let c = '';
  for (let i = 0; i < 2; i++) c += letters[Math.floor(Math.random() * letters.length)];
  c += '-';
  for (let i = 0; i < 4; i++) c += digits[Math.floor(Math.random() * digits.length)];
  return c;
};

export async function saveNote(initialCode, note) {
  let code = initialCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from('pocket_post_notes').insert({
      code,
      sender: note.sender,
      recipient: note.recipient || null,
      message: note.message,
      stamp_idx: note.stampIdx,
      placed_stickers: note.placedStickers,
    });

    if (!error) return { ok: true, code };
    if (error.code === '23505') {
      code = generateCode();
      continue;
    }
    console.error('Pocket Post insert failed:', error);
    return { ok: false, error };
  }
  return { ok: false, error: new Error('Too many code collisions') };
}

export async function loadNote(code) {
  const { data, error } = await supabase
    .from('pocket_post_notes')
    .select('sender, recipient, message, stamp_idx, placed_stickers, created_at')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('Pocket Post load failed:', error);
    return { ok: false, error };
  }
  if (!data) return { ok: true, note: null };

  return {
    ok: true,
    note: {
      sender: data.sender,
      recipient: data.recipient || '',
      message: data.message,
      stampIdx: data.stamp_idx,
      placedStickers: data.placed_stickers || [],
      ts: new Date(data.created_at).getTime(),
    },
  };
}
