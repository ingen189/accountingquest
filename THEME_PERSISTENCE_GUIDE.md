# 🎨 Tema-persistens på tvers av sider - AccountingQuest

## ✅ JA, innstillingene huskes!

Alle tema- og accent-valg lagres i **localStorage** og gjelder for **alle sider** i AccountingQuest.

---

## 📦 Hvordan det fungerer:

### 1. **LocalStorage-nøkler:**
- `aq_theme` → Lagrer tema (dark, light, midnight, osv.)
- `aq_accent` → Lagrer accent-farge (green, blue, purple, osv.)

### 2. **På hver side:**
```html
<!-- Alle HTML-filer har: -->
<link rel="stylesheet" href="css/main.css">
<script src="js/theme-manager.js"></script>
<script>
    if (typeof ThemeManager !== 'undefined' && ThemeManager.init) {
        ThemeManager.init();
    }
</script>
```

### 3. **Når brukeren bytter tema:**
```javascript
// På settings.html eller hvilken som helst side:
ThemeManager.setTheme('midnight');    // Lagres i localStorage
ThemeManager.setAccent('purple');     // Lagres i localStorage
```

### 4. **Når brukeren åpner ny side:**
```javascript
// ThemeManager.init() kjører automatisk:
1. Leser 'aq_theme' fra localStorage
2. Leser 'aq_accent' fra localStorage  
3. Setter data-theme og data-accent på <html>
4. → Samme tema vises på alle sider!
```

---

## 🧪 Test det selv:

1. **Gå til Settings** (settings.html)
   - Velg tema: **🌑 Midnight**
   - Velg accent: **💜 Purple**

2. **Naviger til andre sider:**
   - 📒 Bokføringsspill
   - ❓ Quiz
   - 📚 Wiki
   - 🧠 Hjernetrim
   
3. **Resultat:**
   - ✅ Alle sider har **Midnight-tema**
   - ✅ Alle sider har **Purple accent**
   - ✅ Innstillingene huskes selv etter refresh (F5)
   - ✅ Innstillingene huskes selv om du lukker nettleseren!

---

## 🎨 Tilgjengelige temaer:

### **9 Fargetemaer:**
1. 🌙 **Dark** - Standard mørk (default)
2. ☀️ **Light** - Myk lys
3. 🍦 **Cream** - Varm kremfarget
4. 🌊 **Dark Blue** - Navy blå
5. 🌑 **Midnight** - Ekte svart
6. 🪨 **Charcoal** - Mørk grå
7. 🗿 **Slate** - Blågrå
8. 🌲 **Forest** - Mørk grønn
9. 🔮 **Purple Night** - Mørk lilla

### **10 Accent-farger:**
1. 💚 **Green** - Standard grønn (default)
2. 💙 **Blue** - Blå
3. 💜 **Purple** - Lilla
4. 💗 **Pink** - Rosa
5. 🧡 **Orange** - Oransje
6. 🩵 **Cyan** - Cyan
7. ❤️ **Red** - Rød
8. 💛 **Yellow** - Gul
9. 🌊 **Teal** - Teal
10. 💎 **Indigo** - Indigo

---

## 🔧 Teknisk implementering:

### **Alle 14 HTML-filer:**
✅ index.html
✅ bokforingsspill_excel.html
✅ quiz_updated.html
✅ wiki.html
✅ hjernetrim.html
✅ case_studies_fixed.html
✅ duel.html
✅ regnskapsanalyse.html
✅ settings.html
✅ teacher_portal.html
✅ game_host.html
✅ student_join.html
✅ student_game.html
✅ multiplayer_index.html

**Alle laster:**
- `css/main.css` → CSS-variabler for alle temaer
- `js/theme-manager.js` → Håndterer tema-bytte og localStorage
- Kaller `ThemeManager.init()` → Leser lagrede innstillinger

---

## 💾 LocalStorage struktur:

```javascript
// Etter at bruker velger tema og accent:
localStorage = {
  "aq_theme": "midnight",
  "aq_accent": "purple",
  "bokforingsspill_progress": {...},
  "quiz_v2": {...},
  "regnskapsanalyse_progress": {...}
}
```

---

## ✅ Konklusjon:

**JA!** Tema- og accent-valg huskes perfekt på tvers av alle sider i AccountingQuest. 

Du kan trygt bytte tema/accent på hvilken som helst side, og det vil automatisk gjelde for alle andre sider du navigerer til! 🎉

