export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_config: {
        Row: {
          agent_name: string
          ai_model: string
          escalation_message: string
          greeting_message: string
          id: string
          inactivity_timeout_minutes: number
          max_messages_before_escalation: number
          system_prompt: string
          trigger_analysis: string[]
          trigger_human: string[]
          updated_at: string
          updated_by: string | null
          wait_message: string
        }
        Insert: {
          agent_name?: string
          ai_model?: string
          escalation_message?: string
          greeting_message?: string
          id?: string
          inactivity_timeout_minutes?: number
          max_messages_before_escalation?: number
          system_prompt: string
          trigger_analysis?: string[]
          trigger_human?: string[]
          updated_at?: string
          updated_by?: string | null
          wait_message?: string
        }
        Update: {
          agent_name?: string
          ai_model?: string
          escalation_message?: string
          greeting_message?: string
          id?: string
          inactivity_timeout_minutes?: number
          max_messages_before_escalation?: number
          system_prompt?: string
          trigger_analysis?: string[]
          trigger_human?: string[]
          updated_at?: string
          updated_by?: string | null
          wait_message?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          sender_id: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          current_plan_id: string | null
          full_name: string
          id: string
          neighborhood: string | null
          phone: string | null
          state: string | null
          street: string | null
          street_number: string | null
          updated_at: string
          user_id: string
          vehicle_brand: string | null
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          current_plan_id?: string | null
          full_name: string
          id?: string
          neighborhood?: string | null
          phone?: string | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          updated_at?: string
          user_id: string
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          current_plan_id?: string | null
          full_name?: string
          id?: string
          neighborhood?: string | null
          phone?: string | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          updated_at?: string
          user_id?: string
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          accepted_jobs: number
          address: string | null
          average_rating: number
          created_at: string
          id: string
          is_approved: boolean
          is_available: boolean
          latitude: number | null
          longitude: number | null
          rating_sum: number
          response_time_avg: number
          services: Database["public"]["Enums"]["service_type"][]
          total_jobs: number
          total_ratings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_jobs?: number
          address?: string | null
          average_rating?: number
          created_at?: string
          id?: string
          is_approved?: boolean
          is_available?: boolean
          latitude?: number | null
          longitude?: number | null
          rating_sum?: number
          response_time_avg?: number
          services?: Database["public"]["Enums"]["service_type"][]
          total_jobs?: number
          total_ratings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_jobs?: number
          address?: string | null
          average_rating?: number
          created_at?: string
          id?: string
          is_approved?: boolean
          is_available?: boolean
          latitude?: number | null
          longitude?: number | null
          rating_sum?: number
          response_time_avg?: number
          services?: Database["public"]["Enums"]["service_type"][]
          total_jobs?: number
          total_ratings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sb_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["sb_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["sb_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["sb_transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      sb_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_pricing: {
        Row: {
          created_at: string
          id: string
          non_subscriber_price: number
          service_type: Database["public"]["Enums"]["service_type"]
          subscriber_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          non_subscriber_price?: number
          service_type: Database["public"]["Enums"]["service_type"]
          subscriber_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          non_subscriber_price?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          subscriber_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          accepted_at: string | null
          address: string
          client_id: string
          client_name: string
          client_phone: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_subscriber: boolean
          latitude: number
          longitude: number
          price: number | null
          provider_id: string | null
          rating: number | null
          rating_comment: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          urgency: string | null
          vehicle_info: string | null
        }
        Insert: {
          accepted_at?: string | null
          address: string
          client_id: string
          client_name: string
          client_phone: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_subscriber?: boolean
          latitude: number
          longitude: number
          price?: number | null
          provider_id?: string | null
          rating?: number | null
          rating_comment?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency?: string | null
          vehicle_info?: string | null
        }
        Update: {
          accepted_at?: string | null
          address?: string
          client_id?: string
          client_name?: string
          client_phone?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_subscriber?: boolean
          latitude?: number
          longitude?: number
          price?: number | null
          provider_id?: string | null
          rating?: number | null
          rating_comment?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency?: string | null
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: string[]
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_agent_id: string | null
          client_id: string
          created_at: string
          id: string
          resolved_at: string | null
          service_request_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          summary: string | null
          ticket_number: number
          trigger_words: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          service_request_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          summary?: string | null
          ticket_number?: number
          trigger_words?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          service_request_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          summary?: string | null
          ticket_number?: number
          trigger_words?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      urgency_config: {
        Row: {
          ai_model: string
          classification_prompt: string
          criteria_rules: string
          fallback_urgency: string
          id: string
          is_enabled: boolean
          night_boost: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ai_model?: string
          classification_prompt?: string
          criteria_rules?: string
          fallback_urgency?: string
          id?: string
          is_enabled?: boolean
          night_boost?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ai_model?: string
          classification_prompt?: string
          criteria_rules?: string
          fallback_urgency?: string
          id?: string
          is_enabled?: boolean
          night_boost?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client" | "provider"
      request_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      sb_transaction_type: "earned" | "spent"
      sender_type: "client" | "agent" | "human_agent"
      service_type:
        | "reboque"
        | "chaveiro"
        | "borracheiro"
        | "destombamento"
        | "frete_pequeno"
        | "frete_grande"
      ticket_status:
        | "agent_handling"
        | "analysis"
        | "human_handling"
        | "resolved"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "provider"],
      request_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      sb_transaction_type: ["earned", "spent"],
      sender_type: ["client", "agent", "human_agent"],
      service_type: [
        "reboque",
        "chaveiro",
        "borracheiro",
        "destombamento",
        "frete_pequeno",
        "frete_grande",
      ],
      ticket_status: [
        "agent_handling",
        "analysis",
        "human_handling",
        "resolved",
        "closed",
      ],
    },
  },
} as const
