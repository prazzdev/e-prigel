import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wurmxikkzabopfcspvnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cm14aWtremFib3BmY3Nwdm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODg2OTgsImV4cCI6MjA5MDA2NDY5OH0.QiP56_0jeCfXNsBPjzPoavD2qsZGhQ3aJ6pYoXkAAAU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);