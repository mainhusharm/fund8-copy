import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  query: async (text: string, params?: any[]) => {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query: text,
        params: params || []
      });

      if (error) throw error;
      return { rows: data || [] };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};
