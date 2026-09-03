import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys
const STORAGE_SUPABASE_URL_KEY = 'clinicflow_supabase_url';
const STORAGE_SUPABASE_ANON_KEY = 'clinicflow_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || envKey;

  return {
    url: storedUrl,
    anonKey: storedKey,
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey || config.url.includes('your-project-id')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    localStorage.setItem(STORAGE_SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_SUPABASE_ANON_KEY, anonKey.trim());
    supabaseInstance = null; // reset instance so next call re-inits
    return true;
  } catch (e) {
    console.error('Failed to save Supabase config to local storage', e);
    return false;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL e Chave Anon são obrigatórias.' };
    }
    const testClient = createClient(url, anonKey);
    // Attempt a lightweight query
    const { error } = await testClient.from('tenants').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still connected to Supabase API
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso! (Observação: Execute o script SQL schema para criar as tabelas).',
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso e tabelas detectadas!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Falha de rede ao tentar conectar ao Supabase.' };
  }
}
