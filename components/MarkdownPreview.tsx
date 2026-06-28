"use client";

export default function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} style={{ fontSize: 24, fontWeight: 800, color: "#1F1A13", marginBottom: 6, marginTop: 8 }}>
        {inlineRender(line.slice(2))}
      </h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontSize: 17, fontWeight: 700, color: "#1F1A13", marginBottom: 6, marginTop: 20,
        borderLeft: "3px solid #C8892E", paddingLeft: 10 }}>
        {inlineRender(line.slice(3))}
      </h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 700, color: "#1F1A13", marginBottom: 4, marginTop: 16 }}>
        {inlineRender(line.slice(4))}
      </h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ marginBottom: 12, paddingLeft: 0, listStyle: "none" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 14, color: "#1F1A13", lineHeight: 1.6 }}>
              <span style={{ color: "#C8892E", flexShrink: 0 }}>→</span>
              {inlineRender(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #E0D8C8", margin: "16px 0" }} />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      elements.push(<p key={i} style={{ fontSize: 12, color: "#A89C8E", fontStyle: "italic", marginBottom: 8 }}>
        {inlineRender(line.slice(1, -1))}
      </p>);
    } else {
      elements.push(<p key={i} style={{ fontSize: 14, color: "#1F1A13", lineHeight: 1.7, marginBottom: 10 }}>
        {inlineRender(line)}
      </p>);
    }
    i++;
  }

  return <div>{elements}</div>;
}

function inlineRender(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
    const checkMatch = remaining.match(/\[CHECK:([^\]]+)\]|\[PRÜFEN:([^\]]+)\]/);

    const matches = [boldMatch, italicMatch, linkMatch, checkMatch]
      .filter(Boolean)
      .sort((a, b) => (a!.index ?? 0) - (b!.index ?? 0));

    if (!matches.length) {
      parts.push(remaining);
      break;
    }

    const first = matches[0]!;
    if (first.index! > 0) parts.push(remaining.slice(0, first.index!));

    if (first === boldMatch) {
      parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{first[1]}</strong>);
    } else if (first === italicMatch) {
      parts.push(<em key={key++}>{first[1]}</em>);
    } else if (first === linkMatch) {
      parts.push(<a key={key++} href={first[2]} target="_blank" rel="noreferrer"
        style={{ color: "#C8892E" }}>{first[1]}</a>);
    } else if (first === checkMatch) {
      parts.push(<mark key={key++} style={{ background: "#FFF3DC", color: "#C8892E",
        padding: "0 3px", borderRadius: 2 }}>[CHECK:{first[1] ?? first[2]}]</mark>);
    }

    remaining = remaining.slice(first.index! + first[0].length);
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
