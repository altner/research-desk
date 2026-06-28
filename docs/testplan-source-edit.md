# Testplan: Source editieren

## Vorbereitung
1. Öffne http://localhost:3000 im Browser
2. Navigiere zu **Inbox** in der Sidebar

---

## 1. Edit-Button ist sichtbar

1. Klicke auf eine beliebige Source in der Liste
2. Die Detail-Ansicht öffnet sich rechts
3. **Erwartung:** In der Aktionsleiste unten ist der Button **"Edit"** sichtbar (zwischen "+ Add to Idea" und "Mark as reviewed")

---

## 2. Modal öffnet sich mit vorausgefüllten Werten

1. Klicke auf **"Edit"**
2. **Erwartung:** Ein Modal erscheint mit dem Titel "Edit Source"
3. **Erwartung:** Das URL-Feld zeigt die bestehende URL der Source
4. **Erwartung:** Das Platform-Dropdown zeigt die aktuelle Plattform (z.B. "Reddit")
5. **Erwartung:** Das Note-Feld zeigt den bestehenden Text (falls vorhanden)
6. **Erwartung:** Das Topic Area-Feld zeigt den aktuellen Ort (falls vorhanden)

---

## 3. Abbrechen ohne Änderung

1. Öffne das Edit-Modal
2. Ändere etwas im URL-Feld
3. Klicke auf **"Cancel"** (oder klicke außerhalb des Modals)
4. **Erwartung:** Modal schließt sich, Source ist unverändert

---

## 4. Note bearbeiten

1. Öffne das Edit-Modal einer Source
2. Ändere den Text im Note-Feld (z.B. füge " - editiert" am Ende hinzu)
3. Klicke **"Save Changes"**
4. **Erwartung:** Modal schließt sich
5. **Erwartung:** In der Detail-Ansicht ist der neue Text sofort sichtbar
6. **Erwartung:** Auch in der Listenvorschau links hat sich der Preview-Text aktualisiert

---

## 5. Platform wechseln

1. Öffne das Edit-Modal
2. Wähle im Platform-Dropdown eine andere Plattform (z.B. von "Reddit" auf "YouTube")
3. Klicke **"Save Changes"**
4. **Erwartung:** Das Platform-Badge in der Detail-Ansicht zeigt die neue Plattform
5. **Erwartung:** Das Badge in der Listenzeile links zeigt ebenfalls die neue Plattform

---

## 6. URL ändern

1. Öffne das Edit-Modal
2. Ändere die URL zu einer anderen gültigen URL
3. Klicke **"Save Changes"**
4. **Erwartung:** In der Detail-Ansicht ist der Link aktualisiert

---

## 7. URL leer lassen (Validierung)

1. Öffne das Edit-Modal
2. Lösche den gesamten Inhalt des URL-Feldes
3. Klicke **"Save Changes"**
4. **Erwartung:** Modal bleibt offen, roter Fehlerhinweis erscheint: "URL is required"

---

## 8. Topic Area ändern

1. Öffne das Edit-Modal einer Source ohne Topic Area (oder mit einer)
2. Wähle im Topic Area-Picker einen Ort aus (z.B. "Thailand → Chiang Mai")
3. Klicke **"Save Changes"**
4. **Erwartung:** In der Detail-Ansicht erscheint die Location Crumb mit dem neuen Ort
5. **Erwartung:** In der Listenzeile links ist der Ort ebenfalls sichtbar

---

## 9. Topic Area entfernen

1. Öffne das Edit-Modal einer Source mit gesetztem Topic Area
2. Wähle im Topic Area-Picker den leeren / obersten Eintrag ("—" oder leer)
3. Klicke **"Save Changes"**
4. **Erwartung:** Die Location Crumb in der Detail-Ansicht verschwindet

---

## 10. Andere Features nicht beeinträchtigt

Nach den obigen Tests sicherstellen:

- **"+ Add to Idea"** öffnet weiterhin das Idea-Link-Modal
- **"Mark as reviewed"** ändert weiterhin den Status
- **"Discard"** verwirft die Source wie gewohnt
- **"+ New Source"** öffnet das Capture-Modal
- Filter (Platform, Status, Suche) funktionieren noch korrekt
