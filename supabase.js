// ============================================================
//  INSERTAR AQUÍ TUS CREDENCIALES DE SUPABASE
// ============================================================
const SUPABASE_URL  = 'https://xuichfcvlbrkdevngpji.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNoZmN2bGJya2Rldm5ncGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Njc0MTIsImV4cCI6MjA5NzE0MzQxMn0.E95AgDhHKHAxaHXfsnONQgRMR968jq9TZgNXD7vDieY';
// ============================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);
