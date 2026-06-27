'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { listExampleItems } from '../services/example.service';

/** TEMPLATE hook. React Query owns caching; the service owns the fetch. */
export function useExampleItems() {
  return useQuery({
    queryKey: ['example', 'list'],
    queryFn: () => listExampleItems(createClient()),
  });
}
