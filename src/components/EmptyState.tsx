import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasFilters: boolean;
  onNewItem: () => void;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onNewItem, onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
        <Brain className="h-10 w-10 text-primary" />
      </div>
      
      {hasFilters ? (
        <>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No matching items
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Your Second Barin is empty
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Start capturing your knowledge, insights, and important links to build your personal knowledge base.
          </p>
          <Button onClick={onNewItem} className="btn-primary">
            Add Your First Item
          </Button>
        </>
      )}
    </motion.div>
  );
}
