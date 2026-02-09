import { motion } from 'framer-motion';

export function KnowledgeCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="knowledge-card"
    >
      <div className="skeleton-pulse h-6 w-3/4 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton-pulse h-5 w-16 rounded-full" />
        <div className="skeleton-pulse h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-pulse h-4 w-full" />
        <div className="skeleton-pulse h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
        <div className="skeleton-pulse h-4 w-4 rounded" />
        <div className="skeleton-pulse h-3 w-12" />
      </div>
    </motion.div>
  );
}
