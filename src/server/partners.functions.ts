import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Partner = {
  id: string;
  name: string;
  url: string | null;
  logo_url: string | null;
  display_order: number;
};

export const fetchActivePartners = createServerFn({ method: "GET" }).handler(
  async (): Promise<Partner[]> => {
    const { data, error } = await supabaseAdmin
      .from("partners")
      .select("id, name, url, logo_url, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(50);
    if (error) {
      console.error("fetchActivePartners error:", error);
      return [];
    }
    return (data ?? []) as Partner[];
  },
);
