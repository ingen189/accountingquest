# AccountingQuest - Ny Filstruktur

## 📁 Mappestruktur

```
accountingquest.app/
├── css/
│   └── main.css              ← Felles stilark (20KB)
├── js/
│   ├── firebase-config.js    ← Delt Firebase setup
│   ├── theme-manager.js      ← Tema-håndtering
│   ├── progress-sync.js      ← Fremgang-synkronisering
│   └── excel-export.js       ← Excel-eksport
├── index.html
├── settings.html             ← NY: Tema-velger
├── bokforingsspill.html
├── quiz_updated.html
├── regnskapsanalyse.html
├── case_studies_fixed.html
├── hjernetrim_forbedret.html
├── teacher_portal.html
├── game_host.html
├── student_join.html
├── student_game.html
├── duel.html                 ← NY: 1v1 dueller
└── wiki.html
```

---

## 🎨 Tilgjengelige Temaer

### Bakgrunns-temaer (9 valg)
| Tema | Kode | Farge | Beskrivelse |
|------|------|-------|-------------|
| 🌙 Mørk | `dark` | #0f1419 | Standard, behagelig for øynene |
| ☀️ Lys | `light` | #f5f5f0 | Myk off-white, ikke kritvhit |
| 🍦 Krem | `cream` | #f9f6f1 | Varm, papir-aktig |
| 🌊 Navy | `dark-blue` | #0a192f | Dyp blå natt |
| 🌑 Svart | `midnight` | #000000 | Ekte OLED-svart |
| ⬛ Kull | `charcoal` | #1a1a1a | Nøytral mørk grå |
| 🔷 Skifer | `slate` | #0f172a | Blågrå, moderne |
| 🌲 Skog | `forest` | #0c1a14 | Mørk grønn, naturlig |
| 🔮 Lilla Natt | `purple-night` | #13111c | Mystisk lilla |

### Accent-farger (10 valg)
| Farge | Kode | Hex |
|-------|------|-----|
| 💚 Grønn | `green` | #4ade80 |
| 💙 Blå | `blue` | #3b82f6 |
| 💜 Lilla | `purple` | #a855f7 |
| 💗 Rosa | `pink` | #ec4899 |
| 🧡 Oransje | `orange` | #f59e0b |
| 🩵 Cyan | `cyan` | #06b6d4 |
| ❤️ Rød | `red` | #ef4444 |
| 💛 Gul | `yellow` | #eab308 |
| 🌊 Teal | `teal` | #14b8a6 |
| 💎 Indigo | `indigo` | #6366f1 |

---

## 🔧 Hvordan integrere i eksisterende sider

### Steg 1: Legg til CSS og JS i <head>
```html
<head>
    <!-- Fjern all eksisterende <style>-innhold -->
    
    <!-- Legg til felles CSS -->
    <link rel="stylesheet" href="css/main.css">
    
    <!-- Side-spesifikk CSS (hvis nødvendig) -->
    <style>
        /* Kun side-spesifikke stiler her */
    </style>
</head>
```

### Steg 2: Legg til JS før </body>
```html
    <!-- Theme Manager (alltid) -->
    <script src="js/theme-manager.js"></script>
    
    <!-- Firebase (hvis multiplayer/sync) -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="js/firebase-config.js"></script>
    
    <!-- Progress Sync (hvis fremgang skal lagres) -->
    <script src="js/progress-sync.js"></script>
</body>
```

### Steg 3: Oppdater header HTML
Erstatt eksisterende header med:
```html
<header class="aq-header">
    <div class="aq-header-left">
        <a href="index.html" class="aq-logo">
            <span class="aq-logo-icon">📚</span>
            <span class="aq-logo-text">AccountingQuest</span>
        </a>
        <span class="aq-module-name">📊 Modulnavn</span>
    </div>
    <div class="aq-header-right">
        <div class="aq-header-stat">
            <span class="aq-header-stat-label">Poeng:</span>
            <span class="aq-header-stat-value" id="score">0</span>
        </div>
        <a href="wiki.html" class="aq-btn aq-btn-wiki">📖 Wiki</a>
        <button class="aq-btn aq-btn-icon" onclick="ThemeManager.toggle()" title="Bytt tema">
            🌙
        </button>
        <a href="settings.html" class="aq-btn aq-btn-secondary">⚙️</a>
    </div>
</header>
```

### Steg 4: Oppdater knapper
```html
<!-- Før -->
<button class="back-btn">← Tilbake</button>
<button class="wiki-btn">📖 Wiki</button>

<!-- Etter -->
<a href="index.html" class="aq-btn aq-btn-secondary">← Tilbake</a>
<a href="wiki.html" class="aq-btn aq-btn-wiki">📖 Wiki</a>
```

---

## 📦 CSS-klasser oversikt

### Knapper
```html
<button class="aq-btn aq-btn-primary">Primær</button>
<button class="aq-btn aq-btn-secondary">Sekundær</button>
<button class="aq-btn aq-btn-ghost">Ghost</button>
<button class="aq-btn aq-btn-danger">Slett</button>
<button class="aq-btn aq-btn-wiki">Wiki</button>
<button class="aq-btn aq-btn-multiplayer">Multiplayer</button>

<!-- Størrelser -->
<button class="aq-btn aq-btn-primary aq-btn-sm">Liten</button>
<button class="aq-btn aq-btn-primary aq-btn-lg">Stor</button>
```

### Kort
```html
<div class="aq-card">
    <div class="aq-card-header">
        <span class="aq-card-icon">📊</span>
        <h3 class="aq-card-title">Tittel</h3>
    </div>
    <div class="aq-card-body">
        Innhold her
    </div>
</div>

<!-- Klikkbart kort -->
<div class="aq-card aq-card-clickable" onclick="...">
```

### Badges
```html
<span class="aq-badge aq-badge-primary">Primær</span>
<span class="aq-badge aq-badge-success">Suksess</span>
<span class="aq-badge aq-badge-warning">Advarsel</span>
<span class="aq-badge aq-badge-error">Feil</span>

<!-- Vanskelighetsgrader -->
<span class="aq-badge aq-badge-easy">Lett</span>
<span class="aq-badge aq-badge-medium">Middels</span>
<span class="aq-badge aq-badge-hard">Vanskelig</span>
<span class="aq-badge aq-badge-expert">Ekspert</span>
```

### Progress bar
```html
<div class="aq-progress">
    <div class="aq-progress-bar" style="width: 70%;"></div>
</div>

<!-- Med tekst -->
<div class="aq-progress aq-progress-lg">
    <div class="aq-progress-bar" style="width: 70%;">70%</div>
</div>
```

### Inputs
```html
<div class="aq-form-group">
    <label class="aq-label">Felt</label>
    <input type="text" class="aq-input" placeholder="Skriv her...">
</div>

<select class="aq-select">
    <option>Valg 1</option>
</select>

<textarea class="aq-textarea" rows="4"></textarea>
```

### Layout
```html
<div class="aq-container">          <!-- Max 1400px -->
<div class="aq-container aq-container-sm">  <!-- Max 800px -->

<div class="aq-grid aq-grid-3">     <!-- 3 kolonner -->
<div class="aq-grid aq-grid-auto">  <!-- Auto-fit -->

<div class="aq-flex aq-flex-between">  <!-- Flex space-between -->
```

---

## 🔌 JavaScript API

### ThemeManager
```javascript
// Sett tema
ThemeManager.setTheme('dark');      // dark, light, dark-blue, midnight
ThemeManager.setAccent('green');    // green, blue, purple, pink, orange, cyan, red

// Hent verdier
ThemeManager.getTheme();            // 'dark'
ThemeManager.getAccent();           // 'green'

// Toggle dark/light
ThemeManager.toggle();

// Sjekk om dark
ThemeManager.isDark();              // true/false
```

### FirebaseConfig
```javascript
// Initialiser og bruk
FirebaseConfig.init().then(function() {
    var db = FirebaseConfig.getDb();
    db.ref('path').set(data);
});

// Eller med callback
FirebaseConfig.onReady(function() {
    // Firebase er klar
});

// Anonym innlogging
FirebaseConfig.signInAnon().then(function(user) {
    console.log('Bruker:', user.uid);
});
```

### ProgressSync
```javascript
// Initialiser
ProgressSync.init().then(function(userId) {
    console.log('Synkronisert som:', userId);
});

// Lagre fremgang
ProgressSync.saveProgress('bokforing', 'oppgave_1', {
    completed: true,
    score: 95,
    attempts: 2
});

// Hent fremgang
var progress = ProgressSync.getProgress('bokforing', 'oppgave_1');

// Beregn total fremgang
var totals = ProgressSync.calculateOverallProgress();
console.log(totals.overall.percent + '% fullført');
```

---

## ✅ Sjekkliste for hver side

- [ ] Fjernet gammel inline CSS (behold kun side-spesifikk)
- [ ] Lagt til `<link rel="stylesheet" href="css/main.css">`
- [ ] Lagt til `<script src="js/theme-manager.js"></script>`
- [ ] Oppdatert header til `.aq-header` struktur
- [ ] Byttet knapper til `.aq-btn` klasser
- [ ] Byttet kort til `.aq-card` klasser
- [ ] Lagt til Firebase-scripts hvis nødvendig
- [ ] Lagt til ProgressSync hvis fremgang skal lagres
- [ ] Testet i både dark og light mode
- [ ] Testet på mobil
