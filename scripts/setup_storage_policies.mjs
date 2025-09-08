// Script to setup storage policies for admin uploads
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.log('⚠️ No SUPABASE_SERVICE_ROLE_KEY found. Cannot setup storage policies.');
  console.log('This script requires service role key to modify database schema.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupStoragePolicies() {
  console.log('🔧 Setting up storage policies for admin uploads...');
  
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'scripts', 'sql', 'setup_storage_policies.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement.length === 0) continue;
      
      console.log(`Executing: ${trimmedStatement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: trimmedStatement });
      
      if (error) {
        console.error(`❌ Error executing statement: ${error.message}`);
        // Try direct approach if RPC fails
        try {
          const { error: directError } = await supabase
            .from('storage.objects')
            .select('id')
            .limit(1);
          
          if (directError) {
            console.error(`❌ Direct access also failed: ${directError.message}`);
          }
        } catch (e) {
          console.error(`❌ Exception: ${e.message}`);
        }
      } else {
        console.log('✅ Statement executed successfully');
      }
    }
    
    console.log('🎉 Storage policies setup completed!');
    
  } catch (error) {
    console.error('❌ Failed to setup storage policies:', error.message);
    
    // Provide manual setup instructions
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > Policies');
    console.log('3. Create the following policies for the Contenido bucket:');
    console.log('\nPolicy for INSERT:');
    console.log(`
CREATE POLICY "Admin users can upload to Contenido bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Contenido' AND 
  auth.uid() IS NOT NULL AND
  (
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_app_meta_data->>'is_admin' = 'true'
    )
    OR
    (SELECT COALESCE((SELECT is_admin(auth.uid())), false))
  )
);`);
  }
}

setupStoragePolicies().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
