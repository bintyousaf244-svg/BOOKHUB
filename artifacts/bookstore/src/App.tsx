import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

const Home = lazy(() => import("@/pages/Home"));
const Books = lazy(() => import("@/pages/Books"));
const BookDetail = lazy(() => import("@/pages/BookDetail"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess"));
const FreeBooks = lazy(() => import("@/pages/FreeBooks"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const MyOrders = lazy(() => import("@/pages/MyOrders"));

const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminBooks = lazy(() => import("@/pages/AdminBooks"));
const AdminBookEdit = lazy(() => import("@/pages/AdminBookEdit"));
const AdminOrders = lazy(() => import("@/pages/AdminOrders"));
const AdminDiscountCodes = lazy(() => import("@/pages/AdminDiscountCodes"));
const AdminPaymentSettings = lazy(() => import("@/pages/AdminPaymentSettings"));
const AdminCategories = lazy(() => import("@/pages/AdminCategories"));
const AdminWebsiteEditor = lazy(() => import("@/pages/AdminWebsiteEditor"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
        Loading store...
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Admin Routes */}
        <Route path="/admin" nest>
          <AdminLayout>
            <Switch>
              <Route path="/" component={AdminLogin} />
              <Route path="/dashboard" component={AdminDashboard} />
              <Route path="/books" component={AdminBooks} />
              <Route path="/books/new" component={AdminBookEdit} />
              <Route path="/books/:id/edit" component={AdminBookEdit} />
              <Route path="/orders" component={AdminOrders} />
              <Route path="/categories" component={AdminCategories} />
              <Route path="/discounts" component={AdminDiscountCodes} />
              <Route path="/payment-settings" component={AdminPaymentSettings} />
              <Route path="/website-editor" component={AdminWebsiteEditor} />
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        </Route>

        {/* Store Routes */}
        <Route path="/" nest>
          <StoreLayout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/books" component={Books} />
              <Route path="/books/:id" component={BookDetail} />
              <Route path="/cart" component={CartPage} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/order-success" component={OrderSuccess} />
              <Route path="/free" component={FreeBooks} />
              <Route path="/reviews" component={Reviews} />
              <Route path="/my-orders" component={MyOrders} />
              <Route component={NotFound} />
            </Switch>
          </StoreLayout>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
