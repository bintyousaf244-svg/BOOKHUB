import React, { useEffect, useState } from "react";
import { Save, RotateCcw, Palette, Type, LayoutTemplate, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { WebsiteContent, defaultWebsiteContent, resolveWebsiteContent } from "@/lib/websiteContent";
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

export default function AdminWebsiteEditor() {
  const { toast } = useToast();
  const [form, setForm] = useState<WebsiteContent>(defaultWebsiteContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/website-content")
      .then((response) => response.json())
      .then((data) => setForm(resolveWebsiteContent(data.content)))
      .catch(() => {
        toast({ title: "Using default editor content", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  }, []);

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
            onClick={() => setForm(defaultWebsiteContent)}
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
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.featured.description} onChange={(event) => updateHome("featured", { description: event.target.value })} />
            </Field>
          </SectionCard>

          <SectionCard title="Free Resources Banner" description="Style the free-resources section including the badge, banner gradient, button label, and preview grid density.">
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
              <Field label="Desktop Orbit Books" description="Total books shown in the desktop circular showcase, including the center book.">
                <Input type="number" min={1} max={7} value={form.home.freeResources.spotlightDesktopCount} onChange={(event) => updateHome("freeResources", { spotlightDesktopCount: Number(event.target.value) || 7 })} />
              </Field>
              <Field label="Mobile Orbit Books" description="Total books shown in the mobile circular showcase.">
                <Input type="number" min={1} max={6} value={form.home.freeResources.spotlightMobileCount} onChange={(event) => updateHome("freeResources", { spotlightMobileCount: Number(event.target.value) || 6 })} />
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
            </div>
            <Field label="Description">
              <Textarea rows={3} value={form.home.deals.description} onChange={(event) => updateHome("deals", { description: event.target.value })} />
            </Field>
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
