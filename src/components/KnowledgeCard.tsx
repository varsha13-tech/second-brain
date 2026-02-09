import { motion } from 'framer-motion';
import { KnowledgeItem, KnowledgeType } from '@/types/knowledge';
import { cn } from '@/lib/utils';
import { FileText, Link as LinkIcon, Lightbulb, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface KnowledgeCardProps {
  item: KnowledgeItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

const typeConfig: Record<KnowledgeType, { icon: typeof FileText; accent: boolean }> = {
  note: { icon: FileText, accent: false },
  link: { icon: LinkIcon, accent: false },
  insight: { icon: Lightbulb, accent: true },
};

export function KnowledgeCard({
  item,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  index,
}: KnowledgeCardProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onSelect}
      className={cn(
        'knowledge-card cursor-pointer group relative',
        isSelected && 'knowledge-card-active',
        config.accent && 'bg-primary/80 text-primary-foreground'
      )}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={cn(
          'font-display text-lg font-semibold leading-tight line-clamp-2',
          config.accent ? 'text-primary-foreground' : 'text-card-foreground'
        )}>
          {item.title}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                config.accent && 'hover:bg-primary-foreground/10'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={cn(
                'tag-badge',
                config.accent && 'bg-primary-foreground/20 text-primary-foreground'
              )}
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className={cn(
              'tag-badge',
              config.accent && 'bg-primary-foreground/20 text-primary-foreground'
            )}>
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Summary or Content Preview */}
      <p className={cn(
        'text-sm leading-relaxed line-clamp-2',
        config.accent ? 'text-primary-foreground/80' : 'text-muted-foreground'
      )}>
        {item.summary || item.content}
      </p>

      {/* Footer */}
      <div className={cn(
        'flex items-center gap-2 mt-4 pt-3 border-t',
        config.accent ? 'border-primary-foreground/20' : 'border-border/50'
      )}>
        <Icon className={cn(
          'h-4 w-4',
          config.accent ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )} />
        <span className={cn(
          'text-xs capitalize',
          config.accent ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}>
          {item.type}
        </span>
      </div>
    </motion.article>
  );
}
