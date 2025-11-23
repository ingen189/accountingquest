# 🏗️ System Architecture - AccountingQuest Multiplayer

## 📊 Oversikt

```
┌─────────────────────────────────────────────────────────────┐
│                    MULTIPLAYER SYSTEM                        │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Lærer      │         │   Elever     │                 │
│  │  (Teacher)   │         │  (Students)  │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ teacher_     │         │ student_     │                 │
│  │ portal.html  │         │ join.html    │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                        │                          │
│         │    ┌──────────────┐    │                          │
│         └───►│ localStorage │◄───┘                          │
│              │   (Shared)   │                               │
│              └──────┬───────┘                               │
│                     │                                        │
│         ┌───────────┴───────────┐                           │
│         ▼                       ▼                           │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ game_        │         │ student_     │                 │
│  │ host.html    │         │ game.html    │                 │
│  └──────────────┘         └──────────────┘                 │
│   (Lærer ser)              (Elever ser)                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Dataflyt

### 1️⃣ Quiz-opprettelse
```
Lærer → teacher_portal.html
  ↓
  Lag quiz med spørsmål
  ↓
localStorage['teacher_quizzes']
  ↓
  [
    {
      id: 123,
      name: "Min Quiz",
      questions: [...]
    }
  ]
```

### 2️⃣ Spill-start
```
Lærer → Klikker "Start spill"
  ↓
Genererer 6-sifret PIN (f.eks. 456789)
  ↓
localStorage['game_session'] = {
  pin: 456789,
  quiz: {...},
  created: timestamp
}
  ↓
Redirect til game_host.html?pin=456789
```

### 3️⃣ Elev-påmelding
```
Elev → student_join.html
  ↓
Skriver inn PIN + navn + avatar
  ↓
Validerer mot localStorage['game_session']
  ↓
Legger til i localStorage['game_456789_players'] = [
  {name: "Ole", avatar: "😊"},
  {name: "Kari", avatar: "🤓"}
]
  ↓
Redirect til student_game.html?pin=456789&name=Ole
```

### 4️⃣ Spill-loop
```
game_host.html (Lærer)
  ↓
  Setter localStorage['game_456789_question'] = {
    index: 0,
    question: "...",
    answers: [...],
    time: 30
  }
  ↓
  Starter timer
  
student_game.html (Elever) - poller hvert 500ms
  ↓
  Leser localStorage['game_456789_question']
  ↓
  Viser spørsmål
  ↓
  Elev klikker svar
  ↓
  Lagrer i localStorage['game_456789_answers'] = {
    "Ole": {questionIndex: 0, answer: 2, timeLeft: 15},
    "Kari": {questionIndex: 0, answer: 1, timeLeft: 20}
  }

game_host.html - poller hvert 200ms
  ↓
  Leser localStorage['game_456789_answers']
  ↓
  Oppdaterer telling på skjermen
  ↓
  Når timer = 0 → Neste spørsmål
```

### 5️⃣ Resultater
```
game_host.html
  ↓
  Alle spørsmål ferdig
  ↓
  Beregner poeng:
    - Riktig svar: 500p
    - Hastighetsbonus: (timeLeft/totalTime) × 500p
  ↓
  Sorterer spillere etter poeng
  ↓
  Viser leaderboard

student_game.html
  ↓
  Viser egen total score
  ↓
  Viser statistikk (riktige/totalt)
```

## 💾 localStorage Struktur

### teacher_quizzes
```javascript
[
  {
    id: 1700000001,              // Timestamp når laget
    name: "Min Quiz",            // Quiz-navn
    description: "Om MVA",       // Beskrivelse
    timePerQuestion: 30,         // Sekunder per spørsmål
    questions: [                 // Array med spørsmål
      {
        id: 1,
        text: "Spørsmål?",
        answers: ["A", "B", "C", "D"],
        correct: 2,              // Index (0-3)
        explanation: "Fordi..."
      }
    ],
    created: "2024-01-15T10:00:00.000Z"
  }
]
```

### game_session
```javascript
{
  pin: 456789,                   // 6-sifret PIN
  quiz: { /* quiz object */ },   // Hele quiz-objektet
  created: 1700000000000         // Timestamp
}
```

### game_{PIN}_players
```javascript
[
  {
    name: "Ole",                 // Spillernavn (må være unikt)
    avatar: "😊",               // Emoji
    joinedAt: 1700000000000     // Timestamp
  }
]
```

### game_{PIN}_question
```javascript
{
  index: 0,                      // Spørsmålsnummer (0-based)
  question: "Spørsmåltekst",    // Selve spørsmålet
  answers: [                     // Svaralternativene
    "Alternativ A",
    "Alternativ B",
    "Alternativ C",
    "Alternativ D"
  ],
  time: 30                       // Sekunder til å svare
}
```

### game_{PIN}_answers
```javascript
{
  "Ole": {
    questionIndex: 0,            // Hvilket spørsmål
    answer: 2,                   // Valgt svar (0-3)
    timeLeft: 15,                // Sekunder igjen når svart
    timestamp: 1700000000000     // Når svaret kom
  },
  "Kari": {
    questionIndex: 0,
    answer: 1,
    timeLeft: 20,
    timestamp: 1700000000001
  }
}
```

## ⚙️ Kritiske funksjoner

### Polling (student_game.html)
```javascript
// Sjekker for nye spørsmål hver 500ms
setInterval(() => {
  const questionData = localStorage.getItem(`game_${pin}_question`);
  if (questionData) {
    const question = JSON.parse(questionData);
    if (question.index !== currentQuestion.index) {
      loadQuestion(question);
    }
  }
}, 500);
```

### Svar-telling (game_host.html)
```javascript
// Teller svar per alternativ hver 200ms
setInterval(() => {
  const answers = JSON.parse(localStorage.getItem(`game_${pin}_answers`) || '{}');
  const counts = [0, 0, 0, 0];
  
  Object.values(answers).forEach(answer => {
    if (answer.questionIndex === currentQuestion) {
      counts[answer.answer]++;
    }
  });
  
  // Oppdater UI
  counts.forEach((count, i) => {
    document.getElementById(`answer-count-${i}`).textContent = count;
  });
}, 200);
```

### Poeng-beregning (game_host.html)
```javascript
function calculateScore(answer, question) {
  // Sjekk om svaret er riktig
  if (answer.answer !== question.correct) {
    return 0;
  }
  
  // Basis poeng
  let points = 500;
  
  // Hastighetsbonus (0-500 poeng)
  const timeBonus = Math.max(0, answer.timeLeft || 0);
  const totalTime = question.time;
  points += Math.floor((timeBonus / totalTime) * 500);
  
  return points;
}
```

## 🔒 Sikkerhetsdesign

### Validering
```javascript
// Sjekk at spillet finnes
const session = localStorage.getItem('game_session');
if (!session || session.pin !== userPin) {
  alert('Ugyldig PIN');
  return;
}

// Sjekk at navn ikke er tatt
const players = JSON.parse(localStorage.getItem(`game_${pin}_players`) || '[]');
if (players.some(p => p.name === userName)) {
  alert('Navnet er opptatt');
  return;
}
```

### Race conditions
```javascript
// Unngå samtidig endring av samme data
function addPlayer(pin, player) {
  const players = JSON.parse(localStorage.getItem(`game_${pin}_players`) || '[]');
  
  // Dobbeltsjekk at navn ikke finnes
  if (players.some(p => p.name === player.name)) {
    return false;
  }
  
  players.push(player);
  localStorage.setItem(`game_${pin}_players`, JSON.stringify(players));
  return true;
}
```

## 🚀 Ytelsesoptimalisering

### Begrens polling
```javascript
// Ikke poll når ikke nødvendig
if (gameState === 'waiting') {
  pollInterval = 500;  // Ofte polling i lobby
} else if (gameState === 'playing') {
  pollInterval = 200;  // Hyppig polling under spill
} else {
  pollInterval = 0;     // Ingen polling etter spill
}
```

### Lazy loading
```javascript
// Last bare nødvendig data
function loadQuestion(index) {
  const question = quiz.questions[index];
  // Vis bare dette spørsmålet, ikke hele quiz
  return {
    text: question.text,
    answers: question.answers,
    // IKKE inkluder correct eller explanation ennå
  };
}
```

### Cleanup
```javascript
// Rydd opp etter spill
function endGame(pin) {
  localStorage.removeItem(`game_${pin}_players`);
  localStorage.removeItem(`game_${pin}_answers`);
  localStorage.removeItem(`game_${pin}_question`);
  localStorage.removeItem('game_session');
}
```

## 📱 Responsivt design

### Breakpoints
```css
/* Desktop: >1200px */
.answers-container {
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Tablet: 768px - 1200px */
@media (max-width: 1200px) {
  .answers-container {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
}

/* Mobile: <768px */
@media (max-width: 768px) {
  .answers-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
```

## 🔮 Fremtidige forbedringer

### Firebase Realtime Database
```javascript
// I stedet for localStorage
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const questionRef = ref(db, `games/${pin}/question`);

onValue(questionRef, (snapshot) => {
  const question = snapshot.val();
  loadQuestion(question);
});
```

### WebSockets
```javascript
// Ekte sanntid i stedet for polling
const ws = new WebSocket('wss://accountingquest.app/game');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'NEW_QUESTION') {
    loadQuestion(data.question);
  }
};
```

---

**Dokumentasjon oppdatert: November 2024**
