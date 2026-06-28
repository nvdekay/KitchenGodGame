import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/** Public landing page. */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-neutral-50 to-neutral-100 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">KitchenGodGame</h1>
      <p className="max-w-md text-neutral-600">
        Vượt qua <span className="font-medium text-brand">5 chặng</span> câu hỏi — mỗi chặng mở
        khoá chặng tiếp theo. Trả lời đúng hết để qua chặng và về đích nhanh nhất!
      </p>
      <div className="flex gap-3">
        <Link href="/play">
          <Button>Chơi ngay</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Đăng nhập</Button>
        </Link>
      </div>
    </main>
  );
}
