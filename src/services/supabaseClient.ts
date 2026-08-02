import { createClient } from '@supabase/supabase-js';

const kitchenUrl = import.meta.env.VITE_SUPABASE_KITCHEN_URL || '';
const kitchenKey = import.meta.env.VITE_SUPABASE_KITCHEN_ANON_KEY || '';

export const supabaseKitchen = createClient(kitchenUrl, kitchenKey);
