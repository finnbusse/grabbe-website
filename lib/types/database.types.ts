/**
 * Database Type Definitions for School CMS
 * Generated from the PostgreSQL schema
 * 
 * These types match the database schema defined in scripts/complete_schema.sql
 */

// ============================================================================
// Database Tables
// ============================================================================

/**
 * Static pages (Impressum, Oberstufe, Anmeldung, etc.)
 */
export interface Page {
  id: string; // UUID
  title: string;
  slug: string;
  content: string;
  section: string; // Default: 'allgemein'
  sort_order: number; // Default: 0
  published: boolean; // Default: true
  user_id: string | null; // UUID, references auth.users
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  is_system: boolean; // Default: false
  route_path: string | null;
}

/**
 * Blog posts / News
 */
export interface Post {
  id: string; // UUID
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string; // Default: 'aktuelles'
  published: boolean; // Default: false
  featured: boolean; // Default: false
  image_url: string | null;
  author_name: string | null;
  user_id: string; // UUID, references auth.users
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * School events / Calendar entries
 */
export interface Event {
  id: string; // UUID
  title: string;
  description: string | null;
  event_date: string; // date (YYYY-MM-DD)
  event_time: string | null;
  location: string | null;
  category: string; // Default: 'termin'
  published: boolean; // Default: true
  user_id: string; // UUID, references auth.users
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Downloads (PDFs, files)
 */
export interface Document {
  id: string; // UUID
  title: string;
  file_url: string;
  file_name: string;
  file_size: number; // bigint, Default: 0
  file_type: string | null;
  category: string; // Default: 'allgemein'
  published: boolean; // Default: true
  user_id: string; // UUID, references auth.users
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Header/Footer navigation (hierarchical)
 */
export interface NavigationItem {
  id: string; // UUID
  label: string;
  href: string;
  parent_id: string | null; // UUID, self-referencing FK
  sort_order: number; // Default: 0
  visible: boolean; // Default: true
  location: string; // Default: 'header'
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Key-value configuration store
 */
export interface SiteSetting {
  id: string; // UUID
  key: string;
  value: string;
  type: string; // Default: 'text' (e.g., 'text', 'number', 'boolean', 'json')
  label: string | null;
  category: string; // Default: 'allgemein'
  updated_at: string; // timestamptz
  protected: boolean; // Default: false
}

/**
 * Contact form entries
 */
export interface ContactSubmission {
  id: string; // UUID
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean; // Default: false
  created_at: string; // timestamptz
}

/**
 * School registration form entries
 */
export interface AnmeldungSubmission {
  id: string; // UUID
  child_name: string;
  child_birthday: string | null; // date (YYYY-MM-DD)
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  grundschule: string | null;
  anmeldung_type: string; // Default: 'klasse5'
  wunschpartner: string | null;
  profilprojekt: string | null;
  message: string | null;
  created_at: string; // timestamptz
}

// ============================================================================
// Insert Types (for creating new records, excluding auto-generated fields)
// ============================================================================

export type PageInsert = Omit<Page, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NavigationItemInsert = Omit<NavigationItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type SiteSettingInsert = Omit<SiteSetting, 'id' | 'updated_at'> & {
  id?: string;
  updated_at?: string;
};

export type ContactSubmissionInsert = Omit<ContactSubmission, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type AnmeldungSubmissionInsert = Omit<AnmeldungSubmission, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// ============================================================================
// Update Types (all fields optional)
// ============================================================================

export type PageUpdate = Partial<Omit<Page, 'id' | 'created_at'>>;
export type PostUpdate = Partial<Omit<Post, 'id' | 'created_at'>>;
export type EventUpdate = Partial<Omit<Event, 'id' | 'created_at'>>;
export type DocumentUpdate = Partial<Omit<Document, 'id' | 'created_at'>>;
export type NavigationItemUpdate = Partial<Omit<NavigationItem, 'id' | 'created_at'>>;
export type SiteSettingUpdate = Partial<Omit<SiteSetting, 'id'>>;
export type ContactSubmissionUpdate = Partial<Omit<ContactSubmission, 'id' | 'created_at'>>;
export type AnmeldungSubmissionUpdate = Partial<Omit<AnmeldungSubmission, 'id' | 'created_at'>>;

// ============================================================================
// Database Schema Type (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: Page;
        Insert: PageInsert;
        Update: PageUpdate;
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      documents: {
        Row: Document;
        Insert: DocumentInsert;
        Update: DocumentUpdate;
      };
      navigation_items: {
        Row: NavigationItem;
        Insert: NavigationItemInsert;
        Update: NavigationItemUpdate;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSettingInsert;
        Update: SiteSettingUpdate;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: ContactSubmissionInsert;
        Update: ContactSubmissionUpdate;
      };
      anmeldung_submissions: {
        Row: AnmeldungSubmission;
        Insert: AnmeldungSubmissionInsert;
        Update: AnmeldungSubmissionUpdate;
      };
    };
  };
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Hierarchical navigation item with children
 */
export interface NavigationItemWithChildren extends NavigationItem {
  children?: NavigationItemWithChildren[];
}

/**
 * Post with author details
 */
export interface PostWithAuthor extends Post {
  author?: {
    id: string;
    email?: string;
    name?: string;
  };
}

/**
 * Event with additional metadata
 */
export interface EventWithMetadata extends Event {
  isPast?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
}
