import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://whkhxoqclrbwsapozcsx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa2h4b3FjbHJid3NhcG96Y3N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDkyMjY5MywiZXhwIjoyMDQ2NDk4NjkzfQ.R38BFg2TCYj0JjbaVx5EPRoo6SfCHSXBbF2VTz2SAhc"

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
