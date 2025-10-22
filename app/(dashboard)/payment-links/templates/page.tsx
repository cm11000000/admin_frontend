'use client';

/**
 * Payment Link Template Management UI
 * Comprehensive template management with CRUD operations
 */
import React, { useEffect, useState } from 'react';
import { paymentLinkService, PaymentLinkTemplate } from '@/services/api/PaymentLinkApiService';
import { formatDateTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Star,
  Search,
  Filter,
  MoreVertical,
  FileText,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/lib/toast';
import { Skeleton } from '@/components/ui/skeleton';

const FIELD_TYPES = ['text', 'number', 'email', 'phone', 'date', 'select'] as const;
const CATEGORIES = ['General', 'Invoice', 'Donation', 'Subscription', 'Event', 'Education', 'Other'];

interface CustomField {
  name: string;
  label: string;
  type: typeof FIELD_TYPES[number];
  required: boolean;
  options?: string[];
}

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  amount?: number;
  customFields: CustomField[];
  isDefault: boolean;
}

export default function TemplateManagementPage() {
  if (typeof window === 'undefined') return null;
  const [templates, setTemplates] = useState<PaymentLinkTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Form states
  const [selectedTemplate, setSelectedTemplate] = useState<PaymentLinkTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'General',
    amount: undefined,
    customFields: [],
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await paymentLinkService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentLinkService.createTemplate(formData);
      toast.success('Template created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentLinkService.updateTemplate(selectedTemplate.id, formData);
      toast.success('Template updated successfully');
      setEditDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSubmitting(true);
    try {
      await paymentLinkService.deleteTemplate(selectedTemplate.id);
      toast.success('Template deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateTemplate = async (template: PaymentLinkTemplate) => {
    const duplicateData: TemplateFormData = {
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      amount: template.amount,
      customFields: [...template.customFields],
      isDefault: false,
    };

    setIsSubmitting(true);
    try {
      await paymentLinkService.createTemplate(duplicateData);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (template: PaymentLinkTemplate) => {
    try {
      await paymentLinkService.updateTemplate(template.id, { isDefault: true });
      toast.success('Default template updated');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to set default template');
    }
  };

  const openEditDialog = (template: PaymentLinkTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      amount: template.amount,
      customFields: [...template.customFields],
      isDefault: template.isDefault,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (template: PaymentLinkTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const openPreviewDialog = (template: PaymentLinkTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'General',
      amount: undefined,
      customFields: [],
      isDefault: false,
    });
    setSelectedTemplate(null);
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...formData.customFields,
        {
          name: '',
          label: '',
          type: 'text',
          required: false,
          options: [],
        },
      ],
    });
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const updatedFields = [...formData.customFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormData({ ...formData, customFields: updatedFields });
  };

  const removeCustomField = (index: number) => {
    const updatedFields = formData.customFields.filter((_, i) => i !== index);
    setFormData({ ...formData, customFields: updatedFields });
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getUsageCount = (template: PaymentLinkTemplate) => {
    // Mock usage count - would come from API in real implementation
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Link Templates</h1>
          <p className="text-slate-400 mt-1">Manage reusable templates for payment links</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Templates Found</h3>
            <p className="text-slate-400 mb-4">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first template to get started'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPreviewDialog(template)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(template)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      {template.amount && (
                        <span className="text-sm font-semibold">
                          INR {template.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>{template.customFields.length} custom fields</span>
                      <span>{getUsageCount(template)} uses</span>
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-slate-500">
                    Created {formatDateTime(template.createdAt)}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialogOpen ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {editDialogOpen
                ? 'Update template details and custom fields'
                : 'Create a new payment link template with custom fields'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Invoice Payment"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this template"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Default Amount (Optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-slate-600/50"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default template
                  </Label>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Custom Fields</Label>
                <Button variant="outline" size="sm" onClick={addCustomField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {formData.customFields.map((field, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Field Name</Label>
                          <Input
                            placeholder="e.g., invoiceNumber"
                            value={field.name}
                            onChange={(e) => updateCustomField(index, { name: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Display Label</Label>
                          <Input
                            placeholder="e.g., Invoice Number"
                            value={field.label}
                            onChange={(e) => updateCustomField(index, { label: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateCustomField(index, { type: value as any })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={field.required}
                              onChange={(e) => updateCustomField(index, { required: e.target.checked })}
                              className="rounded border-slate-600/50"
                            />
                            <Label htmlFor={`required-${index}`} className="text-xs cursor-pointer">
                              Required
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCustomField(index)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        {field.type === 'select' && (
                          <div className="col-span-2">
                            <Label className="text-xs">Options (comma-separated)</Label>
                            <Input
                              placeholder="Option 1, Option 2, Option 3"
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateCustomField(index, { options: e.target.value.split(',').map(o => o.trim()) })}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {formData.customFields.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No custom fields added yet. Click "Add Field" to create one.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={editDialogOpen ? handleUpdateTemplate : handleCreateTemplate}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editDialogOpen ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {editDialogOpen ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of "{selectedTemplate?.name}" template
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-slate-400">Category</Label>
                  <p className="font-medium">{selectedTemplate.category}</p>
                </div>
                {selectedTemplate.amount && (
                  <div>
                    <Label className="text-xs text-slate-400">Default Amount</Label>
                    <p className="font-medium">INR {selectedTemplate.amount.toFixed(2)}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-xs text-slate-400">Description</Label>
                  <p className="font-medium">{selectedTemplate.description}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-3 block">Custom Fields ({selectedTemplate.customFields.length})</Label>
                <div className="space-y-2">
                  {selectedTemplate.customFields.map((field, index) => (
                    <div key={index} className="bg-slate-900/60 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{field.label}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{field.type}</Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">Field name: {field.name}</p>
                      {field.options && field.options.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          Options: {field.options.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                  {selectedTemplate.customFields.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No custom fields in this template
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
