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
      businesses: {
        Row: {
          id: string
          owner_id: string
          company_name: string
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          company_name: string
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          company_name?: string
          currency?: string
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          business_id: string
          name: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          email?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          business_id: string
          client_id: string | null
          total_amount: number
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          client_id?: string | null
          total_amount?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          client_id?: string | null
          total_amount?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          due_date?: string | null
          created_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          business_id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      bank_transactions: {
        Row: {
          id: string
          business_id: string
          description: string
          amount: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          description: string
          amount: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          description?: string
          amount?: number
          date?: string
          created_at?: string
        }
      }
      reconciliations: {
        Row: {
          id: string
          business_id: string
          invoice_id: string
          transaction_id: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          invoice_id: string
          transaction_id: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          invoice_id?: string
          transaction_id?: string
          created_at?: string
        }
      }
      feedbacks: {
        Row: {
          id: string
          user_id: string
          message: string
          type: 'BUG' | 'FEATURE' | 'OTHER'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          type?: 'BUG' | 'FEATURE' | 'OTHER'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          type?: 'BUG' | 'FEATURE' | 'OTHER'
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
