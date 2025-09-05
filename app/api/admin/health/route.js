import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../../lib/supabaseServer';

export async function GET() {
  try {
    console.log('🔍 Running storage health check...');
    
    const results = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check 1: Bucket exists and is accessible
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
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
      const { data: policies, error: policiesError } = await supabaseAdmin
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
      results.checks.policies = {
        status: 'ERROR', 
        error: err.message,
      };
    }

    // Check 3: Database table
    try {
      const { data: tableInfo, error: tableError } = await supabaseAdmin
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
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('Contenido')
        .upload(testPath, testData, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Clean up test file
      await supabaseAdmin.storage.from('Contenido').remove([testPath]);
      
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
