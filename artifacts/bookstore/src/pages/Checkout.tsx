import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateOrder } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tag, CheckCircle, X, Loader2, Copy, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiError } from "@workspace/api-client-react";
import { BookCoverImage } from "@/components/BookCoverImage";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  address: z.string().optional(),
  city: z.string().optional(),
  paymentMethod: z.string(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function PaymentInstructions({ method, settings, total }: { method: string; settings: PaymentSettings | null; total: number }) {
  if (!settings) return null;

  const rowClass = "flex items-center justify-between py-1.5 text-sm";
  const labelClass = "text-muted-foreground";
  const valueClass = "font-semibold text-foreground flex items-center";

  if (method === "JazzCash") {
    if (!settings.jazzcashNumber) return (
      <p className="text-sm text-muted-foreground italic mt-3">JazzCash details not configured yet.</p>
    );
    return (
      <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <p className="text-sm font-semibold text-accent mb-3">Send Rs. {total.toLocaleString()} via JazzCash to:</p>
        <div className="space-y-1 divide-y divide-border/50">
          <div className={rowClass}>
            <span className={labelClass}>Mobile Number</span>
            <span className={valueClass}>{settings.jazzcashNumber}<CopyButton text={settings.jazzcashNumber} /></span>
          </div>
          {settings.jazzcashName && (
            <div className={rowClass}>
              <span className={labelClass}>Account Name</span>
              <span className={valueClass}>{settings.jazzcashName}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (method === "EasyPaisa") {
    if (!settings.easypaisaNumber) return (
      <p className="text-sm text-muted-foreground italic mt-3">EasyPaisa details not configured yet.</p>
    );
    return (
      <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <p className="text-sm font-semibold text-accent mb-3">Send Rs. {total.toLocaleString()} via EasyPaisa to:</p>
        <div className="space-y-1 divide-y divide-border/50">
          <div className={rowClass}>
            <span className={labelClass}>Mobile Number</span>
            <span className={valueClass}>{settings.easypaisaNumber}<CopyButton text={settings.easypaisaNumber} /></span>
          </div>
          {settings.easypaisaName && (
            <div className={rowClass}>
              <span className={labelClass}>Account Name</span>
              <span className={valueClass}>{settings.easypaisaName}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (method === "Bank Transfer") {
    if (!settings.bankAccountNumber) return (
      <p className="text-sm text-muted-foreground italic mt-3">Bank transfer details not configured yet.</p>
    );
    return (
      <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <p className="text-sm font-semibold text-accent mb-3">Transfer Rs. {total.toLocaleString()} to this bank account:</p>
        <div className="space-y-1 divide-y divide-border/50">
          {settings.bankName && (
            <div className={rowClass}>
              <span className={labelClass}>Bank</span>
              <span className={valueClass}>{settings.bankName}</span>
            </div>
          )}
          {settings.bankAccountName && (
            <div className={rowClass}>
              <span className={labelClass}>Account Name</span>
              <span className={valueClass}>{settings.bankAccountName}</span>
            </div>
          )}
          <div className={rowClass}>
            <span className={labelClass}>Account Number</span>
            <span className={valueClass}>{settings.bankAccountNumber}<CopyButton text={settings.bankAccountNumber} /></span>
          </div>
          {settings.bankIban && (
            <div className={rowClass}>
              <span className={labelClass}>IBAN</span>
              <span className={valueClass + " font-mono text-xs"}>{settings.bankIban}<CopyButton text={settings.bankIban} /></span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default function Checkout() {
  const { items, subtotal, clearCart, pruneUnavailableItems, syncCartWithCatalog } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState("JazzCash");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  const [discountInput, setDiscountInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMsg, setDiscountMsg] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidatingCart, setIsValidatingCart] = useState(false);

  useEffect(() => {
    apiFetch("/api/payment-settings")
      .then((r) => r.json())
      .then(setPaymentSettings)
      .catch(() => {});
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      city: "",
      paymentMethod: "JazzCash",
      paymentReference: "",
      notes: "",
    }
  });

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCode = async () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    setIsValidating(true);
    setDiscountMsg("");
    try {
      const res = await apiFetch("/api/discount-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCode(code);
        setDiscountAmount(data.discountAmount);
        setDiscountMsg(data.message);
        toast({ title: data.message });
      } else {
        setDiscountMsg(data.message);
        toast({ title: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Could not validate code", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setDiscountAmount(0);
    setDiscountInput("");
    setDiscountMsg("");
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsValidatingCart(true);

    const { availableItems, removedBookIds, unresolvedBookIds } = await syncCartWithCatalog();

    if (unresolvedBookIds.length > 0) {
      setIsValidatingCart(false);
      toast({
        title: "We could not verify your cart right now. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (removedBookIds.length > 0) {
      setIsValidatingCart(false);

      if (availableItems.length === 0) {
        toast({
          title: "Your cart was refreshed because those books are no longer available.",
          variant: "destructive",
        });
        setLocation("/cart");
        return;
      }

      toast({
        title: "Your cart was updated. Please review it and place the order again.",
        variant: "destructive",
      });
      return;
    }

    const notes = [
      data.notes,
      appliedCode ? `Discount code: ${appliedCode} (Rs. ${discountAmount} off)` : null,
    ].filter(Boolean).join(" | ");

    createOrder.mutate({
      data: {
        ...data,
        notes: notes || undefined,
        items: availableItems.map((i) => ({
          bookId: Number(i.bookId),
          quantity: Number(i.quantity),
        }))
      }
    }, {
      onSuccess: (order) => {
        setIsValidatingCart(false);
        clearCart();
        toast({ title: "Order placed successfully!" });
        setLocation(`/order-success?id=${order.id}&method=${data.paymentMethod}`);
      },
      onError: (error) => {
        setIsValidatingCart(false);
        const apiError = error as ApiError<{ error?: string; missingBookIds?: number[] }>;
        const missingBookIds = apiError?.data?.missingBookIds ?? [];

        if (missingBookIds.length > 0) {
          pruneUnavailableItems(missingBookIds);
        }

        const message =
          apiError?.data?.error ||
          error.message ||
          "Failed to place order. Please try again.";
        toast({ title: message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Order Summary — first on mobile, right column on desktop */}
        <div className="w-full lg:w-96 flex-shrink-0 lg:order-last">
          <div className="rounded-2xl border border-border shadow-md bg-card lg:sticky lg:top-24 p-5 md:p-6">
            <h2 className="text-lg font-serif font-bold mb-4 text-foreground">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.bookId} className="flex gap-3 text-sm">
                  <BookCoverImage src={item.coverImage} alt={item.title} className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-medium text-foreground line-clamp-2 text-xs leading-snug">{item.title}</span>
                    <span className="text-muted-foreground text-xs mt-1">Qty: {item.quantity}</span>
                  </div>
                  <div className="font-bold text-foreground text-xs flex-shrink-0">
                    Rs. {(item.isOnSale && item.salePrice ? item.salePrice : item.price) * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-3 border-border/50" />

            {/* Discount Code */}
            <div className="mb-4">
              {appliedCode ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800 font-mono">{appliedCode}</p>
                    <p className="text-xs text-green-600">{discountMsg}</p>
                  </div>
                  <button onClick={handleRemoveCode} className="text-green-600 hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Have a discount code?
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCode())}
                      className="font-mono uppercase text-sm"
                    />
                    <button type="button" onClick={handleApplyCode} disabled={isValidating || !discountInput.trim()}
                      className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold flex-shrink-0 disabled:opacity-50 transition-all hover:bg-muted">
                      {isValidating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {discountMsg && !appliedCode && (
                    <p className="text-xs text-destructive">{discountMsg}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCode})</span>
                  <span>− Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator className="my-2 border-border/50" />
              <div className="flex justify-between text-xl font-bold text-foreground">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Contact Info */}
              <section className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-foreground">Your Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="customerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Aisha Khan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="aisha@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Phone / WhatsApp Number</FormLabel>
                      <FormControl><Input placeholder="0300 1234567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-2 text-foreground">Payment Method</h2>
                <p className="text-sm text-muted-foreground mb-6">Select your payment method and transfer the amount shown below. Then enter your transaction ID / reference number.</p>

                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => { field.onChange(val); setPaymentMethod(val); }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {["JazzCash", "EasyPaisa", "Bank Transfer"].map((method) => (
                          <FormItem key={method} className={`flex items-center space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer transition-colors ${paymentMethod === method ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                            <FormControl><RadioGroupItem value={method} /></FormControl>
                            <FormLabel className="font-medium cursor-pointer flex-1 text-base">{method}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Inline payment instructions */}
                <PaymentInstructions method={paymentMethod} settings={paymentSettings} total={total} />

                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <FormField control={form.control} name="paymentReference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID / Reference Number</FormLabel>
                      <FormControl><Input placeholder="Enter your transaction ID after payment" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl><Textarea placeholder="Any special requests or notes..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto px-12 h-14 rounded-full bg-accent text-accent-foreground font-bold shadow-md hover:bg-accent/90"
                  disabled={createOrder.isPending || isValidatingCart}
                >
                  {createOrder.isPending || isValidatingCart ? "Placing Order..." : `Confirm Order — Rs. ${total.toLocaleString()}`}
                </Button>
              </div>
            </form>
          </Form>
        </div>

      </div>
    </div>
  );
}
