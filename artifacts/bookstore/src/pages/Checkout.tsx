import React, { useState } from "react";
import { Link, useLocation } from "wouter";
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
import { Tag, CheckCircle, X, Loader2 } from "lucide-react";

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

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

  // Discount code state
  const [discountInput, setDiscountInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMsg, setDiscountMsg] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      city: "",
      paymentMethod: "Bank Transfer",
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
      const res = await fetch("/api/discount-codes/validate", {
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

  const onSubmit = (data: CheckoutFormValues) => {
    const notes = [
      data.notes,
      appliedCode ? `Discount code: ${appliedCode} (Rs. ${discountAmount} off)` : null,
    ].filter(Boolean).join(" | ");

    createOrder.mutate({
      data: {
        ...data,
        notes: notes || undefined,
        items: items.map(i => ({ bookId: i.bookId, quantity: i.quantity }))
      }
    }, {
      onSuccess: (order) => {
        clearCart();
        toast({ title: "Order placed successfully!" });
        setLocation(`/order-success?id=${order.id}&method=${data.paymentMethod}`);
      },
      onError: () => {
        toast({ title: "Failed to place order", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Contact Info */}
              <section className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-foreground">Contact & Shipping Details</h2>
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
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="0300 1234567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 text-foreground">Payment Method</h2>
                <p className="text-sm text-muted-foreground mb-6">Please select how you would like to pay. Payment instructions will be provided on the next screen.</p>

                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => { field.onChange(val); setPaymentMethod(val); }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border border-border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <FormControl><RadioGroupItem value="Bank Transfer" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">Direct Bank Transfer</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border border-border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <FormControl><RadioGroupItem value="JazzCash" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">JazzCash</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border border-border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <FormControl><RadioGroupItem value="EasyPaisa" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">EasyPaisa</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="mt-6 pt-6 border-t border-border">
                  <FormField control={form.control} name="paymentReference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reference (Optional)</FormLabel>
                      <FormControl><Input placeholder="If you've already transferred, enter reference here" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="mt-4">
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl><Textarea placeholder="Special instructions for delivery" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto px-12 h-14 rounded-full bg-accent text-accent-foreground font-bold shadow-md hover:bg-accent/90"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Placing Order..." : `Place Order — Rs. ${total.toLocaleString()}`}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <Card className="border-border shadow-md sticky top-24 bg-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif font-bold mb-6 text-foreground">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[35vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.bookId} className="flex gap-4 text-sm">
                    <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium text-foreground line-clamp-2">{item.title}</span>
                      <span className="text-muted-foreground mt-1">Qty: {item.quantity}</span>
                    </div>
                    <div className="font-bold text-foreground">
                      Rs. {(item.isOnSale && item.salePrice ? item.salePrice : item.price) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 border-border/50" />

              {/* Discount Code Input */}
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
                      <Button type="button" variant="outline" size="sm" onClick={handleApplyCode} disabled={isValidating || !discountInput.trim()} className="px-4 flex-shrink-0">
                        {isValidating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                    {discountMsg && !appliedCode && (
                      <p className="text-xs text-destructive">{discountMsg}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
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
                <Separator className="my-3 border-border/50" />
                <div className="flex justify-between text-xl font-bold text-foreground">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
