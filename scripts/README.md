# Database Schema Documentation

This directory contains SQL migration scripts for the Grabbe-Gymnasium School CMS database structure.

## Overview

The database schema consists of 8 main tables designed to support a comprehensive school content management system:

1. **pages** - Static pages (Impressum, Oberstufe, Anmeldung, etc.)
2. **posts** - Blog posts / News (Aktuelles)
3. **events** - School events / Calendar entries
4. **documents** - Downloads (PDFs, files)
5. **navigation_items** - Header/Footer navigation (hierarchical)
6. **site_settings** - Key-value configuration store
7. **contact_submissions** - Contact form entries
8. **anmeldung_submissions** - School registration form entries

## Database Technology

- **PostgreSQL** via Supabase
- Deployed through Vercel
- All secrets managed by Vercel environment variables

## Migration Files

### `complete_schema.sql` (Recommended)

The comprehensive, production-ready schema that includes:
- All 8 tables with exact field specifications
- Row Level Security (RLS) policies
- Indexes for performance optimization
- Triggers for automatic `updated_at` timestamps
- Proper foreign key relationships
- Table and column documentation

**This is the primary migration file to use for setting up the database.**

### Legacy Files

- `001_create_cms_tables.sql` - Initial schema (partial)
- `002_create_cms_tables.sql` - Simplified version (minimal)

These files are kept for reference but the `complete_schema.sql` supersedes them.

## How to Apply the Schema

### Option 1: Supabase Dashboard (Recommended)

1. Log into your Supabase dashboard at https://app.supabase.com
2. Navigate to your project
3. Go to the SQL Editor
4. Copy the contents of `complete_schema.sql`
5. Paste into a new query
6. Run the query

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project (only needed once)
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push

# Or run the SQL file directly
psql -h YOUR_DB_HOST -U postgres -d postgres -f scripts/complete_schema.sql
```

### Option 3: Direct PostgreSQL Connection

If you have direct database access:

```bash
psql postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:[PORT]/postgres -f scripts/complete_schema.sql
```

## Schema Features

### UUID Primary Keys

All tables use UUID primary keys with `gen_random_uuid()` for automatic generation.

### Timestamps

Tables include `created_at` and `updated_at` (where applicable) with type `timestamptz` (timestamp with timezone).

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow public to insert submissions (contact, anmeldung)
- Allow public to read published content (pages, posts, events)
- Require authentication for admin operations
- Protect content ownership (users can only edit their own content)

### Automatic Timestamps

The `updated_at` field is automatically updated via triggers whenever a row is modified.

### Hierarchical Navigation

The `navigation_items` table supports nested navigation through a self-referencing `parent_id` foreign key.

## Table Details

### 1. pages

Static content pages with sections, ordering, and system flags.

**Key Fields:**
- `is_system` - Marks system-generated pages that shouldn't be deleted
- `route_path` - Custom route for the page
- `section` - Groups pages by section (e.g., 'allgemein', 'schule', 'oberstufe')
- `sort_order` - Controls display order within sections

### 2. posts

News articles and blog posts.

**Key Fields:**
- `featured` - Highlights important posts on the homepage
- `excerpt` - Short summary for listings
- `category` - Groups posts (default: 'aktuelles')
- `author_name` - Display name for the author

### 3. events

Calendar events and important dates.

**Key Fields:**
- `event_date` - Date of the event (required)
- `event_time` - Time of event as text (e.g., "14:00 Uhr")
- `location` - Where the event takes place
- `category` - Event type (default: 'termin')

### 4. documents

Downloadable files and documents.

**Key Fields:**
- `file_url` - URL to the file (e.g., Vercel Blob storage)
- `file_name` - Original filename
- `file_size` - Size in bytes
- `file_type` - MIME type (e.g., 'application/pdf')

### 5. navigation_items

Hierarchical navigation structure.

**Key Fields:**
- `parent_id` - References another navigation_item for nested menus
- `location` - Where to display ('header' or 'footer')
- `sort_order` - Display order
- `visible` - Show/hide the item

### 6. site_settings

Flexible key-value store for site configuration.

**Key Fields:**
- `key` - Unique setting identifier (e.g., 'hero_title', 'school_phone')
- `value` - The setting value
- `type` - Data type hint ('text', 'number', 'boolean', 'json')
- `protected` - Prevents deletion of critical settings

**Common Use Cases:**
- Hero section text
- SEO metadata
- School contact information
- Homepage statistics
- Feature flags

### 7. contact_submissions

Contact form submissions from visitors.

**Key Fields:**
- `read` - Tracks if the submission has been reviewed
- No user_id (public submissions)

### 8. anmeldung_submissions

School registration/enrollment forms.

**Key Fields:**
- `child_name` - Student name
- `parent_name` - Parent/guardian name
- `anmeldung_type` - Type of enrollment (default: 'klasse5')
- `grundschule` - Previous elementary school
- `wunschpartner` - Preferred classroom partner
- `profilprojekt` - Selected profile/project

## Environment Variables

Required environment variables (stored in Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for server-side operations)
```

## TypeScript Types

See `lib/types/database.types.ts` for TypeScript type definitions that match this schema.

## Database Maintenance

### Backup

Supabase automatically backs up your database. You can also create manual backups:

```bash
pg_dump postgresql://[connection-string] > backup.sql
```

### Monitor Performance

- Check the Supabase dashboard for query performance
- Review index usage periodically
- Monitor table sizes

### Updates

When updating the schema:
1. Create a new migration file with timestamp prefix
2. Test in a development environment first
3. Apply to production during low-traffic periods
4. Update TypeScript types accordingly

## Security Considerations

1. **RLS Policies** - All tables have Row Level Security enabled
2. **Authentication** - Uses Supabase Auth (auth.users table)
3. **Public Endpoints** - Only submissions and published content are publicly accessible
4. **Protected Settings** - Critical site_settings are marked as protected
5. **Cascade Deletes** - User deletion cascades to their content where appropriate

## Support

For issues or questions:
- Check the Supabase documentation: https://supabase.com/docs
- Review error logs in Vercel dashboard
- Check database logs in Supabase dashboard
