import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zofnguicquemvlpnxivf.supabase.co"
const supabaseKey = "sb_publishable_GgQ3UEg5YSr_HW2KHj7FEQ_r3Y3yNhm"

export const supabase = createClient(supabaseUrl, supabaseKey)
