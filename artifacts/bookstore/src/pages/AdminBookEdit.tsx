import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetBook, useCreateBook, useUpdateBook, useListCategories, getGetBookQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload, X, ImageIcon, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUpload } from "@workspace/object-storage-web";
import { Badge } from "@/components/ui/badge";
import { BookCoverImage } from "@/components/BookCoverImage";
import { apiUrl, storageUrl } from "@/lib/api";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description required"),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().optional().nullable(),
  isOnSale: z.boolean().default(false),
  isFree: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  coverImage: z.string().min(1, "Cover image is required"),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  pages: z.coerce.number().optional().nullable(),
  downloadUrl: z.string().optional().or(z.literal("")).nullable(),
  stock: z.coerce.number().min(0).default(10),
});

type BookFormValues = z.infer<typeof bookSchema>;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read image file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminBookEdit() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const bookId = isEditing ? parseInt(id!, 10) : 0;

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const coverInputRef = useRef<HTMLInputElement>(null);

  // Digital book file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: isEditing, queryKey: getGetBookQueryKey(bookId) }
  });
  const { data: categoriesData } = useListCategories();

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const fileUpload = useUpload({
    basePath: apiUrl("/api/storage"),
    onSuccess: (response) => {
      const servingUrl = storageUrl(response.objectPath);
      form.setValue("downloadUrl", servingUrl, { shouldValidate: true });
      toast({ title: "Book file uploaded successfully" });
    },
    onError: (err) => toast({ title: `Upload failed: ${err.message}`, variant: "destructive" }),
  });

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
      coverImage: "",
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
      const matchingCategoryName =
        categoriesData?.find(
          (cat) =>
            cat.name === book.category ||
            cat.slug === book.category
        )?.name ?? book.category;

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
        category: matchingCategoryName,
        language: book.language,
        ageGroup: book.ageGroup,
        pages: book.pages,
        downloadUrl: book.downloadUrl || "",
        stock: book.stock,
      });
      if (book.downloadUrl?.includes("/api/storage/")) {
        setUploadedFileName("Previously uploaded file");
      }
    }
  }, [isEditing, book, form, categoriesData]);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Cover image must be 5 MB or smaller", variant: "destructive" });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      form.setValue("coverImage", dataUrl, { shouldValidate: true, shouldDirty: true });
      toast({ title: "Cover image saved with this book" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to read image file";
      toast({ title: message, variant: "destructive" });
    }

    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    await fileUpload.uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearFile = () => {
    setUploadedFileName(null);
    form.setValue("downloadUrl", "");
  };

  const onSubmit = (data: BookFormValues) => {
    const payload = {
      ...data,
      downloadUrl: data.downloadUrl || null,
    };

    if (isEditing) {
      updateBook.mutate({ id: bookId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Book updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setLocation("/books");
        },
        onError: () => toast({ title: "Failed to update book", variant: "destructive" })
      });
    } else {
      createBook.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Book created successfully" });
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setLocation("/books");
        },
        onError: () => toast({ title: "Failed to create book", variant: "destructive" })
      });
    }
  };

  if (isEditing && isLoading) return <div>Loading...</div>;

  const isFree = form.watch("isFree");
  const isOnSale = form.watch("isOnSale");
  const currentCoverImage = form.watch("coverImage");
  const currentDownloadUrl = form.watch("downloadUrl");
  const isAnyUploading = fileUpload.isUploading;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/books">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEditing ? "Edit Book" : "Add New Book"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Basic Info */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Book Details</h2>
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

                {/* Cover Image */}
                <FormField control={form.control} name="coverImage" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Cover Image</FormLabel>
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-24 h-32 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                        {currentCoverImage ? (
                          <BookCoverImage src={currentCoverImage} alt="Cover preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-7 w-7 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2 items-center flex-wrap">
                          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                          <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Image
                          </Button>
                          {currentCoverImage && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("coverImage", "", { shouldValidate: true, shouldDirty: true })}
                              className="text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4 mr-1" /> Clear
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Or paste an image URL:</p>
                          <FormControl><Input placeholder="https://example.com/cover.jpg" {...field} /></FormControl>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploaded cover images are stored directly with the book so they do not disappear after deploys or restarts.
                        </p>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    {categoriesData && categoriesData.length > 0 ? (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesData.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input placeholder="e.g. kids-learning" {...field} />
                      </FormControl>
                    )}
                    <FormDescription className="text-xs">
                      Manage categories under <a href="/admin/categories" className="underline text-primary">Admin → Categories</a>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="language" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

          {/* Digital File */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">Digital Book File</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload the book file (PDF, EPUB, etc.) for digital download. For free books this link is shown immediately; for paid books you can share it after payment.
                </p>
              </div>

              {/* Uploaded file badge */}
              {(uploadedFileName || (currentDownloadUrl && currentDownloadUrl.length > 0)) && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1 truncate">
                    {uploadedFileName || "File linked"}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={handleClearFile}
                    className="text-muted-foreground hover:text-destructive h-6 px-2">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div className="flex gap-3 items-center flex-wrap">
                <input ref={fileInputRef} type="file" accept=".pdf,.epub,.doc,.docx,.txt,.mobi" className="hidden" onChange={handleFileChange} />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={fileUpload.isUploading}>
                  <FileText className="h-4 w-4 mr-2" />
                  {fileUpload.isUploading ? `Uploading ${fileUpload.progress}%` : "Upload Book File"}
                </Button>
                <Badge variant="outline" className="text-xs text-muted-foreground">PDF, EPUB, DOCX, MOBI</Badge>
              </div>

              {fileUpload.isUploading && (
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${fileUpload.progress}%` }} />
                </div>
              )}

              <FormField control={form.control} name="downloadUrl" render={({ field }) => (
                <FormItem>
                  <p className="text-xs text-muted-foreground">Or paste an external link (Google Drive, Dropbox, etc.):</p>
                  <FormControl>
                    <Input placeholder="https://drive.google.com/..." {...field} value={field.value || ""} disabled={fileUpload.isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Pricing & Status */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Pricing & Status</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="isFree" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Resource</FormLabel>
                      <FormDescription>Show download link publicly</FormDescription>
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/books">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={createBook.isPending || updateBook.isPending || isAnyUploading} className="bg-primary text-primary-foreground px-8">
              <Save className="mr-2 h-4 w-4" /> Save Book
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
