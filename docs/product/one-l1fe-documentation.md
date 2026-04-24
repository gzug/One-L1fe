# One-L1fe Dokumentation

## Konkurrenz

### 1. Anbieter, die gerade aktiv im Gesundheits- und KI-Bereich sichtbar werden

Diese Beispiele wurden im Projektkontext sichtbar, ohne dass aktiv eine vollständige Konkurrenzanalyse gesucht wurde. Das ist ein Hinweis darauf, dass sich im Bereich digitale Gesundheit, KI-Auswertung und persönliche Gesundheitsdaten gerade viel bewegt. Besonders auffällig ist, dass nicht nur kleine Apps, sondern auch große Unternehmen versuchen, sich in diesem Feld zu positionieren.

- **Doktor SV App mit Gemini — El Salvador für chronisch kranke Patienten**
  - Eine Gesundheits-App, die offenbar KI-Unterstützung von Gemini nutzt.
  - Fokus: Unterstützung von chronisch kranken Patienten.
  - USP: Kombination aus staatlich/medizinisch wirkender Versorgung und KI-Unterstützung.

- **Perplexity Health**
  - Gesundheitsbezogene Suche und Antworten auf Basis von KI.
  - Fokus: Informationen schneller finden, Fragen verständlich beantworten.
  - USP: schnelle, quellennahe Gesundheitsrecherche statt klassischer Google-Suche.

- **Anthropic Claude**
  - Allgemeines KI-System, das auch für Gesundheitsfragen, Zusammenfassungen und Erklärungen genutzt werden kann.
  - Fokus: verständliche Textarbeit, Analyse, Erklärungen, Dokumente.
  - USP: starke Sprach- und Erklärfähigkeit, aber nicht speziell als persönliches Gesundheitssystem gebaut.

- **Apple Health**
  - Apple sammelt und zeigt viele Gesundheitsdaten direkt auf dem iPhone.
  - Dazu gehören unter anderem Aktivität, Schlaf, Herzwerte, Trends und inzwischen auch Arzt- bzw. Gesundheitsdokumente.
  - Auffällig ist, wie viel dort bereits abgedeckt wird: Tracking, Trendanalyse, Gesundheitsdaten, Dokumente und Integration mit Geräten.
  - USP: sehr tiefe Integration ins Apple-Ökosystem.

### 2. Weitere Systeme, die beim Arbeiten an One-L1fe als relevante Vergleichspunkte aufgefallen sind

- **Oura Developer App**
  - Oura bietet über Entwicklerzugänge Zugriff auf Ring-Daten wie Schlaf, Erholung, Aktivität und Herzwerte.
  - USP: sehr gute Wearable-Daten, besonders rund um Schlaf und Regeneration.

- **Levels App**
  - App mit starkem Fokus auf Ernährung und Blutzuckerreaktionen.
  - USP: verständlich machen, wie Essen den Körper beeinflusst.

### Einordnung für One-L1fe

One-L1fe ist nicht einfach eine weitere Health-App. Der Unterschied liegt im langfristigen Ziel: Aus persönlichen Langzeitdaten soll ein **Digital Avatar** entstehen.

Mit Digital Avatar meinen wir kein Spielbild und keinen Chatbot. Gemeint ist ein persönliches Gesundheitsmodell, das über längere Zeit lernt:

- welche Werte regelmäßig gemessen werden,
- welche Werte sich verändern,
- welche Lebensumstände dazu passen,
- welche Muster sich wiederholen,
- welche Fragen man gezielter mit Ärzten, Familie oder für sich selbst klären sollte.

Wichtig: One-L1fe soll keine Diagnose stellen und keinen Arzt ersetzen. Es soll helfen, eigene Gesundheitsdaten besser zu verstehen, Entwicklungen sichtbar zu machen und bessere Fragen zu stellen.

## Tech Stack

Der Tech Stack ist die technische Grundlage des Projekts. Einfach gesagt: Das sind die Bausteine, aus denen die App besteht.

### Mobile App

- **React Native / Expo**
  - Damit bauen wir die App.
  - Vorteil: Eine technische Grundlage kann später für Android und iPhone genutzt werden.
  - Aktueller Schwerpunkt: Android, weil dort Garmin-/Health-Connect-Daten zuerst getestet werden sollen.

### Backend

- **Supabase**
  - Supabase ist der Server- und Datenbankteil des Projekts.
  - Dort liegen Nutzerkonten, gespeicherte Werte, Regeln, Auswertungen und technische Funktionen.
  - Die Datenbank wird nicht manuell im Dashboard verwaltet, sondern über Dateien im Repo: `supabase/migrations/`.

### Datenbank

- **Postgres**
  - Das ist die Datenbank hinter Supabase.
  - Dort werden strukturierte Daten gespeichert, zum Beispiel Laborwerte, Wearable-Werte, Check-ins und spätere Auswertungen.

### Backend-Funktionen

- **Supabase Edge Functions**
  - Das sind kleine Server-Funktionen.
  - Sie laufen nicht direkt in der App, sondern auf dem Server.
  - Vorteil: sensible Logik und spätere KI-Aufrufe bleiben geschützt.

### Gemeinsame Gesundheitslogik

- **packages/domain**
  - Das ist die gemeinsame Regel- und Logikschicht.
  - Dort stehen Definitionen für Biomarker, Einheiten, Grenzwerte, Bewertungslogik und Verträge zwischen App und Backend.
  - Vorteil: Die App, das Backend und Tests nutzen dieselbe Grundlage.

### KI

- **OpenAI / KI-Schicht geplant**
  - Die Architektur sieht vor, KI später über das Backend einzubinden.
  - Aktuell ist diese Schicht nicht als produktiver Nutzerpfad fertig verdrahtet.
  - Das ist bewusst so, damit zuerst Datenstruktur, Sicherheit und klare Regeln stabil werden.

### Wearables

- **Health Connect / Garmin-Pfad**
  - Wearable-Daten sollen zuerst über Android Health Connect verarbeitet werden.
  - Garmin ist ein wichtiger erster Zielpfad.
  - Relevante Werte sind zum Beispiel Schritte, Ruhepuls, HRV, Schlafdauer, Distanz und aktive Kalorien.

## Design

Design wird noch ergänzt.

Geplant sind hier:

- Farben,
- Schrift- und Sprachstil,
- einfache Erklärlogik,
- UI-Richtung,
- Tonalität der App,
- Darstellung von Gesundheitswerten,
- Darstellung von Unsicherheit und Vertrauen.

Wichtig für das Design: Die App soll nicht wie ein medizinisches Kontrollzentrum wirken. Sie soll ruhig, verständlich und vertrauenswürdig sein. Menschen sollen erkennen, was ihre Daten bedeuten, ohne sich durch Fachsprache oder Warnfarben überfordert zu fühlen.

## Ausgangslage: Notion-MVP

Am Anfang stand kein fertiges Produkt, sondern ein MVP in Notion.

MVP bedeutet: Minimum Viable Product. Einfach gesagt: eine erste einfache Version, mit der man prüfen kann, ob eine Idee Sinn ergibt.

Notion war dafür gut, weil man schnell Tabellen, Notizen und erste Strukturen bauen konnte. Man konnte Gesundheitswerte sammeln, Kategorien anlegen und überlegen, welche Zusammenhänge wichtig sind.

Aber Notion hatte klare Grenzen:

- keine echte App-Erfahrung,
- keine saubere Nutzeranmeldung,
- keine stabile Datenbanklogik,
- keine automatische Verarbeitung von Wearable-Daten,
- keine klare Trennung zwischen Rohdaten, Auswertung und Empfehlungen,
- keine sichere Backend-Struktur,
- zu viel manuelle Pflege,
- zu wenig Schutz vor unklarer oder doppelter Logik.

Die wichtigste Entscheidung war deshalb: Notion bleibt nicht der versteckte Motor des Systems. Die eigentliche Logik wird in Code, Datenbank und Backend verlagert.

## Was One-L1fe heute ist

One-L1fe ist ein privates Gesundheitsdaten- und Interpretationsprojekt.

Es sammelt und strukturiert persönliche Gesundheitsinformationen, zum Beispiel:

- Laborwerte,
- Biomarker,
- subjektive Check-ins,
- Wearable-Daten,
- Kontextnotizen,
- spätere Empfehlungen und Interpretationen.

Biomarker sind messbare Gesundheitswerte. Beispiele sind Vitamin D, Ferritin, CRP, ApoB, LDL, HbA1c oder Glukose.

Das Ziel ist nicht, einzelne Werte isoliert anzuschauen. Das Ziel ist, über Zeit Muster zu erkennen.

Beispiel:

- Ein einzelner schlechter Schlafwert sagt wenig.
- Viele Schlafwerte über Wochen sagen mehr.
- Wenn dazu noch Stress, Training, Ernährung, Laborwerte und Energielevel kommen, entsteht ein besseres Bild.

Dieses langfristige Bild ist die Grundlage für den Digital Avatar.

## Die größere Vision: Digital Me / Holistic Person

Langfristig soll One-L1fe nicht nur Blutwerte und Wearable-Daten anzeigen. Die App soll möglichst viele relevante Datenarten zusammenführen, damit ein umfassenderes persönliches Gesundheitsbild entsteht.

Dazu können gehören:

- Blutwerte und Laborberichte,
- DNA-Testdaten,
- Urintests,
- Stuhlproben und Mikrobiomdaten,
- Wearable-Daten,
- Schlafdaten,
- Ernährung,
- Bewegung,
- subjektive Angaben wie Energie, Stimmung, Stress oder Symptome,
- Arztbriefe und andere medizinische Dokumente.

Die Idee dahinter: Der Mensch soll nicht nur über einzelne Werte betrachtet werden, sondern als ganzheitliche Person. Deshalb passt der Begriff **Digital Me** oder **Digital Avatar**: Es entsteht ein datenbasiertes Abbild der eigenen gesundheitlichen Entwicklung.

Wichtig: Dieses Abbild ist nie vollständig und nie unfehlbar. Es hängt davon ab, welche Daten vorhanden sind, wie aktuell sie sind und wie gut sie zusammenpassen.

## Wofür die App später helfen soll

One-L1fe soll Menschen helfen, ihre Situation besser einzuordnen. Besonders relevant kann das sein:

- wenn man akut krank ist,
- wenn man schneller wieder gesund werden möchte,
- wenn man chronisch krank ist,
- wenn man über längere Zeit Veränderungen bemerkt,
- wenn mehrere Werte langsam schlechter werden,
- wenn man sich auf einen Arzttermin vorbereiten möchte.

Mögliche Ausgaben der App:

- verständliche Zusammenfassung der wichtigsten Daten,
- Hinweise, welche Werte auffällig oder unvollständig sind,
- Fragen, die man beim Arzt stellen sollte,
- ein kompaktes Dokument für den Arzttermin,
- Hinweise, welche Daten fehlen,
- Tipps zu Ernährung und Lebensweise,
- Erklärung, welche Empfehlungen nur möglich sind, wenn bestimmte Daten vorhanden sind.

Beispiele:

- „Wenn du zum Arzt gehst, sprich diese drei Punkte an.“
- „Für eine bessere Einschätzung fehlen aktuelle Entzündungswerte.“
- „Diese Empfehlung ist nur möglich, wenn Stuhlproben- oder Mikrobiomdaten vorhanden sind.“
- „Diese DNA-Information ändert sich kaum, aber ihre Interpretation kann sich ändern, wenn neue Forschung oder neue Gesundheitsdaten hinzukommen.“
- „Diese Urintest-Daten sind nur kurzfristig aussagekräftig und sollten nicht über Monate hinweg als aktuell betrachtet werden.“

## Unterschiedliche Daten sind unterschiedlich lange nützlich

Nicht jede Datenart ist gleich lange aussagekräftig.

Beispiele:

- **DNA-Daten** verändern sich normalerweise nicht. Sie können langfristig relevant bleiben. Aber was daraus folgt, hängt von Forschung, Lebensstil, Alter, Symptomen und anderen Daten ab.
- **Blutwerte** sind Momentaufnahmen. Manche bleiben länger relevant, andere müssen nach Wochen oder Monaten neu geprüft werden.
- **Urintests** können sehr kurzfristig sein. Sie können etwas über den aktuellen Zustand sagen, sind aber oft schnell veraltet.
- **Stuhlproben / Mikrobiomdaten** können Hinweise auf Verdauung, Ernährung und Darmflora geben. Sie sind aber abhängig von Ernährung, Medikamenten, Infekten und Zeit.
- **Wearable-Daten** sind besonders gut für Verlauf und Alltag: Schlaf, Puls, Schritte, Belastung, Erholung.
- **Subjektive Angaben** wie Energie, Stimmung oder Stress sind wichtig, weil sie erklären können, warum Werte sich verändern.

Deshalb soll One-L1fe nicht nur fragen: „Welche Daten liegen vor?“, sondern auch: „Sind diese Daten noch frisch genug, um daraus etwas Sinnvolles abzuleiten?“

## Funktionen, die von bestimmten Daten abhängen

Nicht jede Funktion kann immer verfügbar sein.

Beispiele:

- Ernährungstipps können besser werden, wenn Blutwerte, Glukosewerte, Stuhlprobe oder Mikrobiomdaten vorhanden sind.
- Hinweise zu genetischen Veranlagungen sind nur möglich, wenn DNA-Daten vorliegen.
- Aussagen zur Regeneration werden besser, wenn Schlaf, Ruhepuls und HRV vorhanden sind.
- Arztzusammenfassungen werden besser, wenn Laborwerte, Symptome, Medikamente und relevante Dokumente vorliegen.

Die App soll deshalb transparent sagen:

- welche Aussage möglich ist,
- welche Aussage unsicher ist,
- welche Daten fehlen,
- welche Daten zu alt sind,
- wann neue Daten sinnvoll wären.

## Was One-L1fe ausdrücklich nicht ist

One-L1fe ist:

- kein Arzt,
- kein Diagnose-System,
- kein Behandlungsplaner,
- kein Notfall-System,
- kein Ersatz für professionelle medizinische Einschätzung.

Die App soll helfen, Daten besser zu verstehen. Sie soll nicht entscheiden, ob jemand krank ist oder welche Behandlung nötig ist.

Auch wenn Daten auf Risiken oder ungünstige Entwicklungen hinweisen können, darf die App daraus keine sichere Vorhersage machen. Sie kann Hinweise geben, Unsicherheit erklären und helfen, die richtigen nächsten Fragen zu stellen.

## Was bisher erreicht wurde

### 1. Aus Notion wurde eine echte technische Grundlage

Die alte Notion-Struktur wurde in ein echtes Softwareprojekt überführt.

Verbesserung:

- vorher: Tabellen und manuelle Struktur,
- jetzt: App, Backend, Datenbank, Regeln und Tests.

### 2. Eine Mobile App existiert als Prototyp

Der aktuelle Prototyp enthält:

- Login,
- erste Dateneingabe,
- Weekly Check-in,
- Wearable-Sync-Oberfläche,
- Developer-Insight-Bereich für technische Kontrolle.

Das heißt: Es ist nicht mehr nur ein Konzept. Es gibt eine testbare App-Struktur.

### 3. Supabase ist als Backend eingebunden

Supabase übernimmt:

- Nutzerkonten,
- Datenbank,
- Zugriffsregeln,
- Backend-Funktionen,
- Speicherung von Gesundheitsdaten.

Wichtig: Die Datenbankstruktur wird über Migrationen im Repo gepflegt. Dadurch bleibt nachvollziehbar, was wann geändert wurde.

### 4. Die Gesundheitslogik wurde aus der Oberfläche herausgezogen

Ein großer Fortschritt ist die gemeinsame Domain-Schicht.

Einfach erklärt: Regeln wie „welcher Wert ist wichtig“, „welche Einheit wird genutzt“, „wie wird ein Wert bewertet“ oder „welche Daten sind zu alt“ liegen nicht zufällig an verschiedenen Stellen. Sie werden zentral definiert.

Das verhindert später widersprüchliche Auswertungen.

### 5. Biomarker und Priorisierung wurden strukturiert

Es gibt Regeln und Gewichtungen für Gesundheitswerte.

Beispiel:

- Manche Werte sind sehr wichtig und gut belegt.
- Andere Werte sind interessant, aber weniger sicher.
- Das System soll diese Unterschiede sichtbar machen.

Dafür gibt es unter anderem:

- Evidenz-Stufen,
- Gewichtungen,
- Prioritätslogik,
- Unterscheidung zwischen starken und schwächeren Markern.

Evidenz bedeutet: Wie gut ist etwas belegt?

### 6. Wearable-Daten wurden vorbereitet

Der Wearable-Bereich ist teilweise gebaut.

Vorbereitet sind unter anderem:

- Schritte,
- Ruhepuls,
- HRV,
- Schlaf,
- aktive Kalorien,
- Distanz.

HRV bedeutet Herzratenvariabilität. Vereinfacht: Sie beschreibt, wie stark sich die Abstände zwischen Herzschlägen verändern. Das kann Hinweise auf Erholung, Stress oder Belastung geben, ist aber kein einzelner Diagnosewert.

Noch offen: Der komplette Test mit echtem Android-Gerät, Health Connect und Supabase muss noch sauber durchlaufen.

### 7. Sicherheit und Grenzen wurden dokumentiert

Das Projekt hat bewusst klare Grenzen:

- private Nutzung,
- keine öffentlichen Gesundheitsclaims,
- keine Diagnoseversprechen,
- keine rohen persönlichen Gesundheitsdaten im Repo,
- klare Trennung zwischen Daten, Interpretation und Empfehlung.

Das ist wichtig, weil Gesundheitsdaten sensibel sind.

## Was sich gegenüber Notion verbessert hat

### Vorher: Notion als flexible Tabelle

Notion war gut zum Denken und Strukturieren. Aber es war keine stabile technische Produktgrundlage.

### Jetzt: App plus Backend plus Regeln

Die wichtigsten Verbesserungen:

- echte App statt Tabellenansicht,
- Nutzerlogin statt manuellem Zugriff,
- Supabase-Datenbank statt Notion-Tabelle,
- zentrale Regeln statt verstreuter Logik,
- bessere Nachvollziehbarkeit über GitHub,
- spätere Wearable-Anbindung möglich,
- spätere KI-Anbindung kontrollierbar,
- klare Produktgrenzen,
- bessere Grundlage für Datenschutz und Sicherheit,
- strukturierte Roadmap statt lose Ideen.

## Wie das System einfach funktioniert

### Schritt 1: Nutzer gibt Daten ein oder verbindet später Quellen

Zum Beispiel:

- Laborwert,
- Energielevel,
- Schlaf,
- Schritte,
- Notiz zum Tag,
- DNA-Test,
- Urintest,
- Stuhlprobe,
- Arztbrief.

### Schritt 2: Die App sendet die Daten an Supabase

Supabase speichert die Daten sicherer und strukturierter als eine einfache Tabelle.

### Schritt 3: Die Domain-Logik bewertet die Daten

Das System prüft zum Beispiel:

- Welche Einheit hat der Wert?
- Ist der Wert aktuell oder veraltet?
- Ist der Wert stark oder schwach belegt?
- Gibt es bekannte Regeln für diesen Wert?
- Welche Datenarten fehlen für eine bessere Einschätzung?

### Schritt 4: Das System erstellt eine verständliche Einordnung

Nicht im Sinne von Diagnose, sondern zum Beispiel:

- „Dieser Wert ist auffällig.“
- „Dieser Wert ist alt und sollte nicht überbewertet werden.“
- „Dieser Bereich ist gut belegt.“
- „Hier fehlt noch Kontext.“
- „Für Ernährungstipps wären Stuhlprobe oder Glukosedaten hilfreich.“
- „Für den Arzttermin wären diese fünf Punkte relevant.“

### Schritt 5: Langfristig entsteht der Digital Avatar

Je länger Daten gesammelt werden, desto besser kann das System Muster erkennen.

Der Digital Avatar soll langfristig nicht nur einzelne Datenpunkte anzeigen, sondern persönliche Entwicklung verständlich machen.

## Aktueller Stand

Aktuell ist One-L1fe ein testbarer Prototyp.

Fertig bzw. vorhanden:

- Repo-Struktur,
- Mobile-App-Grundlage,
- Login,
- erste Dateneingabe,
- Weekly Check-in,
- Supabase-Anbindung,
- Datenbank-Migrationen,
- Domain-Schicht,
- Biomarker-Logik,
- Evidence Registry,
- Wearable-Sync-Oberfläche,
- Developer-Insight-Bereich,
- Dokumentation zu Architektur, Compliance und Betrieb.

Noch nicht vollständig fertig:

- echter End-to-End-Test mit Garmin / Health Connect / Android / Supabase,
- vollständige produktive Wearable-Verarbeitung,
- Integration von DNA-, Urin- und Stuhlprobendaten,
- Arzttermin-Zusammenfassungen als fertiges Produktfeature,
- saubere Nutzeroberfläche für alle Interpretationen,
- produktiv verdrahtete KI-Schicht,
- finales Design,
- öffentliche Distribution.

## Warum das Projekt relevant ist

Viele Menschen haben heute Gesundheitsdaten an vielen Stellen:

- Laborberichte,
- Arztbriefe,
- Apple Health,
- Garmin,
- Oura,
- Ernährungsdaten,
- Schlafdaten,
- DNA-Tests,
- Urintests,
- Stuhlproben,
- eigene Notizen.

Das Problem: Die Daten liegen verstreut. Sie werden selten langfristig zusammengeführt. Man sieht oft Werte, aber nicht den Zusammenhang.

One-L1fe versucht genau dort anzusetzen:

- Daten sammeln,
- verständlich machen,
- Verlauf zeigen,
- Unsicherheit sichtbar machen,
- bessere persönliche Fragen ermöglichen,
- Vorbereitung auf Arztgespräche verbessern,
- individuelle Hinweise zu Ernährung und Lebensweise ermöglichen,
- langfristig ein eigenes Gesundheitsmodell aufbauen.

## Nächster Dokumentationsbedarf

Diese Datei ist der verständliche Überblick für Familie, Freunde und interessierte Menschen.

Sie soll regelmäßig ergänzt werden, wenn sich der reale Projektstand ändert.

Als nächstes sollten ergänzt werden:

- Design: Farben, Sprache, UI-Richtung,
- Screenshots oder einfache Skizzen,
- ein konkretes Beispiel: „Ein Nutzer gibt Wert X ein und sieht Y“,
- Erklärung der wichtigsten Biomarker in Alltagssprache,
- Erklärung des Digital Avatar anhand eines realistischen Tages- oder Wochenbeispiels,
- konkrete Beispielausgabe für einen Arzttermin,
- einfache Erklärung, welche Datenarten welche Funktionen freischalten.
