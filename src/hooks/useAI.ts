import { useState } from 'react';
import { toast } from 'sonner';
import { env } from '@/lib/env';

const AI_FUNCTION_URL = `${env.SUPABASE_URL}/functions/v1/ai-process`;

/**
 * Lightweight client-side fallback for tag generation when the AI function
 * is unavailable or the OpenAI key isn't configured. This extracts
 * candidate keywords by stripping punctuation, removing stopwords, and
 * returning the top-frequency words as tags.
 * 
 * @param text - The input text to extract tags from
 * @param maxTags - Maximum number of tags to return (default: 6)
 * @returns Array of extracted tags sorted by frequency
 */
export const fallbackExtractTags = (text: string, maxTags = 6): string[] => {
  if (!text) return [];
  const stopwords = new Set([
    'the','and','a','an','of','to','in','for','on','with','is','are','was','were','be','by','this','that','it','as','at','from','or','we','you','your','i','my','me','our','they','their','but','not','have','has','had','can','will','would','should','could'
  ]);

  const cleaned = text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ');

  const words = cleaned.split(/\s+/).filter(Boolean);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3) continue;
    if (stopwords.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  return sorted.slice(0, maxTags);
};

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);

  const summarize = async (title: string, content: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(AI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'summarize', title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error('Failed to generate summary');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const autoTag = async (title: string, content: string): Promise<{ tags: string[]; fallback: boolean }> => {
    setIsLoading(true);
    try {
      const response = await fetch(AI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'auto-tag', title, content }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate tags';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.status === 404
            ? 'AI feature not deployed. Run: supabase functions deploy ai-process'
            : `Request failed (${response.status})`;
        }
          // Graceful fallback: extract tags locally so the "Suggest Tags"
          // button still works even when the AI function or OpenAI key is missing.
          // Show a non-error toast so the UI doesn't display a network error.
          toast.success('AI unavailable — using local tag suggestions.');
          const fallbackText = `${title} \n ${content}`;
          const fallbackTags = fallbackExtractTags(fallbackText);
          return { tags: fallbackTags, fallback: true };
      }

        const data = await response.json();
        return { tags: data.tags || [], fallback: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate tags';
      console.error('Auto-tag error:', error);
      // Use a non-error toast to avoid alarming the user with low-level
      // network messages like "Failed to fetch" while still indicating
      // the app applied a local fallback.
      toast.success('Using local tag suggestions (offline).');
      const fallbackText = `${title} \n ${content}`;
      const fallbackTags = fallbackExtractTags(fallbackText);
      return { tags: fallbackTags, fallback: true };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summarize,
    autoTag,
    isLoading,
  };
}
