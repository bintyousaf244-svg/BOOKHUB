import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Copy, Check, Wallet, Building2, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PaymentSettings {
  jazzcashNumber: string;
  jazzcashName: string;
  easypaisaNumber: string;
  easypaisaName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankIban: string;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <span className="text-sm text-muted-foreground block mb-1">{label}</span>
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded border border-border">
        <span className="font-mono text-lg tracking-wider">{value}</span>
        <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function PaymentBlock({ method, settings, total }: { method: string; settings: PaymentSettings; total: number }) {
  if (method === "JazzCash") {
    if (!settings.jazzcashNumber) return (
      <p className="text-muted-foreground italic">JazzCash payment details have not been configured yet. Please contact us directly.</p>
    );
    return (
      <div className="space-y-4">
        <p className="text-foreground">Please send <strong>Rs. {total.toLocaleString()}</strong> via JazzCash to:</p>
        <Card className="bg-card border-accent/20">
          <CardContent className="p-4 md:p-6 space-y-4">
            {settings.jazzcashName && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Account Name</span>
                <span className="font-bold flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.jazzcashName}</span>
              </div>
            )}
            <CopyField label="JazzCash Number" value={settings.jazzcashNumber} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (method === "EasyPaisa") {
    if (!settings.easypaisaNumber) return (
      <p className="text-muted-foreground italic">EasyPaisa payment details have not been configured yet. Please contact us directly.</p>
    );
    return (
      <div className="space-y-4">
        <p className="text-foreground">Please send <strong>Rs. {total.toLocaleString()}</strong> via EasyPaisa to:</p>
        <Card className="bg-card border-accent/20">
          <CardContent className="p-4 md:p-6 space-y-4">
            {settings.easypaisaName && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Account Name</span>
                <span className="font-bold flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.easypaisaName}</span>
              </div>
            )}
            <CopyField label="EasyPaisa Number" value={settings.easypaisaNumber} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (method === "Bank Transfer") {
    if (!settings.bankAccountNumber) return (
      <p className="text-muted-foreground italic">Bank transfer details have not been configured yet. Please contact us directly.</p>
    );
    return (
      <div className="space-y-4">
        <p className="text-foreground">Please transfer <strong>Rs. {total.toLocaleString()}</strong> to this bank account:</p>
        <Card className="bg-card border-accent/20">
          <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.bankName && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Bank Name</span>
                <span className="font-bold flex items-center gap-2"><Building2 className="h-4 w-4" /> {settings.bankName}</span>
              </div>
            )}
            {settings.bankAccountName && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Account Title</span>
                <span className="font-bold">{settings.bankAccountName}</span>
              </div>
            )}
            <div className="md:col-span-2">
              <CopyField label="Account Number" value={settings.bankAccountNumber} />
            </div>
            {settings.bankIban && (
              <div className="md:col-span-2">
                <CopyField label="IBAN" value={settings.bankIban} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default function OrderSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const idStr = searchParams.get("id");
  const method = searchParams.get("method") || "Bank Transfer";
  const orderId = idStr ? parseInt(idStr, 10) : 0;
  const { toast } = useToast();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((r) => r.json())
      .then(setPaymentSettings)
      .catch(() => {});
  }, []);

  if (!idStr) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold">Invalid Order</h1>
        <Link href="/"><Button className="mt-4">Return Home</Button></Link>
      </div>
    );
  }

  if (isLoading || !paymentSettings) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-48 mx-auto mb-12" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <div className="text-center mb-12">
        <CheckCircle2 className="h-20 w-20 text-accent mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase, <strong>{order.customerName}</strong>. Your order <strong>#{order.id}</strong> has been received.
        </p>
      </div>

      <div className="bg-secondary/30 rounded-2xl p-6 md:p-10 border border-border mb-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
          <Wallet className="text-accent h-6 w-6" /> Payment Instructions
        </h2>

        <PaymentBlock method={method} settings={paymentSettings} total={order.total} />

        <div className="mt-6 p-4 bg-accent/10 text-foreground text-sm rounded-lg border border-accent/20">
          <strong>Important:</strong> After completing the payment, please WhatsApp us your transaction receipt. Your digital books will be sent to <strong>{order.customerEmail}</strong> once payment is verified.
        </div>
      </div>

      <div className="text-center">
        <Link href="/books">
          <Button size="lg" className="rounded-full font-bold px-8 bg-accent text-accent-foreground hover:bg-accent/90">
            Continue Shopping <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
