import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../lib/supabaseServer';

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

export async function GET(req) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {}
    };

    // Check 1: Environment variables
    results.checks.envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAdminClient: !!supabaseAdmin
    };

    // Check 2: Anonymous client connection
    const anonClient = createClient(getSupabaseUrl(), getAnonKey(), { 
      auth: { persistSession: false } 
    });

    try {
      const { data: buckets, error: bucketsError } = await anonClient.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const contenidoBucket = buckets.find(b => b.name === 'contenido');
      results.checks.bucket = {
        status: contenidoBucket ? 'OK' : 'MISSING',
        public: contenidoBucket?.public || false,
        details: contenidoBucket || 'Bucket contenido not found',
      };
    } catch (err) {
      results.checks.bucket = {
        status: 'ERROR',
        error: err.message,
      };
    }

    // Check 3: Database access (contenidos table)
    try {
      const { data: contents, error: contentsError } = await anonClient
        .from('contenidos')
        .select('id,title,status')
        .limit(1);
      
      if (contentsError) throw contentsError;
      
      results.checks.database = {
        status: 'OK',
        accessible: true,
        recordCount: contents?.length || 0
      };
    } catch (err) {
      results.checks.database = {
        status: 'ERROR',
        error: err.message,
      };
    }

    // Check 4: Storage policies
    if (supabaseAdmin) {
      try {
        const { data: policies, error: policiesError } = await supabaseAdmin
          .rpc('get_storage_policies');
        
        if (!policiesError) {
          const contenidoPolicies = policies?.filter(p => p.bucket_name === 'contenido') || [];
          results.checks.policies = {
            status: contenidoPolicies.length > 0 ? 'OK' : 'MISSING',
            count: contenidoPolicies.length,
            details: contenidoPolicies.map(p => ({ name: p.name, operation: p.operation }))
          };
        }
      } catch (err) {
        results.checks.policies = {
          status: 'SKIP',
          reason: 'Admin client unavailable or RPC failed'
        };
      }
    } else {
      results.checks.policies = {
        status: 'SKIP',
        reason: 'No admin client available'
      };
    }

    // Overall status
    const hasErrors = Object.values(results.checks).some(check => check.status === 'ERROR');
    results.overallStatus = hasErrors ? 'ERROR' : 'OK';

    return NextResponse.json(results, { status: 200 });
  } catch (e) {
    return NextResponse.json({ 
      error: e.message || 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
