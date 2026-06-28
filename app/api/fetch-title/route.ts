import { NextRequest, NextResponse } from "next/server";

const OEMBED_PROVIDERS: { pattern: RegExp; endpoint: string }[] = [
  { pattern: /tiktok\.com/i, endpoint: "https://www.tiktok.com/oembed?url=" },
  { pattern: /youtube\.com|youtu\.be/i, endpoint: "https://www.youtube.com/oembed?format=json&url=" },
  { pattern: /instagram\.com/i, endpoint: "https://graph.facebook.com/v18.0/instagram_oembed?url=" },
  { pattern: /reddit\.com/i, endpoint: "https://www.reddit.com/oembed?url=" },
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const provider = OEMBED_PROVIDERS.find((p) => p.pattern.test(url));

  try {
    if (provider) {
      const res = await fetch(`${provider.endpoint}${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const d = await res.json();
        const title = d.title ?? d.author_name ?? null;
        return NextResponse.json({ title });
      }
    }

    // Fallback: parse <title> from HTML
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ResearchDesk/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = match
      ? match[1].trim()
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
      : null;
    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: null });
  }
}
