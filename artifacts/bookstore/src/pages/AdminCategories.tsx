import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, FolderOpen, Book } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  bookCount: number;
}

interface CatForm {
  name: string;
  slug: string;
}

const SUGGESTED = [
  { name: "Arabic", slug: "arabic" },
  { name: "English", slug: "english" },
  { name: "Planner", slug: "planner" },
  { name: "Articles", slug: "articles" },
  { name: "Short Books", slug: "short-books" },
  { name: "Kids Learning", slug: "kids-learning" },
  { name: "Adult Learning", slug: "adult-learning" },
  { name: "Workbooks", slug: "workbooks" },
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function fetchCategories(): Promise<Category[]> {
  const r = await apiFetch("/api/categories");
  if (!r.ok) throw new Error("Failed to fetch categories");
  return r.json();
}

export default function AdminCategories() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CatForm>({ name: "", slug: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: async (body: CatForm) => {
      const r = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Failed to create");
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category created" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: CatForm }) => {
      const r = await apiFetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "Failed to update");
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category updated" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted" });
      setDeleteConfirmId(null);
    },
    onError: () => toast({ title: "Failed to delete category", variant: "destructive" }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ name, slug: editing ? f.slug : toSlug(name) }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    if (editing) updateMutation.mutate({ id: editing.id, body: form });
    else createMutation.mutate(form);
  };

  const addSuggested = (s: { name: string; slug: string }) => {
    const exists = categories.some((c) => c.slug === s.slug);
    if (exists) {
      toast({ title: `"${s.name}" already exists`, variant: "destructive" });
      return;
    }
    createMutation.mutate(s);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const existingSlugs = new Set(categories.map((c) => c.slug));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage book categories. Each category appears as a filter on the store.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
      </div>

      {/* Quick-add suggestions */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Quick Add Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s.slug}
                onClick={() => addSuggested(s)}
                disabled={existingSlugs.has(s.slug) || createMutation.isPending}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  existingSlugs.has(s.slug)
                    ? "border-border text-muted-foreground bg-muted cursor-not-allowed opacity-60"
                    : "border-primary/40 text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {existingSlugs.has(s.slug) ? "✓ " : "+ "}
                {s.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category list */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading categories…</p>
      ) : categories.length === 0 ? (
        <Card className="border-border shadow-sm">
          <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-semibold text-foreground">No categories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use Quick Add above or click "New Category" to create your first one.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-border shadow-sm group hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{cat.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {cat.slug}
                    </code>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Book className="h-3 w-3" /> {cat.bookCount}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteConfirmId(cat.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input
                placeholder="e.g. Short Books"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Slug{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (used in URLs & filters)
                </span>
              </Label>
              <Input
                placeholder="e.g. short-books"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, hyphens only. Auto-filled from name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !form.name.trim() || !form.slug.trim()}
              className="bg-primary text-primary-foreground"
            >
              {isSaving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This removes the category from the list. Books that use this category will keep their
            category value but it won't appear as a filter until you re-add it.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirmId !== null && deleteMutation.mutate(deleteConfirmId)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
