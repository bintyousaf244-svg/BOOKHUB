import React, { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetBook, useCreateBook, useUpdateBook, getGetBookQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description required"),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().optional().nullable(),
  isOnSale: z.boolean().default(false),
  isFree: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  coverImage: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  pages: z.coerce.number().optional().nullable(),
  downloadUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  stock: z.coerce.number().min(0).default(10),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function AdminBookEdit() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const bookId = isEditing ? parseInt(id!, 10) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: isEditing, queryKey: getGetBookQueryKey(bookId) }
  });

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      price: 0,
      salePrice: null,
      isOnSale: false,
      isFree: false,
      isFeatured: false,
      coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
      category: "kids-learning",
      language: "English",
      ageGroup: "Kids",
      pages: null,
      downloadUrl: "",
      stock: 10,
    }
  });

  useEffect(() => {
    if (isEditing && book) {
      form.reset({
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        salePrice: book.salePrice,
        isOnSale: book.isOnSale,
        isFree: book.isFree,
        isFeatured: book.isFeatured,
        coverImage: book.coverImage,
        category: book.category,
        language: book.language,
        ageGroup: book.ageGroup,
        pages: book.pages,
        downloadUrl: book.downloadUrl || "",
        stock: book.stock,
      });
    }
  }, [isEditing, book, form]);

  const onSubmit = (data: BookFormValues) => {
    const payload = {
      ...data,
      downloadUrl: data.isFree ? (data.downloadUrl || null) : null,
    };

    if (isEditing) {
      updateBook.mutate({ id: bookId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Book updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setLocation("/admin/books");
        },
        onError: () => toast({ title: "Failed to update book", variant: "destructive" })
      });
    } else {
      createBook.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Book created successfully" });
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setLocation("/admin/books");
        },
        onError: () => toast({ title: "Failed to create book", variant: "destructive" })
      });
    }
  };

  if (isEditing && isLoading) return <div>Loading...</div>;

  const isFree = form.watch("isFree");
  const isOnSale = form.watch("isOnSale");

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/books">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEditing ? "Edit Book" : "Add New Book"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Book Title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="author" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl><Input placeholder="Author Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="coverImage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Slug</FormLabel>
                    <FormControl><Input placeholder="e.g. kids-learning" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="language" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ageGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Kids">Kids</SelectItem>
                        <SelectItem value="Adults">Adults</SelectItem>
                        <SelectItem value="All Ages">All Ages</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pages" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pages (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="100" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea className="min-h-[120px]" placeholder="Book description..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Pricing & Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="isFree" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Resource</FormLabel>
                      <FormDescription>Available for direct download</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>Show on homepage</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isOnSale" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">On Sale</FormLabel>
                      <FormDescription>Apply discount</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isFree} /></FormControl>
                  </FormItem>
                )} />
              </div>

              {!isFree && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Price (Rs.)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {isOnSale && (
                    <FormField control={form.control} name="salePrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (Rs.)</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Stock</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {isFree && (
                <div className="border-t border-border pt-6">
                  <FormField control={form.control} name="downloadUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download URL (Google Drive, Dropbox, etc.)</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/books">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={createBook.isPending || updateBook.isPending} className="bg-primary text-primary-foreground px-8">
              <Save className="mr-2 h-4 w-4" /> Save Book
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
