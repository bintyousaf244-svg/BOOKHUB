import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetBook,
  useCreateBook,
  useUpdateBook,
  useListCategories,
  getGetBookQueryKey,
  getListBooksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  ImageIcon,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUpload } from "@workspace/object-storage-web";
import { Badge } from "@/components/ui/badge";
import { BookCoverImage } from "@/components/BookCoverImage";
import { apiUrl, storageUrl } from "@/lib/api";
import { joinBookMetadataList, parseBookMetadataList } from "@/lib/bookMetadata";

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
  previewImage1: z.string().optional().nullable(),
  previewImage2: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).default(0),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  pages: z.coerce.number().optional().nullable(),
  downloadUrl: z.string().optional().or(z.literal("")).nullable(),
  stock: z.coerce.number().min(0).default(10),
});

type BookFormValues = z.infer<typeof bookSchema>;

const DEFAULT_LANGUAGE_OPTIONS = ["English", "Arabic", "Urdu"];
const DEFAULT_AGE_GROUP_OPTIONS = ["Kids", "Adults", "All Ages"];

function addMetadataValue(currentValue: string, nextValue: string): string {
  return joinBookMetadataList([
    ...parseBookMetadataList(currentValue),
    nextValue,
  ]);
}

function removeMetadataValue(currentValue: string, valueToRemove: string): string {
  return joinBookMetadataList(
    parseBookMetadataList(currentValue).filter((value) => value !== valueToRemove)
  );
}

function toggleMetadataValue(currentValue: string, nextValue: string): string {
  const selectedValues = parseBookMetadataList(currentValue);

  if (selectedValues.includes(nextValue)) {
    return removeMetadataValue(currentValue, nextValue);
  }

  return addMetadataValue(currentValue, nextValue);
}

function resolveCategoryNames(
  rawCategoryValue: string,
  categoriesData?: Array<{ name: string; slug: string }>
): string {
  return joinBookMetadataList(
    parseBookMetadataList(rawCategoryValue).map((categoryValue) => {
      const matchingCategory = categoriesData?.find(
        (cat) => cat.name === categoryValue || cat.slug === categoryValue
      );

      return matchingCategory?.name ?? categoryValue;
    })
  );
}

function getBookSaveErrorMessage(error: unknown): string {
  const apiError = error as any;
  const apiMessage = apiError?.data?.error;

  if (apiError?.status === 413) {
    return "Cover image payload is too large for the live server. Redeploy the API with the latest fix, or use a smaller image.";
  }

  if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
    return apiMessage;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Failed to save book";
}

async function readFileAsDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image file"));
      img.src = objectUrl;
    });

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to process image");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const qualitySteps = [0.92, 0.85, 0.78, 0.7, 0.6];
    let bestResult = "";

    for (const quality of qualitySteps) {
      const candidate = canvas.toDataURL("image/webp", quality);
      bestResult = candidate;

      if (candidate.length <= 1_500_000) {
        return candidate;
      }
    }

    return bestResult;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminBookEdit() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const bookId = isEditing ? parseInt(id!, 10) : 0;

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewImage1InputRef = useRef<HTMLInputElement>(null);
  const previewImage2InputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [customAgeGroup, setCustomAgeGroup] = useState("");

  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: isEditing, queryKey: getGetBookQueryKey(bookId) },
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
    onError: (err) =>
      toast({ title: `Upload failed: ${err.message}`, variant: "destructive" }),
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
      previewImage1: "",
      previewImage2: "",
      sortOrder: 0,
      category: "kids-learning",
      language: "English",
      ageGroup: "Kids",
      pages: null,
      downloadUrl: "",
      stock: 10,
    },
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
        previewImage1: (book as any).previewImage1 || "",
        previewImage2: (book as any).previewImage2 || "",
        sortOrder: book.sortOrder ?? 0,
        category: resolveCategoryNames(book.category, categoriesData),
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

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "coverImage" | "previewImage1" | "previewImage2",
    successMessage: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
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
      form.setValue(fieldName, dataUrl, { shouldValidate: true, shouldDirty: true });
      toast({ title: successMessage });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to read image file";
      toast({ title: message, variant: "destructive" });
    }

    if (inputRef.current) inputRef.current.value = "";
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

  const handleAddCustomCategory = (currentValue: string, onChange: (value: string) => void) => {
    const trimmedCategory = customCategory.trim();
    if (!trimmedCategory) return;

    onChange(addMetadataValue(currentValue, trimmedCategory));
    setCustomCategory("");
  };

  const handleAddCustomLanguage = (currentValue: string, onChange: (value: string) => void) => {
    const trimmedLanguage = customLanguage.trim();
    if (!trimmedLanguage) return;

    onChange(addMetadataValue(currentValue, trimmedLanguage));
    setCustomLanguage("");
  };

  const handleAddCustomAgeGroup = (currentValue: string, onChange: (value: string) => void) => {
    const trimmedAgeGroup = customAgeGroup.trim();
    if (!trimmedAgeGroup) return;

    onChange(addMetadataValue(currentValue, trimmedAgeGroup));
    setCustomAgeGroup("");
  };

  const onSubmit = (data: BookFormValues) => {
    const payload = {
      ...data,
      previewImage1: data.previewImage1 || null,
      previewImage2: data.previewImage2 || null,
      downloadUrl: data.downloadUrl || null,
    };

    if (isEditing) {
      updateBook.mutate(
        { id: bookId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Book updated successfully" });
            queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
            queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
            setLocation("/books");
          },
          onError: (error) =>
            toast({ title: getBookSaveErrorMessage(error), variant: "destructive" }),
        }
      );
    } else {
      createBook.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Book created successfully" });
            queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
            setLocation("/books");
          },
          onError: (error) =>
            toast({ title: getBookSaveErrorMessage(error), variant: "destructive" }),
        }
      );
    }
  };

  if (isEditing && isLoading) return <div>Loading...</div>;

  const isFree = form.watch("isFree");
  const isOnSale = form.watch("isOnSale");
  const currentCoverImage = form.watch("coverImage");
  const currentPreviewImage1 = form.watch("previewImage1");
  const currentPreviewImage2 = form.watch("previewImage2");
  const currentDownloadUrl = form.watch("downloadUrl");
  const isAnyUploading = fileUpload.isUploading;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/books">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {isEditing ? "Edit Book" : "Add New Book"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Book Details</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Book Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Cover Image</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="flex h-32 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                          {currentCoverImage ? (
                            <BookCoverImage
                              src={currentCoverImage}
                              alt="Cover preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              ref={coverInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) =>
                                handleImageChange(
                                  event,
                                  "coverImage",
                                  "Cover image saved with this book",
                                  coverInputRef,
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => coverInputRef.current?.click()}
                            >
                              <Upload className="mr-1 h-4 w-4" />
                              Upload Image
                            </Button>
                            {currentCoverImage && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  form.setValue("coverImage", "", {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  })
                                }
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="mr-1 h-4 w-4" />
                                Clear
                              </Button>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Or paste an image URL:</p>
                            <FormControl>
                              <Input placeholder="https://example.com/cover.jpg" {...field} />
                            </FormControl>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Uploaded cover images are stored directly with the book so they do not
                            disappear after deploys or restarts.
                          </p>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previewImage1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inside Page Image 1</FormLabel>
                      <div className="space-y-3">
                        <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                          {currentPreviewImage1 ? (
                            <img
                              src={currentPreviewImage1}
                              alt="Inside page preview 1"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={previewImage1InputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                              handleImageChange(
                                event,
                                "previewImage1",
                                "Inside page image 1 saved with this book",
                                previewImage1InputRef,
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => previewImage1InputRef.current?.click()}
                          >
                            <Upload className="mr-1 h-4 w-4" />
                            Upload Image
                          </Button>
                          {currentPreviewImage1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                form.setValue("previewImage1", "", {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                })
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="mr-1 h-4 w-4" />
                              Clear
                            </Button>
                          )}
                        </div>
                        <FormControl>
                          <Input placeholder="https://example.com/inside-page-1.jpg" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Show one inside page so customers can preview what is inside the book.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previewImage2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inside Page Image 2</FormLabel>
                      <div className="space-y-3">
                        <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                          {currentPreviewImage2 ? (
                            <img
                              src={currentPreviewImage2}
                              alt="Inside page preview 2"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={previewImage2InputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                              handleImageChange(
                                event,
                                "previewImage2",
                                "Inside page image 2 saved with this book",
                                previewImage2InputRef,
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => previewImage2InputRef.current?.click()}
                          >
                            <Upload className="mr-1 h-4 w-4" />
                            Upload Image
                          </Button>
                          {currentPreviewImage2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                form.setValue("previewImage2", "", {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                })
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="mr-1 h-4 w-4" />
                              Clear
                            </Button>
                          )}
                        </div>
                        <FormControl>
                          <Input placeholder="https://example.com/inside-page-2.jpg" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Add a second inside page preview to help customers decide before buying.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => {
                    const selectedCategories = parseBookMetadataList(field.value);

                    return (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <div className="space-y-4 rounded-xl border border-border p-4">
                          {categoriesData && categoriesData.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {categoriesData.map((cat) => {
                                const isChecked = selectedCategories.includes(cat.name);

                                return (
                                  <label
                                    key={cat.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        field.onChange(toggleMetadataValue(field.value, cat.name))
                                      }
                                    />
                                    <span>{cat.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No saved categories yet. Add one below.
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom category"
                              value={customCategory}
                              onChange={(event) => setCustomCategory(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleAddCustomCategory(field.value, field.onChange);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleAddCustomCategory(field.value, field.onChange)}
                            >
                              Add
                            </Button>
                          </div>

                          {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedCategories.map((categoryValue) => (
                                <Badge
                                  key={categoryValue}
                                  variant="secondary"
                                  className="gap-1.5 pr-1"
                                >
                                  {categoryValue}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      field.onChange(
                                        removeMetadataValue(field.value, categoryValue)
                                      )
                                    }
                                    className="rounded-full p-0.5 hover:bg-black/10"
                                    aria-label={`Remove ${categoryValue}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormDescription className="text-xs">
                          Select one or more categories. You can also add a custom one here if
                          needed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => {
                    const selectedLanguages = parseBookMetadataList(field.value);

                    return (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <div className="space-y-4 rounded-xl border border-border p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {DEFAULT_LANGUAGE_OPTIONS.map((languageOption) => {
                              const isChecked = selectedLanguages.includes(languageOption);

                              return (
                                <label
                                  key={languageOption}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      field.onChange(
                                        toggleMetadataValue(field.value, languageOption)
                                      )
                                    }
                                  />
                                  <span>{languageOption}</span>
                                </label>
                              );
                            })}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom language"
                              value={customLanguage}
                              onChange={(event) => setCustomLanguage(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleAddCustomLanguage(field.value, field.onChange);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleAddCustomLanguage(field.value, field.onChange)}
                            >
                              Add
                            </Button>
                          </div>

                          {selectedLanguages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedLanguages.map((languageValue) => (
                                <Badge
                                  key={languageValue}
                                  variant="secondary"
                                  className="gap-1.5 pr-1"
                                >
                                  {languageValue}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      field.onChange(
                                        removeMetadataValue(field.value, languageValue)
                                      )
                                    }
                                    className="rounded-full p-0.5 hover:bg-black/10"
                                    aria-label={`Remove ${languageValue}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormDescription className="text-xs">
                          Choose one or more languages, or add your own custom language label.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => {
                    const selectedAgeGroups = parseBookMetadataList(field.value);

                    return (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <div className="space-y-4 rounded-xl border border-border p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {DEFAULT_AGE_GROUP_OPTIONS.map((ageGroupOption) => {
                              const isChecked = selectedAgeGroups.includes(ageGroupOption);

                              return (
                                <label
                                  key={ageGroupOption}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      field.onChange(
                                        toggleMetadataValue(field.value, ageGroupOption)
                                      )
                                    }
                                  />
                                  <span>{ageGroupOption}</span>
                                </label>
                              );
                            })}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom age group"
                              value={customAgeGroup}
                              onChange={(event) => setCustomAgeGroup(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleAddCustomAgeGroup(field.value, field.onChange);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleAddCustomAgeGroup(field.value, field.onChange)}
                            >
                              Add
                            </Button>
                          </div>

                          {selectedAgeGroups.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedAgeGroups.map((ageGroupValue) => (
                                <Badge
                                  key={ageGroupValue}
                                  variant="secondary"
                                  className="gap-1.5 pr-1"
                                >
                                  {ageGroupValue}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      field.onChange(
                                        removeMetadataValue(field.value, ageGroupValue)
                                      )
                                    }
                                    className="rounded-full p-0.5 hover:bg-black/10"
                                    aria-label={`Remove ${ageGroupValue}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormDescription className="text-xs">
                          Choose one or more age groups for this book.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pages (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="0" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Lower numbers appear first in the store.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px]"
                          placeholder="Book description..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">
                  Digital Book File
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload the book file (PDF, EPUB, etc.) for digital download. For free books this
                  link is shown immediately; for paid books you can share it after payment.
                </p>
              </div>

              {(uploadedFileName || (currentDownloadUrl && currentDownloadUrl.length > 0)) && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="flex-1 truncate text-sm text-foreground">
                    {uploadedFileName || "File linked"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFile}
                    className="h-6 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.epub,.doc,.docx,.txt,.mobi"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={fileUpload.isUploading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {fileUpload.isUploading
                    ? `Uploading ${fileUpload.progress}%`
                    : "Upload Book File"}
                </Button>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  PDF, EPUB, DOCX, MOBI
                </Badge>
              </div>

              {fileUpload.isUploading && (
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${fileUpload.progress}%` }}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs text-muted-foreground">
                      Or paste an external link (Google Drive, Dropbox, etc.):
                    </p>
                    <FormControl>
                      <Input
                        placeholder="https://drive.google.com/..."
                        {...field}
                        value={field.value || ""}
                        disabled={fileUpload.isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-serif font-bold text-foreground">Pricing & Status</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Free Resource</FormLabel>
                        <FormDescription>Show download link publicly</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <FormDescription>Show on homepage</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isOnSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">On Sale</FormLabel>
                        <FormDescription>Apply discount</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isFree}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {!isFree && (
                <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price (Rs.)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isOnSale && (
                    <FormField
                      control={form.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price (Rs.)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventory Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/books">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createBook.isPending || updateBook.isPending || isAnyUploading}
              className="bg-primary px-8 text-primary-foreground"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Book
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
