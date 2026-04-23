# Repo-Audit: Aufgabenvorschläge (2026-04-23)

## 1) Aufgabe: Tippfehler korrigieren (Dateinamen / Datenkatalog)

**Problem:** Im Notion-Export sind Dateinamen mit `Tabel` statt `Table` abgelegt.

**Beobachtung:**
- `data/notion-export/05_1_Biomarker Panel Tabel.csv`
- `data/notion-export/05_2_Biomarker Panel Tabel.csv`

**Vorschlag (Task):**
- Beide Dateien konsistent auf `...Table.csv` umbenennen.
- Alle Referenzen in Doku/Skripten prüfen und anpassen.
- Optional: kurzer Hinweis im Changelog/Audit-Log, damit keine Broken Links entstehen.

---

## 2) Aufgabe: Programmierfehler korrigieren (Ferritin-Logik)

**Problem:** In `evaluateFerritin(...)` wird ein *niedriger* Ferritin-Wert aktuell als `CanonicalStatus.High` zurückgegeben.

**Evidenz:**
- Für `value < lowThreshold` wird `canonicalStatus: CanonicalStatus.High` gesetzt.

**Vorschlag (Task):**
- Rückgabestatus auf einen semantisch korrekten Zustand ändern (z. B. `Low` oder projektweit definierte äquivalente Stufe).
- Prüfen, ob nachgelagerte Scoring- und Recommendation-Logik von dieser Korrektur betroffen ist.
- Regressionstest ergänzen (siehe Task 4), damit diese Klassifikationsrichtung abgesichert ist.

---

## 3) Aufgabe: Kommentar-/Doku-Unstimmigkeit beheben (Health Connect Mapping)

**Problem:** Architektur-Doku und TypeScript-Mapping sind für `active_minutes` auf Android Health Connect nicht konsistent.

**Evidenz:**
- Architektur-Doku nennt als Erst-Mapping u. a. `workout_session -> ExerciseSessionRecord`, führt aber `active_minutes` in der konkreten Android-Liste nicht sauber auf.
- `src/lib/wearables/syncContract.ts` mappt `active_minutes` auf `ActiveCaloriesBurnedRecord` (mit Proxy-Kommentar).

**Vorschlag (Task):**
- Entscheidung dokumentieren: Ist `active_minutes` im V1 via `ActiveCaloriesBurnedRecord` wirklich gewollt oder soll es auf ein anderes Record-Modell.
- Danach Doku (`docs/architecture/wearable-metric-keys-v1.md`) und Code (`syncContract.ts`) synchronisieren.
- In der Doku explizit die Semantik-Risiken (Proxy-Mapping, Plattformunterschiede) festhalten.

---

## 4) Aufgabe: Test verbessern (Threshold-/Ferritin-Abdeckung)

**Problem:** Es gibt derzeit keine gezielte Assertion-Suite, die die Ferritin-Branch-Logik direkt absichert; dadurch konnte der Status-Fehler unentdeckt bleiben.

**Evidenz:**
- Der Domain-Testlauf ist grün, aber eine dedizierte Assertion für `evaluateFerritin`-Grenzfälle fehlt.

**Vorschlag (Task):**
- Neue Assertions für `evaluateFerritin` ergänzen:
  - unterhalb `lowCriticalThreshold`
  - zwischen `lowCriticalThreshold` und `lowThreshold`
  - Kontextfall für erhöhte Werte (`hasInflammationContext` true/false)
  - unterschiedliche Grenzwerte für `sex: female/male`
- Tests in den bestehenden `runMinimumSliceAssertions`-Pfad integrieren.
