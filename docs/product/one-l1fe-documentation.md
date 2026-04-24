# One-L1fe Dokumentation

Diese Datei erklärt One-L1fe in einfacher Sprache. Sie richtet sich an Familie, Freunde und interessierte Menschen ohne technischen Hintergrund.

## Kurz gesagt

One-L1fe ist eine App, die persönliche Gesundheitsdaten sammelt, ordnet und verständlich macht.

Die App soll nicht sagen: „Du bist krank“ oder „Du brauchst Behandlung X“. Sie soll helfen, verstreute Daten besser zu verstehen, Entwicklungen über Zeit zu sehen und sich besser auf Arztgespräche vorzubereiten.

Der Kerngedanke:

**Many Dots. One L1fe.**

Viele einzelne Datenpunkte ergeben erst zusammen ein klares Bild.

## Was ist das Problem?

Viele Menschen haben Gesundheitsdaten an vielen Orten:

- Laborberichte,
- Arztbriefe,
- Wearable-Daten von Garmin, Apple Health, Oura oder ähnlichen Geräten,
- Schlafdaten,
- Bewegungsdaten,
- Ernährung,
- DNA-Tests,
- Urintests,
- Stuhl- und Mikrobiomtests,
- eigene Notizen zu Energie, Stress, Symptomen oder Gewohnheiten.

Das Problem: Diese Daten liegen meistens getrennt voneinander. Man sieht einzelne Werte, aber nicht den Zusammenhang.

One-L1fe soll diese einzelnen Punkte verbinden.

## Was war die Ausgangslage?

Am Anfang gab es einen MVP in Notion.

MVP bedeutet: eine sehr einfache erste Version, mit der man eine Idee testet.

Notion war gut, um schnell Tabellen, Notizen und erste Strukturen zu bauen. Aber Notion ist keine richtige App und keine stabile technische Grundlage für Gesundheitsdaten.

Grenzen von Notion:

- keine echte App-Erfahrung,
- keine saubere Nutzeranmeldung,
- keine automatische Wearable-Synchronisierung,
- keine stabile Datenbanklogik,
- zu viel manuelle Pflege,
- keine klare Trennung zwischen Rohdaten, Auswertung und Empfehlungen.

Die wichtigste Verbesserung ist deshalb: Die Logik wandert aus Notion heraus in eine echte App, ein Backend, eine Datenbank und wiederverwendbare Regeln.

## Was wurde bisher erreicht?

Aktuell ist One-L1fe ein testbarer Prototyp.

Bereits vorhanden:

- Login,
- erste Eingabe von Gesundheitswerten,
- Weekly Check-in,
- Wearable-Sync-Oberfläche,
- Garmin-/Health-Connect-Vorbereitung,
- Supabase-Anbindung,
- Datenbank-Migrationen,
- Biomarker-Logik,
- erste Score-/Dot-Architektur in Arbeit,
- Developer-Insight-Bereich für technische Kontrolle,
- Dokumentation zu Architektur, Betrieb und Grenzen.

Noch offen:

- echter Android-Test mit Garmin / Health Connect / Supabase,
- vollständige Wearable-Verarbeitung,
- vollständige Doctor-Prep-Funktion,
- Uploads für Dokumente, DNA, Urin, Stuhl / Mikrobiom,
- echte KI-Auswertung,
- finales Design,
- öffentliche Veröffentlichung.

Wichtig: Die neue Dot-/Score-Struktur liegt aktuell als offene Arbeit in PR #108 und ist noch nicht komplett in `main` angekommen.

## Was ist der „One L1fe Score“?

Der One L1fe Score soll später ein einfacher Überblick sein.

Er soll nicht heißen: „So gesund bist du.“

Er soll eher zeigen:

- welche Daten aktuell vorhanden sind,
- welche Bereiche gut abgedeckt sind,
- welche Daten fehlen,
- welche Daten veraltet sein könnten,
- wie sicher oder unsicher die Einschätzung ist.

Fehlende Daten sollen nicht als schlechter Gesundheitszustand gezählt werden. Wenn Daten fehlen, bedeutet das nur: Die Aussage ist weniger präzise.

## Dots: die Struktur der App

Die App soll mit Dots arbeiten. Ein Dot steht für einen Gesundheitsbereich.

Geplanter Kern:

- **Health**: Blutwerte, Biomarker, Dokumente, DNA, Urin, Stuhl / Mikrobiom, Medikamente, Supplements.
- **Nutrition**: Mahlzeiten, Foto-Upload, Textbeschreibung, grobe Ernährungsschätzung, Hydration.
- **Mind & Sleep**: Schlaf, Energie, Stress, Stimmung, Symptome, Gewohnheiten als Kontext.
- **Activity**: Schritte, Training, Puls, HRV, Distanz, Kalorien, Wearable Sync.

In der Mitte steht **One L1fe** als Gesamtbild.

Doctor Prep ist kein normaler Messbereich, sondern ein eigener Vorbereitungsbereich für Arztgespräche.

## Doctor Prep

Doctor Prep soll einer der wichtigsten praktischen Bereiche werden.

Ziel: Nutzer sollen Arzttermine besser vorbereiten können.

Geplante Funktionen:

- Dokumente hochladen,
- Laborberichte, PDFs oder Bilder sammeln,
- wichtige Daten für den Arzt zusammenfassen,
- Fragen für den Arzt vorbereiten,
- mögliche Tests zur Besprechung vorschlagen,
- E-Mail-Entwurf an den Arzt erstellen,
- Arztkontakte lokal im Prototyp speichern,
- Terminnotiz oder Kalender-Eintrag vorbereiten.

Wichtig: Die App soll nicht sagen „Mach Test X“. Sie soll sagen: „Du könntest mit deinem Arzt besprechen, ob Test X sinnvoll wäre.“

## Nutrition / Meals

Nutrition soll Mahlzeiten erfassbar machen.

Geplant sind drei Wege:

- Foto einer Mahlzeit hochladen,
- Mahlzeit per Text beschreiben,
- Foto plus Beschreibung kombinieren.

Die App soll daraus nur eine grobe Schätzung machen, zum Beispiel Kalorienbereich und Makros wie Protein, Kohlenhydrate und Fett.

Wichtig: Diese Schätzung ist nicht exakt. Die App soll immer anzeigen, wie unsicher die Einschätzung ist und wie man sie verbessern kann, zum Beispiel durch Portionsgrößen, Zutaten oder Zubereitungsart.

## Habits

Habits sind Gewohnheiten oder Verhaltensweisen, die helfen können, Veränderungen zu erklären.

Beispiele:

- smoking,
- alcohol,
- caffeine,
- late eating,
- fasting,
- meditation,
- walking.

Habits sollen den Score nicht direkt beeinflussen.

Sie dienen als Kontext. Beispiel: Wenn Schlaf schlechter wird und in derselben Woche häufiger Alkohol eingetragen wurde, kann die App darauf hinweisen, dass das ein möglicher Zusammenhang sein könnte. Es ist aber kein Beweis.

## Datenstatus: Active, Missing, Not provided

Für Daten soll klar sein, wie die App sie behandelt.

- **Active**: Dieser Wert wird genutzt.
- **Missing**: Der Wert wäre relevant, ist aber aktuell nicht vorhanden.
- **Not provided**: Der Nutzer möchte diesen Wert bewusst nicht angeben.

Wichtig: Not provided zählt nicht als Fehler und verschlechtert den Score nicht.

## Tech Stack einfach erklärt

### GitHub

GitHub ist der Ort, an dem der Code liegt.

Dort sieht man:

- was gebaut wurde,
- wer etwas geändert hat,
- welche Aufgaben noch offen sind,
- welche Änderungen geprüft werden,
- welche Version aktuell ist.

Ein Pull Request, kurz PR, ist ein Änderungsvorschlag. Erst wenn er geprüft und übernommen wird, landet er im Hauptstand der App.

### Supabase

Supabase ist der Backend-Teil.

Ein Backend ist der technische Bereich hinter der App. Dort laufen Anmeldung, Datenbank, Berechtigungen und Server-Funktionen.

Supabase nutzt Postgres als Datenbank.

Postgres ist eine sehr verbreitete Datenbank, in der strukturierte Daten gespeichert werden können, zum Beispiel Nutzer, Laborwerte, Check-ins oder Wearable-Daten.

### Migrations

Migrations sind Änderungsdateien für die Datenbank.

Sie sorgen dafür, dass die Datenbank nachvollziehbar verändert wird. Dadurch weiß man später, wann welche Tabelle oder Regel eingeführt wurde.

Wichtig: Die Datenbank soll nicht einfach manuell im Supabase-Dashboard geändert werden. Die wichtigste Quelle ist das Repo, besonders `supabase/migrations/`.

### React Native / Expo

React Native ist die Grundlage für die mobile App.

Expo ist ein Werkzeug, das die Entwicklung und das Testen der App einfacher macht.

Ziel ist zuerst Android, weil Garmin / Health Connect dort aktuell der wichtigste Testpfad ist.

### Domain Layer

Der Domain Layer ist die gemeinsame Gesundheitslogik.

Einfach gesagt: Dort stehen Regeln, Einheiten, Grenzwerte, Scores und Datenverträge.

Das verhindert, dass App, Backend und Auswertung jeweils eigene widersprüchliche Regeln verwenden.

### Edge Functions

Edge Functions sind kleine Server-Funktionen in Supabase.

Sie laufen nicht auf dem Handy, sondern serverseitig. Das ist wichtig, weil sensible Logik und spätere KI-Aufrufe nicht direkt in der App liegen sollten.

### KI / LLM

LLM steht für Large Language Model. Das ist ein KI-Sprachmodell wie ChatGPT, Claude oder Gemini.

In One-L1fe ist KI geplant, aber streng begrenzt:

- keine Diagnose,
- keine Behandlungsempfehlung,
- keine Notfallentscheidung,
- keine echten sensiblen Gesundheitsdaten an freie Testmodelle.

Im Prototyp können KI-Funktionen zunächst nur mit Testdaten oder Mock-Antworten geprüft werden.

## Konkurrenz / Vergleichspunkte

Diese Beispiele zeigen, dass rund um digitale Gesundheit und KI gerade viel passiert.

### Doktor SV App mit Gemini

Eine Gesundheits-App aus El Salvador, die offenbar Gemini-KI nutzt und chronisch kranke Patienten unterstützen soll.

### Perplexity Health

Gesundheitsbezogene KI-Suche. Fokus: schnellere Antworten und Recherche mit Quellen.

### Anthropic Claude

Allgemeines KI-System, stark bei Erklärungen, Zusammenfassungen und Dokumenten. Nicht speziell als persönliche Health-App gebaut.

### Apple Health

Apple Health sammelt sehr viele Gesundheitsdaten direkt auf dem iPhone: Aktivität, Schlaf, Trends, Herzwerte und auch Gesundheitsdokumente. Auffällig ist, wie viel dort bereits abgedeckt wird.

### Oura Developer App

Oura bietet Zugriff auf Ring-Daten wie Schlaf, Erholung, Aktivität und Herzwerte. Stark bei Schlaf und Regeneration.

### Levels

Levels fokussiert sich stark auf Ernährung und Blutzuckerreaktionen. Es erklärt, wie Essen den Körper beeinflusst.

## Unterschied zu diesen Angeboten

One-L1fe soll nicht nur ein einzelner Tracker sein.

Der Fokus liegt auf dem Zusammenführen vieler Datenquellen:

- Blutwerte,
- Wearables,
- Check-ins,
- Ernährung,
- Dokumente,
- Arztvorbereitung,
- später DNA, Urin und Stuhl / Mikrobiom.

Ziel ist ein persönliches, datenbasiertes Gesamtbild — kein einzelnes Dashboard und kein digitaler Arzt.

## Was One-L1fe ausdrücklich nicht ist

One-L1fe ist:

- kein Arzt,
- kein Diagnose-System,
- kein Behandlungsplaner,
- kein Notfall-System,
- kein Ersatz für professionelle medizinische Einschätzung.

One-L1fe soll helfen, Daten zu organisieren, Muster sichtbar zu machen und bessere Fragen vorzubereiten.

## Was als nächstes kommt

Kurzfristig wichtig:

- Dot-/Score-Struktur stabil fertigstellen,
- One-L1fe-Home mit Dots sauber umsetzen,
- Doctor Prep weiter ausbauen,
- Nutrition mit Foto/Text-Mock umsetzen,
- Habits als Kontext erfassen,
- Wearable Sync auf echtem Android-Gerät testen,
- Garmin / Health Connect Ende-zu-Ende prüfen,
- klare Erklärtexte zu Score, Confidence, Coverage und Datenstatus ergänzen.

Langfristig:

- Dokumenten-Upload,
- Arzt-E-Mail-Entwurf,
- Kalender-/Terminunterstützung,
- bessere Ernährungsauswertung,
- Upload von DNA-, Urin- und Stuhltestdaten,
- KI-Auswertung mit strengen Sicherheitsregeln,
- vollständiger Digital-Me-Ansatz aus Langzeitdaten.

## Warum das Projekt relevant ist

Gesundheitsdaten werden immer mehr, aber sie sind selten verständlich verbunden.

One-L1fe versucht, aus vielen einzelnen Datenpunkten ein verständliches Bild zu machen.

Nicht als Diagnose.

Sondern als bessere Orientierung für das eigene Leben, die eigenen Routinen und Gespräche mit Ärzten.
