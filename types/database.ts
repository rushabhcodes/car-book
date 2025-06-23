export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          role: 'admin' | 'dealer'
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone: string
          role?: 'admin' | 'dealer'
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          role?: 'admin' | 'dealer'
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      car_listings: {
        Row: {
          id: string
          dealer_id: string
          status: 'pending' | 'approved' | 'rejected'
          registration_year: string
          manufacturing_year: string
          brand: string
          model: string
          transmission_type: string
          rto_number: string
          color: string
          ownership_history: string
          kilometers_driven: string
          fuel_type: string
          insurance_validity: string
          insurance_type: string
          asking_price: string
          offered_price: string
          you_can_offer: string
          whatsapp_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dealer_id: string
          status?: 'pending' | 'approved' | 'rejected'
          registration_year: string
          manufacturing_year: string
          brand: string
          model: string
          transmission_type: string
          rto_number: string
          color: string
          ownership_history: string
          kilometers_driven: string
          fuel_type: string
          insurance_validity: string
          insurance_type: string
          asking_price: string
          offered_price: string
          you_can_offer: string
          whatsapp_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dealer_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          registration_year?: string
          manufacturing_year?: string
          brand?: string
          model?: string
          transmission_type?: string
          rto_number?: string
          color?: string
          ownership_history?: string
          kilometers_driven?: string
          fuel_type?: string
          insurance_validity?: string
          insurance_type?: string
          asking_price?: string
          offered_price?: string
          you_can_offer?: string
          whatsapp_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      listing_media: {
        Row: {
          id: string
          listing_id: string
          file_url: string
          file_type: 'image' | 'video' | 'audio_repairs_needed' | 'audio_repairs_completed'
          file_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          file_url: string
          file_type: 'image' | 'video' | 'audio_repairs_needed' | 'audio_repairs_completed'
          file_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          file_url?: string
          file_type?: 'image' | 'video' | 'audio_repairs_needed' | 'audio_repairs_completed'
          file_name?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
