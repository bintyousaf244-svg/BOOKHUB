import React, { useEffect, useState, useRef, useCallback } from "react";
import { Save, RotateCcw, Palette, Type, LayoutTemplate, Monitor, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { WebsiteContent, TextEffect, defaultWebsiteContent, resolveWebsiteContent } from "@/lib/websiteContent";
import { TEXT_EFFECT_OPTIONS } from "@/lib/textEffects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Field({
  label,
  children,
  description,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}

function TextEffectField({
  label,
  value,
  onChange,
  effectColor,
  onChangeColor,
  effectIntensity,
  onChangeIntensity,
  defaultColor = "#D97B8F",
  description,
}: {
  label: string;
  value?: TextEffect;
  onChange: (value: TextEffect) => void;
  effectColor?: string;
  onChangeColor?: (color: string) => void;
  effectIntensity?: number;
  onChangeIntensity?: (intensity: number) => void;
  defaultColor?: string;
  description?: string;
}) {
  return (
    <div className="space-y-3">
      <Field label={label} description={description}>
        <Select value={value || "none"} onValueChange={(next) => onChange(next as TextEffect)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TEXT_EFFECT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {value && value !== "none" && onChangeColor && onChangeIntensity && (
        <div className="grid grid-cols-2 gap-4 p-3 rounded-xl border bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Effect Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                className="w-10 h-10 p-1 cursor-pointer rounded-lg border-2 border-muted-foreground/20"
                value={effectColor || defaultColor}
                onChange={(e) => onChangeColor(e.target.value)}
              />
              <Input
                type="text"
                className="h-9 text-xs uppercase"
                value={effectColor || defaultColor}
                onChange={(e) => onChangeColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Effect Intensity</Label>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {effectIntensity !== undefined ? effectIntensity : 5}/10
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg appearance-none"
                value={effectIntensity !== undefined ? effectIntensity : 5}
                onChange={(e) => onChangeIntensity(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ListEditorProps<T> {
  items: T[];
  onChange: (newItems: T[]) => void;
  renderItemFields: (item: T, index: number, updateItem: (patch: Partial<T>) => void) => React.ReactNode;
  newItemTemplate: T;
  label: string;
  addButtonLabel?: string;
}

function ListEditor<T extends Record<string, any>>({
  items = [],
  onChange,
  renderItemFields,
  newItemTemplate,
  label,
  addButtonLabel = "Add Item",
}: ListEditorProps<T>) {
  const handleAdd = () => {
    onChange([...items, { ...newItemTemplate }]);
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(items.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdate = (indexToUpdate: number, patch: Partial<T>) => {
    onChange(
      items.map((item, idx) => (idx === indexToUpdate ? { ...item, ...patch } : item))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <Label className="text-base font-semibold">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
          {addButtonLabel}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No items added yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start p-4 rounded-xl border bg-muted/30 relative">
              <div className="flex-1 grid gap-4">
                {renderItemFields(item, idx, (patch) => handleUpdate(idx, patch))}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mt-6"
                onClick={() => handleRemove(idx)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StringListEditorProps {
  items: string[];
  onChange: (newItems: string[]) => void;
  label: string;
  addButtonLabel?: string;
}

function StringListEditor({
  items = [],
  onChange,
  label,
  addButtonLabel = "Add Item",
}: StringListEditorProps) {
  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleRemove = (idxToRemove: number) => {
    onChange(items.filter((_, idx) => idx !== idxToRemove));
  };

  const handleUpdate = (idxToUpdate: number, newVal: string) => {
    onChange(items.map((item, idx) => (idx === idxToUpdate ? newVal : item)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <Label className="text-base font-semibold">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
          {addButtonLabel}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No items added yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                value={item}
                placeholder="List bullet text..."
                onChange={(e) => handleUpdate(idx, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(idx)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parsePairs(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [first, ...rest] = line.split("|");
      return {
        value: first?.trim() ?? "",
        label: rest.join("|").trim(),
      };
    });
}

function parseDescriptions(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return {
        title: title?.trim() ?? "",
        description: rest.join("|").trim(),
      };
    });
}

const DRAFT_KEY = "bookhub-editor-draft";

interface EditorDraft {
  content: WebsiteContent;
  timestamp: number;
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

function loadDraft(): EditorDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EditorDraft;
    // Discard drafts older than 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      clearDraft();
      return null;
    }
    return parsed;
  } catch {
    clearDraft();
    return null;
  }
}

function saveDraft(content: WebsiteContent) {
  try {
    const draft: EditorDraft = { content, timestamp: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch { /* ignore quota errors */ }
}

export default function AdminWebsiteEditor() {
  const { toast } = useToast();
  const [form, setForm] = useState<WebsiteContent>(defaultWebsiteContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<WebsiteContent | null>(null);
  const serverDataLoaded = useRef(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Fetch server data and check for draft ---
  useEffect(() => {
    apiFetch("/api/website-content")
      .then((response) => response.json())
      .then((data) => {
        const serverContent = resolveWebsiteContent(data.content);
        setForm(serverContent);
        serverDataLoaded.current = true;

        // Check if there's a saved draft that differs from server
        const draft = loadDraft();
        if (draft && JSON.stringify(draft.content) !== JSON.stringify(serverContent)) {
          setPendingDraft(draft.content);
        } else {
          // Draft matches server data or doesn't exist — clean up
          clearDraft();
        }
      })
      .catch(() => {
        toast({ title: "Using default editor content", variant: "destructive" });
        serverDataLoaded.current = true;
        // Still check for draft even on error
        const draft = loadDraft();
        if (draft) setPendingDraft(draft.content);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- Debounced auto-save to localStorage ---
  useEffect(() => {
    // Don't persist until the server data has loaded at least once
    if (!serverDataLoaded.current) return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraft(form);
    }, 500);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [form]);

  const updateNavbar = (patch: Partial<WebsiteContent["navbar"]>) => {
    setForm((current) => ({ ...current, navbar: { ...current.navbar, ...patch } }));
  };

  const updateFooter = (patch: Partial<WebsiteContent["footer"]>) => {
    setForm((current) => ({ ...current, footer: { ...current.footer, ...patch } }));
  };

  const updateHome = <K extends keyof WebsiteContent["home"]>(
    section: K,
    patch: Partial<WebsiteContent["home"][K]>,
  ) => {
    setForm((current) => ({
      ...current,
      home: {
        ...current.home,
        [section]: {
          ...current.home[section],
          ...patch,
        },
      },
    }));
  };

  // --- Draft restoration handlers ---
  const handleRestoreDraft = useCallback(() => {
    if (pendingDraft) {
      setForm(pendingDraft);
      setPendingDraft(null);
      toast({ title: "Draft restored", description: "Your unsaved changes have been restored. Click Save to keep them." });
    }
  }, [pendingDraft, toast]);

  const handleDiscardDraft = useCallback(() => {
    setPendingDraft(null);
    clearDraft();
    toast({ title: "Draft discarded" });
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiFetch("/api/admin/website-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form }),
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      clearDraft();
      setPendingDraft(null);
      toast({ title: "Website editor saved" });
    } catch {
      toast({ title: "Failed to save website editor", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading website editor...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <Palette className="h-7 w-7 text-primary" />
            Website Editor
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Edit the public storefront from one place. This controls the shared navbar and footer plus every homepage section including layout mode, text, colors, fonts, and sizing.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => { setForm(defaultWebsiteContent); clearDraft(); setPendingDraft(null); }}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {pendingDraft && (
        <Card className="border-amber-500/40 bg-amber-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="pt-5 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Unsaved draft found</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  You have unsaved changes from a previous session. Would you like to restore them?
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={handleDiscardDraft}>
                Discard
              </Button>
              <Button size="sm" onClick={handleRestoreDraft} className="bg-amber-600 hover:bg-amber-700 text-white">
                Restore Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium flex items-center gap-2"><Monitor className="h-4 w-4" /> Shared sections</p>
            <p className="text-xs text-muted-foreground mt-1">Navbar and footer branding, colors, font family, and CTA styling.</p>
          </div>
          <div>
            <p className="text-sm font-medium flex items-center gap-2"><LayoutTemplate className="h-4 w-4" /> Layout presets</p>
            <p className="text-xs text-muted-foreground mt-1">Switch between centered, split, inline, compact, spacious, grid, and stack layouts where relevant.</p>
          </div>
          <div>
            <p className="text-sm font-medium flex items-center gap-2"><Type className="h-4 w-4" /> Typography controls</p>
            <p className="text-xs text-muted-foreground mt-1">Change font family, title size, body size, text color, and accent color section by section.</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="shared" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shared">Shared Store Sections</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="shared" className="space-y-6">
          <SectionCard title="Navbar" description="Control the top navigation branding, colors, font size, and main call-to-action button.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand Name">
                <Input value={form.navbar.brandName} onChange={(event) => updateNavbar({ brandName: event.target.value })} />
              </Field>
              <Field label="CTA Label">
                <Input value={form.navbar.ctaLabel} onChange={(event) => updateNavbar({ ctaLabel: event.target.value })} />
              </Field>
              <Field label="CTA Target URL">
                <Input value={form.navbar.ctaLink} onChange={(event) => updateNavbar({ ctaLink: event.target.value })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.navbar.backgroundColor} onChange={(event) => updateNavbar({ backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.navbar.textColor} onChange={(event) => updateNavbar({ textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.navbar.accentColor} onChange={(event) => updateNavbar({ accentColor: event.target.value })} />
              </Field>
              <Field label="CTA Background">
                <Input type="color" value={form.navbar.ctaBackgroundColor} onChange={(event) => updateNavbar({ ctaBackgroundColor: event.target.value })} />
              </Field>
              <Field label="CTA Text Color">
                <Input type="color" value={form.navbar.ctaTextColor} onChange={(event) => updateNavbar({ ctaTextColor: event.target.value })} />
              </Field>
              <Field label="Nav Font Size">
                <Input type="number" min={12} max={24} value={form.navbar.navFontSize} onChange={(event) => updateNavbar({ navFontSize: Number(event.target.value) || 14 })} />
              </Field>
              <Field label="Font Family" description="Examples: Georgia, serif or 'Trebuchet MS', sans-serif">
                <Input value={form.navbar.fontFamily} onChange={(event) => updateNavbar({ fontFamily: event.target.value })} />
              </Field>
              <TextEffectField
                label="Text Effect"
                value={form.navbar.textEffect}
                onChange={(textEffect) => updateNavbar({ textEffect })}
                effectColor={form.navbar.textEffectColor}
                onChangeColor={(textEffectColor) => updateNavbar({ textEffectColor })}
                effectIntensity={form.navbar.textEffectIntensity}
                onChangeIntensity={(textEffectIntensity) => updateNavbar({ textEffectIntensity })}
                defaultColor={form.navbar.accentColor}
                description="Applies to the brand name and navigation text."
              />
            </div>
            <div className="mt-6 pt-6 border-t">
              <ListEditor
                items={form.navbar.links || []}
                onChange={(links) => updateNavbar({ links })}
                newItemTemplate={{ href: "/new-link", label: "New Link", forceReload: false }}
                label="Navigation Links"
                addButtonLabel="Add Nav Link"
                renderItemFields={(item, idx, update) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <Field label="Label">
                      <Input value={item.label} onChange={(e) => update({ label: e.target.value })} />
                    </Field>
                    <Field label="URL Path">
                      <Input value={item.href} onChange={(e) => update({ href: e.target.value })} />
                    </Field>
                    <Field label="Force Reload">
                      <Select value={item.forceReload ? "true" : "false"} onValueChange={(val) => update({ forceReload: val === "true" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True (External/Static)</SelectItem>
                          <SelectItem value="false">False (Client Route)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Footer" description="Edit footer branding, descriptive text, muted text tone, and typography.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Brand Name">
                <Input value={form.footer.brandName} onChange={(event) => updateFooter({ brandName: event.target.value })} />
              </Field>
              <Field label="Font Family">
                <Input value={form.footer.fontFamily} onChange={(event) => updateFooter({ fontFamily: event.target.value })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.footer.backgroundColor} onChange={(event) => updateFooter({ backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.footer.textColor} onChange={(event) => updateFooter({ textColor: event.target.value })} />
              </Field>
              <Field label="Muted Text Color" description="Used for smaller footer links and descriptions.">
                <Input type="color" value={form.footer.mutedTextColor.startsWith("#") ? form.footer.mutedTextColor : "#c7c7c7"} onChange={(event) => updateFooter({ mutedTextColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.footer.accentColor} onChange={(event) => updateFooter({ accentColor: event.target.value })} />
              </Field>
              <Field label="Heading Size">
                <Input type="number" min={12} max={24} value={form.footer.headingSize} onChange={(event) => updateFooter({ headingSize: Number(event.target.value) || 14 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.footer.bodySize} onChange={(event) => updateFooter({ bodySize: Number(event.target.value) || 14 })} />
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.footer.titleEffect}
                onChange={(titleEffect) => updateFooter({ titleEffect })}
                effectColor={form.footer.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateFooter({ titleEffectColor })}
                effectIntensity={form.footer.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateFooter({ titleEffectIntensity })}
                defaultColor={form.footer.accentColor}
                description="Used for the footer brand name and column headings."
              />
              <TextEffectField
                label="Body Effect"
                value={form.footer.bodyEffect}
                onChange={(bodyEffect) => updateFooter({ bodyEffect })}
                effectColor={form.footer.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateFooter({ bodyEffectColor })}
                effectIntensity={form.footer.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateFooter({ bodyEffectIntensity })}
                defaultColor={form.footer.accentColor}
                description="Used for the footer description and link text."
              />
            </div>
            <Field label="Footer Description">
              <Textarea rows={4} value={form.footer.description} onChange={(event) => updateFooter({ description: event.target.value })} />
            </Field>

            <div className="mt-6 pt-6 border-t grid gap-6 md:grid-cols-2">
              <ListEditor
                items={form.footer.shopLinks || []}
                onChange={(shopLinks) => updateFooter({ shopLinks })}
                newItemTemplate={{ href: "/new-link", label: "New Link" }}
                label="Footer Shop Links"
                addButtonLabel="Add Shop Link"
                renderItemFields={(item, idx, update) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <Field label="Label">
                      <Input value={item.label} onChange={(e) => update({ label: e.target.value })} />
                    </Field>
                    <Field label="URL Path">
                      <Input value={item.href} onChange={(e) => update({ href: e.target.value })} />
                    </Field>
                  </div>
                )}
              />

              <ListEditor
                items={form.footer.accountLinks || []}
                onChange={(accountLinks) => updateFooter({ accountLinks })}
                newItemTemplate={{ href: "/new-link", label: "New Link" }}
                label="Footer Account Links"
                addButtonLabel="Add Account Link"
                renderItemFields={(item, idx, update) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <Field label="Label">
                      <Input value={item.label} onChange={(e) => update({ label: e.target.value })} />
                    </Field>
                    <Field label="URL Path">
                      <Input value={item.href} onChange={(e) => update({ href: e.target.value })} />
                    </Field>
                  </div>
                )}
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6">
          <SectionCard title="Hero Section" description="Edit the main storefront banner, hero layout, buttons, image, and headline typography.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow Text">
                <Input value={form.home.hero.eyebrow} onChange={(event) => updateHome("hero", { eyebrow: event.target.value })} />
              </Field>
              <Field label="Font Family">
                <Input value={form.home.hero.fontFamily} onChange={(event) => updateHome("hero", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Headline Line 1">
                <Input value={form.home.hero.titleLine1} onChange={(event) => updateHome("hero", { titleLine1: event.target.value })} />
              </Field>
              <Field label="Headline Highlight">
                <Input value={form.home.hero.titleHighlight} onChange={(event) => updateHome("hero", { titleHighlight: event.target.value })} />
              </Field>
              <Field label="Primary Button Text">
                <Input value={form.home.hero.primaryButtonLabel} onChange={(event) => updateHome("hero", { primaryButtonLabel: event.target.value })} />
              </Field>
              <Field label="Primary Button URL">
                <Input value={form.home.hero.primaryButtonLink || ""} placeholder="/books" onChange={(event) => updateHome("hero", { primaryButtonLink: event.target.value })} />
              </Field>
              <Field label="Primary Button Background Color">
                <Input type="color" value={form.home.hero.primaryButtonBgColor || form.home.hero.accentColor} onChange={(event) => updateHome("hero", { primaryButtonBgColor: event.target.value })} />
              </Field>
              <Field label="Primary Button Text Color">
                <Input type="color" value={form.home.hero.primaryButtonTextColor || form.home.hero.textColor} onChange={(event) => updateHome("hero", { primaryButtonTextColor: event.target.value })} />
              </Field>
              <Field label="Secondary Button Text">
                <Input value={form.home.hero.secondaryButtonLabel} onChange={(event) => updateHome("hero", { secondaryButtonLabel: event.target.value })} />
              </Field>
              <Field label="Secondary Button URL">
                <Input value={form.home.hero.secondaryButtonLink || ""} placeholder="/free" onChange={(event) => updateHome("hero", { secondaryButtonLink: event.target.value })} />
              </Field>
              <Field label="Secondary Button Background Color">
                <Input type="color" value={form.home.hero.secondaryButtonBgColor || "#000000"} onChange={(event) => updateHome("hero", { secondaryButtonBgColor: event.target.value === "#000000" ? undefined : event.target.value })} />
              </Field>
              <Field label="Secondary Button Text Color">
                <Input type="color" value={form.home.hero.secondaryButtonTextColor || form.home.hero.textColor} onChange={(event) => updateHome("hero", { secondaryButtonTextColor: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.hero.layout} onValueChange={(value) => updateHome("hero", { layout: value as WebsiteContent["home"]["hero"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left aligned</SelectItem>
                    <SelectItem value="center">Centered</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.hero.titleEffect}
                onChange={(titleEffect) => updateHome("hero", { titleEffect })}
                effectColor={form.home.hero.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("hero", { titleEffectColor })}
                effectIntensity={form.home.hero.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("hero", { titleEffectIntensity })}
                defaultColor={form.home.hero.accentColor}
                description="Used for the main hero heading."
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.hero.bodyEffect}
                onChange={(bodyEffect) => updateHome("hero", { bodyEffect })}
                effectColor={form.home.hero.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("hero", { bodyEffectColor })}
                effectIntensity={form.home.hero.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("hero", { bodyEffectIntensity })}
                defaultColor={form.home.hero.accentColor}
                description="Used for the hero description text."
              />
              <Field label="Title Size">
                <Input type="number" min={32} max={84} value={form.home.hero.titleSize} onChange={(event) => updateHome("hero", { titleSize: Number(event.target.value) || 56 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={14} max={28} value={form.home.hero.bodySize} onChange={(event) => updateHome("hero", { bodySize: Number(event.target.value) || 20 })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.hero.backgroundColor} onChange={(event) => updateHome("hero", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.hero.textColor} onChange={(event) => updateHome("hero", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.hero.accentColor} onChange={(event) => updateHome("hero", { accentColor: event.target.value })} />
              </Field>
              <Field label="Background Image URL">
                <Input value={form.home.hero.backgroundImage} onChange={(event) => updateHome("hero", { backgroundImage: event.target.value })} />
              </Field>
              <Field label="Background Image Opacity" description="Use 1 for a fully visible photo or lower it for a softer background.">
                <Input type="number" min={0} max={1} step={0.05} value={form.home.hero.backgroundImageOpacity} onChange={(event) => updateHome("hero", { backgroundImageOpacity: Number(event.target.value) || 0 })} />
              </Field>
              <Field label="Overlay CSS" description="Accepts solid colors or CSS gradients.">
                <Input value={form.home.hero.overlayColor} onChange={(event) => updateHome("hero", { overlayColor: event.target.value })} />
              </Field>
              <Field label="Overlay Opacity" description="Set to 0 to remove the overlay completely.">
                <Input type="number" min={0} max={1} step={0.05} value={form.home.hero.overlayOpacity} onChange={(event) => updateHome("hero", { overlayOpacity: Number(event.target.value) || 0 })} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={4} value={form.home.hero.description} onChange={(event) => updateHome("hero", { description: event.target.value })} />
            </Field>
            <div className="mt-6 pt-6 border-t">
              <ListEditor
                items={form.home.hero.stats || []}
                onChange={(stats) => updateHome("hero", { stats })}
                newItemTemplate={{ value: "100+", label: "New Stat" }}
                label="Hero Stats List"
                addButtonLabel="Add Stat Card"
                renderItemFields={(item, idx, update) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <Field label="Value (e.g. 100+)">
                      <Input value={item.value} onChange={(e) => update({ value: e.target.value })} />
                    </Field>
                    <Field label="Label">
                      <Input value={item.label} onChange={(e) => update({ label: e.target.value })} />
                    </Field>
                  </div>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Trust Strip" description="Update the highlight cards under the hero and switch between card and inline layouts.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Section Title">
                <Input value={form.home.trust.title} onChange={(event) => updateHome("trust", { title: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.trust.layout} onValueChange={(value) => updateHome("trust", { layout: value as WebsiteContent["home"]["trust"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.trust.backgroundColor} onChange={(event) => updateHome("trust", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Card Background">
                <Input type="color" value={form.home.trust.cardBackgroundColor} onChange={(event) => updateHome("trust", { cardBackgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.trust.textColor} onChange={(event) => updateHome("trust", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.trust.accentColor} onChange={(event) => updateHome("trust", { accentColor: event.target.value })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={18} max={40} value={form.home.trust.titleSize} onChange={(event) => updateHome("trust", { titleSize: Number(event.target.value) || 26 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={22} value={form.home.trust.bodySize} onChange={(event) => updateHome("trust", { bodySize: Number(event.target.value) || 14 })} />
              </Field>
              <Field label="Font Family">
                <Input value={form.home.trust.fontFamily} onChange={(event) => updateHome("trust", { fontFamily: event.target.value })} />
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.trust.titleEffect}
                onChange={(titleEffect) => updateHome("trust", { titleEffect })}
                effectColor={form.home.trust.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("trust", { titleEffectColor })}
                effectIntensity={form.home.trust.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("trust", { titleEffectIntensity })}
                defaultColor={form.home.trust.accentColor}
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.trust.bodyEffect}
                onChange={(bodyEffect) => updateHome("trust", { bodyEffect })}
                effectColor={form.home.trust.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("trust", { bodyEffectColor })}
                effectIntensity={form.home.trust.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("trust", { bodyEffectIntensity })}
                defaultColor={form.home.trust.accentColor}
                description="Applies to trust card titles and descriptions."
              />
            </div>
            <div className="mt-6 pt-6 border-t">
              <ListEditor
                items={form.home.trust.items || []}
                onChange={(items) => updateHome("trust", { items })}
                newItemTemplate={{ title: "New Item", description: "Description here", iconName: "GraduationCap" }}
                label="Trust Highlight Items"
                addButtonLabel="Add Item"
                renderItemFields={(item, idx, update) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <Field label="Title">
                      <Input value={item.title} onChange={(e) => update({ title: e.target.value })} />
                    </Field>
                    <Field label="Description">
                      <Input value={item.description} onChange={(e) => update({ description: e.target.value })} />
                    </Field>
                    <Field label="Icon Component">
                      <Select value={item.iconName || "GraduationCap"} onValueChange={(val) => update({ iconName: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GraduationCap">Graduation Cap</SelectItem>
                          <SelectItem value="BookHeart">Book Heart</SelectItem>
                          <SelectItem value="ShieldCheck">Shield Check</SelectItem>
                          <SelectItem value="Star">Star</SelectItem>
                          <SelectItem value="Sparkles">Sparkles</SelectItem>
                          <SelectItem value="Heart">Heart</SelectItem>
                          <SelectItem value="BookOpen">Book Open</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Category Cards" description="Control the age-based cards, titles, card descriptions, colors, and grid/stack layout.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow">
                <Input value={form.home.categories.eyebrow} onChange={(event) => updateHome("categories", { eyebrow: event.target.value })} />
              </Field>
              <Field label="Section Title">
                <Input value={form.home.categories.title} onChange={(event) => updateHome("categories", { title: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.categories.layout} onValueChange={(value) => updateHome("categories", { layout: value as WebsiteContent["home"]["categories"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="stack">Stack</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Font Family">
                <Input value={form.home.categories.fontFamily} onChange={(event) => updateHome("categories", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={18} max={56} value={form.home.categories.titleSize} onChange={(event) => updateHome("categories", { titleSize: Number(event.target.value) || 38 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.home.categories.bodySize} onChange={(event) => updateHome("categories", { bodySize: Number(event.target.value) || 14 })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.categories.backgroundColor} onChange={(event) => updateHome("categories", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.categories.textColor} onChange={(event) => updateHome("categories", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.categories.accentColor} onChange={(event) => updateHome("categories", { accentColor: event.target.value })} />
              </Field>
              <Field label="Kids Title">
                <Input value={form.home.categories.kidsTitle} onChange={(event) => updateHome("categories", { kidsTitle: event.target.value })} />
              </Field>
              <Field label="Adults Title">
                <Input value={form.home.categories.adultsTitle} onChange={(event) => updateHome("categories", { adultsTitle: event.target.value })} />
              </Field>
              <Field label="Kids Card Background" description="Supports gradients.">
                <Input value={form.home.categories.kidsBackground} onChange={(event) => updateHome("categories", { kidsBackground: event.target.value })} />
              </Field>
              <Field label="Adults Card Background" description="Supports gradients.">
                <Input value={form.home.categories.adultsBackground} onChange={(event) => updateHome("categories", { adultsBackground: event.target.value })} />
              </Field>
              <Field label="Kids Text Color">
                <Input type="color" value={form.home.categories.kidsTextColor || "#ffffff"} onChange={(event) => updateHome("categories", { kidsTextColor: event.target.value })} />
              </Field>
              <Field label="Adults Text Color">
                <Input type="color" value={form.home.categories.adultsTextColor || "#ffffff"} onChange={(event) => updateHome("categories", { adultsTextColor: event.target.value })} />
              </Field>
              <Field label="Kids Link URL">
                <Input value={form.home.categories.kidsLink || ""} placeholder="/books?ageGroup=Kids" onChange={(event) => updateHome("categories", { kidsLink: event.target.value })} />
              </Field>
              <Field label="Adults Link URL">
                <Input value={form.home.categories.adultsLink || ""} placeholder="/books?ageGroup=Adults" onChange={(event) => updateHome("categories", { adultsLink: event.target.value })} />
              </Field>
            </div>
            <div className="mt-6 pt-6 border-t">
              <Label className="text-base font-semibold mb-4 block">Card Background Images &amp; Overlays</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Kids Background Image URL" description="URL/path to background image for the Kids card.">
                  <Input value={form.home.categories.kidsBackgroundImage || ""} placeholder="/kids-learning-bg.png" onChange={(event) => updateHome("categories", { kidsBackgroundImage: event.target.value })} />
                </Field>
                <Field label="Kids Background Image Opacity" description="0 = hidden, 1 = fully visible">
                  <Input type="number" min={0} max={1} step={0.05} value={form.home.categories.kidsBackgroundImageOpacity ?? 0.45} onChange={(event) => updateHome("categories", { kidsBackgroundImageOpacity: Number(event.target.value) })} />
                </Field>
                <Field label="Kids Overlay Color" description="Supports gradients.">
                  <Input value={form.home.categories.kidsOverlayColor || ""} placeholder="linear-gradient(135deg, #582C6F 50%, #3a1d49 100%)" onChange={(event) => updateHome("categories", { kidsOverlayColor: event.target.value })} />
                </Field>
                <Field label="Kids Overlay Opacity" description="0 = no overlay, 1 = fully opaque">
                  <Input type="number" min={0} max={1} step={0.05} value={form.home.categories.kidsOverlayOpacity ?? 0} onChange={(event) => updateHome("categories", { kidsOverlayOpacity: Number(event.target.value) })} />
                </Field>
                <Field label="Adults Background Image URL" description="URL/path to background image for the Adults card.">
                  <Input value={form.home.categories.adultsBackgroundImage || ""} placeholder="/adults-learning-bg.png" onChange={(event) => updateHome("categories", { adultsBackgroundImage: event.target.value })} />
                </Field>
                <Field label="Adults Background Image Opacity" description="0 = hidden, 1 = fully visible">
                  <Input type="number" min={0} max={1} step={0.05} value={form.home.categories.adultsBackgroundImageOpacity ?? 0.45} onChange={(event) => updateHome("categories", { adultsBackgroundImageOpacity: Number(event.target.value) })} />
                </Field>
                <Field label="Adults Overlay Color" description="Supports gradients.">
                  <Input value={form.home.categories.adultsOverlayColor || ""} placeholder="linear-gradient(135deg, #416D53 50%, #2d4d3a 100%)" onChange={(event) => updateHome("categories", { adultsOverlayColor: event.target.value })} />
                </Field>
                <Field label="Adults Overlay Opacity" description="0 = no overlay, 1 = fully opaque">
                  <Input type="number" min={0} max={1} step={0.05} value={form.home.categories.adultsOverlayOpacity ?? 0} onChange={(event) => updateHome("categories", { adultsOverlayOpacity: Number(event.target.value) })} />
                </Field>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t grid gap-4 md:grid-cols-2">
              <TextEffectField
                label="Title Effect"
                value={form.home.categories.titleEffect}
                onChange={(titleEffect) => updateHome("categories", { titleEffect })}
                effectColor={form.home.categories.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("categories", { titleEffectColor })}
                effectIntensity={form.home.categories.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("categories", { titleEffectIntensity })}
                defaultColor={form.home.categories.accentColor}
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.categories.bodyEffect}
                onChange={(bodyEffect) => updateHome("categories", { bodyEffect })}
                effectColor={form.home.categories.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("categories", { bodyEffectColor })}
                effectIntensity={form.home.categories.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("categories", { bodyEffectIntensity })}
                defaultColor={form.home.categories.accentColor}
                description="Applies to the category card titles and descriptions."
              />
            </div>
            <Field label="Kids Description">
              <Textarea rows={3} value={form.home.categories.kidsDescription} onChange={(event) => updateHome("categories", { kidsDescription: event.target.value })} />
            </Field>
            <Field label="Adults Description">
              <Textarea rows={3} value={form.home.categories.adultsDescription} onChange={(event) => updateHome("categories", { adultsDescription: event.target.value })} />
            </Field>
          </SectionCard>

          <SectionCard title="Featured Collection" description="Adjust the featured books block text, layout density, colors, and font sizes.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow">
                <Input value={form.home.featured.eyebrow} onChange={(event) => updateHome("featured", { eyebrow: event.target.value })} />
              </Field>
              <Field label="Section Title">
                <Input value={form.home.featured.title} onChange={(event) => updateHome("featured", { title: event.target.value })} />
              </Field>
              <Field label="Button Label">
                <Input value={form.home.featured.buttonLabel} onChange={(event) => updateHome("featured", { buttonLabel: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.featured.layout} onValueChange={(value) => updateHome("featured", { layout: value as WebsiteContent["home"]["featured"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.featured.backgroundColor} onChange={(event) => updateHome("featured", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.featured.textColor} onChange={(event) => updateHome("featured", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.featured.accentColor} onChange={(event) => updateHome("featured", { accentColor: event.target.value })} />
              </Field>
              <Field label="Font Family">
                <Input value={form.home.featured.fontFamily} onChange={(event) => updateHome("featured", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={20} max={56} value={form.home.featured.titleSize} onChange={(event) => updateHome("featured", { titleSize: Number(event.target.value) || 38 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.home.featured.bodySize} onChange={(event) => updateHome("featured", { bodySize: Number(event.target.value) || 16 })} />
              </Field>
              <Field label="Button Link URL">
                <Input value={form.home.featured.buttonLink || ""} placeholder="/books" onChange={(event) => updateHome("featured", { buttonLink: event.target.value })} />
              </Field>
              <Field label="Button Background Color">
                <Input type="color" value={form.home.featured.buttonBgColor || form.home.featured.accentColor} onChange={(event) => updateHome("featured", { buttonBgColor: event.target.value })} />
              </Field>
              <Field label="Button Text Color">
                <Input type="color" value={form.home.featured.buttonTextColor || form.home.featured.textColor} onChange={(event) => updateHome("featured", { buttonTextColor: event.target.value })} />
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.featured.titleEffect}
                onChange={(titleEffect) => updateHome("featured", { titleEffect })}
                effectColor={form.home.featured.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("featured", { titleEffectColor })}
                effectIntensity={form.home.featured.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("featured", { titleEffectIntensity })}
                defaultColor={form.home.featured.accentColor}
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.featured.bodyEffect}
                onChange={(bodyEffect) => updateHome("featured", { bodyEffect })}
                effectColor={form.home.featured.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("featured", { bodyEffectColor })}
                effectIntensity={form.home.featured.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("featured", { bodyEffectIntensity })}
                defaultColor={form.home.featured.accentColor}
              />
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.featured.description} onChange={(event) => updateHome("featured", { description: event.target.value })} />
            </Field>
          </SectionCard>

          <SectionCard title="Free Resources Banner" description="Style the free-resources section including the badge, banner gradient, button label, book card size, and preview grid.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Badge">
                <Input value={form.home.freeResources.badge} onChange={(event) => updateHome("freeResources", { badge: event.target.value })} />
              </Field>
              <Field label="Section Title">
                <Input value={form.home.freeResources.title} onChange={(event) => updateHome("freeResources", { title: event.target.value })} />
              </Field>
              <Field label="Button Label">
                <Input value={form.home.freeResources.buttonLabel} onChange={(event) => updateHome("freeResources", { buttonLabel: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.freeResources.layout} onValueChange={(value) => updateHome("freeResources", { layout: value as WebsiteContent["home"]["freeResources"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Section Background">
                <Input type="color" value={form.home.freeResources.backgroundColor} onChange={(event) => updateHome("freeResources", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.freeResources.textColor} onChange={(event) => updateHome("freeResources", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.freeResources.accentColor} onChange={(event) => updateHome("freeResources", { accentColor: event.target.value })} />
              </Field>
              <Field label="Font Family">
                <Input value={form.home.freeResources.fontFamily} onChange={(event) => updateHome("freeResources", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Banner Background" description="Supports gradients.">
                <Input value={form.home.freeResources.bannerBackground} onChange={(event) => updateHome("freeResources", { bannerBackground: event.target.value })} />
              </Field>
              <Field label="Book Card Height (px)" description="Max height of each book cover in the 3×2 banner grid. Lower = smaller books.">
                <Input type="number" min={80} max={250} value={form.home.freeResources.spotlightBookHeight ?? 130} onChange={(event) => updateHome("freeResources", { spotlightBookHeight: Number(event.target.value) || 130 })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={20} max={56} value={form.home.freeResources.titleSize} onChange={(event) => updateHome("freeResources", { titleSize: Number(event.target.value) || 38 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.home.freeResources.bodySize} onChange={(event) => updateHome("freeResources", { bodySize: Number(event.target.value) || 18 })} />
              </Field>
              <Field label="Banner Layout">
                <Select value={form.home.freeResources.bannerLayout || "left"} onValueChange={(value) => updateHome("freeResources", { bannerLayout: value as "left" | "right" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left aligned layout</SelectItem>
                    <SelectItem value="right">Right aligned layout</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.freeResources.titleEffect}
                onChange={(titleEffect) => updateHome("freeResources", { titleEffect })}
                effectColor={form.home.freeResources.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("freeResources", { titleEffectColor })}
                effectIntensity={form.home.freeResources.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("freeResources", { titleEffectIntensity })}
                defaultColor={form.home.freeResources.accentColor}
                description="Applies to the free resources heading."
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.freeResources.bodyEffect}
                onChange={(bodyEffect) => updateHome("freeResources", { bodyEffect })}
                effectColor={form.home.freeResources.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("freeResources", { bodyEffectColor })}
                effectIntensity={form.home.freeResources.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("freeResources", { bodyEffectIntensity })}
                defaultColor={form.home.freeResources.accentColor}
                description="Applies to the description and bullet list."
              />
              <Field label="Background Image URL" description="URL/path to background image for the banner.">
                <Input value={form.home.freeResources.backgroundImage || ""} placeholder="/magic-book-bg.png" onChange={(event) => updateHome("freeResources", { backgroundImage: event.target.value })} />
              </Field>
              <Field label="Background Image Opacity" description="0 = hidden, 1 = fully visible">
                <Input type="number" min={0} max={1} step={0.05} value={form.home.freeResources.backgroundImageOpacity ?? 0.35} onChange={(event) => updateHome("freeResources", { backgroundImageOpacity: Number(event.target.value) })} />
              </Field>
              <Field label="Overlay Color" description="Supports gradients. Shown on top of the background image.">
                <Input value={form.home.freeResources.overlayColor || ""} placeholder="linear-gradient(135deg, #582C6F 0%, #3a1d49 100%)" onChange={(event) => updateHome("freeResources", { overlayColor: event.target.value })} />
              </Field>
              <Field label="Overlay Opacity" description="0 = no overlay, 1 = fully opaque">
                <Input type="number" min={0} max={1} step={0.05} value={form.home.freeResources.overlayOpacity ?? 0} onChange={(event) => updateHome("freeResources", { overlayOpacity: Number(event.target.value) })} />
              </Field>
              <Field label="Checkmark Color">
                <Input type="color" value={form.home.freeResources.checkmarkColor || "#bfa345"} onChange={(event) => updateHome("freeResources", { checkmarkColor: event.target.value })} />
              </Field>
              <Field label="Checkmark Text Color">
                <Input type="color" value={form.home.freeResources.checkmarkTextColor || "#ffffff"} onChange={(event) => updateHome("freeResources", { checkmarkTextColor: event.target.value })} />
              </Field>
              <Field label="Button Background Color">
                <Input type="color" value={form.home.freeResources.buttonBackgroundColor || "#4a2955"} onChange={(event) => updateHome("freeResources", { buttonBackgroundColor: event.target.value })} />
              </Field>
              <Field label="Button Text Color">
                <Input type="color" value={form.home.freeResources.buttonTextColor || "#ffffff"} onChange={(event) => updateHome("freeResources", { buttonTextColor: event.target.value })} />
              </Field>
              <Field label="Button Link URL">
                <Input value={form.home.freeResources.buttonLink || ""} placeholder="/free" onChange={(event) => updateHome("freeResources", { buttonLink: event.target.value })} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.freeResources.description} onChange={(event) => updateHome("freeResources", { description: event.target.value })} />
            </Field>
            <div className="mt-6 pt-6 border-t">
              <StringListEditor
                items={form.home.freeResources.bullets || []}
                onChange={(bullets) => updateHome("freeResources", { bullets })}
                label="Free Resources Checkmarks list"
                addButtonLabel="Add Bullet"
              />
            </div>
          </SectionCard>

          <SectionCard title="Special Deals" description="Change the sale section label, text, and how dense the deal cards appear.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Badge">
                <Input value={form.home.deals.badge} onChange={(event) => updateHome("deals", { badge: event.target.value })} />
              </Field>
              <Field label="Section Title">
                <Input value={form.home.deals.title} onChange={(event) => updateHome("deals", { title: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.deals.layout} onValueChange={(value) => updateHome("deals", { layout: value as WebsiteContent["home"]["deals"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Font Family">
                <Input value={form.home.deals.fontFamily} onChange={(event) => updateHome("deals", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.deals.backgroundColor} onChange={(event) => updateHome("deals", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.deals.textColor} onChange={(event) => updateHome("deals", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.deals.accentColor} onChange={(event) => updateHome("deals", { accentColor: event.target.value })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={20} max={56} value={form.home.deals.titleSize} onChange={(event) => updateHome("deals", { titleSize: Number(event.target.value) || 38 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.home.deals.bodySize} onChange={(event) => updateHome("deals", { bodySize: Number(event.target.value) || 16 })} />
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.deals.titleEffect}
                onChange={(titleEffect) => updateHome("deals", { titleEffect })}
                effectColor={form.home.deals.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("deals", { titleEffectColor })}
                effectIntensity={form.home.deals.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("deals", { titleEffectIntensity })}
                defaultColor={form.home.deals.accentColor}
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.deals.bodyEffect}
                onChange={(bodyEffect) => updateHome("deals", { bodyEffect })}
                effectColor={form.home.deals.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("deals", { bodyEffectColor })}
                effectIntensity={form.home.deals.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("deals", { bodyEffectIntensity })}
                defaultColor={form.home.deals.accentColor}
              />
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.deals.description} onChange={(event) => updateHome("deals", { description: event.target.value })} />
            </Field>
          </SectionCard>

          <SectionCard title="Customer Reviews" description="Manage the homepage review cards and the dedicated reviews page content.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Badge">
                <Input value={form.home.reviews.badge} onChange={(event) => updateHome("reviews", { badge: event.target.value })} />
              </Field>
              <Field label="Section Title">
                <Input value={form.home.reviews.title} onChange={(event) => updateHome("reviews", { title: event.target.value })} />
              </Field>
              <Field label="Button Label">
                <Input value={form.home.reviews.buttonLabel} onChange={(event) => updateHome("reviews", { buttonLabel: event.target.value })} />
              </Field>
              <Field label="Button Link URL">
                <Input value={form.home.reviews.buttonLink} onChange={(event) => updateHome("reviews", { buttonLink: event.target.value })} />
              </Field>
              <Field label="Font Family">
                <Input value={form.home.reviews.fontFamily} onChange={(event) => updateHome("reviews", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.reviews.backgroundColor} onChange={(event) => updateHome("reviews", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Card Background">
                <Input type="color" value={form.home.reviews.cardBackgroundColor} onChange={(event) => updateHome("reviews", { cardBackgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.reviews.textColor} onChange={(event) => updateHome("reviews", { textColor: event.target.value })} />
              </Field>
              <Field label="Accent Color">
                <Input type="color" value={form.home.reviews.accentColor} onChange={(event) => updateHome("reviews", { accentColor: event.target.value })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={20} max={56} value={form.home.reviews.titleSize} onChange={(event) => updateHome("reviews", { titleSize: Number(event.target.value) || 38 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.home.reviews.bodySize} onChange={(event) => updateHome("reviews", { bodySize: Number(event.target.value) || 16 })} />
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.reviews.titleEffect}
                onChange={(titleEffect) => updateHome("reviews", { titleEffect })}
                effectColor={form.home.reviews.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("reviews", { titleEffectColor })}
                effectIntensity={form.home.reviews.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("reviews", { titleEffectIntensity })}
                defaultColor={form.home.reviews.accentColor}
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.reviews.bodyEffect}
                onChange={(bodyEffect) => updateHome("reviews", { bodyEffect })}
                effectColor={form.home.reviews.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("reviews", { bodyEffectColor })}
                effectIntensity={form.home.reviews.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("reviews", { bodyEffectIntensity })}
                defaultColor={form.home.reviews.accentColor}
              />
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.reviews.description} onChange={(event) => updateHome("reviews", { description: event.target.value })} />
            </Field>
            <div className="mt-6 pt-6 border-t">
              <ListEditor
                items={form.home.reviews.items || []}
                onChange={(items) => updateHome("reviews", { items })}
                newItemTemplate={{
                  customerName: "Customer Name",
                  location: "City",
                  bookName: "Book Name",
                  review: "Share what the customer loved about the book.",
                  rating: 5,
                }}
                label="Customer Review Cards"
                addButtonLabel="Add Review"
                renderItemFields={(item, idx, update) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <Field label="Customer Name">
                      <Input value={item.customerName} onChange={(e) => update({ customerName: e.target.value })} />
                    </Field>
                    <Field label="Location">
                      <Input value={item.location} onChange={(e) => update({ location: e.target.value })} />
                    </Field>
                    <Field label="Book Name">
                      <Input value={item.bookName} onChange={(e) => update({ bookName: e.target.value })} />
                    </Field>
                    <Field label="Rating (1-5)">
                      <Input type="number" min={1} max={5} value={item.rating} onChange={(e) => update({ rating: Number(e.target.value) || 5 })} />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Review Text">
                        <Textarea rows={3} value={item.review} onChange={(e) => update({ review: e.target.value })} />
                      </Field>
                    </div>
                  </div>
                )}
              />
            </div>
          </SectionCard>

          <SectionCard title="Bottom CTA" description="Customize the final call-to-action block, including text, colors, and centered or split layout.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Badge">
                <Input value={form.home.cta.badge} onChange={(event) => updateHome("cta", { badge: event.target.value })} />
              </Field>
              <Field label="Section Title">
                <Input value={form.home.cta.title} onChange={(event) => updateHome("cta", { title: event.target.value })} />
              </Field>
              <Field label="Primary Button">
                <Input value={form.home.cta.primaryButtonLabel} onChange={(event) => updateHome("cta", { primaryButtonLabel: event.target.value })} />
              </Field>
              <Field label="Secondary Button">
                <Input value={form.home.cta.secondaryButtonLabel} onChange={(event) => updateHome("cta", { secondaryButtonLabel: event.target.value })} />
              </Field>
              <Field label="Layout">
                <Select value={form.home.cta.layout} onValueChange={(value) => updateHome("cta", { layout: value as WebsiteContent["home"]["cta"]["layout"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centered</SelectItem>
                    <SelectItem value="split">Split</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <TextEffectField
                label="Title Effect"
                value={form.home.cta.titleEffect}
                onChange={(titleEffect) => updateHome("cta", { titleEffect })}
                effectColor={form.home.cta.titleEffectColor}
                onChangeColor={(titleEffectColor) => updateHome("cta", { titleEffectColor })}
                effectIntensity={form.home.cta.titleEffectIntensity}
                onChangeIntensity={(titleEffectIntensity) => updateHome("cta", { titleEffectIntensity })}
                defaultColor={form.home.cta.accentColor}
                description="Applies to the CTA title."
              />
              <TextEffectField
                label="Body Effect"
                value={form.home.cta.bodyEffect}
                onChange={(bodyEffect) => updateHome("cta", { bodyEffect })}
                effectColor={form.home.cta.bodyEffectColor}
                onChangeColor={(bodyEffectColor) => updateHome("cta", { bodyEffectColor })}
                effectIntensity={form.home.cta.bodyEffectIntensity}
                onChangeIntensity={(bodyEffectIntensity) => updateHome("cta", { bodyEffectIntensity })}
                defaultColor={form.home.cta.accentColor}
                description="Applies to the CTA description."
              />
              <Field label="Font Family">
                <Input value={form.home.cta.fontFamily} onChange={(event) => updateHome("cta", { fontFamily: event.target.value })} />
              </Field>
              <Field label="Background Color">
                <Input type="color" value={form.home.cta.backgroundColor} onChange={(event) => updateHome("cta", { backgroundColor: event.target.value })} />
              </Field>
              <Field label="Text Color">
                <Input type="color" value={form.home.cta.textColor} onChange={(event) => updateHome("cta", { textColor: event.target.value })} />
              </Field>
              <Field label="Primary Accent">
                <Input type="color" value={form.home.cta.accentColor} onChange={(event) => updateHome("cta", { accentColor: event.target.value })} />
              </Field>
              <Field label="Secondary Accent">
                <Input type="color" value={form.home.cta.secondaryAccentColor} onChange={(event) => updateHome("cta", { secondaryAccentColor: event.target.value })} />
              </Field>
              <Field label="Title Size">
                <Input type="number" min={20} max={56} value={form.home.cta.titleSize} onChange={(event) => updateHome("cta", { titleSize: Number(event.target.value) || 38 })} />
              </Field>
              <Field label="Body Size">
                <Input type="number" min={12} max={24} value={form.home.cta.bodySize} onChange={(event) => updateHome("cta", { bodySize: Number(event.target.value) || 18 })} />
              </Field>
              <Field label="Primary Button URL">
                <Input value={form.home.cta.primaryButtonLink || ""} placeholder="/books" onChange={(event) => updateHome("cta", { primaryButtonLink: event.target.value })} />
              </Field>
              <Field label="Secondary Button URL">
                <Input value={form.home.cta.secondaryButtonLink || ""} placeholder="/free" onChange={(event) => updateHome("cta", { secondaryButtonLink: event.target.value })} />
              </Field>
              <Field label="Primary Button Text Color">
                <Input type="color" value={form.home.cta.primaryButtonTextColor || "#ffffff"} onChange={(event) => updateHome("cta", { primaryButtonTextColor: event.target.value })} />
              </Field>
              <Field label="Secondary Button Text Color">
                <Input type="color" value={form.home.cta.secondaryButtonTextColor || "#ffffff"} onChange={(event) => updateHome("cta", { secondaryButtonTextColor: event.target.value })} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.cta.description} onChange={(event) => updateHome("cta", { description: event.target.value })} />
            </Field>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
