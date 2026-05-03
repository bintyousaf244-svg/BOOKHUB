import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Smartphone, Building2, Wallet, MessageCircle, Globe, Share2 } from "lucide-react";

interface PaymentSettings {
  jazzcashNumber: string;
  jazzcashName: string;
  easypaisaNumber: string;
  easypaisaName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankIban: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
}

const empty: PaymentSettings = {
  jazzcashNumber: "",
  jazzcashName: "",
  easypaisaNumber: "",
  easypaisaName: "",
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
  bankIban: "",
  whatsappNumber: "",
  facebookUrl: "",
  instagramUrl: "",
  websiteUrl: "",
};

export default function AdminPaymentSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState<PaymentSettings>(empty);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((r) => r.json())
      .then((data) => { setForm({ ...empty, ...data }); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const r = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      toast({ title: "Payment settings saved" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const f = (key: keyof PaymentSettings) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-foreground">Payment Settings</h1>
        <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground">
          <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        These details are shown to customers at checkout so they know where to send payment.
      </p>

      {/* JazzCash */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" /> JazzCash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>JazzCash Mobile Number</Label>
            <Input placeholder="03XX-XXXXXXX" {...f("jazzcashNumber")} />
          </div>
          <div className="space-y-1.5">
            <Label>Account Name (Optional)</Label>
            <Input placeholder="Name on the account" {...f("jazzcashName")} />
          </div>
        </CardContent>
      </Card>

      {/* EasyPaisa */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" /> EasyPaisa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>EasyPaisa Mobile Number</Label>
            <Input placeholder="03XX-XXXXXXX" {...f("easypaisaNumber")} />
          </div>
          <div className="space-y-1.5">
            <Label>Account Name (Optional)</Label>
            <Input placeholder="Name on the account" {...f("easypaisaName")} />
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" /> Bank Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Bank Name</Label>
            <Input placeholder="e.g. Meezan Bank" {...f("bankName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Account Number</Label>
            <Input placeholder="0123-4567890123" {...f("bankAccountNumber")} />
          </div>
          <div className="space-y-1.5">
            <Label>Account Holder Name</Label>
            <Input placeholder="Full name on bank account" {...f("bankAccountName")} />
          </div>
          <div className="space-y-1.5">
            <Label>IBAN (Optional)</Label>
            <Input placeholder="PK36SCBL0000001123456702" {...f("bankIban")} />
          </div>
        </CardContent>
      </Card>

      {/* Social & Website Links */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-primary" /> Social Media & Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded-sm bg-[#1877f2]" /> Facebook Page URL
            </Label>
            <Input placeholder="https://facebook.com/yourpage" {...f("facebookUrl")} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded-sm bg-gradient-to-br from-[#f09433] to-[#dc2743]" /> Instagram Page URL
            </Label>
            <Input placeholder="https://instagram.com/yourhandle" {...f("instagramUrl")} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-muted-foreground" /> Your Website URL
            </Label>
            <Input placeholder="https://yourwebsite.com" {...f("websiteUrl")} />
          </div>
          <p className="text-xs text-muted-foreground">These links appear in the store footer so visitors can find you on social media.</p>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" /> WhatsApp Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input placeholder="03XX-XXXXXXX" {...f("whatsappNumber")} />
            <p className="text-xs text-muted-foreground">Customers will use this to send you their payment receipt. Enter with local format (e.g. 03319347345).</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="bg-primary text-primary-foreground px-8">
          <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
