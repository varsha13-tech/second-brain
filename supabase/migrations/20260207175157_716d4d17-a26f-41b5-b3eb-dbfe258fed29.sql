-- Create knowledge_items table
CREATE TABLE public.knowledge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'link', 'insight')),
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_knowledge_items_type ON public.knowledge_items(type);
CREATE INDEX idx_knowledge_items_created_at ON public.knowledge_items(created_at DESC);
CREATE INDEX idx_knowledge_items_tags ON public.knowledge_items USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (as per user requirements)
CREATE POLICY "Allow all operations on knowledge_items" 
ON public.knowledge_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_knowledge_items_updated_at
BEFORE UPDATE ON public.knowledge_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();