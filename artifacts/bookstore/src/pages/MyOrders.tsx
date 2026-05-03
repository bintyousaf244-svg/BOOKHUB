import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Download, BookOpen, ArrowRight, AlertCircle } from "lucide-react";

interface DownloadBook {
  bookId: number;
  title: string;
  coverImage: string;
  downloadUrl: string | null;
}

interface DownloadResult {
  allowed: boolean;
  status: string;
  books: DownloadBook[];
}

const statusInfo: Record<string, { icon: React.ReactNode; label: string; message: string; color: string }> = {
  pending: {
    icon: <Clock className="h-10 w-10 text-amber-500" />,
    label: "Payment Pending",
    message: "Your order has been received. Once you send payment and we verify it, your books will be unlocked for download.",
    color: "border-amber-200 bg-amber-50",
  },
  processing: {
    icon: <Clock className="h-10 w-10 text-blue-500" />,
    label: "Being Reviewed",
    message: "We have received your payment and are currently verifying it. Your download link will be ready very soon!",
    color: "border-blue-200 bg-blue-50",
  },
  cancelled: {
    icon: <XCircle className="h-10 w-10 text-red-500" />,
    label: "Order Cancelled",
    message: "This order has been cancelled. If you believe this is a mistake, please contact us.",
    color: "border-red-200 bg-red-50",
  },
  completed: {
    icon: <CheckCircle2 className="h-10 w-10 text-green-500" />,
    label: "Payment Verified",
    message: "Your payment has been verified! Download your books below.",
    color: "border-green-200 bg-green-50",
  },
};

export default function MyOrders() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledId = urlParams.get("id") || "";

  const [orderId, setOrderId] = useState(prefilledId);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setHasSearched(true);
    if (!orderId || !email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/downloads?email=${encodeURIComponent(email.trim())}`);
      if (res.status === 404) {
        setError("No order found with that ID and email combination. Please double-check your details.");
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const info = result ? (statusInfo[result.status] ?? statusInfo.pending) : null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-10">
        <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Download My Books</h1>
        <p className="text-muted-foreground">
          Enter your order number and email address to access your purchased books.
        </p>
      </div>

      <Card className="border-border shadow-md mb-8">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleLookup} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="orderId">Order Number</Label>
              <Input
                id="orderId"
                type="number"
                placeholder="e.g. 42"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">Found in your order confirmation page or email</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="The email you used when ordering"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              {isLoading ? "Looking up your order..." : "Find My Order"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && info && (
        <div className="space-y-6">
          <div className={`flex items-start gap-4 p-5 border rounded-xl ${info.color}`}>
            <div className="flex-shrink-0">{info.icon}</div>
            <div>
              <h3 className="font-bold text-lg mb-1">{info.label}</h3>
              <p className="text-sm text-muted-foreground">{info.message}</p>
            </div>
          </div>

          {result.allowed && result.books.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-xl text-foreground">Your Books</h3>
              {result.books.map((book) => (
                <Card key={book.bookId} className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    {book.coverImage && (
                      <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground line-clamp-2">{book.title}</p>
                    </div>
                    {book.downloadUrl ? (
                      <a
                        href={book.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      </a>
                    ) : (
                      <Button disabled variant="outline" className="flex-shrink-0 gap-2 text-muted-foreground">
                        <Download className="h-4 w-4" /> Not available
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {result.allowed && result.books.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No downloadable books found in this order.</p>
          )}
        </div>
      )}

      <div className="mt-10 text-center text-sm text-muted-foreground">
        Questions about your order?{" "}
        <Link href="/books" className="text-accent hover:underline">Browse more books</Link>
      </div>
    </div>
  );
}
