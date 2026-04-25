import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, LayoutGrid, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import instance from "@/lib/axios";
import { toast } from "sonner";
import AdminLoader from "@/components/AdminLoader";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
    _id: string;
    name: string;
    description: string;
    image?: string;
    propertyCount?: number;
}

interface CategoryFormData {
    name: string;
    description: string;
    image: string;
}

const EMPTY_FORM: CategoryFormData = { name: "", description: "", image: "" };

// ─── Row Skeleton ─────────────────────────────────────────────────────────────
function TableRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-12 w-12 rounded-lg" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-64" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell>
                <div className="flex gap-2 justify-end">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </TableCell>
        </TableRow>
    );
}

// ─── Category Form Fields ─────────────────────────────────────────────────────
function CategoryForm({
    formData,
    onChange,
}: {
    formData: CategoryFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
    return (
        <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="cat-name">
                    Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="cat-name"
                    name="name"
                    placeholder="e.g. PGs/Hostels, Flat/Apartments"
                    value={formData.name}
                    onChange={onChange}
                />
            </div>
            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="cat-desc">
                    Description <span className="text-destructive">*</span>
                </Label>
                <textarea
                    id="cat-desc"
                    name="description"
                    placeholder="A short description visible on the homepage…"
                    value={formData.description}
                    onChange={onChange}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
            </div>
            {/* Image URL */}
            <div className="space-y-2">
                <Label htmlFor="cat-image">Image URL (optional)</Label>
                <Input
                    id="cat-image"
                    name="image"
                    placeholder="https://example.com/image.png"
                    value={formData.image}
                    onChange={onChange}
                />
                {formData.image && (
                    <div className="mt-2 rounded-lg overflow-hidden w-24 h-16 border border-border">
                        <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminCategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>(EMPTY_FORM);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await instance.get("/category");
            setCategories(res.data.data || []);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ── Form helpers ───────────────────────────────────────────────────────────
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return false;
        }
        if (!formData.description.trim()) {
            toast.error("Description is required");
            return false;
        }
        return true;
    };

    // ── Add ────────────────────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            await instance.post("/category", formData);
            toast.success("Category added successfully");
            setIsAddOpen(false);
            setFormData(EMPTY_FORM);
            await fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to add category");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Edit ───────────────────────────────────────────────────────────────────
    const openEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            description: cat.description,
            image: cat.image || "",
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editingCategory || !validateForm()) return;
        setIsSubmitting(true);
        try {
            await instance.put(`/category/${editingCategory._id}`, formData);
            toast.success("Category updated successfully");
            setIsEditOpen(false);
            setEditingCategory(null);
            setFormData(EMPTY_FORM);
            await fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update category");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteId) return;
        setIsSubmitting(true);
        try {
            await instance.delete(`/category/${deleteId}`);
            toast.success("Category deleted successfully");
            setDeleteId(null);
            await fetchCategories();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to delete category";
            toast.error(msg);
            setDeleteId(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    if (isLoading) {
        return <AdminLoader />;
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage property listing categories shown across the platform
                    </p>
                </div>
                <Button
                    className="gap-2"
                    onClick={() => {
                        setFormData(EMPTY_FORM);
                        setIsAddOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {isLoading ? <Skeleton className="h-7 w-8" /> : categories.length}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Categories</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {isLoading ? (
                                    <Skeleton className="h-7 w-8" />
                                ) : (
                                    categories.filter((c) => c.image).length
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">With Images</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hidden sm:block">
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <LayoutGrid className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {isLoading ? (
                                    <Skeleton className="h-7 w-8" />
                                ) : (
                                    categories.reduce((s, c) => s + (c.propertyCount || 0), 0)
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Properties</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Table ── */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 pl-4">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                <TableHead className="text-center">Properties</TableHead>
                                <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
                            ) : categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <LayoutGrid className="h-10 w-10 opacity-30" />
                                            <p className="font-medium">No categories yet</p>
                                            <p className="text-sm">
                                                Click "Add Category" to create your first one.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((cat) => (
                                    <TableRow key={cat._id} className="group">
                                        {/* Image */}
                                        <TableCell className="pl-4">
                                            {cat.image ? (
                                                <img
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    className="h-12 w-12 rounded-lg object-cover border border-border"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "";
                                                        (e.target as HTMLImageElement).className =
                                                            "h-12 w-12 rounded-lg bg-muted flex items-center justify-center";
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Name */}
                                        <TableCell className="font-semibold">{cat.name}</TableCell>

                                        {/* Description */}
                                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs">
                                            <span className="line-clamp-2">{cat.description}</span>
                                        </TableCell>

                                        {/* Property Count */}
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-mono">
                                                {cat.propertyCount ?? 0}
                                            </Badge>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEdit(cat)}
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setDeleteId(cat._id)}
                                                    title="Delete"
                                                    className="hover:border-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ── Add Dialog ── */}
            <Dialog
                open={isAddOpen}
                onOpenChange={(o) => {
                    if (!isSubmitting) setIsAddOpen(o);
                }}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a new property listing category. It will appear on the homepage and search filters.
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryForm formData={formData} onChange={handleChange} />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Saving…" : "Save Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog
                open={isEditOpen}
                onOpenChange={(o) => {
                    if (!isSubmitting) setIsEditOpen(o);
                }}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the details for <strong>{editingCategory?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <CategoryForm formData={formData} onChange={handleChange} />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Updating…" : "Update Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <AlertDialog
                open={!!deleteId}
                onOpenChange={(o) => {
                    if (!o && !isSubmitting) setDeleteId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action is permanent. Categories that still have properties linked
                            to them <strong>cannot</strong> be deleted — the backend will prevent it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isSubmitting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminCategoryPage;
