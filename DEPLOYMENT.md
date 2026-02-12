# Deployment Guide: Database Setup

This guide will walk you through setting up the complete database schema for the Grabbe-Gymnasium CMS on Supabase.

## Prerequisites

- A Supabase project (create one at https://app.supabase.com if needed)
- The Supabase project should be linked to your Vercel deployment
- Access to the Supabase SQL Editor

## Step-by-Step Deployment

### 1. Access Supabase SQL Editor

1. Navigate to https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

### 2. Apply the Database Schema

1. Open the file `scripts/complete_schema.sql` from this repository
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

The script will:
- Create all 8 database tables
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Add triggers for automatic timestamp updates
- Add table documentation

### 3. Verify the Setup

After running the script, verify that everything was created successfully:

1. In Supabase, go to "Table Editor" in the left sidebar
2. You should see all 8 tables:
   - `pages`
   - `posts`
   - `events`
   - `documents`
   - `navigation_items`
   - `site_settings`
   - `contact_submissions`
   - `anmeldung_submissions`

3. Click on each table to verify the columns match the schema

### 4. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Get these values from Supabase:
   - Go to Project Settings → API
   - Copy the "Project URL" as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Redeploy your application in Vercel for the changes to take effect

### 5. Test the Setup

1. After deployment, try accessing your application
2. Check that:
   - The homepage loads without database errors
   - The CMS interface can connect to the database
   - Form submissions work (contact, anmeldung)

## Database Tables Overview

### Core Content Tables

1. **pages** - Static pages like "Impressum", "Über uns", etc.
2. **posts** - News articles and blog posts
3. **events** - Calendar events and important dates
4. **documents** - Downloadable files (PDFs, documents)

### System Tables

5. **navigation_items** - Dynamic menu structure (header/footer)
6. **site_settings** - Configuration key-value store

### Submission Tables

7. **contact_submissions** - Contact form entries
8. **anmeldung_submissions** - School enrollment forms

## Security Features

All tables have Row Level Security (RLS) enabled:

- **Public access**: Published content (pages, posts, events, documents)
- **Authenticated access**: Full access to CMS for logged-in users
- **Submission forms**: Public can submit, only authenticated users can read
- **Ownership**: Users can only edit/delete their own content

## Seeding Initial Data

After creating the tables, you may want to add some initial data:

### Example: Add Site Settings

```sql
-- Basic site settings
INSERT INTO public.site_settings (key, value, label, category, protected) VALUES
  ('site_title', 'Grabbe-Gymnasium Detmold', 'Site Title', 'general', true),
  ('site_description', 'Willkommen am Grabbe-Gymnasium Detmold', 'Site Description', 'general', false),
  ('contact_email', 'info@grabbe-gymnasium.de', 'Contact Email', 'contact', false),
  ('contact_phone', '+49 5231 123456', 'Contact Phone', 'contact', false),
  ('school_address', 'Geisstraße 20, 32756 Detmold', 'School Address', 'contact', false);
```

### Example: Add Navigation Items

```sql
-- Main navigation items
INSERT INTO public.navigation_items (label, href, location, sort_order, visible) VALUES
  ('Startseite', '/', 'header', 0, true),
  ('Über uns', '/ueber-uns', 'header', 1, true),
  ('Aktuelles', '/aktuelles', 'header', 2, true),
  ('Termine', '/termine', 'header', 3, true),
  ('Kontakt', '/kontakt', 'header', 4, true),
  ('Impressum', '/impressum', 'footer', 0, true),
  ('Datenschutz', '/datenschutz', 'footer', 1, true);
```

### Example: Create Initial Pages

```sql
-- Create basic pages (requires authenticated user)
-- Replace 'YOUR_USER_ID' with actual user UUID from auth.users
INSERT INTO public.pages (title, slug, content, section, published, user_id) VALUES
  ('Impressum', 'impressum', 'Impressum content here...', 'legal', true, 'YOUR_USER_ID'),
  ('Datenschutz', 'datenschutz', 'Privacy policy content here...', 'legal', true, 'YOUR_USER_ID'),
  ('Über uns', 'ueber-uns', 'About us content here...', 'allgemein', true, 'YOUR_USER_ID');
```

## Troubleshooting

### Schema Already Exists

If you run the script multiple times, it's safe because:
- All table creations use `CREATE TABLE IF NOT EXISTS`
- Triggers are dropped before recreation with `DROP TRIGGER IF EXISTS`
- Policies use unique names per table

### Permission Errors

If you get permission errors:
1. Make sure you're running the script as the postgres user
2. Check that RLS is properly enabled
3. Verify your user is authenticated when accessing the data

### Connection Issues from Next.js

If the app can't connect to Supabase:
1. Verify environment variables are set correctly in Vercel
2. Check that the SUPABASE_URL doesn't have trailing slashes
3. Confirm the anon key is the "public" anon key, not the service role key

## Next Steps

After successful deployment:

1. **Create an admin user** - Use Supabase Auth to create your first user
2. **Add initial content** - Use the CMS to add pages, posts, and events
3. **Configure site settings** - Set up your school's information
4. **Test forms** - Try submitting contact and enrollment forms
5. **Set up backups** - Configure automated backups in Supabase

## Support

- Supabase Documentation: https://supabase.com/docs
- Next.js with Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Project Repository: https://github.com/finnbusse/cdggy-dt-homepage-rebranding

## Schema Updates

If you need to update the schema in the future:

1. Create a new migration file in `scripts/` with a timestamp
2. Test thoroughly in development
3. Apply to production during low-traffic periods
4. Update the TypeScript types in `lib/types/database.types.ts`
5. Redeploy the application

Example migration naming:
- `20260212_add_new_field.sql`
- `20260213_update_constraints.sql`
