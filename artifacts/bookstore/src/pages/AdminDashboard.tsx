import React from "react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.completedOrders} completed</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Library Size</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.freeBooks} free resources</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent orders.</p>
              ) : (
                stats.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <div className="font-medium text-foreground">Order #{order.id} - {order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} &bull; {order.paymentMethod}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">Rs. {order.total}</div>
                      <Badge variant={order.status === 'pending' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/orders" className="text-sm text-accent hover:underline mt-4 block">View all orders &rarr;</Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Top Selling Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingBooks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No sales data yet.</p>
              ) : (
                stats.topSellingBooks.map(book => (
                  <div key={book.id} className="flex gap-4">
                    <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/books" className="text-sm text-accent hover:underline mt-4 block">Manage books &rarr;</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
