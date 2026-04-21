export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ServiceRow = {
  id: string;
  name_fr: string;
  name_ar: string;
  description_fr: string;
  description_ar: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogProductRow = {
  id: string;
  name: string;
  category: "frames" | "lenses" | "sunglasses";
  brand: string;
  price: number;
  stock: number;
  image_url: string | null;
  image_path: string | null;
  description_fr: string | null;
  description_ar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AppointmentRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_date: string;
  preferred_time: string;
  reason: string | null;
  locale: "fr" | "ar";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TestimonialRow = {
  id: string;
  author_name: string;
  rating: number;
  body_fr: string;
  body_ar: string | null;
  source: "google" | "manual";
  google_id: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type SiteContentRow = {
  id: string;
  content_key: string;
  value_fr: string | null;
  value_ar: string | null;
  value_numeric: number | null;
  content_type: "text" | "number" | "richtext";
  label: string;
  updated_at: string;
};

export type ApiKeyRow = {
  id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      services: {
        Row: ServiceRow;
        Insert: Partial<ServiceRow> & Pick<ServiceRow, "name_fr" | "name_ar" | "description_fr" | "description_ar" | "icon">;
        Update: Partial<ServiceRow>;
      };
      catalog_products: {
        Row: CatalogProductRow;
        Insert: Partial<CatalogProductRow> & Pick<CatalogProductRow, "name" | "category" | "brand" | "price">;
        Update: Partial<CatalogProductRow>;
      };
      appointments: {
        Row: AppointmentRow;
        Insert: Partial<AppointmentRow> & Pick<AppointmentRow, "full_name" | "phone" | "preferred_date" | "preferred_time">;
        Update: Partial<AppointmentRow>;
      };
      testimonials: {
        Row: TestimonialRow;
        Insert: Partial<TestimonialRow> & Pick<TestimonialRow, "author_name" | "body_fr">;
        Update: Partial<TestimonialRow>;
      };
      site_content: {
        Row: SiteContentRow;
        Insert: Partial<SiteContentRow> & Pick<SiteContentRow, "content_key" | "content_type" | "label">;
        Update: Partial<SiteContentRow>;
      };
      api_keys: {
        Row: ApiKeyRow;
        Insert: Partial<ApiKeyRow> & Pick<ApiKeyRow, "name" | "key_hash" | "key_prefix">;
        Update: Partial<ApiKeyRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
