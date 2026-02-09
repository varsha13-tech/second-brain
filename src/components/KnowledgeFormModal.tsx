import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KnowledgeItem, KnowledgeType, CreateKnowledgeItem } from '@/types/knowledge';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  type: z.enum(['note', 'link', 'insight']),
  tags: z.string().optional(),
  source_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface KnowledgeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateKnowledgeItem) => Promise<void>;
  editItem?: KnowledgeItem | null;
}

export function KnowledgeFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
}: KnowledgeFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [aiFallbackUsed, setAiFallbackUsed] = useState(false);
  const { summarize, autoTag, isLoading: isAILoading } = useAI();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'note',
      tags: '',
      source_url: '',
    },
  });

  useEffect(() => {
    if (editItem) {
      form.reset({
        title: editItem.title,
        content: editItem.content,
        type: editItem.type,
        tags: editItem.tags?.join(', ') || '',
        source_url: editItem.source_url || '',
      });
    } else {
      form.reset({
        title: '',
        content: '',
        type: 'note',
        tags: '',
        source_url: '',
      });
    }
    setSuggestedTags([]);
  }, [editItem, form, isOpen]);

  const handleAutoTag = async () => {
    const title = form.getValues('title');
    const content = form.getValues('content');
    
    if (!title || !content) {
      return;
    }

    const result = await autoTag(title, content);
    const tags = result.tags || [];
    setAiFallbackUsed(Boolean(result.fallback));
    if (tags.length > 0) {
      setSuggestedTags(tags);
    }
  };

  const addSuggestedTag = (tag: string) => {
    const currentTags = form.getValues('tags');
    const tagsArray = currentTags ? currentTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (!tagsArray.includes(tag)) {
      tagsArray.push(tag);
      form.setValue('tags', tagsArray.join(', '));
    }
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tags
        ? data.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        : [];

      let summary: string | null = null;
      if (!editItem?.summary && data.content.length > 100) {
        summary = await summarize(data.title, data.content);
      }

      await onSubmit({
        title: data.title,
        content: data.content,
        type: data.type as KnowledgeType,
        tags: tagsArray,
        source_url: data.source_url || undefined,
        summary: summary || editItem?.summary || undefined,
      });

      form.reset();
      setSuggestedTags([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editItem ? 'Edit Knowledge Item' : 'New Knowledge Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter a descriptive title..."
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="input-field">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="insight">Insight</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your knowledge, insight, or description..."
                      className="input-field min-h-[150px] resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Tags</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoTag}
                      disabled={isAILoading || !form.getValues('title') || !form.getValues('content')}
                      className="h-7 text-xs gap-1.5"
                    >
                      {isAILoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Suggest Tags
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter tags separated by commas..."
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                  {aiFallbackUsed && (
                    <div className="text-sm text-muted-foreground mt-2" aria-live="polite">
                      Using local tag suggestions (offline)
                    </div>
                  )}
                  
                  {/* Suggested tags */}
                  <AnimatePresence>
                    {suggestedTags.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-1.5 mt-2"
                      >
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addSuggestedTag(tag)}
                            className="tag-badge hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com/article"
                      className="input-field"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary min-w-[100px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editItem ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
