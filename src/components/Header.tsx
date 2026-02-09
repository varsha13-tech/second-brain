import { motion } from 'framer-motion';
import { FilterState, KnowledgeType, SortOption } from '@/types/knowledge';
import { useAuth } from "@/contexts/auth.core";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, Search, ChevronDown, LogOut, User } from 'lucide-react';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  allTags: string[];
  onNewItem: () => void;
}

export function Header({ filters, onFilterChange, allTags, onNewItem }: HeaderProps) {
  const { user, signOut } = useAuth();
  const typeOptions: { value: KnowledgeType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'note', label: 'Note' },
    { value: 'link', label: 'Link' },
    { value: 'insight', label: 'Insight' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'title', label: 'Title A-Z' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground tracking-tight shrink-0">
          Second Barin
        </h1>

        <div className="flex flex-1 flex-wrap items-center gap-3 md:ml-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-9 bg-background/50 border-input focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={filters.type}
            onValueChange={(value) => onFilterChange({ type: value as KnowledgeType | 'all' })}
          >
            <SelectTrigger className="w-[130px] bg-background/50">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tags Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background/50">
                Tags
                {filters.tags.length > 0 && (
                  <span className="ml-1.5 bg-primary/20 text-primary-foreground px-1.5 py-0.5 rounded-full text-xs">
                    {filters.tags.length}
                  </span>
                )}
                <ChevronDown className="ml-1.5 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {allTags.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No tags yet</div>
              ) : (
                allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange({ tags: [...filters.tags, tag] });
                      } else {
                        onFilterChange({ tags: filters.tags.filter((t) => t !== tag) });
                      }
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <Select
            value={filters.sort}
            onValueChange={(value) => onFilterChange({ sort: value as SortOption })}
          >
            <SelectTrigger className="w-[130px] bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  Sort: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* New Item Button */}
          <Button onClick={onNewItem} className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Knowledge Item</span>
            <span className="sm:hidden">New</span>
          </Button>

          {/* User menu / Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto shrink-0" aria-label="Account menu">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.email && (
                <DropdownMenuItem disabled className="text-muted-foreground font-normal">
                  {user.email}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
