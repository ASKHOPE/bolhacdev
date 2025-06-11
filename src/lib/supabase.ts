import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_name: string
          donor_email: string
          amount: number
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          donor_name: string
          donor_email: string
          amount: number
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          donor_name?: string
          donor_email?: string
          amount?: number
          message?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          location: string
          image_url: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          location: string
          image_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          location?: string
          image_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          target_amount: number
          raised_amount: number | null
          start_date: string
          end_date: string
          status: string
          image_url: string | null
          beneficiaries: number
          program_category: string
          published: boolean | null
          featured: boolean | null
          image_gallery: string[]
          show_gallery: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          target_amount?: number
          raised_amount?: number | null
          start_date: string
          end_date: string
          status?: string
          image_url?: string | null
          beneficiaries?: number
          program_category: string
          published?: boolean | null
          featured?: boolean | null
          image_gallery?: string[]
          show_gallery?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          target_amount?: number
          raised_amount?: number | null
          start_date?: string
          end_date?: string
          status?: string
          image_url?: string | null
          beneficiaries?: number
          program_category?: string
          published?: boolean | null
          featured?: boolean | null
          image_gallery?: string[]
          show_gallery?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}