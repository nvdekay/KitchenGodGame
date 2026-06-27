/** Admin overview — scaffolding only. Real dashboards/widgets get added as
 *  admin features later; this proves the protected route + layout work. */
export default function AdminOverviewPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Overview</h1>
      <p className="mt-2 text-neutral-600">
        Admin dashboard scaffolding. Add metrics, moderation, and content tools
        as features under <code>/admin/*</code>.
      </p>
    </section>
  );
}
