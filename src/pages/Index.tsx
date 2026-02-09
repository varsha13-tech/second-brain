import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { KnowledgeCard } from '@/components/KnowledgeCard';
import { KnowledgeCardSkeleton } from '@/components/KnowledgeCardSkeleton';
import { DetailPanel } from '@/components/DetailPanel';
import { EmptyState } from '@/components/EmptyState';
import { KnowledgeFormModal } from '@/components/KnowledgeFormModal';
import {
  useKnowledgeItems,
  useCreateKnowledgeItem,
  useUpdateKnowledgeItem,
  useDeleteKnowledgeItem,
  useAllTags,
} from '@/hooks/useKnowledgeItems';
import { FilterState, KnowledgeItem, CreateKnowledgeItem } from '@/types/knowledge';
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

const initialFilters: FilterState = {
  search: '',
  type: 'all',
  tags: [],
  sort: 'recent',
};

const Index = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<KnowledgeItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<KnowledgeItem | null>(null);

  const { data: items, isLoading, error } = useKnowledgeItems(filters);
  const { data: allTags = [] } = useAllTags();
  const createMutation = useCreateKnowledgeItem();
  const updateMutation = useUpdateKnowledgeItem();
  const deleteMutation = useDeleteKnowledgeItem();

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.tags.length > 0;

  const handleNewItem = useCallback(() => {
    setEditItem(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: KnowledgeItem) => {
    setEditItem(item);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((item: KnowledgeItem) => {
    setDeleteItem(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteItem) {
      await deleteMutation.mutateAsync(deleteItem.id);
      if (selectedItem?.id === deleteItem.id) {
        setSelectedItem(null);
      }
      setDeleteItem(null);
    }
  }, [deleteItem, deleteMutation, selectedItem]);

  const handleSubmit = useCallback(
    async (data: CreateKnowledgeItem) => {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, ...data });
        if (selectedItem?.id === editItem.id) {
          setSelectedItem({ ...selectedItem, ...data, updated_at: new Date().toISOString() } as KnowledgeItem);
        }
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [editItem, updateMutation, createMutation, selectedItem]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        filters={filters}
        onFilterChange={handleFilterChange}
        allTags={allTags}
        onNewItem={handleNewItem}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Knowledge Items Grid */}
          <div className="flex-1 min-w-0">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-xl font-semibold text-foreground mb-6"
            >
              Knowledge Items
              {items && items.length > 0 && (
                <span className="ml-2 text-muted-foreground font-body font-normal text-base">
                  ({items.length})
                </span>
              )}
            </motion.h2>

            {error ? (
              <div className="text-center py-12 text-destructive">
                Failed to load knowledge items. Please try again.
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <KnowledgeCardSkeleton key={i} index={i} />
                ))}
              </div>
            ) : items && items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onSelect={() => setSelectedItem(item)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                hasFilters={hasActiveFilters}
                onNewItem={handleNewItem}
                onClearFilters={clearFilters}
              />
            )}
          </div>

          {/* Detail Panel - Desktop */}
          <div className="hidden lg:block w-[380px] shrink-0">
            {selectedItem ? (
              <div className="sticky top-28">
                <DetailPanel
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                />
              </div>
            ) : (
              <div className="sticky top-28 detail-panel flex items-center justify-center text-muted-foreground text-sm">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Knowledge Form Modal */}
      <KnowledgeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
        editItem={editItem}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
