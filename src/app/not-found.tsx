import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold">404</h2>
      <p className="text-neutral-600">This page does not exist.</p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
