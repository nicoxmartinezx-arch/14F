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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          couple_name: string
          anniversary_date: string | null
          created_at: string
          status: 'active' | 'pending' | 'ended'
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          couple_name?: string
          anniversary_date?: string | null
          created_at?: string
          status?: 'active' | 'pending' | 'ended'
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          couple_name?: string
          anniversary_date?: string | null
          created_at?: string
          status?: 'active' | 'pending' | 'ended'
        }
      }
      memories: {
        Row: {
          id: string
          couple_id: string
          created_by: string
          title: string
          description: string
          memory_date: string
          image_url: string | null
          category: 'date' | 'gift' | 'trip' | 'milestone' | 'moment' | 'surprise' | 'celebration'
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          created_by: string
          title: string
          description?: string
          memory_date: string
          image_url?: string | null
          category?: 'date' | 'gift' | 'trip' | 'milestone' | 'moment' | 'surprise' | 'celebration'
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          created_by?: string
          title?: string
          description?: string
          memory_date?: string
          image_url?: string | null
          category?: 'date' | 'gift' | 'trip' | 'milestone' | 'moment' | 'surprise' | 'celebration'
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      couple_invitations: {
        Row: {
          id: string
          sender_id: string
          recipient_email: string
          recipient_id: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'expired'
          invitation_code: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_email: string
          recipient_id?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired'
          invitation_code?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_email?: string
          recipient_id?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired'
          invitation_code?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
}
