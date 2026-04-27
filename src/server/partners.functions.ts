import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

// ---------- Admin operations ----------

async function assertAdmin(actorUserId: string) {
  const { data, error } = await supabaseAdmin.rpc("is_admin_user", {
    _user_id: actorUserId,
  });
  if (error) throw new Error("Admin check failed");
  if (!data) throw new Error("Forbidden: admin access required");
}

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

const ActorSchema = z.object({ actorUserId: z.string().uuid() });

export const fetchAllPartners = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string }) => ActorSchema.parse(data))
  .handler(async ({ data }): Promise<AdminPartner[]> => {
    await assertAdmin(data.actorUserId);
    const { data: rows, error } = await supabaseAdmin
      .from("partners")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminPartner[];
  });

const UpsertSchema = z.object({
  actorUserId: z.string().uuid(),
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  url: z
    .string()
    .trim()
    .max(500)
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  logo_url: z.string().trim().max(1000).url().optional().nullable(),
  display_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const upsertPartner = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof UpsertSchema>) => UpsertSchema.parse(data))
  .handler(async ({ data }): Promise<AdminPartner> => {
    await assertAdmin(data.actorUserId);
    const payload = {
      name: data.name,
      url: data.url ?? null,
      logo_url: data.logo_url ?? null,
      display_order: data.display_order,
      is_active: data.is_active,
    };
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("partners")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row as AdminPartner;
    }
    const { data: row, error } = await supabaseAdmin
      .from("partners")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as AdminPartner;
  });

export const deletePartner = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string; id: string }) =>
    z.object({ actorUserId: z.string().uuid(), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.actorUserId);
    const { error } = await supabaseAdmin.from("partners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderPartners = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string; orderedIds: string[] }) =>
    z
      .object({
        actorUserId: z.string().uuid(),
        orderedIds: z.array(z.string().uuid()).min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.actorUserId);
    // Update each row with its new display_order.
    await Promise.all(
      data.orderedIds.map((id, idx) =>
        supabaseAdmin.from("partners").update({ display_order: idx }).eq("id", id),
      ),
    );
    return { ok: true };
  });

export const togglePartnerActive = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string; id: string; isActive: boolean }) =>
    z
      .object({
        actorUserId: z.string().uuid(),
        id: z.string().uuid(),
        isActive: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.actorUserId);
    const { error } = await supabaseAdmin
      .from("partners")
      .update({ is_active: data.isActive })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const UploadSchema = z.object({
  actorUserId: z.string().uuid(),
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  // base64 (no data: prefix)
  base64: z.string().min(1).max(8_000_000), // ~6MB binary cap
});

export const uploadPartnerLogo = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof UploadSchema>) => UploadSchema.parse(data))
  .handler(async ({ data }) => {
    await assertAdmin(data.actorUserId);
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage
      .from("partner-logos")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("partner-logos").getPublicUrl(path);
    return { url: pub.publicUrl, path };
  });

export const isCurrentUserAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { actorUserId: string }) => ActorSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: ok, error } = await supabaseAdmin.rpc("is_admin_user", {
      _user_id: data.actorUserId,
    });
    if (error) return { isAdmin: false };
    return { isAdmin: !!ok };
  });