# 🎮 AccountingQuest Multiplayer - KOMPLETT SYSTEM v1.1

## 🆕 NYE FUNKSJONER i v1.1

### ⚙️ **Innstillinger-side**
- **Dark/Light Mode** - Bytt mellom mørkt og lyst tema
- **Tema-farger** - Velg mellom grønn, blå, lilla, oransje
- **Excel-innstillinger** - Kontroller Excel-funksjonalitet
- **Quiz-innstillinger** - Tilpass quiz-opplevelsen
- **Data-administrasjon** - Eksporter og slett data

### 📊 **Excel-stil quiz-spørsmål**
Nå støtter systemet BÅDE:
1. **Kahoot-stil** (flervalg med 4 fargeknapper) - perfekt for multiplayer
2. **Excel-stil** (skriv/beregn svar i celler) - perfekt for bokføring og beregninger

---

## 📦 ALLE FILER (10 stk)

### HTML-filer (6 stk):
1. ⭐ **multiplayer_index.html** - Hovedmeny
2. 👨‍🏫 **teacher_portal.html** - Lag quiz
3. 🖥️ **game_host.html** - Spillvert
4. 🎓 **student_join.html** - Elever logger på
5. 📱 **student_game.html** - Spillskjerm
6. ⚙️ **settings.html** - Innstillinger ⬅️ NY!

### Dokumentasjon (4 stk):
7. 📦 **INDEX.md** - Komplett oversikt
8. 🚀 **QUICK_START.md** - 5-minutters guide
9. 📖 **README_MULTIPLAYER.md** - Full dokumentasjon (denne filen)
10. 🏗️ **ARCHITECTURE.md** - Teknisk arkitektur

### Data:
11. 💾 **demo_quizzes.json** - 3 ferdige quiz

---

## 🎨 DARK/LIGHT MODE

### Hvordan bytte tema:
1. Åpne `settings.html`
2. Toggle "Mørk modus" på/av
3. Velg tema-farge (grønn, blå, lilla, oransje)
4. Klikk "Lagre innstillinger"

### Tema i alle moduler:
Alle deler av systemet respekterer innstillingene:
- ✅ Multiplayer-index
- ✅ Lærer-portal
- ✅ Spillvert
- ✅ Elev-påmelding
- ✅ Spillskjerm
- ✅ Bokføringsspill
- ✅ Quiz-system
- ✅ Regnskapsanalyse
- ✅ Case studies

---

## 📊 EXCEL-STIL QUIZ

### Hva er Excel-stil quiz?
I stedet for å velge mellom A/B/C/D, kan elever:
- **Skrive tallsvar** i celler
- **Bruke formler** (=B1+C1, =SUM(A1:A5))
- **Beregne** nøkkeltall
- **Løse** bokføringsoppgaver

### Eksempel Excel-quiz:

#### Spørsmål 1: Beregn egenkapitalrentabilitet
```
Gitt:
- Årsresultat: 80 000
- Egenkapital: 500 000

Beregn ROE i %: [_______]
```

#### Spørsmål 2: Fullfør bokføring
```
Kontantsalg kr 10 000:

Konto          Debet    Kredit
1920 Bank      [____]   [____]
3000 Salg      [____]   [____]
```

### Hvordan lage Excel-stil quiz:
I `teacher_portal.html`:
1. Klikk "Ny Quiz"
2. Velg **quiz-type**: "Excel-stil" eller "Blandet"
3. For hvert spørsmål:
   - Skriv oppgaven
   - Definer input-felter
   - Sett fasit
   - Legg til forklaring

---

## ⚙️ INNSTILLINGER - FULL GUIDE

### 🎨 Utseende
| Innstilling | Beskrivelse | Standard |
|-------------|-------------|----------|
| **Mørk modus** | Bruk mørkt tema | ✅ På |
| **Tema-farge** | Grønn/Blå/Lilla/Oransje | Grønn |
| **Animasjoner** | Smooth overganger | ✅ På |

### 🎮 Spill
| Innstilling | Beskrivelse | Standard |
|-------------|-------------|----------|
| **Lydeffekter** | Spill lyder | ✅ På |
| **Vis forklaringer** | Auto-vis etter svar | ✅ På |
| **Standard tid** | Tid per spørsmål | 30 sek |

### 📊 Bokføring & Excel
| Innstilling | Beskrivelse | Standard |
|-------------|-------------|----------|
| **Excel-stil interface** | Excel-celler | ✅ På |
| **Vis kalkulator** | Flyttbar kalkulator | ✅ På |
| **Celle-navigering** | Piltaster | ✅ På |
| **Formel-støtte** | =B1+C1 osv. | ✅ På |
| **Auto-formatering** | 1000 → 1 000 | ✅ På |

### ❓ Quiz-opplevelse
| Innstilling | Beskrivelse | Standard |
|-------------|-------------|----------|
| **Quiz-type** | Kahoot/Tradisjonell/Excel | Kahoot |
| **Vis fremgang** | Fremdriftsbalk | ✅ På |
| **Tillat hoppe over** | Skip-knapp | ❌ Av |
| **Hint-system** | Hint-knapp | ✅ På |

### 💾 Data & Lagring
| Innstilling | Beskrivelse | Standard |
|-------------|-------------|----------|
| **Auto-lagre** | Lagre automatisk | ✅ På |
| **Eksporter data** | Last ned backup | - |
| **Slett all data** | Reset alt | - |

---

## 🎯 QUIZ-TYPER OVERSIKT

### 1. Kahoot-stil (Multiplayer)
```
✅ Best for: Live konkurranser
✅ Spørsmål: Flervalg
✅ Svar: 4 fargeknapper
✅ Tid: 10-60 sekunder
✅ Poeng: Riktig + hastighetsbonus
```

**Eksempel:**
```
Hva er standard MVA-sats?

🔴 A) 15%
🔵 B) 20%
🟠 C) 25% ← Riktig!
🟢 D) 30%
```

### 2. Excel-stil (Solo/Øving)
```
✅ Best for: Beregninger og bokføring
✅ Spørsmål: Oppgaver med input
✅ Svar: Skriv/beregn i celler
✅ Tid: 30-180 sekunder
✅ Poeng: Nøyaktighet
```

**Eksempel:**
```
Beregn likviditetsgrad 1:

Omløpsmidler:    800 000
Kortsiktig gjeld: 500 000

Likviditetsgrad 1 = [_______]

(Formel: =B1/B2)
```

### 3. Blandet (Avansert)
```
✅ Best for: Variert læring
✅ Spørsmål: Både flervalg og beregning
✅ Svar: Tilpasset per spørsmål
✅ Tid: Varierende
✅ Poeng: Tilpasset
```

**Eksempel:**
```
Spørsmål 1: Flervalg - Hva er ROE?
Spørsmål 2: Excel - Beregn ROE
Spørsmål 3: Flervalg - Tolkning av ROE
Spørsmål 4: Excel - Sammenlign ROE over tid
```

---

## 🚀 RASK OPPSTART MED INNSTILLINGER

### Steg 1: Tilpass utseende
```
1. Åpne settings.html
2. Velg Light mode hvis du foretrekker lyst tema
3. Velg tema-farge (f.eks. blå)
4. Lagre innstillinger
```

### Steg 2: Konfigurer Excel-funksjoner
```
1. I settings.html
2. Skru på/av Excel-funksjoner
3. Velg quiz-stil (Kahoot/Excel/Blandet)
4. Lagre innstillinger
```

### Steg 3: Lag første quiz
```
1. Åpne teacher_portal.html
2. Velg quiz-type basert på innstillinger
3. Legg til spørsmål
4. Start spill!
```

---

## 💡 BESTE PRAKSIS

### For Kahoot-stil quiz:
✅ **5-8 spørsmål** - Holder engasjementet oppe
✅ **30 sekunder** per spørsmål - Balansert tid
✅ **Variert vanskelighet** - Start lett, slutt vanskelig
✅ **Gode forklaringer** - Pedagogisk viktig
✅ **Live diskusjon** - Pause og snakk om svarene

### For Excel-stil quiz:
✅ **3-5 oppgaver** - Tar lengre tid
✅ **60-120 sekunder** per oppgave - Mer tid til beregning
✅ **Inkluder formler** - Lær Excel samtidig
✅ **Detaljerte fasit** - Vis steg-for-steg
✅ **Praktiske case** - Virkelige regnskapssituasjoner

### For blandede quiz:
✅ **Start med flervalg** - Varm opp
✅ **Excel i midten** - Når de er fokusert
✅ **Avslutt med flervalg** - Oppsummering
✅ **Balansert fordeling** - 60% flervalg, 40% Excel
✅ **Tydelig instruksjon** - Forklar hva som forventes

---

## 📊 EKSEMPEL-QUIZ MED BLANDET TYPE

### "Komplett Regnskapstest"

#### Del 1: Teori (Kahoot-stil, 5 min)
1. Hva er hovedregel for MVA-sats? (30 sek)
2. Når debiteres bankinnskudd? (30 sek)
3. Hva klassifiseres som omløpsmiddel? (30 sek)

#### Del 2: Beregning (Excel-stil, 10 min)
4. Beregn egenkapitalrentabilitet (ROE) (120 sek)
5. Fullfør horisontal analyse (150 sek)
6. Beregn likviditetsgrad 1 og 2 (120 sek)

#### Del 3: Anvendelse (Kahoot-stil, 3 min)
7. Hvordan tolkes ROE på 15%? (30 sek)
8. Er likviditetsgrad 1 på 1.2 bra? (30 sek)
9. Hvilket nøkkeltall viser soliditet? (30 sek)

**Total tid: 18 minutter**
**Total poeng: 9000 (1000 per spørsmål)**

---

## 🎨 TEMA-EKSEMPLER

### Grønt tema (Standard)
```css
Primær: #4ade80 (Neon grønn)
Sekundær: #22c55e (Mørk grønn)
Bakgrunn: #1e1e1e (Mørk grå)
```

### Blått tema
```css
Primær: #3b82f6 (Lys blå)
Sekundær: #2563eb (Mørk blå)
Bakgrunn: #1e1e1e (Mørk grå)
```

### Lilla tema
```css
Primær: #a855f7 (Lilla)
Sekundær: #9333ea (Mørk lilla)
Bakgrunn: #1e1e1e (Mørk grå)
```

### Oransje tema
```css
Primær: #f59e0b (Gul-oransje)
Sekundær: #d97706 (Mørk oransje)
Bakgrunn: #1e1e1e (Mørk grå)
```

### Light mode (alle farger)
```css
Bakgrunn: #f5f5f5 (Lys grå)
Kort: #ffffff (Hvit)
Tekst: #1e1e1e (Mørk grå)
```

---

## 🔧 TEKNISKE DETALJER

### Innstillinger lagres i localStorage:
```javascript
{
  darkMode: true,
  themeColor: 'green',
  animations: true,
  sound: true,
  autoExplanation: true,
  defaultTime: 30,
  excelMode: true,
  calculator: true,
  cellNav: true,
  formulas: true,
  autoFormat: true,
  quizStyle: 'kahoot',
  showProgress: true,
  allowSkip: false,
  hints: true,
  autosave: true
}
```

### Innstillingene brukes av:
- ✅ `multiplayer_index.html` - Tema og farger
- ✅ `teacher_portal.html` - Quiz-oppsett
- ✅ `game_host.html` - Spillvisning
- ✅ `student_game.html` - Elev-opplevelse
- ✅ Alle bokføring/quiz-moduler

---

## 📱 RESPONSIVT DESIGN

Alle sider tilpasser seg:
- **Desktop** (>1200px) - Full layout
- **Tablet** (768-1200px) - Kompakt layout
- **Mobil** (<768px) - Vertikal layout

Innstillinger er like enkle på mobil som på desktop!

---

## 🆘 FEILSØKING

### Problem: Innstillinger virker ikke
**Løsning:**
1. Sjekk at du klikket "Lagre innstillinger"
2. Oppdater siden (F5)
3. Sjekk at localStorage er aktivert

### Problem: Dark mode virker ikke i alle moduler
**Løsning:**
1. Åpne hver modul én gang etter å ha endret tema
2. Modulene laster innstillinger ved oppstart
3. Oppdater alle åpne vinduer

### Problem: Excel-funksjoner fungerer ikke
**Løsning:**
1. Gå til settings.html
2. Sjekk at "Excel-stil interface" er PÅ
3. Sjekk at "Formel-støtte" er PÅ
4. Lagre og prøv igjen

---

## 🔮 KOMMENDE FUNKSJONER

### v1.2 (snart):
- 🎵 Faktiske lydeffekter
- 📸 Bilder i quiz-spørsmål
- 📥 Import av quiz fra JSON
- 🎨 Flere tema-farger
- 🌙 Auto dark mode (følg system)

### v2.0 (fremtid):
- 🔥 Firebase backend (ekte sanntid)
- ⚔️ Duell-modus
- 🏆 Achievement-system
- 📊 Avansert statistikk
- 🌍 Flerspråklig

---

## 📞 SUPPORT

### Trenger hjelp?
1. Les **QUICK_START.md** for rask hjelp
2. Les **INDEX.md** for oversikt
3. Les denne filen for detaljer
4. Sjekk **ARCHITECTURE.md** for teknisk info

### Rapporter bugs:
Beskriv:
- Hvilken fil/side
- Hvilken nettleser
- Hva du gjorde
- Hva som skjedde
- Dine innstillinger

---

**Oppdatert: November 2024**
**Versjon: 1.1**
**Nytt: Settings & Excel-quiz støtte**

🎓 **Lykke til med undervisningen!** 🚀
