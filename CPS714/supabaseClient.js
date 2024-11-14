import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zoebadsgwupkbgvnrekz.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZWJhZHNnd3Vwa2Jndm5yZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NTAyMTIsImV4cCI6MjA0NzEyNjIxMn0.e71rg-MRvwbdWi0lvm2MIW-oT9BraRzQUkb52Eig6Zk"

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
