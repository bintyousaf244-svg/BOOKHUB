import React from "react";
import { Link, useLocation } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Copy, Wallet, Building2, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function OrderSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const idStr = searchParams.get("id");
  const method = searchParams.get("method") || "Bank Transfer";
  const orderId = idStr ? parseInt(idStr, 10) : 0;
  const { toast } = useToast();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (!idStr) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold">Invalid Order</h1>
        <Link href="/"><Button className="mt-4">Return Home</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
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
        <p className="text-lg text-muted-foreground">Thank you for your purchase, {order.customerName}. Your order #{order.id} is now {order.status}.</p>
      </div>

      <div className="bg-secondary/30 rounded-2xl p-6 md:p-10 border border-border mb-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
          <Wallet className="text-accent h-6 w-6" /> Payment Instructions
        </h2>
        
        {method === "Bank Transfer" && (
          <div className="space-y-4">
            <p className="text-foreground">Please transfer <strong>Rs. {order.total}</strong> to the following bank account:</p>
            <Card className="bg-card border-accent/20">
              <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Bank Name</span>
                  <span className="font-bold flex items-center gap-2"><Building2 className="h-4 w-4" /> Meezan Bank</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Account Title</span>
                  <span className="font-bold">Al-Qalam Bookstore</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground block mb-1">IBAN / Account Number</span>
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded border border-border">
                    <span className="font-mono text-lg tracking-wider">PK00MEZN1234567890</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard("PK00MEZN1234567890")}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {method === "JazzCash" && (
          <div className="space-y-4">
            <p className="text-foreground">Please send <strong>Rs. {order.total}</strong> via JazzCash to:</p>
            <Card className="bg-card border-accent/20">
              <CardContent className="p-4 md:p-6">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Account Title</span>
                  <span className="font-bold">Aisha Khan</span>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground block mb-1">JazzCash Number</span>
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded border border-border">
                    <span className="font-mono text-xl tracking-wider flex items-center gap-2"><Phone className="h-5 w-5" /> 0300 1234567</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard("03001234567")}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {method === "EasyPaisa" && (
          <div className="space-y-4">
            <p className="text-foreground">Please send <strong>Rs. {order.total}</strong> via EasyPaisa to:</p>
            <Card className="bg-card border-accent/20">
              <CardContent className="p-4 md:p-6">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Account Title</span>
                  <span className="font-bold">Aisha Khan</span>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground block mb-1">EasyPaisa Number</span>
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded border border-border">
                    <span className="font-mono text-xl tracking-wider flex items-center gap-2"><Phone className="h-5 w-5" /> 0345 1234567</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard("03451234567")}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 p-4 bg-accent/10 text-foreground text-sm rounded-lg border border-accent/20">
          <strong>Important:</strong> After sending the payment, please reply to your order email or WhatsApp us with a screenshot of the transaction receipt. Your order will be shipped once payment is verified.
        </div>
      </div>

      <div className="text-center">
        <Link href="/books">
          <Button size="lg" className="rounded-full font-bold px-8">
            Continue Shopping <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
