---
status: draft
owner: repo
created: 2026-04-14
scope: repo
---

# Codebase-Review (2026-04-14)

## Verdict
Es gibt mindestens vier klar abgrenzbare, sinnvoll priorisierbare Aufgaben:
1. **Tippfehler-Korrektur** in der Sprachkonvention eines Kommentars,
2. **Programmierfehler-Korrektur** in der Request-Validierung,
3. **Doku-Konsistenz-Korrektur** zwischen `CHECKPOINT.md` und `checkpoint.yaml`,
4. **Test-Verbesserung** für eine aktuell ungeschützte Negativkante.

## Evidenz und konkrete Aufgaben

### 1) Aufgabe: Tippfehler / Terminologie vereinheitlichen
- **Befund (bekannt):** In `apps/mobile/mobileSupabaseAuth.ts` steht im Kommentar die britische Schreibweise `behaviour`, während die restliche Repo-Doku überwiegend US-Englisch nutzt.
- **Risiko:** Gering, aber inkonsistente Sprache verschlechtert Suchbarkeit und wirkt wie ein Tippfehler.
- **Task-Vorschlag:**
  - Kommentar auf US-Schreibweise `behavior` ändern.
  - Optional: kurze Regel in CONTRIBUTING ergänzen (US spelling in code comments/docs).

### 2) Aufgabe: Programmierfehler in der Request-Validierung beheben
- **Befund (bekannt):** In `parseEntry` wird `marker` nur als non-empty string geprüft und dann per Type-Assertion nach `BiomarkerKey` gecastet.
- **Risiko:** Unerlaubte Marker-Werte können in den Laufzeitpfad gelangen; Typensicherheit wird zur Laufzeit umgangen.
- **Task-Vorschlag:**
  - Runtime-Guard ergänzen (z. B. `isBiomarkerKey(marker)`),
  - bei ungültigen Markern explizit Fehler werfen,
  - Fehlertext mit Feldpfad (`panel.entries[i].marker`) standardisieren.

### 3) Aufgabe: Doku-Unstimmigkeit korrigieren
- **Befund (bekannt):** `CHECKPOINT.md` dokumentiert, dass Platzhalter-Env-Variablen entfernt wurden und Supabase-Auth live ist; `checkpoint.yaml` behauptet weiterhin, Mobile Auth nutze Platzhalter.
- **Risiko:** Agenten oder Entwickler könnten auf veralteter Basis planen.
- **Task-Vorschlag:**
  - `checkpoint.yaml` auf den Zustand aus `CHECKPOINT.md` aktualisieren,
  - Felder `active_blockers` und `next_best_steps` harmonisieren,
  - `last_verified` auf den tatsächlichen Prüfzeitpunkt setzen.

### 4) Aufgabe: Testqualität verbessern (Negativfall Marker-Validierung)
- **Befund (bekannt):** Die vorhandenen Contract-Assertions prüfen viele Invalid-Inputs, aber keinen expliziten Fall für „unbekannter marker“.
- **Risiko:** Regressionen in der Marker-Whitelist bleiben unentdeckt.
- **Task-Vorschlag:**
  - In `packages/domain/minimumSliceFunctionContract.assertions.ts` einen Test ergänzen, der einen unbekannten Marker sendet und einen klaren Fehler erwartet.
  - Optional: zweiten Test für Case-Sensitivity (`ApoB` vs `apob`) ergänzen.

## Confidence / Uncertainty
- **Hoch** bei Doku-Unstimmigkeit und Marker-Validierungslücke (direkt im Code sichtbar).
- **Mittel** beim Tippfehler-Task, da es primär Terminologie-/Stilkonsistenz ist.

## Next action
1. Reihenfolge: **(2) Programmierfehler** → **(4) Test** → **(3) Doku-Konsistenz** → **(1) Tippfehler/Terminologie**.
2. Danach `npm run test:domain` als Mindest-Regression.
