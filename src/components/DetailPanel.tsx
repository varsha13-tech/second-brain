import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeItem } from '@/types/knowledge';
import { format } from 'date-fns';
import { FileText, Link as LinkIcon, Lightbulb, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DetailPanelProps {
  item: KnowledgeItem | null;
  onClose: () => void;
}

const typeIcons = {
  note: FileText,
  link: LinkIcon,
  insight: Lightbulb,
};

export function DetailPanel({ item, onClose }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="detail-panel"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-popover-foreground leading-tight pr-4">
              {item.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
            <span className="inline-flex items-center gap-1.5 capitalize">
              {(() => {
                const Icon = typeIcons[item.type];
                return <Icon className="h-4 w-4" />;
              })()}
              {item.type}
            </span>
            {item.tags && item.tags.length > 0 && (
              <span>Tags: {item.tags.join(', ')}</span>
            )}
          </div>

          <div className="text-sm text-muted-foreground mb-6">
            Created on: {format(new Date(item.created_at), 'MMM d, yyyy')}
          </div>

          {/* Content Section */}
          <section className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Content
            </h3>
            <div className="border-t border-border/50 pt-3">
              <p className="text-popover-foreground leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          </section>

          {/* Summary Section */}
          {item.summary && (
            <section className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Summary
              </h3>
              <div className="border-t border-border/50 pt-3">
                <p className="text-popover-foreground leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </section>
          )}

          {/* Source URL */}
          {item.source_url && (
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Source
              </h3>
              <div className="border-t border-border/50 pt-3">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline break-all"
                >
                  {item.source_url}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </div>
            </section>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
