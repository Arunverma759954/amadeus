import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseAnonKey = 'sb_publishable_-isUm3wqCd7Ec4NNp58Xqw_25FczRyL'; // Using publishable key for browser

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
