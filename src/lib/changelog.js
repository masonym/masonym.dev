import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CHANGELOG_DIR = path.join(process.cwd(), 'src', 'content', 'changelog');

export function getAllChangelogEntries({ tool, category } = {}) {
  if (!fs.existsSync(CHANGELOG_DIR)) return [];
  const files = fs.readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith('.mdx'));
  const entries = files.map((filename) => {
    const fullPath = path.join(CHANGELOG_DIR, filename);
    const source = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(source);

    const fm = {
      slug: data.slug || filename.replace(/\.(md|mdx)$/, ''),
      title: data.title || filename,
      date: data.date ? new Date(data.date).toISOString() : null,
      tool: data.tool || null,
      category: data.category || 'changed',
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || null,
      summary: data.summary || null,
      detailsHtml: content && content.trim().length ? marked.parse(content) : '',
    };
    return fm;
  });

  const filtered = entries
    .filter((e) => (tool ? e.tool === tool : true))
    .filter((e) => (category ? e.category === category : true))
    .sort((a, b) => {
      const ad = a.date ? Date.parse(a.date) : 0;
      const bd = b.date ? Date.parse(b.date) : 0;
      return bd - ad;
    });

  return filtered;
}

export function getAvailableFilters() {
  const entries = getAllChangelogEntries();
  const tools = Array.from(new Set(entries.map((e) => e.tool).filter(Boolean))).sort();
  const categories = Array.from(new Set(entries.map((e) => e.category).filter(Boolean))).sort();
  return { tools, categories };
}
