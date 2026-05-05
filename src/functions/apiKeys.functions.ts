import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateApiKey, hashApiKey } from "@/lib/apiAuth";

/**
 * List user's API keys
 */
export const listApiKeys = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) =>
    z.object({ userId: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data }) => {
    const { data: keys, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, scopes, is_active, last_used_at, expires_at, created_at")
      .eq("user_id", data.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return keys || [];
  });

/**
 * Create new API key
 */
export const createApiKey = createServerFn({ method: "POST" })
  .validator((d: { userId: string; name?: string; scopes?: string[] }) =>
    z.object({
      userId: z.string().uuid(),
      name: z.string().max(100).optional(),
      scopes: z.array(z.string()).optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { key, hashedKey } = generateApiKey();

    const { data: row, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        user_id: data.userId,
        key_hash: hashedKey,
        name: data.name || "Default API Key",
        scopes: data.scopes || ["read"],
      })
      .select("id, name, scopes, created_at")
      .single();

    if (error) throw new Error(error.message);

    // Return the key only once (user must save it)
    return {
      ...row,
      key, // Full key - only shown once!
    };
  });

/**
 * Update API key (name, scopes, active status)
 */
export const updateApiKey = createServerFn({ method: "POST" })
  .validator((d: { userId: string; keyId: string; updates: { name?: string; scopes?: string[]; is_active?: boolean } }) =>
    z.object({
      userId: z.string().uuid(),
      keyId: z.string().uuid(),
      updates: z.object({
        name: z.string().max(100).optional(),
        scopes: z.array(z.string()).optional(),
        is_active: z.boolean().optional(),
      }),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update(data.updates)
      .eq("id", data.keyId)
      .eq("user_id", data.userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

/**
 * Delete API key
 */
export const deleteApiKey = createServerFn({ method: "POST" })
  .validator((d: { userId: string; keyId: string }) =>
    z.object({
      userId: z.string().uuid(),
      keyId: z.string().uuid(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("api_keys")
      .delete()
      .eq("id", data.keyId)
      .eq("user_id", data.userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });
