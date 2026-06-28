# Tailwind Migration — Schrittweise

Tokens sind in `app/globals.css` im `@theme`-Block definiert.
Regel: **Wenn du eine Datei sowieso anfasst, migriere sie vollständig.**

## Konventionen

### Semantische Token → Tailwind-Klasse

| Rolle | Token | Klasse |
|---|---|---|
| App-Hintergrund | `--color-surface` | `bg-surface` |
| Card / Panel | `--color-card` | `bg-card` |
| Modal / Overlay | `--color-overlay` | `bg-overlay` |
| Sidebar | `--color-sidebar` | `bg-sidebar` |
| Primäraktion | `--color-action` | `bg-action`, `text-action`, `border-action` |
| Primäraktion Hover | `--color-action-hover` | `bg-action-hover` |
| Primäraktion subtle | `--color-action-subtle` | `bg-action-subtle` |
| Gefahr | `--color-danger` | `text-danger`, `border-danger` |
| Gefahr Hintergrund | `--color-danger-subtle` | `bg-danger-subtle` |
| Akzent (Teal) | `--color-accent` | `text-accent`, `bg-accent` |
| Border | `--color-border` | `border-border` |
| Border stark | `--color-border-strong` | `border-border-strong` |
| Text Haupttext | `--color-text` | `text-text` |
| Text sekundär | `--color-text-muted` | `text-text-muted` |
| Text tertiär | `--color-text-faint` | `text-text-faint` |

### Typografie

| Inline style | Tailwind-Klasse |
|---|---|
| `fontSize: 11` | `text-[11px]` |
| `fontSize: 12` | `text-xs` |
| `fontSize: 13` | `text-[13px]` |
| `fontWeight: 700` | `font-bold` |
| `fontWeight: 600` | `font-semibold` |
| `borderRadius: 6` | `rounded-md` |
| `borderRadius: 99` | `rounded-full` |

---

## Dateien

### Components

- [x] `components/ui.tsx` — Button, Badge, LocationCrumb, PlatformBadge, StatusBadge
- [x] `components/Sidebar.tsx`
- [x] `components/CaptureModal.tsx`
- [x] `components/EditSourceModal.tsx`
- [x] `components/IdeaLinkModal.tsx`
- [ ] `components/MergeModal.tsx`
- [ ] `components/NewIdeaModal.tsx`
- [ ] `components/LocationPicker.tsx`
- [ ] `components/GlobalHeader.tsx`

### Pages / App

- [ ] `app/(app)/layout.tsx`
- [ ] `app/(app)/sources/page.tsx`
- [ ] `app/(app)/ideas/page.tsx`
- [ ] `app/(app)/ideas/[id]/page.tsx`
- [ ] `app/(app)/articles/page.tsx`
- [ ] `app/(app)/articles/[id]/page.tsx`
- [ ] `app/(app)/settings/page.tsx`
- [ ] `app/layout.tsx`
- [ ] `app/page.tsx`
- [ ] `app/providers.tsx`

---

## Vorgehen pro Datei

1. Alle `style={{ ... }}`-Props durch Tailwind-Klassen ersetzen
2. Komplexe dynamische Styles (z.B. aktive Farbe per State) mit `cn()` oder Template-Strings lösen
3. Hardcodierte Hex-Werte die keinem Token entsprechen → Token ergänzen oder nächsten passenden Token verwenden
4. Nach Migration: kurz im Browser prüfen, kein visueller Unterschied
