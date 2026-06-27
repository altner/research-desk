import crypto from "crypto";

const TRACKING_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid", "mc_cid", "mc_eid", "ref", "igshid", "s",
];

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const param of TRACKING_PARAMS) u.searchParams.delete(param);
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase();
  }
}

export function hashText(text: string): string {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
}

export function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  } catch { /* ignore */ }
  return "other";
}
