# CMS Dashboard Troubleshooting Guide

## Problem: Cannot Save Items in CMS Dashboard

This guide helps resolve issues when you can't save new content in the CMS.

## Common Causes

### 1. Environment Variable Mismatch

**Symptom**: Nothing happens when clicking "Save" or you see authentication errors.

**Cause**: The application can't connect to Supabase due to missing or incorrect environment variables.

**Solution**: Ensure you have the correct Supabase environment variables set in Vercel.

## Vercel Environment Variable Setup

### Quick Fix (Recommended)

In your Vercel project settings, ensure you have EITHER of these configurations:

#### Option A: Standard Naming
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Option B: Vercel Integration Naming
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**Important**: For the CMS dashboard to work, you MUST have `NEXT_PUBLIC_*` prefixed variables. Next.js only exposes these to the browser.

### Step-by-Step Fix

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" → "Environment Variables"

2. **Check Your Current Variables**
   You should see variables for Supabase. **CRITICAL**: Browser-side code (CMS) requires `NEXT_PUBLIC_*` prefix.

3. **Verify Variable Values**
   - Go to your Supabase Dashboard: https://app.supabase.com
   - Select your project
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

4. **Set/Update Variables in Vercel**
   
   **Option A - Standard (Recommended):**
   ```
   NEXT_PUBLIC_SUPABASE_URL = [Your Project URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your anon public key]
   ```

   **Option B - Vercel Integration:**
   If using Vercel's Supabase integration, you need BOTH sets:
   ```
   SUPABASE_URL = [Your Project URL]
   NEXT_PUBLIC_SUPABASE_URL = [Your Project URL]
   
   SUPABASE_PUBLISHABLE_KEY = [Your anon public key]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = [Your anon public key]
   ```
   
   **Why both?** Server-side code can use `SUPABASE_*`, but browser code (CMS) needs `NEXT_PUBLIC_*`.

5. **Redeploy Your Application**
   - After saving variables, trigger a new deployment
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "Redeploy"

## Verification Checklist

After redeploying, verify:

- [ ] Environment variables are set in Vercel
- [ ] Variables are available in all environments (Production, Preview, Development)
- [ ] Application has been redeployed after setting variables
- [ ] You can log in to the CMS (if login works, Supabase connection is good)
- [ ] Browser console shows no errors (F12 → Console)

## Common Errors and Solutions

### Error: "Missing Supabase environment variables"

**Cause**: Environment variables are not set or not accessible.

**Solution**: 
1. Check that variables are set in Vercel
2. Ensure they're enabled for your deployment environment
3. Redeploy the application

### Error: "Invalid API key"

**Cause**: Wrong API key or using Service Role Key instead of Anon Key.

**Solution**: 
- Use the "anon public" key from Supabase, NOT the "service_role" key
- The anon key is safe to expose in the browser
- Double-check you copied the correct key from Supabase dashboard

### Error: "Not authenticated" or "RLS Policy Violation"

**Cause**: User is not logged in or Row Level Security is blocking the operation.

**Solution**:
1. Make sure you're logged in to the CMS
2. Check that your user exists in Supabase Auth
3. Verify RLS policies allow the operation (see Database troubleshooting below)

## Database-Specific Issues

### Posts/Events/Pages Not Saving

**Check Row Level Security**:
1. Go to Supabase Dashboard → SQL Editor
2. Run this query to check if RLS is causing issues:

```sql
-- Temporarily check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('posts', 'events', 'pages', 'documents');
```

**Verify User ID**:
The `user_id` field must match your authenticated user's ID. Check with:

```sql
-- Get your user ID
SELECT id, email FROM auth.users;
```

### Navigation Items Not Saving

Navigation items can be edited by any authenticated user. If saving fails:

1. Verify you're logged in
2. Check browser console for errors
3. Verify `navigation_items` table exists in Supabase

## Browser Console Debugging

1. Open browser Developer Tools (F12)
2. Go to "Console" tab
3. Try to save an item in the CMS
4. Look for error messages

Common error patterns:
- `Failed to fetch` → Network issue or wrong Supabase URL
- `Invalid API key` → Wrong or missing API key
- `JWT expired` → Session expired, try logging out and back in
- `permission denied` → RLS policy blocking the operation

## Advanced Troubleshooting

### Check Network Requests

1. Open Developer Tools (F12) → Network tab
2. Try to save an item
3. Look for requests to your Supabase URL
4. Check the request status:
   - 200 = Success
   - 401 = Unauthorized (auth issue)
   - 403 = Forbidden (RLS policy issue)
   - 404 = Not Found (wrong URL)
   - 500 = Server Error (database issue)

### Test Supabase Connection

Create a test page to verify connection:

```typescript
// In a client component
import { createClient } from '@/lib/supabase/client'

export function TestConnection() {
  const test = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from('posts').select('count')
    console.log({ data, error })
  }
  return <button onClick={test}>Test Connection</button>
}
```

### Verify Environment Variables at Runtime

Add this temporarily to a page:

```typescript
// Server component
export default function DebugPage() {
  return (
    <div>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</p>
      <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
      <p>Alt URL: {process.env.SUPABASE_URL ? 'Set' : 'Missing'}</p>
      <p>Alt Key: {process.env.SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Missing'}</p>
    </div>
  )
}
```

**Warning**: Remove this debug page after testing! Never expose actual values.

## Quick Reference: Variable Names

The application accepts these variable names (in order of priority):

**For Supabase URL**:
1. `NEXT_PUBLIC_SUPABASE_URL` (required for browser/CMS)
2. `SUPABASE_URL` (server-side only)

**For Supabase Key**:
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required for browser/CMS, primary)
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (required for browser/CMS, alternative name)
3. `SUPABASE_PUBLISHABLE_KEY` (server-side only)

**IMPORTANT**: Variables without `NEXT_PUBLIC_` prefix are only available server-side. The CMS dashboard runs in the browser, so it MUST have the `NEXT_PUBLIC_*` versions.

## Still Having Issues?

1. Check Vercel deployment logs for errors
2. Check Supabase logs: Dashboard → Logs → API Logs
3. Verify database schema is applied (see DEPLOYMENT.md)
4. Ensure you have an authenticated user in auth.users table
5. Try logging out and back in to refresh your session

## Contact

If none of these solutions work:
1. Export browser console errors
2. Export Vercel deployment logs
3. Check Supabase API logs
4. Provide the specific error message
