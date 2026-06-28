# Research Desk — End-to-End Testplan

Dieser Testplan deckt den vollständigen Workflow ab: von der ersten Source-Erfassung bis zum fertigen Artikel. Alle Tests werden manuell im Browser durchgeführt (http://localhost:3000).

---

## Voraussetzungen

- [ ] Dev-Server läuft: `npm run dev` (Port 3000)
- [ ] `.env` enthält gültigen `ANTHROPIC_API_KEY`
- [ ] Mindestens ein Prompt-Template mit `isDefault: true` existiert (Settings → Prompt Templates)
- [ ] Mindestens eine Location existiert (Settings → Topic Areas → z.B. „Chiang Mai")

---

## 1. Globaler Header & Projektauswahl

- [ ] Header ist auf jeder Seite sichtbar
- [ ] Links: Label „Project" + Dropdown mit allen Projekten
- [ ] Dropdown zeigt Source- und Ideenzähler je Projekt
- [ ] Projekt wechseln → Seiteninhalte aktualisieren sich
- [ ] Rechts: Zahnrad-Icon → navigiert zu `/settings`

---

## 2. Source erfassen

**Seite:** `/sources` → Capture-Button

- [ ] Modal öffnet sich
- [ ] URL eingeben (z.B. `https://reddit.com/r/ThailandTourism/comments/test`) → Platform wird automatisch erkannt: **reddit**
- [ ] Note eingeben (eigene Beobachtung, kein Originaltext)
- [ ] Topic Area auswählen (z.B. Chiang Mai)
- [ ] Speichern → Source erscheint im Ordner **Inbox** mit Status **NEW**
- [ ] Duplicate-Erkennung: gleiche URL nochmals erfassen → Hinweis erscheint

---

## 3. Source-Ordner

**Seite:** `/sources`

- [ ] Dreispaltiges Layout sichtbar: Ordner | Liste | Detail
- [ ] **Inbox** ist standardmäßig aktiv, zeigt nur unsortierte Sources
- [ ] Neuen Ordner anlegen: Eingabe am Ende der Ordnerliste → Enter
- [ ] Ordner umbenennen: ✎-Icon hover → klicken → neuen Namen eingeben → Enter
- [ ] Source per Checkbox auswählen → Bulk-Toolbar erscheint → „Move to folder" → Ordner wählen → Source verschwindet aus Inbox
- [ ] Ordner anklicken → nur Sources dieses Ordners erscheinen in der Liste
- [ ] Ordner löschen (×-Icon) → Sources wandern zurück in Inbox

---

## 4. Source editieren

**Seite:** `/sources` → Source auswählen → Edit-Button

- [ ] Edit-Modal öffnet sich mit aktuellen Werten
- [ ] URL ändern → speichern → Detailpanel zeigt neue URL
- [ ] Platform ändern → Badge in der Liste aktualisiert sich
- [ ] Note ändern → Detailpanel zeigt neue Note
- [ ] Topic Area ändern → Detailpanel zeigt neue Location
- [ ] Status ändern auf **Reviewed** → Source bleibt sichtbar (bei Filter „All")
- [ ] Idea-Verknüpfung sichtbar (falls vorhanden): Idea-Titel + verlinkter Artikel

---

## 5. Source mit Idea verknüpfen

**Seite:** `/sources` → Source auswählen → „Link to Idea"

### 5a — Neue Idea erstellen
- [ ] „Link to Idea"-Button klicken → Modal öffnet sich
- [ ] Tab „New Idea" auswählen
- [ ] Titel eingeben, Kategorie wählen, Topic Area auswählen
- [ ] Speichern → Source-Status wechselt auf **LINKED TO IDEA**
- [ ] Source verschwindet aus NEW-Filter
- [ ] Idea erscheint auf dem Kanban-Board (`/ideas`)

### 5b — Bestehende Idea verknüpfen
- [ ] „Link to Idea"-Button → Tab „Existing Idea"
- [ ] Idea aus der Liste auswählen → speichern
- [ ] `confirmationCount` der Idea steigt um 1

### 5c — Verknüpfung aufheben
- [ ] Source editieren → Status auf **Reviewed** oder **New** setzen → speichern
- [ ] IdeaSource-Verknüpfung wird automatisch entfernt
- [ ] `confirmationCount` der Idea sinkt um 1

---

## 6. Mehrfachauswahl (Bulk-Aktionen)

**Seite:** `/sources`

- [ ] Mehrere Sources per Checkbox auswählen → Bulk-Toolbar erscheint
- [ ] „Move to folder" → alle ausgewählten Sources in Ordner verschieben
- [ ] „Link to Idea" → alle ausgewählten Sources mit einer Idea verknüpfen
- [ ] Auswahl aufheben → Bulk-Toolbar verschwindet

---

## 7. Idea-Board

**Seite:** `/ideas`

- [ ] Kanban mit 5 Spalten sichtbar: Idea / Recherche / Entwurf / Review / Veröffentlicht
- [ ] Idea-Karte zeigt: Titel, Kategorie-Badge (mit Farbe), Location, Credibility, Source-Anzahl
- [ ] Idea **ohne** Artikel: normaler weißer Rahmen
- [ ] Idea **mit** Artikel: amber-farbener Rahmen + Label „✦ Article"
- [ ] Klick auf Karte → öffnet `/ideas/[id]` (nie direkt den Artikel)
- [ ] Bei Idea mit Artikel: separater Button „Open Article" sichtbar
- [ ] **+ New Idea**-Button → erstellt Idea ohne vorherige Source

---

## 8. Idea-Detail & Bearbeitung

**Seite:** `/ideas/[id]`

- [ ] Back-Button oben links → navigiert zur vorherigen Seite
- [ ] Titel, Kategorie-Badge, Location-Breadcrumb, Status, Sources-Anzahl, Credibility sichtbar
- [ ] Summary und Research Notes sichtbar
- [ ] Linked Sources Liste: Platform-Badge, URL (klickbar), Datum
- [ ] **Edit**-Button → Inline-Formular öffnet sich
- [ ] Titel ändern → speichern → Seite zeigt neuen Titel
- [ ] Kategorie ändern → Badge aktualisiert sich
- [ ] Credibility ändern → Badge aktualisiert sich
- [ ] Research Notes eingeben → gespeichert
- [ ] Cancel → keine Änderungen

---

## 9. AI Draft generieren

**Seite:** `/ideas/[id]`

- [ ] Template-Dropdown zeigt verfügbare Templates (Default vorausgewählt)
- [ ] **Generate AI Draft** klicken → Lade-Status sichtbar
- [ ] Nach ~10–30 Sekunden: Weiterleitung zu `/articles/[id]`
- [ ] Artikel enthält generierten Markdown-Text
- [ ] Idea-Status wechselt auf **Entwurf**
- [ ] Artikel erscheint auf `/articles` in der Liste
- [ ] Artikel hat `projectId` des Projekts (verschwindet nicht aus der Liste)

---

## 10. Articles-Seite

**Seite:** `/articles`

- [ ] Zweispaltiges Layout: Liste links (380px), Vorschau rechts
- [ ] Liste zeigt: Titel, Kategorie-Badge, Location, Credibility, Status-Badge
- [ ] Status-Filter funktioniert: Draft / In Review / Published
- [ ] Suche nach Titel-Text funktioniert
- [ ] Pagination bei mehr als 30 Artikeln: Prev / Next / „Page X of Y"
- [ ] Klick auf Artikel in Liste → Vorschau rechts aktualisiert sich
- [ ] Vorschau zeigt: Artikel-Inhalt (Markdown gerendert), verknüpfte Sources
- [ ] **Open Editor**-Button → öffnet `/articles/[id]`

---

## 11. Artikel-Editor

**Seite:** `/articles/[id]`

- [ ] Back-Button oben links → navigiert zur vorherigen Seite
- [ ] Markdown-Editor mit generiertem Text vorausgefüllt
- [ ] Text editieren → speichern funktioniert
- [ ] Publish-Status ändern: Draft → In Review → Published
- [ ] Published URL eintragen → gespeichert
- [ ] Export-Button → Datei exportiert oder HTTP-Aufruf (je nach `EXPORT_MODE`)
- [ ] Linked Sources Block am unteren Rand der Vorschau sichtbar

---

## 12. Settings — Prompt Templates

**Seite:** `/settings` → Tab „Prompt Templates"

- [ ] Liste vorhandener Templates mit Name, Beschreibung, DEFAULT-Badge
- [ ] „Show prompt ▼" → Template-Text wird eingeblendet
- [ ] **+ New Template** → Formular öffnet sich
- [ ] Pflichtfelder: Name + Template-Text; ohne diese → Fehlermeldung
- [ ] Template-Variablen (`{{title}}` etc.) in der Referenz-Box sichtbar
- [ ] „Set default" → anderes Template verliert DEFAULT-Badge
- [ ] Edit → Änderungen speichern
- [ ] Delete → Bestätigungsdialog → Template entfernt

---

## 13. Settings — Topic Areas

**Seite:** `/settings` → Tab „Topic Areas"

- [ ] Location-Baum sichtbar (Thailand → Regionen → Provinzen)
- [ ] Expand/Collapse per ▶/▼
- [ ] **+ Add Top-Level Area** → Formular für Country-Level
- [ ] **+ Child** → Formular für untergeordnete Location
- [ ] Pflichtfelder: English Name + German Name + Type
- [ ] Slug wird automatisch generiert (nicht editierbar)
- [ ] Template-Dropdown je Location → Template zuweisen → amber hervorgehoben
- [ ] Edit → Namen ändern → gespeichert
- [ ] Delete mit Kind-Locations → Fehlermeldung (nicht löschbar solange Kinder vorhanden)

---

## 14. Settings — Categories

**Seite:** `/settings` → Tab „Categories"

- [ ] Liste aller Kategorien mit Farb-Dot, Badge-Vorschau und Key
- [ ] **+ New Category** → Formular mit Key, Label (DE), Color-Picker
- [ ] Key kann nach dem Anlegen nicht mehr geändert werden
- [ ] Farbe per Color-Picker wählen → Badge-Farbe ändert sich sofort
- [ ] Edit → Label und Farbe ändern → Badge in der App aktualisiert sich überall
- [ ] Delete → Bestätigungsdialog → Kategorie entfernt
- [ ] Neue Kategorie erscheint sofort in: New Idea Modal, Idea Edit Form, Idea-Board-Filter

---

## 15. Vollständiger End-to-End-Durchlauf

Führe diese Sequenz einmal komplett durch:

1. **Source erfassen** (`/sources` → Capture) mit URL, Note und Topic Area
2. **Source in Ordner ablegen** (neuen Ordner anlegen → Source verschieben)
3. **Mit Idea verknüpfen** (Link to Idea → New Idea → Titel + Kategorie + Topic Area)
4. **Idea anreichern** (`/ideas/[id]` → Edit → Research Notes + Credibility setzen)
5. **AI Draft generieren** (Generate AI Draft → Template auswählen → warten)
6. **Artikel prüfen** (`/articles` → Artikel in Liste sichtbar → Vorschau aufrufen)
7. **Artikel editieren** (Open Editor → Text anpassen → speichern)
8. **Status setzen** (Draft → In Review → Published)

Erwartetes Ergebnis: Artikel ist unter `/articles` mit Status **Published** sichtbar, hat eine `projectId` und zeigt die verknüpfte Source im Linked Sources Block.

---

## Bekannte Einschränkungen

- Source.rawText fließt strukturell nicht in den AI-Prompt (durch `lib/idea-reader.ts` sichergestellt)
- Alle Artikel erhalten beim Erstellen zwingend eine `projectId` — Schema-seitig NOT NULL
- Ordner-Hierarchie ist derzeit flach (kein Verschachteln von Unterordnern möglich)
