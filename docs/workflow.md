# Research Desk — Workflow

## Übersicht

Research Desk ist ein Tool zur strukturierten Recherche und Artikel-Erstellung. Der Workflow verhindert, dass fremder Text (TikTok-Captions, Reddit-Posts) direkt in Artikel-Entwürfe fließt — stattdessen destillierst du selbst die Kernidee, bevor die KI daraus einen Artikel macht.

```
Source (Fundstelle)  →  Idea (Thema)  →  Article Draft (KI-Entwurf)  →  Article (fertig)
```

---

## Schritt 1: Quelle erfassen — Inbox

**Wo:** `/inbox` → **+ New Source**

Du hast etwas Interessantes auf Reddit, TikTok etc. gefunden.

| Feld | Beschreibung |
|------|-------------|
| URL | Link zur Originalquelle |
| Platform | Reddit, TikTok, Instagram, YouTube, Forum, Other |
| Note | **Deine eigene Beobachtung** — kein copy/paste des Originaltexts |
| Topic Area | Optional: Region → Provinz (oder tiefer, wenn verfügbar) |

> **Wichtig:** Das Feld "Note" ist für deine eigene Zusammenfassung gedacht, nicht für den Original-Text der Quelle. Der Original-Text fließt niemals in den AI-Prompt.

Neu erfasste Sources erscheinen im Inbox mit Status **NEW**.

---

## Schritt 2: Sources verarbeiten — Inbox

**Wo:** `/inbox` (Standard-Filter: **New**)

Sources einzeln oder per Mehrfachauswahl (Checkbox) bearbeiten:

### Aktionen

| Aktion | Was passiert |
|--------|-------------|
| **Mark as Reviewed** | Status → REVIEWED (gesehen, kein sofortiger Plan) |
| **Link to Idea** | Source wird mit einer Idea verknüpft → Status → LINKED |
| **Discard** | Status → DISCARDED (nicht relevant) |

### Link to Idea
Ein Popup erscheint mit zwei Optionen:
- **Create new Idea** — Titel, Kategorie, Topic Area und optionale Zusammenfassung eingeben
- **Existing Idea** — Source an eine bereits bestehende Idea-Karte hängen

Wenn eine Source mit einer Idea verknüpft wird:
- Eine `IdeaSource`-Verknüpfung wird angelegt
- Source-Status wechselt auf **LINKED** (verschwindet aus dem NEW-Filter)
- Der `confirmationCount` der Idea wird hochgezählt
- Eine Source kann an **mehrere Ideas** geknüpft sein

### Inbox-Filter
- **Platform**: Reddit, TikTok, etc.
- **Status**: New / Reviewed / Linked / Discarded / Merged (Default: **New**)
- **Suche**: Freitext-Suche in URL

---

## Schritt 3: Idea entwickeln — Ideas

**Wo:** `/ideas`

Kanban-Board mit folgenden Spalten:

```
IDEA → RESEARCHING → DRAFTING → REVIEW → PUBLISHED
```

### Auf der Idea-Karte
- **Titel / Angle** — die konkrete Fragestellung oder das Thema
- **Kategorie** — Hidden Gem, Warning/Risk, Food & Drink, Atmosphere, Cultural Note, Practical Tip, Other
- **Topic Area** — geographische Einordnung (Region / Provinz / Ort)
- **Credibility** — LOW / MEDIUM / HIGH / VERIFIED
- **Summary** — eigene Zusammenfassung des Themas (keine Originaltexte)
- **Research Notes** — eigene Recherche-Notizen, Beobachtungen, Quellen-Einschätzungen

### Linked Sources
Alle verknüpften Sources sind auf der Idea-Seite sichtbar (URL + Platform + Datum) — als Referenz, nicht als Input für die KI.

---

## Schritt 4: AI Draft generieren — Idea-Detail

**Wo:** `/ideas/[id]` → **Generate AI Draft**

Die KI erhält **ausschließlich** diese Felder:
- Titel, Kategorie, Topic Area
- Summary, Research Notes
- Anzahl der verknüpften Sources, Credibility-Level
- Aktuelles Datum

**Die KI sieht niemals:** URLs, Original-Captions, rawText der Sources.

### Template-Auswahl
Das passende Prompt-Template wird automatisch ermittelt:
1. Manuell im Dropdown gewählt (Override)
2. Template das dem Topic Area der Idea zugeordnet ist (z.B. "Thailand Reise-Artikel" für alle Thailand-Ideen)
3. Template das einem übergeordneten Topic Area zugeordnet ist (Provinz → Region → Land)
4. Global als Default markiertes Template

Nach der Generierung: Weiterleitung zum Article-Draft. Idea-Status wechselt auf **DRAFTING**.

---

## Schritt 5: Artikel finalisieren — Articles

**Wo:** `/articles/[id]`

- Markdown-Editor zum Nachbearbeiten des AI-Entwurfs
- Publish-Status: Draft → In Review → Published
- Published URL eintragen
- Export-Funktion

---

## Einstellungen

**Wo:** `/settings`

### Prompt Templates
Eigene Prompts für die AI-Generierung.

Verfügbare Template-Variablen:
| Variable | Inhalt |
|----------|--------|
| `{{title}}` | Titel der Idea |
| `{{category}}` | Kategorie (englisch) |
| `{{area}}` | Topic Area als Pfad (z.B. "Northern Thailand › Chiang Mai") |
| `{{sourceCount}}` | Anzahl verknüpfter Sources |
| `{{credibility}}` | Credibility-Level |
| `{{summary}}` | Zusammenfassung |
| `{{researchNotes}}` | Research Notes |
| `{{date}}` | Aktueller Monat + Jahr |

Ein Template kann optional einem Topic Area zugeordnet werden — dann wird es automatisch für alle Ideas in diesem Bereich verwendet.

### Topic Areas
Verwaltung der Location-Hierarchie.

Mögliche Ebenen:
```
Country  →  Region  →  Province  →  Place / Ort  →  Hotel / Restaurant / Shop / Attraction
```

Für jede Location kann ein Prompt-Template zugeordnet werden.

---

## Architektonische Einschränkung

> **Source → Idea → Article** ist der einzig erlaubte Pfad.

Der AI-Prompt-Builder hat technisch keinen Zugriff auf `Source.rawText`. Dies ist eine strukturelle Einschränkung (nicht nur Konvention), abgesichert durch Regressionstests in `__tests__/no-rawtext-in-prompt.test.ts`.
