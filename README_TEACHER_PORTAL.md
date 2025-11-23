# 📚 Lærerportal - Full Excel-funksjonalitet

## 🎯 Hva er dette?

En **komplett lærerportal** hvor du kan lage egendefinerte oppgaver med **Excel-funksjonalitet** på ALLE moduler:

- ✅ **Bokføring** - T-kontoer og posteringer
- ✅ **Quiz & Teori** - Flervalg, åpne svar, Excel-beregninger
- ✅ **Regnskapsanalyse** - Horisontal/vertikal analyse
- ✅ **Beregningsoppgaver** - ROE, ROA, nøkkeltall
- ✅ **Case Studies** - Komplekse flerstegs-case
- 🔜 **Multiplayer** - Kahoot-stil quiz (kommer snart)

---

## 🚀 Kom i gang

### 1. Åpne lærerportalen
[📖 teacher_portal_complete.html](computer:///mnt/user-data/outputs/teacher_portal_complete.html)

### 2. Velg modul
Klikk på et av de 6 modulkortene

### 3. Lag oppgave
- Fyll inn tittel og beskrivelse
- Bygg Excel-tabell
- Definer celletyper (Input/Fast/Formel)
- Lagre!

### 4. Publiser
Dine studenter kan nå løse oppgaven!

---

## ⭐ Hovedfunksjoner

### Excel-funksjonalitet
```
✓ Cellereferanser (B1, C2, etc.)
✓ Formler (=B1+B2, =ABS(C3)/B$1*100)
✓ Låste celler (B$1, $B1, $B$1)
✓ Automatiske beregninger
✓ Input/Fast/Formel-celler
```

### Oppgavetyper
```
📖 Bokføring
   - Posteringsoppgaver
   - T-kontoer
   - Kontoplan

❓ Quiz
   - Flervalg
   - Åpne svar
   - Excel-beregninger

📊 Analyse
   - Horisontal analyse
   - Vertikal analyse
   - Nøkkeltall

🔢 Beregning
   - ROE/ROA
   - Likviditet
   - Soliditet

💼 Case
   - Resultatdisponering
   - Årsavslutning
   - Tilleggsposteringer
```

---

## 📖 Eksempler

### Eksempel 1: Enkel bokføring
```
Tittel: Kontantsalg med MVA
Beskrivelse: Selger varer for kr 12 000 + 25% MVA

Excel-tabell:
+---+---------------+--------+--------+
| # | Beskrivelse   | Debet  | Kredit |
+---+---------------+--------+--------+
| 1 | Bankinnskudd  | INPUT  |        |
| 2 | Salgsinntekt  |        | 12000  |
| 3 | Utgående MVA  |        | INPUT  |
+---+---------------+--------+--------+

Formel for studenten: =12000*0.25 (for MVA)
```

### Eksempel 2: Horisontal analyse
```
Tittel: Analysér resultatregnskapet

Excel-tabell:
+---------------+------+------+---------+---------+
|               | 20x5 | 20x4 | Endr kr | Endr %  |
+---------------+------+------+---------+---------+
| Omsetning     | 30k  | 27k  | INPUT   | INPUT   |
| Varekostnad   | -15k | -14k | INPUT   | INPUT   |
+---------------+------+------+---------+---------+

Formler:
- Endring kr: =B2-C2
- Endring %: =(D2/ABS(C2))*100
```

### Eksempel 3: ROE-beregning
```
Tittel: Beregn egenkapitalrentabiliteten

Excel-tabell:
+---------------------+-------+
| Beskrivelse         | Verdi |
+---------------------+-------+
| Årsresultat         | 80000 |
| Gj.snitt egenkapital| 500000|
| ROE (%)             | INPUT |
+---------------------+-------+

Formel: =(B1/B2)*100
Løsning: 16%
```

---

## 🎨 Funksjoner i portalen

### Oppgavebygger
- ✅ Visuell editor
- ✅ Excel-tabell-builder
- ✅ Drag & drop rader/kolonner
- ✅ Celletypevalg (Input/Fast/Formel)
- ✅ Kontoplan-editor (for bokføring)
- ✅ Hint og forklaringer

### Administrasjon
- ✅ Se alle lagrede oppgaver
- ✅ Rediger eksisterende oppgaver
- ✅ Publiser til studenter
- ✅ Slett oppgaver
- ✅ Filtrer etter modul/vanskelighetsgrad

### Datalagring
- ✅ Automatisk lagring i localStorage
- ✅ Eksport/import av oppgaver (kommer)
- ✅ Backup-funksjon (kommer)

---

## 📚 Dokumentasjon

### Komplett guide
[📖 TEACHER_PORTAL_GUIDE.md](computer:///mnt/user-data/outputs/TEACHER_PORTAL_GUIDE.md)

Inneholder:
- Detaljert forklaring av alle moduler
- Steg-for-steg instruksjoner
- Excel-formelguide
- Eksempeloppgaver
- Tips & best practices

---

## 🔧 Tekniske detaljer

### Excel-formler som støttes:

**Operasjoner:**
- `+` Addisjon
- `-` Subtraksjon
- `*` Multiplikasjon
- `/` Divisjon

**Funksjoner:**
- `ABS(x)` - Absoluttverdien
- `(x/y)*100` - Prosent

**Cellereferanser:**
- `B1` - Rad 1, kolonne B
- `B$1` - Låst rad
- `$B1` - Låst kolonne
- `$B$1` - Helt låst

**Eksempler:**
```javascript
=B1+B2          // 10 + 20 = 30
=B1*0.25        // 100 * 0.25 = 25
=ABS(B1)        // ABS(-50) = 50
=(B1/B2)*100    // (80/500)*100 = 16
=B1/B$1*100     // Prosent av rad 1 (kan kopieres ned)
```

---

## 🎯 Neste steg

### 1. Test portalen
- [x] Åpne `teacher_portal_complete.html`
- [ ] Lag en enkel bokføringsoppgave
- [ ] Test Excel-funksjonalitet
- [ ] Lagre og publiser

### 2. Lag innhold
- [ ] 10 bokføringsoppgaver (lett → vanskelig)
- [ ] 20 quiz-spørsmål
- [ ] 5 analyseoppgaver
- [ ] 5 beregningsoppgaver
- [ ] 3 case-oppgaver

### 3. Test med studenter
- [ ] Publiser oppgaver
- [ ] Samle tilbakemeldinger
- [ ] Juster og forbedre

### 4. Multiplayer (kommer)
- [ ] Kahoot-stil quiz
- [ ] PIN-kode system
- [ ] Live leaderboard
- [ ] 1v1 Battles

---

## 📊 Status

| Modul | Excel-støtte | Oppgavetyper | Status |
|-------|-------------|--------------|---------|
| Bokføring | ✅ Full | T-kontoer, posteringer | ✅ Klar |
| Quiz | ✅ Full | Flervalg, åpent, Excel | ✅ Klar |
| Analyse | ✅ Full | Horisontal, vertikal | ✅ Klar |
| Beregning | ✅ Full | Nøkkeltall | ✅ Klar |
| Case | ✅ Full | Flerstegs-case | ✅ Klar |
| Multiplayer | ⏳ Kommer | Kahoot-stil | 🔜 Snart |

---

## 🎉 Ferdig!

**Lærerportalen har nå full Excel-funksjonalitet på alle moduler!**

### Filer:
- [📖 teacher_portal_complete.html](computer:///mnt/user-data/outputs/teacher_portal_complete.html) - Lærerportalen
- [📚 TEACHER_PORTAL_GUIDE.md](computer:///mnt/user-data/outputs/TEACHER_PORTAL_GUIDE.md) - Komplett guide
- [📋 README_TEACHER_PORTAL.md](computer:///mnt/user-data/outputs/README_TEACHER_PORTAL.md) - Denne filen

### Start her:
1. Åpne lærerportalen
2. Les guiden
3. Lag din første oppgave!

**God fornøyelse! 🚀**
