import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export type Partner = {
  id: string;
  name: string;
  url: string | null;
  logo_url: string | null;
  display_order: number;
};

export async function fetchActivePartners(): Promise<Partner[]> {
  const { data, error } = await supabase
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
}

// Admin functions - these would need to be moved to serverless API routes for production
// For now, they're commented out as they require service role key

/*
export type AdminPartner = {
  id: string;
  name: string;
  url: string | null;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function isCurrentUserAdmin(actorUserId: string): Promise<boolean> {
  // This needs to be called from a serverless function
  // For now, return false as placeholder
  console.warn("isCurrentUserAdmin should be called from serverless API");
  return false;
}
*/

export async function isCurrentUserAdmin(data: { actorUserId: string }): Promise<{ isAdmin: boolean }> {
  // Placeholder - in production, this should be an API call to a serverless function
  // that uses the service role key to check admin status
  console.warn("Admin check should be done via API route");
  return { isAdmin: false };
}
