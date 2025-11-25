# 📚 KLASSEROM SYSTEM - KOMPLETT FILEOVERSIKT

Alle 11 HTML-filer i klasserom systemet med nøkkelinformasjon.

---

## 📋 FILER OVERSIKT

### **LÆRER SIDE (5 FILER)**

#### 1. **teacher_registration.html** (31 KB)
**Plassering:** `/mnt/user-data/outputs/teacher_registration.html`

**Formål:** Lærer registrering og onboarding

**Funksjoner:**
- 3-stegs registreringsprosess
- Steg 1: Grunnleggende info (navn, e-post, skole, rolle)
- Steg 2: Planvalg (Basic 499kr, Pro 999kr, School 2999kr)
- Steg 3: Manual verifisering (hvis e-post ikke auto-verifiseres)
- Auto-verifisering via e-post domene (whitelist av uis.no, uio.no, etc.)
- Upload av arbeidsbevis hvis manual
- 14 dagers gratis prøveperiode
- Oppretter lærer i Firebase `/teachers/{userId}`

**Firebase paths:**
```javascript
/teachers/{userId}
  - name, email, school, role
  - verified, verificationMethod
  - subscription: { plan, status, startDate, trialEndDate, features }
```

**Navigation:**
- Fra: teacher_portal.html
- Til: classroom_dashboard.html (etter registrering)

---

#### 2. **classroom_dashboard.html** (22 KB)
**Plassering:** `/mnt/user-data/outputs/classroom_dashboard.html`

**Formål:** Dashboard for alle lærerens klasserom

**Funksjoner:**
- Grid layout for alle klasserom
- "Opprett nytt klasserom" card (+ ikon)
- Hver klasserom card viser:
  - Navn og ikon
  - 6-sifret kode (ABC123 format)
  - Antall elever
  - Sist aktiv dato
  - "Administrer" og "Slett" knapper
- Genererer unik 6-sifret kode automatisk
- Modal for å opprette nytt klasserom
- Filtrering (Aktive / Arkiverte)

**Firebase paths:**
```javascript
/classrooms/{classroomId}
  - name, description
  - code (6 digits)
  - teacherId, teacherName
  - year (2024/2025)
  - createdAt, archived
  - students: {...}
```

**Navigation:**
- Fra: teacher_registration.html
- Til: classroom_manage.html?id={classroomId}

---

#### 3. **classroom_manage.html** (34 KB)
**Plassering:** `/mnt/user-data/outputs/classroom_manage.html`

**Formål:** Administrer et spesifikt klasserom

**Funksjoner:**
- 3 tabs: Elever | Oppgaver | Statistikk
- **Elever tab:**
  - Grid med student-kort (avatar, navn, e-post, poeng, oppgaver)
  - Klikk på student → student_detail.html
  - "Fjern student" funksjon
- **Oppgaver tab:**
  - Liste med assignment-kort
  - Hver assignment: ikon, tittel, frist, poeng, status
  - Stats: X fullført, Y påbegynt
  - "Se detaljer" → assignment_results.html
  - "Rediger" → assignment_create.html?edit={id}
  - "Dupliser" funksjon (📋)
- **FAB (+) knapp** for å opprette ny oppgave
- "Arkiver klasserom" knapp i header

**Firebase paths:**
```javascript
/classrooms/{classroomId}/students
/assignments (filtered by classroomId)
/classroom_progress/{classroomId}/{studentId}
```

**Navigation:**
- Fra: classroom_dashboard.html
- Til: 
  - assignment_create.html (ny oppgave)
  - assignment_results.html (se resultater)
  - student_detail.html (student profil)

---

#### 4. **assignment_create.html** (27 KB)
**Plassering:** `/mnt/user-data/outputs/assignment_create.html`

**Formål:** Opprett eller rediger en oppgave

**Funksjoner:**
- Velg oppgavetype: Quiz | Bokføring | Analyse | Case Study
- **For Quiz:**
  - Laster quizzer fra teacher_portal.html (localStorage: teacher_quizzes)
  - Dropdown selector med previews
- **Settings:**
  - Tittel og beskrivelse
  - Frist (datepicker)
  - Poeng (default 100)
  - Max forsøk (1/2/3/5/unlimited)
  - Status (active/draft)
- Live preview av valgt quiz
- Lagre til Firebase `/assignments/{id}`
- Edit mode: Henter eksisterende assignment

**Firebase paths:**
```javascript
/assignments/{assignmentId}
  - classroomId
  - title, description
  - type: "quiz" | "bokforing" | "analyse" | "case"
  - content: { quiz: {...} }
  - dueDate, points, maxAttempts
  - status: "active" | "draft"
  - createdAt, createdBy
```

**Navigation:**
- Fra: classroom_manage.html
- Til: classroom_manage.html (etter lagring)

---

#### 5. **assignment_results.html** (30 KB)
**Plassering:** `/mnt/user-data/outputs/assignment_results.html`

**Formål:** Se alle innleveringer for en oppgave

**Funksjoner:**
- **Stats cards:**
  - Totalt innlevert
  - Gjennomsnittsscore
  - Fullføringsprosent
  - Gj.snitt tid brukt
- **Score distribution chart:**
  - Bar chart (0-20%, 20-40%, 40-60%, 60-80%, 80-100%)
  - Visual representation av prestasjoner
- **Submissions table:**
  - Student navn
  - Score (X / Y poeng)
  - Nøyaktighet (%)
  - Riktige svar (X / Y)
  - Tid brukt
  - Innlevert dato/tid
  - Forsøk (1 av 3)
- **Filter:** Alle | Høy (>70%) | Medium (50-70%) | Lav (<50%)
- **Excel export:** 
  - Bruker SheetJS (xlsx.full.min.js)
  - Laster ned .xlsx fil med alle resultater
- **Actions:** Send påminnelse, Last ned PDF (kommer)

**Firebase paths:**
```javascript
/submissions (filtered by assignmentId)
  - studentId, assignmentId, classroomId
  - answers: { 0: 2, 1: 0, ... }
  - score, correctCount, accuracy
  - totalQuestions, timeSpent
  - submittedAt, status
```

**Navigation:**
- Fra: classroom_manage.html
- Til: student_detail.html (klikk på student)

---

### **ELEV SIDE (4 FILER)**

#### 6. **student_classroom.html** (20 KB)
**Plassering:** `/mnt/user-data/outputs/student_classroom.html`

**Formål:** Elev bli med i klasserom via kode

**Funksjoner:**
- **6-sifret kode input:**
  - 6 separate input bokser
  - Auto-advance mellom bokser
  - Visual feedback
- Verifisering av klasseromskode mot Firebase
- Viser klasserom-info før joining:
  - Navn
  - Lærer
  - Antall elever
  - Fag/år
- **Registreringsskjema:**
  - Navn (required)
  - E-post (valgfri)
- "Bli med" knapp → Lagrer til Firebase
- **"Mine klasserom" liste:**
  - Alle klasserom brukeren er medlem av
  - Klikk → student_assignments.html

**Firebase paths:**
```javascript
/classrooms/{classroomId}/students/{userId}
  - name, email
  - joinedAt
  - totalPoints: 0
```

**Navigation:**
- Fra: index.html
- Til: student_assignments.html?classroom={id}

---

#### 7. **student_assignments.html** (24 KB)
**Plassering:** `/mnt/user-data/outputs/student_assignments.html`

**Formål:** Se alle oppgaver i et klasserom

**Funksjoner:**
- **Klasserom header med stats:**
  - Fullført oppgaver
  - Total poeng
  - Gjennomsnittlig nøyaktighet
- **Filter:**
  - Alle
  - Ikke startet
  - Pågående
  - Fullført
  - Forsinket (auto fra dueDate)
- **Assignment cards:**
  - Type ikon (❓📊📈📑)
  - Tittel og beskrivelse
  - Frist (countdown hvis nær)
  - Poeng
  - Forsøk (1 av 3 brukt)
  - Status badge (Ikke startet | Pågående | Fullført | Forsinket)
- "Start oppgave" knapp → assignment_quiz.html
- **PRO marketing banner** (viral growth)

**Firebase paths:**
```javascript
/assignments (filtered by classroomId)
/classroom_progress/{classroomId}/{userId}
  - assignments: { [id]: { score, completed, submittedAt } }
```

**Navigation:**
- Fra: student_classroom.html
- Til: assignment_quiz.html?id={id}&classroom={id}

---

#### 8. **assignment_quiz.html** (28 KB)
**Plassering:** `/mnt/user-data/outputs/assignment_quiz.html`

**Formål:** Elev tar en quiz assignment

**Funksjoner:**
- **Assignment header:**
  - Tittel
  - Frist
  - Poeng
  - Forsøk (1 av 3)
- **Quiz info:**
  - Antall spørsmål
  - Tid per spørsmål
- **Timer (fixed top-right):**
  - Countdown per spørsmål (30 sek default)
  - States: Normal | Warning (<10s) | Danger (<5s, shake animation)
  - Auto-submit når timer = 0
- **Progress bar:** X av Y spørsmål
- **Question card:**
  - Spørsmålsnummer
  - Spørsmålstekst
  - 4-6 multiple choice options (A, B, C, D, E, F)
  - Radio buttons for valg
- **Navigation:**
  - "Forrige" og "Neste" knapper
  - Siste spørsmål: "Lever inn" knapp
- **AUTO-SCORING:**
  - Sammenligner answers med quiz.questions[i].correctAnswer
  - Teller correctCount
  - Beregner accuracy = (correctCount / totalQuestions) * 100
  - Beregner score = (correctCount / totalQuestions) * assignment.points
- **Lagrer til Firebase:**
  - `/submissions/{id}`: Full submission data
  - `/classroom_progress/{classroomId}/{studentId}`: Oppdater totalPoints, completedAssignments
- **Results screen:**
  - Icon (🏆/🎉/👍/📚 basert på score)
  - Score (X / Y poeng)
  - Riktige svar (X / Y)
  - Nøyaktighet (%)
  - Tid brukt
  - "Tilbake til oppgaver" knapp

**Firebase paths:**
```javascript
/submissions/{submissionId}
  - assignmentId, classroomId, studentId
  - answers: { 0: 2, 1: 0, ... }
  - score, correctCount, accuracy
  - totalQuestions, timeSpent
  - submittedAt, status

/classroom_progress/{classroomId}/{studentId}
  - totalPoints += score
  - completedAssignments++
  - assignments: { [id]: { score, completed: true, submittedAt } }
```

**Navigation:**
- Fra: student_assignments.html
- Til: student_assignments.html (etter innlevering)

---

### **STUDENT PROFIL & PROGRESS (2 FILER)**

#### 9. **student_detail.html** (26 KB)
**Plassering:** `/mnt/user-data/outputs/student_detail.html`

**Formål:** Lærer ser detaljert student-profil

**Funksjoner:**
- **Student header:**
  - Avatar (😊)
  - Navn og e-post
  - Ble med dato
  - Sist aktiv
  - Klasserom navn
  - "Send melding" knapp (kommer)
  - "Fjern fra klasserom" knapp (danger)
- **Stats cards (4 stk):**
  - Total poeng
  - Fullført oppgaver
  - Gjennomsnittsscore (%)
  - Total tid brukt
- **Progresjon per kategori:**
  - Quiz: X% progress bar
  - Bokføring: X%
  - Analyse: X%
  - (Basert på fullførte vs totale oppgaver)
- **Alle innleveringer:**
  - Liste med submission-kort
  - Type ikon + tittel
  - Score + nøyaktighet badge
  - Riktige svar
  - Tid brukt
  - Innlevert dato
  - Sortert nyest først

**Firebase paths:**
```javascript
/classrooms/{classroomId}/students/{studentId}
/classroom_progress/{classroomId}/{studentId}
/submissions (filtered by studentId and classroomId)
/assignments (for matching assignment info)
```

**Navigation:**
- Fra: classroom_manage.html (klikk på student)
- Til: classroom_manage.html (tilbake)

---

#### 10. **student_progress.html** (22 KB)
**Plassering:** `/mnt/user-data/outputs/student_progress.html`

**Formål:** Elev ser total progresjon across alle klasserom

**Funksjoner:**
- **Overview card (gradient):**
  - Velkommen melding
  - 4 stats: Klasserom, Fullført, Poeng, Nøyaktighet
- **Mine klasserom:**
  - Grid med klasserom-kort
  - Hver card: Navn, lærer, fullført, poeng
  - Klikk → student_assignments.html
- **Ukentlig aktivitet chart:**
  - Bar chart for siste 7 dager
  - Viser antall innleveringer per dag
  - Hover for detaljer
- **Prestasjoner (8 stk):**
  - 🎯 Første innlevering
  - 🔥 5 innleveringer
  - 💪 10 innleveringer
  - 🏆 Perfekt score (100%)
  - 💎 100 poeng totalt
  - 💰 500 poeng totalt
  - 🌅 Morgensprek (innlevering før 08:00)
  - 🦉 Nattugle (innlevering etter 23:00)
  - Unlocked vs Locked status

**Firebase paths:**
```javascript
/classrooms (filtered by userId in students)
/classroom_progress (all for userId)
/submissions (all for userId)
```

**Navigation:**
- Fra: student_classroom.html (header button)
- Link tilbake i header

---

### **TEACHER LITE (1 FIL)**

#### 11. **teacher_lite_signup.html** (24 KB)
**Plassering:** `/mnt/user-data/outputs/teacher_lite_signup.html`

**Formål:** Landing page for Teacher Lite tier (299 kr/år)

**Funksjoner:**
- **Hero section:**
  - Stor tittel: "🎮 Teacher Lite"
  - Pris: 299 kr/år
  - CTA: "Start 14 dagers gratis prøveperiode"
  - Ingen kredittkort nødvendig
- **Feature showcase (6 cards):**
  - Multiplayer Quiz
  - Opptil 50 Elever
  - Live Leaderboard
  - Basic Statistikk
  - Lag Egne Quizzer
  - Pause & Kontroll
- **Comparison table:**
  - Teacher Lite vs Teacher Pro
  - Feature-by-feature sammenligning
  - Clear value proposition
- **Testimonials (3 stk):**
  - Fra "Ole Hansen" (Lektor, Stavanger VGS)
  - Fra "Kari Nordmann" (Lærer, Bergen Handelshøyskole)
  - Fra "Per Olsen" (Universitetslektor, UiO)
- **FAQ (6 spørsmål):**
  - Forskjell Lite vs Pro
  - Oppgraderingsmulighet
  - Kostnad for elever
  - Prøveperiode
  - Egne spørsmål
  - Max elever
- **Final CTA:**
  - Samme som hero
  - "Start gratis prøveperiode →"

**Navigation:**
- Fra: index.html (marketing)
- Til: teacher_registration.html?plan=lite

---

## 🔗 NAVIGASJONSFLYT

### **Lærer Flow:**
```
teacher_registration.html
  ↓ (registrer)
classroom_dashboard.html
  ↓ (opprett klasserom)
classroom_dashboard.html (oppdatert)
  ↓ (klikk "Administrer")
classroom_manage.html
  ↓ (FAB +)
assignment_create.html
  ↓ (lagre)
classroom_manage.html (oppdatert)
  ↓ (klikk "Se detaljer")
assignment_results.html
  ↓ (klikk student)
student_detail.html
  ↓ (tilbake)
classroom_manage.html
```

### **Elev Flow:**
```
student_classroom.html
  ↓ (skriv kode)
student_classroom.html (viser klasserom info)
  ↓ (bli med)
student_assignments.html
  ↓ (klikk oppgave)
assignment_quiz.html
  ↓ (ta quiz)
assignment_quiz.html (results screen)
  ↓ (tilbake)
student_assignments.html (oppdatert med score)
  ↓ (header button)
student_progress.html
```

---

## 📊 FIREBASE DATABASE STRUKTUR

### **Hovedpaths:**

```javascript
/teachers/{teacherId}
  - userId, name, email, school, role
  - verified, verificationMethod
  - subscription: {
      plan: "lite" | "pro" | "school",
      status: "trial" | "active" | "expired",
      features: { ... }
    }

/classrooms/{classroomId}
  - name, description, code
  - teacherId, teacherName
  - year, createdAt, archived
  - students: {
      {studentId}: {
        name, email, joinedAt, totalPoints
      }
    }

/assignments/{assignmentId}
  - classroomId, teacherId
  - title, description, type
  - content: { quiz: {...} }
  - dueDate, points, maxAttempts
  - status, createdAt

/submissions/{submissionId}
  - assignmentId, classroomId, studentId
  - answers: { 0: 2, 1: 0, ... }
  - score, correctCount, accuracy
  - totalQuestions, timeSpent
  - submittedAt, status, attempt

/classroom_progress/{classroomId}/{studentId}
  - totalPoints, completedAssignments
  - lastActive
  - assignments: {
      {assignmentId}: {
        score, completed, attempts, submittedAt
      }
    }
```

---

## 🎨 STYLING & THEMES

Alle filer bruker:
- `main.css` (shared styles)
- CSS variables for theming:
  - `--accent`, `--success`, `--danger`, `--warning`
  - `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
  - `--text-primary`, `--text-secondary`
- Dark/Light mode support via `theme-manager.js`
- Responsive design (mobile-first)
- Konsistent spacing og typography

---

## 🔧 TEKNISKE DETALJER

### **Firebase SDK:**
Alle filer laster:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
```

### **Firebase Config:**
```javascript
{
  apiKey: "AIzaSyAPuacYOSf4Hv-h36yA5Hav67SlpIFMIIQ",
  authDomain: "accountingquest-multiplayer.firebaseapp.com",
  databaseURL: "https://accountingquest-multiplayer-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "accountingquest-multiplayer",
  storageBucket: "accountingquest-multiplayer.firebasestorage.app",
  messagingSenderId: "525417361926",
  appId: "1:525417361926:web:ec9b737f82af9b21700987"
}
```

### **External Libraries:**
- **SheetJS (XLSX):** `assignment_results.html`
  - URL: `https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js`
  - For Excel export

### **Theme Manager:**
```html
<script src="js/theme-manager.js"></script>
<script>
  if (typeof ThemeManager !== 'undefined' && ThemeManager.init) {
    ThemeManager.init();
  }
</script>
```

---

## ✅ FEATURE CHECKLIST

### **Core Features:**
- [x] Lærer registrering med auto-verifisering
- [x] Opprett klasserom med 6-sifret kode
- [x] Elev join via kode (gratis)
- [x] Opprett quiz assignments
- [x] Elev tar quiz med timer
- [x] Auto-scoring system
- [x] Lærer ser resultater med charts
- [x] Excel export
- [x] Student detail view
- [x] Student progress dashboard
- [x] Duplicate assignment
- [x] Archive classroom
- [x] Teacher Lite tier (299 kr)

### **Polish:**
- [x] Konsistent design
- [x] Dark/Light mode
- [x] Responsive layout
- [x] Loading states
- [x] Error handling
- [x] Empty states
- [x] Success feedback

### **Not Yet Implemented:**
- [ ] Toast notifications (JS fil laget, må integreres)
- [ ] Loading spinners (JS fil laget, må integreres)
- [ ] Bokføring assignments
- [ ] Analyse assignments
- [ ] Case study assignments
- [ ] E-post notifikasjoner
- [ ] Vipps betaling

---

## 📦 FILER STØRRELSE

```
teacher_registration.html       31 KB
classroom_dashboard.html        22 KB
classroom_manage.html           34 KB  (størst - 3 tabs)
assignment_create.html          27 KB
assignment_results.html         30 KB
student_classroom.html          20 KB
student_assignments.html        24 KB
assignment_quiz.html            28 KB
student_detail.html             26 KB
student_progress.html           22 KB
teacher_lite_signup.html        24 KB

TOTALT:                         288 KB
```

---

## 🚀 DEPLOYMENT

Alle filer er klare for:
1. **GitHub Pages** - Static hosting
2. **Firebase Hosting** - Alternative
3. **Cloudflare Pages** - Alternative

**Avhengigheter:**
- `main.css` (må eksistere)
- `js/theme-manager.js` (må eksistere)
- `js/toast-notifications.js` (optional, laget men ikke integrert)
- `js/loading-spinner.js` (optional, laget men ikke integrert)
- Firebase project aktiv
- Firebase Rules deployet

---

## 💡 NESTE STEG

1. **Deploy til GitHub**
   - Push alle filer
   - Enable GitHub Pages
   - Test URLs

2. **Deploy Firebase Rules**
   - Copy `firebase-rules.json`
   - Firebase Console → Realtime Database → Rules
   - Publish

3. **Testing**
   - Test lærer flow (registrer → opprett klasserom → opprett oppgave)
   - Test elev flow (join → se oppgaver → ta quiz)
   - Test results (lærer ser resultater → Excel export)

4. **Integrer Toast & Loading**
   - Replace `alert()` med `Toast.success/error()`
   - Replace `confirm()` med `Toast.confirm()`
   - Add `Loading.show/hide()` til Firebase calls

5. **Polish**
   - Fix any bugs from testing
   - Improve UX based on feedback
   - Optimize performance

---

**ALT ER KLART FOR DEPLOYMENT! 🎉**

Vil du se noe spesifikt i detalj? 🤔
