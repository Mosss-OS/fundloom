export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      campaign_comments: {
        Row: {
          author_id: string;
          body: string;
          campaign_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          campaign_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          campaign_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_comments_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_updates: {
        Row: {
          author_id: string;
          body: string;
          campaign_id: string;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          campaign_id: string;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          campaign_id?: string;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_updates_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          amount_raised: number;
          category: Database["public"]["Enums"]["campaign_category"];
          contract_address: string | null;
          cover_image_url: string | null;
          created_at: string;
          deadline: string;
          description: string;
          goal_amount: number;
          id: string;
          is_verified: boolean;
          payout_preference: Database["public"]["Enums"]["payout_pref"];
          status: Database["public"]["Enums"]["campaign_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_raised?: number;
          category?: Database["public"]["Enums"]["campaign_category"];
          contract_address?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          deadline: string;
          description: string;
          goal_amount: number;
          id?: string;
          is_verified?: boolean;
          payout_preference?: Database["public"]["Enums"]["payout_pref"];
          status?: Database["public"]["Enums"]["campaign_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_raised?: number;
          category?: Database["public"]["Enums"]["campaign_category"];
          contract_address?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          deadline?: string;
          description?: string;
          goal_amount?: number;
          id?: string;
          is_verified?: boolean;
          payout_preference?: Database["public"]["Enums"]["payout_pref"];
          status?: Database["public"]["Enums"]["campaign_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      donations: {
        Row: {
          amount: number;
          campaign_id: string;
          created_at: string;
          donor_user_id: string | null;
          donor_wallet: string;
          id: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          tx_hash: string | null;
        };
        Insert: {
          amount: number;
          campaign_id: string;
          created_at?: string;
          donor_user_id?: string | null;
          donor_wallet: string;
          id?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          tx_hash?: string | null;
        };
        Update: {
          amount?: number;
          campaign_id?: string;
          created_at?: string;
          donor_user_id?: string | null;
          donor_wallet?: string;
          id?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          tx_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_donor_user_id_fkey";
            columns: ["donor_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      partners: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          amount: number;
          campaign_id: string;
          created_at: string;
          donor_user_id: string | null;
          donor_wallet: string;
          id: string;
          status: string;
          tx_hash: string | null;
        };
        Insert: {
          amount: number;
          campaign_id: string;
          created_at?: string;
          donor_user_id?: string | null;
          donor_wallet: string;
          id?: string;
          status?: string;
          tx_hash?: string | null;
        };
        Update: {
          amount?: number;
          campaign_id?: string;
          created_at?: string;
          donor_user_id?: string | null;
          donor_wallet?: string;
          id?: string;
          status?: string;
          tx_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "refunds_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "refunds_donor_user_id_fkey";
            columns: ["donor_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          campaign_id: string | null;
          created_at: string;
          id: string;
          status: Database["public"]["Enums"]["tx_status"];
          tx_hash: string | null;
          type: Database["public"]["Enums"]["tx_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          campaign_id?: string | null;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["tx_status"];
          tx_hash?: string | null;
          type: Database["public"]["Enums"]["tx_type"];
          user_id: string;
        };
        Update: {
          amount?: number;
          campaign_id?: string | null;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["tx_status"];
          tx_hash?: string | null;
          type?: Database["public"]["Enums"]["tx_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          privy_id: string;
          updated_at: string;
          wallet_address: string | null;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          id?: string;
          privy_id: string;
          updated_at?: string;
          wallet_address?: string | null;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          privy_id?: string;
          updated_at?: string;
          wallet_address?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      increment_campaign_raised: {
        Args: { _amount: number; _campaign_id: string };
        Returns: undefined;
      };
      is_admin_user: { Args: { _user_id: string }; Returns: boolean };
      mark_expired_campaigns: { Args: never; Returns: number };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
      campaign_category:
        | "art"
        | "tech"
        | "community"
        | "education"
        | "health"
        | "environment"
        | "music"
        | "food"
        | "gaming"
        | "other";
      campaign_status: "active" | "completed" | "cancelled" | "failed";
      payment_method: "crypto" | "fiat";
      payout_pref: "crypto" | "fiat";
      tx_status: "pending" | "confirmed" | "failed";
      tx_type: "donation" | "withdrawal";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      campaign_category: [
        "art",
        "tech",
        "community",
        "education",
        "health",
        "environment",
        "music",
        "food",
        "gaming",
        "other",
      ],
      campaign_status: ["active", "completed", "cancelled", "failed"],
      payment_method: ["crypto", "fiat"],
      payout_pref: ["crypto", "fiat"],
      tx_status: ["pending", "confirmed", "failed"],
      tx_type: ["donation", "withdrawal"],
    },
  },
} as const;
