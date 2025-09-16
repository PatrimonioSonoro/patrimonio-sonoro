analytics-tracker Edge Function

Purpose
- Receive analytics events from the frontend and insert them server-side into Supabase tables using the service role key.

How it works
- POST JSON body: { type, sessionId, userId, data, timestamp }
- Supported types: page_view, content_interaction, social_click
- The function uses the env var SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE) and SUPABASE_URL to create an admin client.

Deployment / Local testing
- Set environment vars in your deployment (Supabase dashboard or CLI):
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- Deploy with the Supabase CLI or via the Supabase dashboard.

Security
- Keep SUPABASE_SERVICE_ROLE_KEY secret. Only the Edge Function and server environments should have access.

Notes
- The function attempts to insert to dedicated tables (page_views, content_interactions, social_clicks). Ensure those tables exist.
- If event type is unknown and you have an `events` table, it will attempt to insert there.
