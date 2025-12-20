import fs from 'fs';
import path from 'path';
import './styles.css';

export const metadata = {
  title: "v.265 New Familiar Options | mason's maple matrix",
  description: "View new familiar options in MapleStory's v.265. This includes mostly Mystic Frontier potential lines.",
};

export default function NewFamiliarOptionsPage() {
  // Read the HTML file at build/request time (no client fetch)
  const htmlPath = path.join(process.cwd(), 'public', 'new_familiar_options.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : '';

  return (
    <div
      className="familiar-options-container"
      dangerouslySetInnerHTML={{ __html: bodyContent }}
    />
  );
}
