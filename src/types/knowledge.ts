export type KnowledgeType = 'note' | 'link' | 'insight';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
  source_url: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeItem {
  title: string;
  content: string;
  type: KnowledgeType;
  tags?: string[];
  source_url?: string;
  summary?: string;
}

export type SortOption = 'recent' | 'oldest' | 'title';

export interface FilterState {
  search: string;
  type: KnowledgeType | 'all';
  tags: string[];
  sort: SortOption;
}
