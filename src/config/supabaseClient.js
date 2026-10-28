import { createClient } from '@supabase/supabase-js'

const entornoVite = import.meta.env ?? {}
const urlSupabase = entornoVite.VITE_SUPABASE_URL?.trim() ?? ''
const clavePublica = entornoVite.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const errorConfiguracionSupabase =
  !urlSupabase || !clavePublica
    ? 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para continuar.'
    : null

export const supabase = errorConfiguracionSupabase
  ? null
  : createClient(urlSupabase, clavePublica)
