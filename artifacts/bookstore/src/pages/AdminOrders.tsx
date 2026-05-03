import React, { useState } from "react";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, CheckCircle2 } from "lucide-react";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useListOrders({ 
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100 
  });
  
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate({ id: orderId, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "Order status updated" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" })
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="destructive">Pending</Badge>;
      case 'processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed': return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed ✓</Badge>;
      case 'shipped': return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'delivered': return <Badge variant="secondary" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Manage Orders</h1>
        
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                </TableRow>
              ) : data?.orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              ) : (
                data?.orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.city}</div>
                    </TableCell>
                    <TableCell className="font-bold">Rs. {order.total}</TableCell>
                    <TableCell>
                      <div className="text-sm">{order.paymentMethod}</div>
                      {order.paymentReference && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">Ref: {order.paymentReference}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={order.status} 
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="h-8 text-xs border-0 bg-transparent p-0 w-28 focus:ring-0">
                          {getStatusBadge(order.status)}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed ✓</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      {order.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-green-700 hover:text-green-900 hover:bg-green-50 gap-1"
                          onClick={() => handleStatusChange(order.id, "completed")}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details #{order.id}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                              <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Customer Info</h4>
                              <div className="bg-muted/30 p-4 rounded-md text-sm space-y-1">
                                <p><strong>Name:</strong> {order.customerName}</p>
                                <p><strong>Email:</strong> {order.customerEmail}</p>
                                <p><strong>Phone:</strong> {order.customerPhone}</p>
                                <p><strong>City:</strong> {order.city}</p>
                                <p><strong>Address:</strong> {order.address}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Payment Info</h4>
                              <div className="bg-muted/30 p-4 rounded-md text-sm space-y-1">
                                <p><strong>Method:</strong> {order.paymentMethod}</p>
                                <p><strong>Total:</strong> Rs. {order.total}</p>
                                <p><strong>Reference:</strong> {order.paymentReference || "N/A"}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                                {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Order Items</h4>
                              <div className="border border-border rounded-md divide-y divide-border">
                                {order.items.map(item => (
                                  <div key={item.bookId} className="p-3 flex justify-between items-center bg-card">
                                    <div className="flex items-center gap-3">
                                      <img src={item.coverImage} className="w-8 h-10 object-cover rounded" />
                                      <span className="font-medium text-sm">{item.title}</span>
                                    </div>
                                    <div className="text-right text-sm">
                                      {item.quantity} x Rs. {item.price}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
