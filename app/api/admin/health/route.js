import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return key;
}

export async function GET() {
  try {
    console.log('🔍 Running storage health check...');
    
    // Use admin client if available, otherwise fallback to anonymous client
    let supabase = supabaseAdmin;
    let usingFallback = false;
    if (!supabase) {
      console.log('Admin client not available, using anonymous client as fallback');
      supabase = createClient(getSupabaseUrl(), getAnonKey());
      usingFallback = true;
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      usingFallback,
      checks: {}
    };

    // Check 1: Bucket exists and is accessible
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const contenidoBucket = buckets.find(b => b.name === 'Contenido');
      results.checks.bucket = {
        status: contenidoBucket ? 'OK' : 'MISSING',
        details: contenidoBucket || 'Bucket Contenido not found',
      };
    } catch (err) {
      results.checks.bucket = {
        status: 'ERROR',
        error: err.message,
      };
    }

    // Check 2: Storage policies
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'storage')
        .eq('tablename', 'objects');
        
      if (policiesError) throw policiesError;
      
      const contenidoPolicies = policies.filter(p => p.qual?.includes('Contenido'));
      results.checks.policies = {
        status: contenidoPolicies.length > 0 ? 'OK' : 'MISSING',
        count: contenidoPolicies.length,
        details: contenidoPolicies.map(p => p.policyname),
      };
    } catch (err) {
      // Some projects may not expose pg_policies via the client; treat as a warning
      results.checks.policies = {
        status: 'WARN',
        error: err.message,
      };
    }

    // Check 3: Database table
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('contenidos')
        .select('id')
        .limit(1);
        
      if (tableError) throw tableError;
      
      results.checks.database = {
        status: 'OK',
        details: 'contenidos table accessible',
      };
    } catch (err) {
      results.checks.database = {
        status: 'ERROR',
        error: err.message,
      };
    }

    // Check 4: Test small upload
    try {
      const testData = Buffer.from('test-health-check');
      const testPath = `health-check/test-${Date.now()}.txt`;
      
      // Use an allowed MIME type for the test upload (audio) to match bucket restrictions
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Contenido')
        .upload(testPath, testData, { upsert: true, contentType: 'audio/mpeg' });
        
      if (uploadError) throw uploadError;
      
      // Clean up test file
      await supabase.storage.from('Contenido').remove([testPath]);
      
      results.checks.upload = {
        status: 'OK',
        details: 'Test upload successful',
      };
    } catch (err) {
      results.checks.upload = {
        status: 'ERROR',
        error: err.message,
      };
    }

    // Overall status
    const allOk = Object.values(results.checks).every(check => check.status === 'OK');
    results.overall = allOk ? 'HEALTHY' : 'ISSUES_DETECTED';

    console.log('✅ Health check completed:', results.overall);
    
    return NextResponse.json(results, { 
      status: allOk ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall: 'ERROR',
      error: error.message,
    }, { status: 500 });
  }
}
