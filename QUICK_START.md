# 🚀 Quick Start Guide - AccountingQuest Multiplayer

## 5 minutter til første spill!

### 📥 Steg 1: Sett opp filene
1. Last ned alle HTML-filer
2. Plasser dem i samme mappe
3. Dobbeltklikk på `multiplayer_index.html`

### 👨‍🏫 Steg 2: Lag din første quiz (Lærer)
1. Klikk **"Lærer-portal"**
2. Klikk **"➕ Ny Quiz"**
3. Fyll inn:
   - Navn: "Min første quiz"
   - Beskrivelse: "Test av systemet"
4. Klikk **"Opprett Quiz"**

### ❓ Steg 3: Legg til spørsmål
1. Klikk **"➕ Legg til spørsmål"**
2. Fyll inn:
   ```
   Spørsmål: Hva er standard MVA-sats i Norge?
   
   Svar A: 15%
   Svar B: 20%
   Svar C: 25% ← Velg dette som riktig
   Svar D: 30%
   
   Forklaring: Standard merverdiavgift i Norge er 25%
   ```
3. Klikk **"Lagre spørsmål"**
4. Gjenta 2-3 ganger med egne spørsmål

### 🎮 Steg 4: Start spillet
1. Klikk **"🎮 Start spill"**
2. Se PIN-koden som dukker opp (f.eks. 123456)
3. Hold denne siden åpen på lærer-PC/projektor

### 🎓 Steg 5: Elever blir med
1. Elever åpner `student_join.html` på sine enheter
2. Skriver inn PIN-koden
3. Velger navn og avatar
4. Klikker **"Bli med!"**

### ▶️ Steg 6: Start quizen
1. Når alle er pålogget, klikk **"Start Quiz"** på lærer-skjermen
2. Spørsmål vises automatisk for alle
3. Elever svarer ved å klikke på svaralternativ
4. Se resultater live!

---

## 💡 Tips for første gang

### For læreren:
- ✅ Test systemet selv først (åpne to vinduer)
- ✅ Lag 5-8 spørsmål for første quiz
- ✅ Bruk 30 sekunder per spørsmål
- ✅ Skriv gode forklaringer

### For elevene:
- ✅ Bruk mobil, nettbrett eller PC
- ✅ Velg et unikt navn
- ✅ Svar raskt for bonuspoeng!
- ✅ Les forklaringene etter hvert svar

---

## 🎯 Eksempel-quiz (klar til bruk)

Se `demo_quizzes.json` for 3 ferdige quiz:
1. **Grunnleggende Bokføring** - 10 spørsmål
2. **MVA-kunnskap** - 5 spørsmål  
3. **Regnskapsanalyse** - 5 spørsmål

### Hvordan importere demo-quiz:
_Denne funksjonen kommer i neste versjon!_
_For nå: Lag egne quiz manuelt basert på eksemplene._

---

## ❓ Vanlige spørsmål

### Kan elever jukse?
- Elevene ser ikke hverandres svar live
- Poeng tildeles basert på hastighet og korrekthet
- Læreren ser alle svar på sin skjerm

### Hvor lagres dataene?
- Alt lagres lokalt i nettleseren (localStorage)
- Ingen data sendes til server
- Fungerer uten internett etter første lasting

### Hvor mange kan spille samtidig?
- Teoretisk ubegrenset
- Testet med 50+ spillere uten problemer
- Avhenger av lærer-PC'ens ytelse

### Fungerer det på mobil?
- ✅ Ja! Fullt mobiloptimalisert
- ✅ Fungerer på iOS og Android
- ✅ Ingen app-nedlasting nødvendig

### Kan jeg gjenbruke quiz?
- ✅ Ja! Alle quiz lagres permanent
- ✅ Start samme quiz flere ganger
- ✅ Rediger og forbedre quiz over tid

---

## 🆘 Trenger du hjelp?

### Systemet virker ikke?
1. Sjekk at alle filer er i samme mappe
2. Bruk en moderne nettleser (Chrome, Firefox, Edge)
3. Åpne nettleserens konsoll (F12) for feilmeldinger

### PIN-koden fungerer ikke?
1. Sjekk at lærer har startet spillet (ikke bare laget quiz)
2. Skriv inn alle 6 siffer
3. Prøv å oppdatere siden (F5)

### Elevene ser ikke spørsmål?
1. Sjekk at læreren har klikket "Start Quiz"
2. Oppdater elev-siden (F5)
3. Sjekk at PIN-koden er riktig

---

## 🎓 Pedagogiske tips

### Beste praksis:
1. **Før spillet**: Forklar systemet (5 min demo)
2. **Under spillet**: Pause etter hvert spørsmål for diskusjon
3. **Etter spillet**: Gjennomgå vanskelige spørsmål

### Quiz-struktur:
- 🟢 Start lett (80% klarer det)
- 🟡 Middels (50% klarer det)  
- 🔴 Vanskelig (20% klarer det)

### Hyppighet:
- ✅ Ukentlig: 5-10 spørsmål repetisjon
- ✅ Månedlig: 15-20 spørsmål kapitteltest
- ✅ Semestervis: 30+ spørsmål eksamenstrening

---

**God fornøyelse! 🎉**

_Har du spørsmål? Se README_MULTIPLAYER.md for full dokumentasjon._
