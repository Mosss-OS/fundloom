import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import {
  fetchAllPartners,
  upsertPartner,
  deletePartner,
  reorderPartners,
  togglePartnerActive,
  uploadPartnerLogo,
  isCurrentUserAdmin,
  type AdminPartner,
} from "@/functions/partners.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({
    meta: [
      { title: "Partners — Admin · Fundloom" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPartnersPage,
});

function AdminPartnersPage() {
  const { user, loading } = useFundloomAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editing, setEditing] = useState<AdminPartner | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminPartner | null>(null);

  // Auth + admin gate
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    isCurrentUserAdmin({ data: { actorUserId: user.id } })
      .then((r) => {
        setIsAdmin(r.isAdmin);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [loading, user, navigate]);

  const refresh = async () => {
    if (!user) return;
    setLoadingList(true);
    try {
      const rows = await fetchAllPartners({ data: { actorUserId: user.id } });
      setPartners(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isAdmin && user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user]);

  const move = async (index: number, dir: -1 | 1) => {
    if (!user) return;
    const next = [...partners];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPartners(next);
    try {
      await reorderPartners({
        data: { actorUserId: user.id, orderedIds: next.map((p) => p.id) },
      });
    } catch (e) {
      toast.error("Reorder failed");
      refresh();
    }
  };

  const onToggle = async (p: AdminPartner) => {
    if (!user) return;
    setPartners((prev) => prev.map((r) => (r.id === p.id ? { ...r, is_active: !p.is_active } : r)));
    try {
      await togglePartnerActive({
        data: { actorUserId: user.id, id: p.id, isActive: !p.is_active },
      });
    } catch {
      toast.error("Update failed");
      refresh();
    }
  };

  const onDelete = async () => {
    if (!user || !confirmDelete) return;
    try {
      await deletePartner({ data: { actorUserId: user.id, id: confirmDelete.id } });
      toast.success("Partner deleted");
      setConfirmDelete(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading || checking) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <p className="text-sm text-ink-soft">Loading…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <h1 className="font-display text-3xl text-ink">Not authorized</h1>
        <p className="mt-3 text-ink-soft">You need an admin role to manage partners.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Admin</span>
          <h1 className="mt-2 font-display text-4xl text-ink">Partners</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Manage the sponsor & partner logos shown on the landing marquee.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-ink px-5 text-canvas hover:bg-ink/90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New partner
        </Button>
      </motion.header>

      <div className="rounded-3xl bg-paper hairline overflow-hidden">
        <div className="hidden grid-cols-[60px_72px_1fr_1fr_120px_140px] items-center gap-4 px-6 py-3 text-xs uppercase tracking-wider text-ink-soft md:grid">
          <span>Order</span>
          <span>Logo</span>
          <span>Name</span>
          <span>URL</span>
          <span>Active</span>
          <span className="text-right">Actions</span>
        </div>
        {loadingList ? (
          <div className="px-6 py-12 text-center text-sm text-ink-soft">Loading…</div>
        ) : partners.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-xl text-ink">No partners yet</p>
            <p className="mt-1 text-sm text-ink-soft">
              Create your first sponsor to populate the marquee.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line/60">
            {partners.map((p, i) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[60px_72px_1fr_1fr_120px_140px] md:items-center md:gap-4"
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-md p-1 text-ink-soft transition hover:bg-canvas hover:text-ink disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === partners.length - 1}
                    className="rounded-md p-1 text-ink-soft transition hover:bg-canvas hover:text-ink disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-canvas hairline">
                  {p.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      className="max-h-10 max-w-14 object-contain"
                    />
                  ) : (
                    <span className="font-display text-xs text-ink-soft">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-soft md:hidden">{p.url ?? "—"}</p>
                </div>
                <div className="hidden truncate text-sm text-ink-soft md:block">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-ink">
                      {p.url}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={p.is_active} onCheckedChange={() => onToggle(p)} />
                  <span className="text-xs text-ink-soft">{p.is_active ? "Live" : "Hidden"}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-full bg-canvas px-3 py-1.5 text-xs text-ink hairline transition hover:bg-ink hover:text-canvas"
                  >
                    <Pencil className="mr-1 inline h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="rounded-full bg-canvas px-3 py-1.5 text-xs text-ink hairline transition hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PartnerFormDialog
        open={creating || !!editing}
        partner={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSaved={() => {
          setEditing(null);
          setCreating(false);
          refresh();
        }}
        actorUserId={user?.id ?? ""}
        nextOrder={partners.length}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this partner?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.name} will be removed from the landing marquee. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function PartnerFormDialog({
  open,
  partner,
  onClose,
  onSaved,
  actorUserId,
  nextOrder,
}: {
  open: boolean;
  partner: AdminPartner | null;
  onClose: () => void;
  onSaved: () => void;
  actorUserId: string;
  nextOrder: number;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const isEdit = !!partner;
  const title = useMemo(() => (isEdit ? "Edit partner" : "New partner"), [isEdit]);

  useEffect(() => {
    if (!open) return;
    setName(partner?.name ?? "");
    setUrl(partner?.url ?? "");
    setLogoUrl(partner?.logo_url ?? null);
    setOrder(partner?.display_order ?? nextOrder);
    setActive(partner?.is_active ?? true);
  }, [open, partner, nextOrder]);

  const handleFile = async (file: File) => {
    if (!actorUserId) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Logo must be under 4MB");
      return;
    }
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const base64 = btoa(bin);
      const res = await uploadPartnerLogo({
        data: {
          actorUserId,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          base64,
        },
      });
      setLogoUrl(res.url);
      toast.success("Logo uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await upsertPartner({
        data: {
          actorUserId,
          id: partner?.id,
          name: name.trim(),
          url: url.trim() || undefined,
          logo_url: logoUrl,
          display_order: order,
          is_active: active,
        },
      });
      toast.success(isEdit ? "Partner updated" : "Partner created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coinbase"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-url">Link URL</Label>
            <Input
              id="p-url"
              type="url"
              value={url}
              maxLength={500}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-canvas hairline">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="logo preview"
                    className="max-h-12 max-w-20 object-contain"
                  />
                ) : (
                  <span className="text-xs text-ink-soft">No logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload image"}
                </Button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="inline-flex items-center text-xs text-ink-soft hover:text-ink"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Remove logo
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-ink-soft">
              PNG, JPG, SVG or WebP. Max 4MB. Transparent backgrounds work best.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-order">Display order</Label>
              <Input
                id="p-order"
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-end gap-3 pb-2">
              <Switch checked={active} onCheckedChange={setActive} id="p-active" />
              <Label htmlFor="p-active" className="cursor-pointer">
                {active ? "Active" : "Hidden"}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || uploading}
            className="bg-ink text-canvas hover:bg-ink/90"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
