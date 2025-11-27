# Corporate Finance Database Struktur

## Oversikt

Dette dokumentet beskriver den anbefalte database-strukturen for Corporate Finance-modulen i AccountingQuest. Følg denne strukturen for å sikre at alle funksjoner fungerer korrekt.

---

## Nåværende Problem

Oppgavene ligger under `solutions/corporate_finance/` og inneholder **kun løsningsdata** - ikke selve spørsmålsteksten, svaralternativer, eller input-felt. Dette gjør at:

- ❌ Spørsmålstekst vises ikke
- ❌ Svaralternativer vises ikke for MC-oppgaver
- ❌ Input-felt vises ikke for beregningsoppgaver
- ❌ Oppgavedata (variabler) vises ikke

---

## Anbefalt Struktur

### Alternativ A: Separert (Anbefalt)

Spørsmål og løsninger i separate noder for bedre sikkerhet og fleksibilitet.

```
questions/
  corporate_finance/
    cf_npv_001/
      id: "cf_npv_001"
      module: "corporate_finance"
      topic: "npv"
      difficulty: "easy" | "medium" | "hard"
      type: "calculation" | "multiple_choice" | "true_false" | "excel_grid"
      title: "NPV Beregning"
      question: "Et prosjekt krever en investering på 100 000 NOK..."
      data: {
        investment: 100000,
        cashflow_year1: 40000,
        cashflow_year2: 50000,
        discount_rate: 0.10
      }
      input_fields: [
        { id: "npv", label: "NPV", unit: "NOK" }
      ]
      hints: [
        "NPV = Σ(CF_t / (1+r)^t) - I₀",
        "Diskonter hver kontantstrøm separat"
      ]

solutions/
  corporate_finance/
    cf_npv_001/
      correct: { npv: 12396.69 }
      tolerance: 1
      explanation: "NPV = 40000/1.1 + 50000/1.1² - 100000 = 12396.69"
      formula: "NPV = CF₁/(1+r) + CF₂/(1+r)² - I₀"
```

### Alternativ B: Kombinert

Alt i én node (enklere, men mindre sikker - brukere kan se løsningen).

```
questions/
  corporate_finance/
    cf_npv_001/
      # Spørsmålsdata
      id: "cf_npv_001"
      module: "corporate_finance"
      topic: "npv"
      difficulty: "medium"
      type: "calculation"
      title: "NPV Beregning"
      question: "Et prosjekt krever en investering..."
      data: { ... }
      input_fields: [ ... ]
      hints: [ ... ]
      
      # Løsningsdata (OBS: synlig for brukere!)
      correct: { npv: 12396.69 }
      tolerance: 1
      explanation: "..."
```

---

## Feltbeskrivelser

### Obligatoriske felt

| Felt | Type | Beskrivelse |
|------|------|-------------|
| `id` | string | Unik ID, f.eks. "cf_npv_001" |
| `module` | string | "corporate_finance" |
| `topic` | string | Se topic-liste nedenfor |
| `type` | string | "calculation", "multiple_choice", "true_false", "excel_grid" |
| `title` | string | Kort tittel på oppgaven |
| `question` | string | Selve oppgaveteksten |

### Type-spesifikke felt

#### For `multiple_choice`:
```javascript
options: [
  { id: "a", text: "Alternativ A" },
  { id: "b", text: "Alternativ B" },
  { id: "c", text: "Alternativ C" },
  { id: "d", text: "Alternativ D" }
]

// I solutions:
correct: "b"  // ID på riktig svar
```

#### For `true_false`:
```javascript
// Ingen ekstra felt trengs - systemet genererer Sant/Usant-knapper

// I solutions:
correct: "true" | "false"
```

#### For `calculation`:
```javascript
data: {
  investment: 100000,
  rate: 0.10,
  years: 5
}

input_fields: [
  { id: "npv", label: "NPV", unit: "NOK" },
  { id: "irr", label: "IRR", unit: "%" }
]

// I solutions:
correct: {
  npv: 12396.69,
  irr: 15.2
}
tolerance: 0.1  // Akseptert avvik
```

#### For `excel_grid`:
```javascript
grid: {
  columns: ["År 1", "År 2", "År 3"],
  rows: [
    {
      label: "Kontantstrøm",
      cells: [
        { value: 40000, readonly: true },
        { value: 50000, readonly: true },
        { id: "cf3", readonly: false }  // Input-celle
      ]
    },
    {
      label: "Diskontert",
      cells: [
        { id: "pv1", readonly: false },
        { id: "pv2", readonly: false },
        { id: "pv3", readonly: false }
      ]
    }
  ]
}

// I solutions:
correct: {
  cf3: 60000,
  pv1: 36363.64,
  pv2: 41322.31,
  pv3: 45078.89
}
```

---

## Topic-verdier

Bruk disse eksakte verdiene for `topic`-feltet:

| Topic ID | Norsk navn | Beskrivelse |
|----------|------------|-------------|
| `npv` | NPV & IRR | Nåverdi, internrente, tilbakebetalingstid |
| `bonds` | Obligasjoner | Obligasjonsprising, yield, durasjon |
| `stocks` | Aksjer & Dividender | DDM, Gordon Growth, aksjeverdi |
| `wacc` | WACC & Kapitalstruktur | Kapitalkostnad, gearing, CAPM |
| `portfolio` | Portefølje & Risiko | Diversifisering, beta, avkastning |
| `annuity` | Annuiteter & Lån | Låneberegninger, annuitetsfaktor |
| `forex` | Valuta & Hedging | Valutakurser, forward, hedging |
| `options` | Opsjoner | Call, put, strategier |

---

## Difficulty-verdier

| Verdi | Beskrivelse |
|-------|-------------|
| `easy` | Grunnleggende, én beregning |
| `medium` | Flere steg, kombinere formler |
| `hard` | Komplekse scenarioer, analyse |

---

## ID-konvensjon

Format: `cf_{topic}_{type}_{nummer}`

Eksempler:
- `cf_npv_calc_001` - NPV beregningsoppgave #1
- `cf_stocks_mc_003` - Aksjer multiple choice #3
- `cf_wacc_tf_001` - WACC sant/usant #1
- `cf_bonds_grid_002` - Obligasjoner excel-grid #2

Type-koder:
- `calc` = calculation
- `mc` = multiple_choice
- `tf` = true_false
- `grid` = excel_grid

---

## Eksempeloppgaver

### Multiple Choice

```javascript
// questions/corporate_finance/cf_stocks_mc_001
{
  id: "cf_stocks_mc_001",
  module: "corporate_finance",
  topic: "stocks",
  difficulty: "easy",
  type: "multiple_choice",
  title: "Dividend Discount Model",
  question: "Hvilken formel beskriver Gordon Growth Model for aksjevurdering?",
  options: [
    { id: "a", text: "P₀ = D₁ / (r - g)" },
    { id: "b", text: "P₀ = D₀ / (r + g)" },
    { id: "c", text: "P₀ = D₁ × (r - g)" },
    { id: "d", text: "P₀ = D₀ × (1 + r) / g" }
  ],
  hints: [
    "Gordon Growth antar konstant vekst i dividender",
    "Formelen gir nåverdien av en uendelig dividendestrøm"
  ]
}

// solutions/corporate_finance/cf_stocks_mc_001
{
  correct: "a",
  explanation: "Gordon Growth Model: P₀ = D₁ / (r - g), der D₁ er neste års dividende, r er avkastningskrav, og g er vekstrate. Forutsetter g < r.",
  tolerance: 0
}
```

### Beregning

```javascript
// questions/corporate_finance/cf_npv_calc_001
{
  id: "cf_npv_calc_001",
  module: "corporate_finance",
  topic: "npv",
  difficulty: "medium",
  type: "calculation",
  title: "NPV med ulike kontantstrømmer",
  question: "Et investeringsprosjekt krever en initial investering på 500 000 NOK. Prosjektet forventes å generere følgende kontantstrømmer: År 1: 150 000, År 2: 200 000, År 3: 250 000. Med et avkastningskrav på 12%, hva er prosjektets NPV?",
  data: {
    investment: 500000,
    cf_year1: 150000,
    cf_year2: 200000,
    cf_year3: 250000,
    discount_rate: 0.12
  },
  input_fields: [
    { id: "npv", label: "NPV", unit: "NOK" }
  ],
  hints: [
    "NPV = Σ(CF_t / (1+r)^t) - I₀",
    "Diskonter hver kontantstrøm: CF₁/1.12 + CF₂/1.12² + CF₃/1.12³",
    "Trekk fra initial investering til slutt"
  ]
}

// solutions/corporate_finance/cf_npv_calc_001
{
  correct: { npv: -12547.05 },
  tolerance: 10,
  explanation: "NPV = 150000/1.12 + 200000/1.12² + 250000/1.12³ - 500000 = 133928.57 + 159438.78 + 177935.60 - 500000 = -28697.05 NOK. Negativt NPV betyr at prosjektet ikke bør gjennomføres.",
  formula: "NPV = CF₁/(1+r) + CF₂/(1+r)² + CF₃/(1+r)³ - I₀"
}
```

### Sant/Usant

```javascript
// questions/corporate_finance/cf_portfolio_tf_001
{
  id: "cf_portfolio_tf_001",
  module: "corporate_finance",
  topic: "portfolio",
  difficulty: "easy",
  type: "true_false",
  title: "Diversifisering og risiko",
  question: "Diversifisering kan eliminere all risiko i en portefølje.",
  hints: [
    "Tenk på forskjellen mellom systematisk og usystematisk risiko"
  ]
}

// solutions/corporate_finance/cf_portfolio_tf_001
{
  correct: "false",
  explanation: "Diversifisering kan kun eliminere usystematisk (bedriftsspesifikk) risiko. Systematisk risiko (markedsrisiko) kan ikke diversifiseres bort da den påvirker hele markedet.",
  tolerance: 0
}
```

### Excel Grid

```javascript
// questions/corporate_finance/cf_stocks_grid_001
{
  id: "cf_stocks_grid_001",
  module: "corporate_finance",
  topic: "stocks",
  difficulty: "hard",
  type: "excel_grid",
  title: "To-fase vekstmodell",
  question: "Et selskap betaler nå utbytte på 2 NOK per aksje. Utbyttet forventes å vokse med 15% de neste 3 årene, deretter 5% for alltid. Avkastningskravet er 12%. Beregn aksjekursen.",
  data: {
    current_dividend: 2,
    growth_phase1: "15% i 3 år",
    growth_phase2: "5% for alltid",
    required_return: 0.12
  },
  grid: {
    columns: ["År 1", "År 2", "År 3", "Terminal"],
    rows: [
      {
        label: "Dividende",
        cells: [
          { id: "d1", readonly: false },
          { id: "d2", readonly: false },
          { id: "d3", readonly: false },
          { id: "d4", readonly: false }
        ]
      },
      {
        label: "Diskontert verdi",
        cells: [
          { id: "pv1", readonly: false },
          { id: "pv2", readonly: false },
          { id: "pv3", readonly: false },
          { id: "terminal", readonly: false }
        ]
      }
    ]
  },
  input_fields: [
    { id: "stock_price", label: "Aksjekurs", unit: "NOK" }
  ],
  hints: [
    "D₁ = D₀ × (1 + g₁) = 2 × 1.15",
    "Terminal verdi = D₄ / (r - g₂)",
    "Diskonter alle verdier tilbake til i dag"
  ]
}

// solutions/corporate_finance/cf_stocks_grid_001
{
  correct: {
    d1: 2.30,
    d2: 2.645,
    d3: 3.04175,
    d4: 3.1938375,
    pv1: 2.0536,
    pv2: 2.1085,
    pv3: 2.1651,
    terminal: 32.4875,
    stock_price: 38.81
  },
  tolerance: 0.1,
  explanation: "Fase 1: Beregn dividender med 15% vekst. Fase 2: Terminal verdi med Gordon Growth. Sum av diskonterte verdier gir aksjekursen."
}
```

---

## Firebase Security Rules

```json
{
  "rules": {
    "questions": {
      "corporate_finance": {
        ".read": true,
        ".write": "auth != null && auth.uid == 'ADMIN_UID'",
        "$questionId": {
          ".validate": "newData.hasChildren(['id', 'module', 'topic', 'type', 'title', 'question'])"
        }
      }
    },
    "solutions": {
      "corporate_finance": {
        ".read": true,
        ".write": "auth != null && auth.uid == 'ADMIN_UID'",
        "$questionId": {
          ".validate": "newData.hasChild('correct')"
        }
      }
    }
  }
}
```

---

## Migrering fra nåværende struktur

### Steg 1: Backup
Bruk CF Admin Tool til å eksportere eksisterende data som JSON.

### Steg 2: Purge
Slett alt under `solutions/corporate_finance/` (eller flytt til backup-sti).

### Steg 3: Seed
Last opp oppgaver med riktig struktur til `questions/corporate_finance/` og `solutions/corporate_finance/`.

### Steg 4: Test
Verifiser at oppgaver lastes og vises korrekt.

---

## Seed Script

For å laste opp oppgaver programmatisk, bruk dette formatet:

```javascript
const questions = {
  cf_npv_calc_001: {
    id: "cf_npv_calc_001",
    module: "corporate_finance",
    topic: "npv",
    // ... resten av feltene
  }
};

const solutions = {
  cf_npv_calc_001: {
    correct: { npv: 12396.69 },
    tolerance: 1,
    explanation: "..."
  }
};

// Upload
firebase.database().ref('questions/corporate_finance').set(questions);
firebase.database().ref('solutions/corporate_finance').set(solutions);
```

---

## Kontakt

Ved spørsmål om database-struktur, kontakt utvikler eller se kildekoden i `corporate_finance.html`.
