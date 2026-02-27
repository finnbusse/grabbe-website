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
  hero_image_url: string | null;
  meta_description: string | null;
  seo_og_image: string | null;
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
  event_date: string | null; // date (YYYY-MM-DD), optional custom display date
  meta_description: string | null;
  seo_og_image: string | null;
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
  event_end_date: string | null; // date (YYYY-MM-DD)
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

/**
 * Tags for categorizing events, documents, and posts
 */
export interface Tag {
  id: string; // UUID
  name: string;
  color: string; // Default: 'blue'
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Junction: event ↔ tag
 */
export interface EventTag {
  event_id: string; // UUID
  tag_id: string; // UUID
}

/**
 * Junction: document ↔ tag
 */
export interface DocumentTag {
  document_id: string; // UUID
  tag_id: string; // UUID
}

/**
 * Junction: post ↔ tag
 */
export interface PostTag {
  post_id: string; // UUID
  tag_id: string; // UUID
}

/**
 * Extended user profiles for CMS users (teachers)
 */
export interface UserProfile {
  id: string; // UUID
  user_id: string; // UUID, references auth.users
  first_name: string;
  last_name: string;
  title: string; // e.g. "Dr."
  avatar_url: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
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

export type TagInsert = Omit<Tag, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
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
export type TagUpdate = Partial<Omit<Tag, 'id' | 'created_at'>>;
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at'>>;

// ============================================================================
// Campaigns
// ============================================================================

export interface CampaignButton {
  id: string
  label: string
  url: string
  style: 'primary' | 'secondary' | 'outline' | 'ghost'
  target: '_self' | '_blank'
}

export interface Campaign {
  id: string
  title: string
  headline: string
  message: string
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  show_once: boolean
  overlay_style: 'blur' | 'dark' | 'light'
  accent_color: string
  buttons: CampaignButton[]
  created_at: string
  updated_at: string
  user_id: string | null
}

export type CampaignInsert = Omit<Campaign, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'created_at'>>

// ============================================================================
// List-view types (narrow projections for card/list views without large blobs)
// ============================================================================

/** Post fields fetched for card/list views (excludes `content`) */
export type PostListItem = Omit<Post, 'content'>

/** Event fields fetched for card/list views */
export type EventListItem = Pick<Event, 'id' | 'title' | 'description' | 'event_date' | 'event_end_date' | 'event_time' | 'location' | 'category'>

/** Document fields fetched for card/list views */
export type DocumentListItem = Pick<Document, 'id' | 'title' | 'file_url' | 'file_name' | 'file_size' | 'file_type' | 'category'>

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
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
        Relationships: [];
      };
      documents: {
        Row: Document;
        Insert: DocumentInsert;
        Update: DocumentUpdate;
        Relationships: [];
      };
      navigation_items: {
        Row: NavigationItem;
        Insert: NavigationItemInsert;
        Update: NavigationItemUpdate;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSettingInsert;
        Update: SiteSettingUpdate;
        Relationships: [];
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: ContactSubmissionInsert;
        Update: ContactSubmissionUpdate;
        Relationships: [];
      };
      anmeldung_submissions: {
        Row: AnmeldungSubmission;
        Insert: AnmeldungSubmissionInsert;
        Update: AnmeldungSubmissionUpdate;
        Relationships: [];
      };
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
        Relationships: [];
      };
      tags: {
        Row: Tag;
        Insert: TagInsert;
        Update: TagUpdate;
        Relationships: [];
      };
      event_tags: {
        Row: EventTag;
        Insert: EventTag;
        Update: EventTag;
        Relationships: [];
      };
      document_tags: {
        Row: DocumentTag;
        Insert: DocumentTag;
        Update: DocumentTag;
        Relationships: [];
      };
      post_tags: {
        Row: PostTag;
        Insert: PostTag;
        Update: PostTag;
        Relationships: [];
      };
      campaigns: {
        Row: Campaign;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
        Relationships: [];
      };
      cms_roles: {
        Row: CmsRoleRow;
        Insert: CmsRoleInsert;
        Update: CmsRoleUpdate;
        Relationships: [];
      };
      user_roles: {
        Row: UserRoleRow;
        Insert: UserRoleInsert;
        Update: Partial<UserRoleRow>;
        Relationships: [];
      };
      user_page_permissions: {
        Row: UserPagePermissionRow;
        Insert: UserPagePermissionInsert;
        Update: Partial<UserPagePermissionRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ============================================================================
// RBAC Types
// ============================================================================

/**
 * CMS role definitions (system + custom)
 */
export interface CmsRoleRow {
  id: string; // UUID
  name: string;
  slug: string;
  is_system: boolean;
  permissions: Record<string, unknown>; // JSONB
  created_at: string; // timestamptz
}

/**
 * User ↔ role assignment
 */
export interface UserRoleRow {
  id: string; // UUID
  user_id: string; // UUID, references auth.users
  role_id: string; // UUID, references cms_roles
}

/**
 * Per-user page access assignment
 */
export interface UserPagePermissionRow {
  id: string; // UUID
  user_id: string; // UUID
  page_type: "editable" | "cms";
  page_id: string;
}

export type CmsRoleInsert = Omit<CmsRoleRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type CmsRoleUpdate = Partial<Omit<CmsRoleRow, 'id' | 'created_at'>>;

export type UserRoleInsert = Omit<UserRoleRow, 'id'> & { id?: string };

export type UserPagePermissionInsert = Omit<UserPagePermissionRow, 'id'> & { id?: string };

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
