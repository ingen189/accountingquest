# 📚 Lærerportal - Komplett Guide

## 🎯 Oversikt

Lærerportalen gir deg full kontroll til å lage egendefinerte oppgaver med **Excel-funksjonalitet** på ALLE moduler. Du kan lage alt fra enkle flervalgsoppgaver til komplekse bokførings-case med formler og cellereferanser.

---

## 🚀 Kom i gang

### Åpne lærerportalen
[📖 Åpne teacher_portal_complete.html](computer:///mnt/user-data/outputs/teacher_portal_complete.html)

### Hovedmeny
Du ser 6 modulkort:
1. **📖 Bokføring** - Interaktive bokføringsoppgaver
2. **❓ Quiz & Teori** - Flervalg og teoretiske spørsmål
3. **📊 Regnskapsanalyse** - Analyseoppgaver med nøkkeltall
4. **🔢 Beregningsoppgaver** - Matematiske beregninger
5. **💼 Case Studies** - Komplekse case-oppgaver
6. **🎮 Multiplayer Quiz** - Kahoot-stil klasseromsquiz

---

## 📖 MODUL 1: Bokføring

### Hva kan du lage?
- Posteringsoppgaver med T-kontoer
- Excel-tabeller for bilag og poster
- Drag-and-drop kontoplan
- Automatisk validering

### Slik lager du en bokføringsoppgave:

1. **Klikk på "Bokføring"-kortet**
2. **Fyll inn grunnleggende info:**
   - Tittel: "Kontantsalg med MVA"
   - Beskrivelse: "Selger varer for kr 12 000 + MVA"
   - Vanskelighetsgrad: Lett/Middels/Vanskelig

3. **Bygg Excel-tabellen:**
   - Klikk "+ Legg til rad" for hver posteringslinje
   - Tabellen har automatisk kolonner: #, Beskrivelse, Debet, Kredit
   - Du kan legge til flere kolonner med "+ Legg til kolonne"

4. **Definer celletyper:**
   - **Input** - Student skal fylle inn selv
   - **Fast** - Forhåndsutfylt (readonly)
   - **Formel** - Automatisk beregning (f.eks. =B2*0.25 for MVA)

5. **Legg til kontoplan (valgfri):**
   ```
   1920 Bankinnskudd
   2700 Utgående MVA
   3000 Salgsinntekt
   ```

6. **Legg til hint:**
   "Husk å beregne MVA: 12 000 × 0,25 = 3 000"

7. **Klikk "💾 Lagre Oppgave"**

### Eksempel på ferdig oppgave:
```
Tittel: Kontantsalg med MVA
Beskrivelse: Selger varer for kr 12 000 + MVA (25%)

Excel-tabell:
+-+---------------+--------+--------+
|#| Beskrivelse   | Debet  | Kredit |
+-+---------------+--------+--------+
|1| Bankinnskudd  | [INPUT]|        |
|2| Salgsinntekt  |        | 12000  |
|3| Utgående MVA  |        | [INPUT]|
+-+---------------+--------+--------+

Løsning:
- Debet 1920: 15 000 (12 000 + 3 000)
- Kredit 3000: 12 000
- Kredit 2700: 3 000
```

---

## ❓ MODUL 2: Quiz & Teori

### 3 typer spørsmål:

#### A) Flervalg
```
Spørsmål: Hva er egenkapital?
☐ A) Eiendeler - Gjeld (Riktig ✓)
☐ B) Eiendeler + Gjeld
☐ C) Gjeld - Eiendeler
☐ D) Ingen av delene
```

**Slik lager du:**
1. Velg "Flervalg" som type
2. Skriv alternativene (minimum 2)
3. Kryss av for riktig(e) svar

#### B) Åpent svar
```
Spørsmål: Forklar opptjeningsprinsippet

Forventet svar: "Inntekter skal bokføres når de er 
opptjent, ikke nødvendigvis når pengene mottas..."
```

**Slik lager du:**
1. Velg "Åpent svar" som type
2. Skriv forventet svar/nøkkelord

#### C) Excel-beregning
```
Spørsmål: Beregn egenkapitalrentabiliteten

Gitt:
- Årsresultat: 80 000
- Egenkapital: 500 000

Excel-tabell for utregning:
+---+-------------+--------+
| # | Beskrivelse | Verdi  |
+---+-------------+--------+
| 1 | Årsresultat | 80000  |
| 2 | Egenkapital | 500000 |
| 3 | ROE (%)     | [INPUT]|
+---+-------------+--------+

Løsning: (80000/500000)*100 = 16%
```

**Slik lager du:**
1. Velg "Excel-beregning" som type
2. Bygg Excel-tabellen med "+ Legg til rad"
3. Marker hvilke celler studenten skal fylle inn

---

## 📊 MODUL 3: Regnskapsanalyse

### Hva kan du lage?
- Horisontal analyse (% endring mellom år)
- Vertikal analyse (% av omsetning)
- Nøkkeltallberegninger
- Grafisk fremstilling

### Eksempel: Horisontal analyse

**Oppgave:**
"Analyser utviklingen i resultatregnskapet fra 20x4 til 20x5"

**Excel-tabell:**
```
+--------------------+--------+--------+------------+------------+
|                    | 20x5   | 20x4   | Endring kr | Endring %  |
+--------------------+--------+--------+------------+------------+
| Driftsinntekter    | 30000  | 27000  | [INPUT]    | [INPUT]    |
| Varekostnad        | -15000 | -14000 | [INPUT]    | [INPUT]    |
| Lønnskostnad       | -5000  | -4200  | [INPUT]    | [INPUT]    |
| Driftsresultat     | 7000   | 6000   | [INPUT]    | [INPUT]    |
+--------------------+--------+--------+------------+------------+
```

**Formler studenten kan bruke:**
- Endring kr: `=B2-C2`
- Endring %: `=(D2/ABS(C2))*100`

**Hint:**
"Endring i kr = 20x5 - 20x4
Endring i % = (Endring kr / ABS(20x4)) × 100"

---

## 🔢 MODUL 4: Beregningsoppgaver

### Hva kan du lage?
- ROE (Egenkapitalrentabilitet)
- ROA (Totalkapitalrentabilitet)
- Likviditetsgrad 1 & 2
- Soliditet (Egenkapitalandel)
- Gjeldsgrad
- Rentedekningsgrad
- Arbeidskapital

### Eksempel: ROE-beregning

**Oppgave:**
"Beregn egenkapitalrentabiliteten (ROE) for Alpha AS"

**Excel-tabell:**
```
+---------------------+--------+
| Beskrivelse         | Verdi  |
+---------------------+--------+
| Årsresultat         | 80000  |
| Gj.snitt egenkapital| 500000 |
| ROE (%)             | [INPUT]|
+---------------------+--------+
```

**Formel:**
`ROE = (Årsresultat / Gjennomsnittlig egenkapital) × 100`

**I Excel:**
`=(B1/B2)*100`

**Løsning:** 16%

---

## 💼 MODUL 5: Case Studies

### Hva kan du lage?
- Resultatdisponering
- Årsavslutning
- Tilleggsposteringer
- Komplekse flerstegs-case

### Eksempel: Resultatdisponering

**Oppgave:**
"Alpha AS har et årsresultat på kr 800 000. Styret foreslår:
- Utbytte: kr 300 000
- Resten til annen egenkapital"

**Excel-tabell:**
```
+------------------------+--------+
| Konto                  | Beløp  |
+------------------------+--------+
| 8800 Årsresultat       | 800000 |
| 2800 Avsatt utbytte    | [INPUT]|
| 2050 Annen egenkapital | [INPUT]|
+------------------------+--------+
```

**Løsning:**
- 2800: 300 000
- 2050: 500 000 (800 000 - 300 000)

---

## 🎮 MODUL 6: Multiplayer Quiz

### Kommer snart!

Funksjoner som kommer:
- **Kahoot-stil klasseromsquiz**
- **PIN-kode system** for studenter
- **Live leaderboard**
- **1v1 Battles**
- **Blandet oppgavetyper** i samme quiz

---

## 🔧 EXCEL-FUNKSJONER

### Celletyper

| Type | Beskrivelse | Eksempel |
|------|-------------|----------|
| **Input** | Student fyller inn | Tomt felt |
| **Fast (Readonly)** | Forhåndsutfylt | 12000 |
| **Formel** | Automatisk beregning | =B2*0.25 |

### Formler som støttes

#### Grunnleggende operasjoner:
- `=B1+B2` - Addisjon
- `=B1-B2` - Subtraksjon
- `=B1*B2` - Multiplikasjon
- `=B1/B2` - Divisjon

#### Funksjoner:
- `=ABS(B1)` - Absoluttverdien
- `=(B1/B2)*100` - Prosent
- `=B$1` - Låst rad (kan kopieres ned)

#### Cellereferanser:
- `B1` - Vanlig referanse (rad 1, kolonne B)
- `B$1` - Låst rad
- `$B1` - Låst kolonne
- `$B$1` - Helt låst

### Eksempler på komplekse formler:

**MVA-beregning:**
```
=B2*0.25
(12 000 × 0,25 = 3 000)
```

**Prosent av omsetning:**
```
=ABS(B2)/B$1*100
(Varekostnad / Omsetning × 100)
```

**ROE-beregning:**
```
=(B1/B2)*100
(Årsresultat / Egenkapital × 100)
```

**Horisontal analyse:**
```
=(D2/ABS(C2))*100
((Endring kr / ABS(Tidligere år)) × 100)
```

---

## 💾 LAGRING & ADMINISTRASJON

### Lagre oppgave
1. Fyll inn alle felter
2. Klikk "💾 Lagre Oppgave"
3. Oppgaven lagres i localStorage

### Se mine oppgaver
1. Klikk "Mine Quiz" i toppmenyen
2. Se alle lagrede oppgaver
3. Filtrer etter modul

### Rediger oppgave
1. Gå til "Mine Quiz"
2. Klikk "✏️ Rediger" på oppgaven
3. Gjør endringer
4. Lagre på nytt

### Publiser oppgave
1. Gå til "Mine Quiz"
2. Klikk "🚀 Publiser" på oppgaven
3. Oppgaven blir tilgjengelig for studenter

### Slett oppgave
1. Gå til "Mine Quiz"
2. Klikk "🗑️ Slett" på oppgaven
3. Bekreft sletting

---

## 📋 TIPS & BEST PRACTICES

### For bokføringsoppgaver:
✅ Start med enkle oppgaver (kontantsalg)
✅ Legg til kontoplan for lettere løsning
✅ Bruk hint for å guide studentene
✅ Test oppgaven selv før publisering

### For quiz:
✅ Miks flervalg og åpne spørsmål
✅ Legg til Excel-beregninger for variasjon
✅ Bruk lovhjemler i forklaringene
✅ Ha 4-6 alternativer i flervalg

### For analyseoppgaver:
✅ Gi realistiske tall
✅ Bruk formler for automatisk beregning
✅ Legg til hint om hvilke formler som brukes
✅ Vis steg-for-steg løsning

### For beregningsoppgaver:
✅ Start med enkle nøkkeltall (ROE, ROA)
✅ Gi formelen i oppgaveteksten
✅ La studenten bruke Excel-formler
✅ Randomiser tallene for variasjon

### For case-oppgaver:
✅ Bygg opp kompleksiteten gradvis
✅ Lag flerstegs oppgaver
✅ Kombiner flere konsepter
✅ Gi god tid til løsning

---

## 🎯 EKSEMPEL-OPPGAVER

### 1. Enkel bokføring (Lett)
**Tittel:** Kontantsalg uten MVA  
**Beskrivelse:** Selger varer for kr 10 000 kontant  
**Løsning:**
- Debet 1920 Bankinnskudd: 10 000
- Kredit 3000 Salgsinntekt: 10 000

### 2. Bokføring med MVA (Middels)
**Tittel:** Kontantsalg med MVA  
**Beskrivelse:** Selger varer for kr 12 000 + 25% MVA  
**Løsning:**
- Debet 1920 Bankinnskudd: 15 000
- Kredit 3000 Salgsinntekt: 12 000
- Kredit 2700 Utgående MVA: 3 000

### 3. Lønnskjøring (Vanskelig)
**Tittel:** Komplett lønnskjøring  
**Beskrivelse:** Brutto lønn kr 30 000, skattetrekk 30%, AGA 14,1%  
**Løsning:**
- Debet 5000 Lønn: 30 000
- Debet 5400 AGA: 4 230
- Kredit 2600 Skattetrekk: 9 000
- Kredit 2770 Skyldig AGA: 4 230
- Kredit 2930 Påløpt lønn: 21 000

### 4. ROE-beregning (Lett)
**Tittel:** Egenkapitalrentabilitet  
**Gitt:** Årsresultat 80 000, Egenkapital 500 000  
**Løsning:** ROE = (80 000 / 500 000) × 100 = 16%

### 5. Horisontal analyse (Middels)
**Tittel:** Analyse av resultatregnskapet  
**Gitt:** Omsetning 20x5: 30 000, 20x4: 27 000  
**Løsning:** Endring kr = 3 000, Endring % = 11,11%

---

## 🚀 NESTE STEG

1. **Test lærerportalen:**  
   [📖 Åpne teacher_portal_complete.html](computer:///mnt/user-data/outputs/teacher_portal_complete.html)

2. **Lag din første oppgave:**  
   - Start med en enkel bokføringsoppgave
   - Test Excel-funksjonaliteten
   - Lagre og publiser

3. **Utvid innholdet:**  
   - Lag 5-10 oppgaver per modul
   - Variere vanskelighetsgraden
   - Kombiner ulike oppgavetyper

4. **Forbered multiplayer:**  
   - Tenk på hvilke oppgaver som egner seg for quiz
   - Planlegg Kahoot-stil økter
   - Kombiner teori og praksis

---

## 📞 SUPPORT

### Trenger du hjelp?
- Se denne guiden først
- Test med enkle oppgaver
- Bygg gradvis opp kompleksiteten

### Funnet en bug?
- Beskriv problemet
- Gjenta stegene
- Send tilbakemelding

---

## ✅ SJEKKLISTE: Klar til bruk

- [x] Lærerportal opprettet
- [x] Alle 5 moduler støtter Excel
- [x] Formler fungerer
- [x] Lagring fungerer
- [x] Publisering fungerer
- [ ] Test med ekte studenter
- [ ] Samle tilbakemeldinger
- [ ] Forbedre basert på feedback

---

# 🎉 Du er klar!

**Lærerportalen har nå full Excel-funksjonalitet på alle moduler!**

[📖 Åpne lærerportalen](computer:///mnt/user-data/outputs/teacher_portal_complete.html)

God fornøyelse med å lage oppgaver! 🚀
