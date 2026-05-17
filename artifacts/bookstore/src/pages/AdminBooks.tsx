import React, { useState } from "react";
import { Link } from "wouter";
import { useListBooks, useDeleteBook, useUpdateBook } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BookCoverImage } from "@/components/BookCoverImage";

export default function AdminBooks() {
  const [search, setSearch] = useState("");
  const [sortOrderDrafts, setSortOrderDrafts] = useState<Record<number, string>>({});
  const { data, isLoading } = useListBooks({ search, limit: 100 });
  const deleteBook = useDeleteBook();
  const updateBook = useUpdateBook();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshBookLists = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/books"] });
  };

  const handleDelete = (id: number) => {
    deleteBook.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Book deleted successfully" });
        refreshBookLists();
      },
      onError: () => {
        toast({ title: "Failed to delete book", variant: "destructive" });
      }
    });
  };

  const getDraftValue = (bookId: number, currentSortOrder: number) =>
    sortOrderDrafts[bookId] ?? String(currentSortOrder);

  const handleSortOrderChange = (bookId: number, value: string) => {
    setSortOrderDrafts((prev) => ({
      ...prev,
      [bookId]: value,
    }));
  };

  const handleSortOrderSave = (bookId: number, currentSortOrder: number) => {
    const rawValue = getDraftValue(bookId, currentSortOrder).trim();
    const nextSortOrder = Number(rawValue);

    if (!Number.isInteger(nextSortOrder) || nextSortOrder < 0) {
      toast({ title: "Sort order must be a whole number 0 or greater", variant: "destructive" });
      return;
    }

    updateBook.mutate(
      { id: bookId, data: { sortOrder: nextSortOrder } },
      {
        onSuccess: () => {
          toast({ title: "Book order updated" });
          setSortOrderDrafts((prev) => {
            const next = { ...prev };
            delete next[bookId];
            return next;
          });
          refreshBookLists();
        },
        onError: () => {
          toast({ title: "Failed to update book order", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Manage Books</h1>
        <Link href="/books/new">
          <Button className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add New Book
          </Button>
        </Link>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search books by title, author..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">Order</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Category/Age</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading books...</TableCell>
                </TableRow>
              ) : data?.books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No books found.</TableCell>
                </TableRow>
              ) : (
                data?.books.map(book => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          className="h-9 w-20"
                          value={getDraftValue(book.id, book.sortOrder)}
                          onChange={(e) => handleSortOrderChange(book.id, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => handleSortOrderSave(book.id, book.sortOrder)}
                          disabled={updateBook.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <BookCoverImage src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                        <div>
                          <div className="font-medium max-w-[200px] truncate">{book.title}</div>
                          <div className="text-xs text-muted-foreground">{book.author}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{book.category}</div>
                      <div className="text-xs text-muted-foreground">{book.ageGroup} &bull; {book.language}</div>
                    </TableCell>
                    <TableCell>
                      {book.isFree ? (
                        <span className="font-medium text-accent">Free</span>
                      ) : (
                        <div className="text-sm">
                          {book.isOnSale ? (
                            <>
                              <span className="font-bold text-destructive">Rs. {book.salePrice}</span>
                              <span className="text-xs line-through text-muted-foreground ml-1">Rs. {book.price}</span>
                            </>
                          ) : (
                            <span className="font-medium">Rs. {book.price}</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={book.stock < 10 && !book.isFree ? "destructive" : "secondary"}>
                        {book.isFree ? "∞" : book.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap w-24">
                        {book.isFeatured && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Featured</Badge>}
                        {book.isOnSale && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-destructive border-destructive">Sale</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/books/${book.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Book</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{book.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(book.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
