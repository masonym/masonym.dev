import Link from 'next/link';
import { getAllChangelogEntries, getAvailableFilters } from '@/lib/changelog';

export const metadata = {
  title: 'Changelog | mason\'s maple matrix',
  description: 'What\'s changed across tools on mason\'s maple matrix.',
};

function FilterPills({ tools, categories, currentTool, currentCategory }) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground/70 mr-2">Tool:</span>
        <Link href={`/changelog${currentCategory ? `?category=${encodeURIComponent(currentCategory)}` : ''}`} className={`px-3 py-1 rounded-full border ${!currentTool ? 'bg-primary text-background' : 'hover:bg-primary-dark'}`}>All</Link>
        {tools.map((t) => {
          const qs = new URLSearchParams();
          qs.set('tool', t);
          if (currentCategory) qs.set('category', currentCategory);
          return (
            <Link key={t} href={`/changelog?${qs.toString()}`} className={`px-3 py-1 rounded-full border ${currentTool === t ? 'bg-primary text-background' : 'hover:bg-primary-dark'}`}>{t}</Link>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground/70 mr-2">Category:</span>
        <Link href={`/changelog${currentTool ? `?tool=${encodeURIComponent(currentTool)}` : ''}`} className={`px-3 py-1 rounded-full border ${!currentCategory ? 'bg-primary text-background' : 'hover:bg-primary-dark'}`}>All</Link>
        {categories.map((c) => {
          const qs = new URLSearchParams();
          qs.set('category', c);
          if (currentTool) qs.set('tool', currentTool);
          return (
            <Link key={c} href={`/changelog?${qs.toString()}`} className={`px-3 py-1 rounded-full border capitalize ${currentCategory === c ? 'bg-primary text-background' : 'hover:bg-primary-dark'}`}>{c}</Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Page({ searchParams }) {
  const tool = searchParams?.tool || '';
  const category = searchParams?.category || '';
  const { tools, categories } = getAvailableFilters();
  const entries = getAllChangelogEntries({ tool: tool || undefined, category: category || undefined });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Changelog</h1>

      <FilterPills tools={tools} categories={categories} currentTool={tool} currentCategory={category} />

      <ul className="space-y-4">
        {entries.map((e) => (
          <li key={e.slug} className="border rounded-lg p-4 bg-background-bright/30">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {e.category && <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded bg-primary-dark">{e.category}</span>}
              {e.tool && (
                <Link href={`/changelog?tool=${encodeURIComponent(e.tool)}`} className="text-xs px-2 py-0.5 rounded border hover:bg-primary-dark">
                  {e.tool}
                </Link>
              )}
              {e.date && <span className="text-xs text-foreground/70 ml-auto">{new Date(e.date).toLocaleDateString()}</span>}
            </div>
            <h3 className="text-lg font-medium mb-1">{e.title}</h3>
            {e.summary && <p className="text-foreground/80">{e.summary}</p>}
            {e.detailsHtml && (
              <details className="mt-3">
                <summary className="cursor-pointer select-none text-sm text-primary hover:underline">
                  Details
                </summary>
                <div
                  className="mt-2 text-foreground/90 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:mt-3 [&_h3]:mt-2 [&_code]:bg-background-dim [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-blue-500 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: e.detailsHtml }}
                />
              </details>
            )}
          </li>
        ))}
        {entries.length === 0 && (
          <li className="text-foreground/60">No entries yet.</li>
        )}
      </ul>
    </div>
  );
}
