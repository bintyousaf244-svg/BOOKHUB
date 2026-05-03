import React from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import Home from "@/pages/Home";
import Books from "@/pages/Books";
import BookDetail from "@/pages/BookDetail";
import CartPage from "@/pages/CartPage";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import FreeBooks from "@/pages/FreeBooks";

import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminBooks from "@/pages/AdminBooks";
import AdminBookEdit from "@/pages/AdminBookEdit";
import AdminOrders from "@/pages/AdminOrders";
import AdminDiscountCodes from "@/pages/AdminDiscountCodes";

const queryClient = new QueryClient();

function Router() {
  return (
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
            <Route path="/discounts" component={AdminDiscountCodes} />
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
            <Route component={NotFound} />
          </Switch>
        </StoreLayout>
      </Route>
    </Switch>
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
