# Research Desk — Workflow

## Übersicht

Research Desk ist ein Tool zur strukturierten Recherche und Artikel-Erstellung. Der Workflow verhindert, dass fremder Text (TikTok-Captions, Reddit-Posts) direkt in Artikel-Entwürfe fließt — stattdessen destillierst du selbst die Kernidee, bevor die KI daraus einen Artikel macht.

```
Source (Fundstelle)  →  Idea (Thema)  →  Article Draft (KI-Entwurf)  →  Article (fertig)
```

---

## Globaler Header

Jede Seite zeigt oben einen globalen Header:
- **Links:** Label „Project" + Dropdown zur Projektauswahl (mit Quellen- und Ideenzähler je Projekt)
- **Rechts:** Zahnrad-Icon → `/settings`

Das aktive Projekt bestimmt, welche Sources, Ideas und Articles angezeigt werden.

---

## Schritt 1: Quelle erfassen — Sources

**Wo:** `/sources` → Capture-Button (oben rechts)

Du hast etwas Interessantes auf Reddit, TikTok etc. gefunden.

| Feld | Beschreibung |
|------|-------------|
| URL | Link zur Originalquelle (Pflicht) |
| Platform | Reddit, TikTok, Instagram, YouTube, Forum, Other (wird aus URL erkannt) |
| Note | **Deine eigene Beobachtung** — kein copy/paste des Originaltexts |
| Topic Area | Optional: Region → Provinz (oder tiefer, wenn verfügbar) |

> **Wichtig:** Das Feld „Note" ist für deine eigene Zusammenfassung gedacht — nie für den Original-Text der Quelle. Der Original-Text fließt niemals in den AI-Prompt.

Neu erfasste Sources erscheinen im Ordner **Inbox** mit Status **NEW**.

---

## Schritt 2: Sources verwalten — Sources

**Wo:** `/sources`

Die Seite ist dreispaltig aufgebaut (Mail-Client-Layout):

| Spalte | Inhalt |
|--------|--------|
| **Ordner** (links) | Inbox (unsortiert) + eigene Ordner zur Ablage |
| **Liste** (Mitte) | Sources im aktiven Ordner, filterbar nach Status und Platform |
| **Detail** (rechts) | Vollansicht der markierten Source |

### Ordner
- **Inbox** = Sources ohne Ordner-Zuweisung (Standard)
- Eigene Ordner anlegen, umbenennen, löschen (per Icons in der Ordnerliste)
- Sources per Checkbox auswählen und in Ordner verschieben (Bulk-Toolbar)

### Source-Aktionen (Detailpanel)
| Aktion | Was passiert |
|--------|-------------|
| **Edit** | URL, Platform, Note, Status, Topic Area bearbeiten |
| **Link to Idea** | Source mit einer Idea verknüpfen → Status → LINKED TO IDEA |
| **Discard** | Status → DISCARDED |

### Status-Übergänge
```
NEW → REVIEWED → LINKED TO IDEA
                ↘ DISCARDED
```
Wird der Status einer verlinkten Source auf NEW oder REVIEWED zurückgesetzt, wird die IdeaSource-Verknüpfung automatisch entfernt.

### Link to Idea
Ein Popup bietet zwei Optionen:
- **Neue Idea erstellen** — Titel, Kategorie, Topic Area und optionale Zusammenfassung eingeben
- **Bestehende Idea auswählen** — Source an eine bereits vorhandene Idea-Karte hängen

Nach dem Verknüpfen:
- Source-Status wechselt auf **LINKED TO IDEA**
- Der `confirmationCount` der Idea steigt um 1
- Eine Source kann mit **mehreren Ideas** verknüpft sein

### Filter
- **Platform:** Reddit, TikTok, Instagram, YouTube, Forum, Other
- **Status:** All / New / Reviewed / Linked / Discarded / Merged (Standard: **New**)
- **Suche:** Freitext in URL

---

## Schritt 3: Idea entwickeln — Ideas

**Wo:** `/ideas`

Kanban-Board mit fünf Spalten:

```
IDEA  →  RECHERCHE  →  ENTWURF  →  REVIEW  →  VERÖFFENTLICHT
```

Ideas mit einem vorhandenen Artikel werden mit einem amber-farbenen Rahmen und dem Label **✦ Article** angezeigt. Klick auf die Karte öffnet die Idea-Detailseite; ein separater Button **Open Article** führt direkt zum Artikel-Editor.

### Idea-Felder
| Feld | Beschreibung |
|------|-------------|
| **Titel / Angle** | Die konkrete Fragestellung oder das Thema |
| **Kategorie** | Dynamisch verwaltbar in Settings → Categories |
| **Topic Area** | Geographische Einordnung (Region / Provinz / Ort) |
| **Credibility** | NIEDRIG / MITTEL / HOCH / BESTÄTIGT |
| **Summary** | Eigene Zusammenfassung des Themas |
| **Research Notes** | Eigene Recherche-Notizen (kein Originaltext) |

### Linked Sources
Alle verknüpften Sources sind auf der Idea-Detailseite sichtbar (Platform, URL, Datum) — als Referenz, nicht als Input für die KI.

---

## Schritt 4: AI Draft generieren — Idea-Detail

**Wo:** `/ideas/[id]` → **Generate AI Draft**

Die KI erhält **ausschließlich** diese Felder:
- Titel, Kategorie, Topic Area (als Pfad)
- Summary, Research Notes
- Anzahl der verknüpften Sources, Credibility-Level
- Aktuelles Datum

**Die KI sieht niemals:** URLs, Original-Captions, rawText der Sources.

### Template-Auflösung (automatisch)
1. Manuell im Dropdown gewählt (Override)
2. Template das dem Topic Area der Idea zugeordnet ist
3. Template das einem übergeordneten Topic Area zugeordnet ist (Provinz → Region → Land)
4. Global als Default markiertes Template

Nach der Generierung wechselt der Idea-Status auf **ENTWURF** und der Artikel ist unter `/articles` sichtbar.

---

## Schritt 5: Artikel finalisieren — Articles

**Wo:** `/articles`

Zweispaltig (wie Sources):
- **Links:** Liste aller Artikel mit Suche, Status-Filter und Pagination (30 pro Seite)
- **Rechts:** Vorschau des ausgewählten Artikels inkl. verlinkter Sources

Klick auf **Open Editor** öffnet `/articles/[id]` mit:
- Vollständigem Markdown-Editor
- Publish-Status: Draft → In Review → Published
- Published URL (optional)
- Export-Funktion
- Verlinkter Sources-Liste (zur Referenz)

---

## Einstellungen

**Wo:** `/settings`

Drei Tabs:

### Prompt Templates
Eigene Prompts für die AI-Generierung.

Verfügbare Template-Variablen:
| Variable | Inhalt |
|----------|--------|
| `{{title}}` | Titel der Idea |
| `{{category}}` | Kategorie (englisch) |
| `{{area}}` | Topic Area als Pfad (z.B. „Northern Thailand › Chiang Mai") |
| `{{sourceCount}}` | Anzahl verknüpfter Sources |
| `{{credibility}}` | Credibility-Level |
| `{{summary}}` | Zusammenfassung |
| `{{researchNotes}}` | Research Notes |
| `{{date}}` | Aktueller Monat + Jahr |

Ein Template kann optional einem Topic Area zugeordnet werden — dann wird es automatisch für alle Ideas in diesem Bereich verwendet.

### Topic Areas
Verwaltung der Location-Hierarchie.

```
Country  →  Region  →  Province  →  Place / Ort  →  Hotel / Restaurant / Shop / Attraction / POI
```

Für jede Location kann ein Prompt-Template zugeordnet werden.

### Categories
Verwaltung der Idea-Kategorien (CRUD: Name, Farbe). Änderungen wirken sich sofort auf alle Kategorie-Auswahlfelder und Badges in der App aus.

---

## Architektonische Einschränkung

> **Source → Idea → Article** ist der einzig erlaubte Pfad.

`lib/idea-reader.ts` hat technisch keinen Zugriff auf `Source.rawText`. Dies ist eine strukturelle Einschränkung (nicht nur Konvention), abgesichert durch Regressionstests in `__tests__/no-rawtext-in-prompt.test.ts`.

Alle Artikel erhalten beim Erstellen zwingend eine `projectId` — NULL-Werte sind auf Schema-Ebene ausgeschlossen.
