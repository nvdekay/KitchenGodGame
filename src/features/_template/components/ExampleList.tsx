'use client';

import { useExampleItems } from '../hooks/useExample';

/** TEMPLATE component. Demonstrates the hook → service flow. */
export function ExampleList() {
  const { data, isLoading } = useExampleItems();
  if (isLoading) return <p>Loading…</p>;
  return (
    <ul>
      {(data ?? []).map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
