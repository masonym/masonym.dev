const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const CHANGELOG_DIR = path.join(process.cwd(), "src", "content", "changelog");
const OUT_FILE = path.join(process.cwd(), "src", "data", "changelog.json");
const PUBLIC_OUT_FILE = path.join(process.cwd(), "public", "changelog.json");

function build() {
  if (!fs.existsSync(CHANGELOG_DIR)) {
    console.log("no changelog dir, skipping");
    return;
  }

  const files = fs.readdirSync(CHANGELOG_DIR).filter((f) => f.endsWith(".mdx"));
  const entries = files.map((filename) => {
    const fullPath = path.join(CHANGELOG_DIR, filename);
    const source = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(source);

    return {
      slug: data.slug || filename.replace(/\.(md|mdx)$/, ""),
      title: data.title || filename,
      date: data.date ? new Date(data.date).toISOString() : null,
      tool: data.tool || null,
      category: data.category || "changed",
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || null,
      summary: data.summary || null,
      detailsHtml:
        content && content.trim().length ? marked.parse(content) : "",
    };
  });

  entries.sort((a, b) => {
    const ad = a.date ? Date.parse(a.date) : 0;
    const bd = b.date ? Date.parse(b.date) : 0;
    return bd - ad;
  });

  fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2));
  // Also write to public for client-side fetching at /changelog.json
  fs.writeFileSync(PUBLIC_OUT_FILE, JSON.stringify(entries, null, 2));
  console.log(`wrote ${entries.length} changelog entries to:\n - ${OUT_FILE}\n - ${PUBLIC_OUT_FILE}`);
}

build();
