import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeItem, CreateKnowledgeItem, FilterState } from '@/types/knowledge';
import { toast } from 'sonner';

export function useKnowledgeItems(filters: FilterState) {
  return useQuery({
    queryKey: ['knowledge-items', filters],
    queryFn: async (): Promise<KnowledgeItem[]> => {
      let query = supabase
        .from('knowledge_items')
        .select('*');

      // Apply type filter
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      // Apply tag filter
      if (filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Apply search filter
      if (filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
      }

      // Apply sorting
      switch (filters.sort) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching knowledge items:', error);
        throw error;
      }

      return data as KnowledgeItem[];
    },
  });
}

export function useCreateKnowledgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CreateKnowledgeItem): Promise<KnowledgeItem> => {
      const { data, error } = await supabase
        .from('knowledge_items')
        .insert([item])
        .select()
        .single();

      if (error) {
        console.error('Error creating knowledge item:', error);
        throw error;
      }

      return data as KnowledgeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
      toast.success('Knowledge item created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create knowledge item');
      console.error(error);
    },
  });
}

export function useUpdateKnowledgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KnowledgeItem> & { id: string }): Promise<KnowledgeItem> => {
      const { data, error } = await supabase
        .from('knowledge_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating knowledge item:', error);
        throw error;
      }

      return data as KnowledgeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
      toast.success('Knowledge item updated');
    },
    onError: (error) => {
      toast.error('Failed to update knowledge item');
      console.error(error);
    },
  });
}

export function useDeleteKnowledgeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting knowledge item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-items'] });
      toast.success('Knowledge item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete knowledge item');
      console.error(error);
    },
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: ['all-tags'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('tags');

      if (error) {
        console.error('Error fetching tags:', error);
        throw error;
      }

      const allTags = new Set<string>();
      data.forEach((item: { tags: string[] }) => {
        item.tags?.forEach((tag) => allTags.add(tag));
      });

      return Array.from(allTags).sort();
    },
  });
}
