# 🎮 AccountingQuest - Kahoot-Style Multiplayer System

## 📋 Oversikt

Et komplett Kahoot-inspirert multiplayer quiz-system for regnskapsundervisning. Systemet lar lærere lage egne quiz, starte live-spill, og la studenter konkurrere i sanntid.

## ✨ Features

### 👨‍🏫 Lærer-portal (`teacher_portal.html`)
- ➕ **Lag egne quiz** med ubegrenset antall spørsmål
- 📝 **Flervalgsspørsmål** med 4 svaralternativer
- ⏱️ **Justerbar tid** per spørsmål (10-120 sekunder)
- 💡 **Forklaringer** - legg til pedagogiske forklaringer til hvert spørsmål
- ✏️ **Rediger og slett** spørsmål når som helst
- 🎮 **Start spill** med autogenerert 6-sifret PIN
- 💾 **Lokal lagring** - alle quiz lagres i localStorage

### 🖥️ Spillvert (`game_host.html`)
- 📺 **Stort PIN-display** for å vise til klassen
- 👥 **Live spillerliste** - se hvem som blir med
- 📊 **Sanntids-visning** av svar under hvert spørsmål
- ⏰ **Visuell nedtelling** med fargeendringer
- 🏆 **Automatisk resultattavle** etter siste spørsmål
- 📈 **Poengberegning** basert på riktig svar + hastighet

### 🎓 Elev-portal (`student_join.html`)
- 🔢 **Enkel PIN-innlogging**
- 👤 **Velg navn og avatar** (12 forskjellige emojis)
- ⏳ **Lobby-visning** mens man venter på spillstart
- 📱 **Mobiloptimalisert** interface

### 📱 Spill-skjerm for elever (`student_game.html`)
- 🎯 **Store, fargerike svarknapper**
- ⏱️ **Live nedtelling**
- ⚡ **Umiddelbar feedback** etter svar
- 🎨 **Kahoot-inspirert design** med fire farger (rød, blå, oransje, grønn)
- 💯 **Poengvisning** som oppdateres live
- 🏅 **Sluttresultater** med statistikk

## 🚀 Komme i gang

### Installasjon
1. Last ned alle 5 HTML-filer
2. Plasser dem i samme mappe
3. Åpne `multiplayer_index.html` i nettleseren

### For lærere
1. Klikk "Lærer-portal"
2. Klikk "➕ Ny Quiz"
3. Gi quizen et navn og beskrivelse
4. Legg til spørsmål med "➕ Legg til spørsmål"
5. For hvert spørsmål:
   - Skriv spørsmålet
   - Legg inn 4 svaralternativer
   - Velg riktig svar
   - Legg til en forklaring (valgfritt)
6. Klikk "🎮 Start spill"
7. Vis PIN-koden til elevene

### For elever
1. Gå til "Bli med i spill"
2. Skriv inn PIN-koden fra læreren
3. Velg navn og avatar
4. Vent til læreren starter
5. Svar på spørsmålene så raskt som mulig!

## 🎨 Design-prinsipper

### Kahoot-inspirert
- **Store, fargerike knapper** - lett å se på avstand
- **Fire distinkte farger** - rød, blå, oransje, grønn
- **Tydelig typografi** - stor og leselig tekst
- **Animasjoner** - smooth transitions og feedback

### Mobiloptimalisert
- **Responsive grid** - tilpasser seg skjermstørrelse
- **Touch-friendly** - store klikkbare områder
- **Vertikal layout** på mobil
- **Ingen små detaljer** som er vanskelig å trykke på

### Mørkt tema
- **Profesjonelt utseende** - #1e1e1e bakgrunn
- **Høy kontrast** - lett å lese
- **Neon-aksenter** - #4ade80 grønn for viktige elementer

## 💾 Datalagring

Systemet bruker **localStorage** for all datalagring:

```javascript
// Quiz lagres her:
teacher_quizzes: [{
    id: timestamp,
    name: "Quiz navn",
    description: "Beskrivelse",
    timePerQuestion: 30,
    questions: [...]
}]

// Aktiv spilløkt:
game_session: {
    pin: "123456",
    quiz: {...},
    created: timestamp
}

// Spillere i lobby:
game_123456_players: [
    {name: "Ole", avatar: "😊", joinedAt: timestamp}
]

// Svar fra spillere:
game_123456_answers: {
    "Ole": {questionIndex: 0, answer: 2, timeLeft: 15}
}

// Aktivt spørsmål:
game_123456_question: {
    index: 0,
    question: "...",
    answers: [...],
    time: 30
}
```

## 🔧 Tekniske detaljer

### Arkitektur
- **Kun frontend** - ingen server nødvendig
- **localStorage** - for datapersistering
- **Polling** - for sanntids-oppdateringer (500ms intervall)
- **Vanilla JavaScript** - ingen avhengigheter

### Filstruktur
```
multiplayer_index.html    - Hovedmeny
teacher_portal.html       - Lag og administrer quiz
game_host.html           - Spillvert (lærer ser dette)
student_join.html        - Elever blir med her
student_game.html        - Spillskjerm for elever
```

### Browser-kompatibilitet
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📊 Poengberegning

Poeng tildeles basert på:
1. **Riktig svar**: 500 poeng
2. **Hastighetsbonus**: 0-500 poeng ekstra
   - Beregning: `(timeLeft / totalTime) × 500`
   - Eksempel: Svarer på 30 sek spørsmål etter 10 sek = 500 + 333 = 833 poeng

**Maksimalt**: 1000 poeng per spørsmål

## 🎯 Eksempel-quiz

Her er et eksempel på hvordan man lager en regnskaps-quiz:

```javascript
{
    name: "Grunnleggende Bokføring",
    description: "Test din kunnskap om dobbel bokføring",
    timePerQuestion: 30,
    questions: [
        {
            text: "Hva bokføres på debet ved kontantsalg?",
            answers: [
                "Bankinnskudd",
                "Salgsinntekt",
                "Kundefordringer",
                "Leverandørgjeld"
            ],
            correct: 0,
            explanation: "Ved kontantsalg debiteres bankinnskudd fordi pengene kommer inn på kontoen."
        }
    ]
}
```

## 🚧 Fremtidige forbedringer

### Planlagt for neste versjon:
- 🔥 **Firebase Realtime Database** - ekte sanntidssynk
- ⚔️ **Duell-modus** - 1v1 konkurranser
- 📊 **Statistikk-eksport** - Last ned resultater som CSV
- 🏆 **Achievement-system** - Utmerkelser for prestasjon
- 🎵 **Lydeffekter** - Som Kahoot har
- 📸 **Bilder i spørsmål** - Vis grafer og diagrammer
- 🌍 **Flerspråklig** - Engelsk og flere språk

### Kortsiktige forbedringer:
- ✅ Vis riktig svar etter hvert spørsmål
- ✅ Bedre forklaringer med lovhjemler
- ✅ Eksporter quiz som JSON
- ✅ Importer quiz fra JSON
- ✅ Dupliser eksisterende quiz
- ✅ Forhåndsvisning før start

## 🐛 Kjente begrensninger

1. **localStorage-grense**: ~5-10MB per domene
   - Løsning: Eksporter gamle quiz som JSON
   
2. **Polling i stedet for WebSockets**: 
   - Kan ha litt forsinkelse (500ms)
   - Løsning: Bytt til Firebase når klar

3. **Kun én lærer per PIN**: 
   - Hvis to lærere starter samtidig med samme PIN kan det bli konflikt
   - Løsning: Bruk UUID i stedet for random 6-siffer

4. **Ingen autentisering**: 
   - Hvem som helst kan starte spill
   - Løsning: Legg til lærer-innlogging

## 📞 Support & bidrag

Dette er et open-source utdanningsprosjekt for AccountingQuest.

### Rapporter feil
Hvis du finner bugs eller har forslag:
1. Beskriv problemet detaljert
2. Inkluder hvilken nettleser du bruker
3. Legg ved skjermbilder hvis relevant

### Bidra med kode
Pull requests er velkomne! Spesielt:
- Nye quiz-templates
- Forbedret UI/UX
- Flere språk
- Ytelsesoptimalisering

## 📝 Lisens

MIT License - Bruk fritt i undervisning!

## 🙏 Takk til

- **Kahoot!** - For inspirasjon til design og spillmekanikk
- **AccountingQuest-teamet** - For visjonen om gamifisert regnskapsundervisning
- **Alle testbrukere** - Som hjalp til med å finne bugs

---

## 🎓 Pedagogiske tips

### For beste resultat:
1. **Hold quiz korte** - 5-10 spørsmål per runde
2. **Variert vanskelighetsgrad** - Start lett, avslutt vanskelig
3. **Bruk forklaringer** - Lær mens dere spiller
4. **Diskuter svarene** - Pause etter hvert spørsmål for å snakke om svaret
5. **Gjenta quiz** - Spill samme quiz flere ganger for å se fremgang

### Quiz-ideer:
- 📚 Grunnleggende bokføring (kontoplan, debet/kredit)
- 💰 MVA-kunnskap (satser, fradragsrett)
- 📊 Regnskapsanalyse (nøkkeltall, formler)
- ⚖️ Lovkunnskap (bokføringsloven, regnskapsloven)
- 🧮 Hurtigregning (prosent, marginer, mark-up)

---

**Lykke til med undervisningen! 🎓**
