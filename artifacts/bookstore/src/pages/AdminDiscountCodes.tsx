import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Tag, Copy, Check } from "lucide-react";

interface DiscountCode {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface CodeForm {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minOrderAmount: string;
  maxUses: string;
  isActive: boolean;
  expiresAt: string;
}

const emptyForm: CodeForm = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  isActive: true,
  expiresAt: "",
};

const API = "/api";

async function fetchCodes(): Promise<DiscountCode[]> {
  const r = await fetch(`${API}/admin/discount-codes`);
  return r.json();
}

export default function AdminDiscountCodes() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<CodeForm>(emptyForm);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: codes = [], isLoading } = useQuery({ queryKey: ["discount-codes"], queryFn: fetchCodes });

  const createMutation = useMutation({
    mutationFn: async (body: object) => {
      const r = await fetch(`${API}/admin/discount-codes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed to create");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discount-codes"] }); toast({ title: "Discount code created" }); setDialogOpen(false); },
    onError: () => toast({ title: "Failed to create code", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: object }) => {
      const r = await fetch(`${API}/admin/discount-codes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed to update");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discount-codes"] }); toast({ title: "Discount code updated" }); setDialogOpen(false); },
    onError: () => toast({ title: "Failed to update code", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API}/admin/discount-codes/${id}`, { method: "DELETE" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discount-codes"] }); toast({ title: "Code deleted" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const r = await fetch(`${API}/admin/discount-codes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discount-codes"] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: DiscountCode) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      isActive: form.isActive,
      expiresAt: form.expiresAt || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, body });
    else createMutation.mutate(body);
  };

  const copyCode = (code: DiscountCode) => {
    navigator.clipboard.writeText(code.code);
    setCopiedId(code.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-foreground">Discount Codes</h1>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> New Code
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : codes.length === 0 ? (
        <Card className="border-border shadow-sm">
          <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
            <Tag className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-semibold text-foreground">No discount codes yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first code to offer discounts at checkout.</p>
            </div>
            <Button onClick={openCreate} variant="outline">Create a Code</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => (
            <Card key={c.id} className="border-border shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground text-lg tracking-widest">{c.code}</span>
                    <button onClick={() => copyCode(c)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copiedId === c.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {c.type === "percentage" ? `${c.value}% off` : `Rs. ${c.value} off`}
                    </Badge>
                    {c.minOrderAmount ? <span className="text-xs text-muted-foreground">Min Rs. {c.minOrderAmount}</span> : null}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Used: {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</span>
                    {c.expiresAt && <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={c.isActive}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: c.id, isActive: v })}
                      className="scale-90"
                    />
                    <span className="text-sm text-muted-foreground">{c.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Discount Code" : "Create Discount Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="font-mono tracking-widest uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "percentage" | "fixed" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (Rs.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{form.type === "percentage" ? "Discount %" : "Discount Rs."}</Label>
                <Input type="number" min="0" placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 200"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Min. Order (Rs.) <span className="text-muted-foreground text-xs">Optional</span></Label>
                <Input type="number" min="0" placeholder="0" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Max Uses <span className="text-muted-foreground text-xs">Optional</span></Label>
                <Input type="number" min="1" placeholder="Unlimited" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date <span className="text-muted-foreground text-xs">Optional</span></Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active (visible at checkout)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !form.code || !form.value} className="bg-primary text-primary-foreground">
              {isSaving ? "Saving..." : editing ? "Update Code" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
