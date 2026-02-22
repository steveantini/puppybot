import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

const SESSION_ONLY_FLAG = 'puppybot-session-only';

const storageAdapter = {
  getItem: (key) => {
    return sessionStorage.getItem(SESSION_ONLY_FLAG)
      ? sessionStorage.getItem(key)
      : localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (sessionStorage.getItem(SESSION_ONLY_FLAG)) {
      sessionStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: storageAdapter },
});

export function setRememberMe(remember) {
  if (remember) {
    sessionStorage.removeItem(SESSION_ONLY_FLAG);
  } else {
    sessionStorage.setItem(SESSION_ONLY_FLAG, '1');
  }
}
