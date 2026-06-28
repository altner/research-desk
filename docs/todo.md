# Research Desk — To-Do

## Blog-Anbindung (Astro)

- [ ] `slug`-Feld auf `Article` hinzufügen (für saubere Blog-URLs statt CUID)
- [ ] Export-Route (`/api/articles/[id]/export`) um Frontmatter erweitern (slug, category, location, publishedAt)
- [ ] `EXPORT_DIR` Unterstützung pro Projekt (z.B. `EXPORT_DIR_<projectId>`)
- [ ] Astro Content Layer Loader als Beispiel dokumentieren
- [ ] Webhook beim Publish-Status-Wechsel → Astro rebuild triggern

## API & Sicherheit

- [ ] API-Key Authentifizierung (für externen Zugriff z.B. vom Astro-Blog)
- [ ] Rate Limiting auf API-Routen

## Artikel

- [ ] `slug`-Feld auf `Article` (Voraussetzung für Blog-URLs)
- [ ] Mehrere KI-Drafts pro Artikel verwalten (History / Versionen)
- [ ] Bild-Unterstützung (Upload oder URL-Feld)

## Sources

- [ ] Ordner-Hierarchie (Unterordner verschachteln)
- [ ] Automatische Duplikat-Erkennung beim Import verbessern

## Medien / Fotos

- [ ] MinIO als selbst gehosteten S3-kompatiblen Storage einrichten (Docker auf VPS)
- [ ] `@aws-sdk/client-s3` Integration: Upload-Route `/api/media/upload` pro Projekt
- [ ] Einfache Medienbibliothek im UI: Upload → Vorschau → URL in Zwischenablage kopieren
- [ ] URL direkt in Markdown-Editor einfügen (Insert Image Button)
- [ ] Optional: Cloudflare R2 als Alternative (kein eigener Server nötig, globales CDN)

## Ideen / Nice-to-have

- [ ] Bulk-Import von Sources (CSV / OPML)
- [ ] Mobile-taugliche Erfassung (schnelles Capture von unterwegs)
- [ ] Statistiken / Dashboard (Sources pro Woche, Artikel pro Projekt, …)
