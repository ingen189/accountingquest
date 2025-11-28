# 📋 AccountingQuest: PDF til JSON Konverteringsguide

## Corporate Finance & Økonomi-eksamener

**Versjon:** 1.0  
**Sist oppdatert:** November 2024  
**Modul:** `corporate_finance`

---

## 📑 Innholdsfortegnelse

1. [Oversikt](#oversikt)
2. [JSON-Struktur](#json-struktur)
3. [Oppgavetyper](#oppgavetyper)
4. [Drag & Drop Varianter](#drag--drop-varianter)
5. [Excel Grid Varianter](#excel-grid-varianter)
6. [Topic-mapping](#topic-mapping)
7. [Konverteringsprosess](#konverteringsprosess)
8. [Komplette eksempler](#komplette-eksempler)
9. [Validering og Import](#validering-og-import)

---

## Oversikt

### 🎯 Mål
Konvertere eksamensoppgaver fra PDF til interaktivt JSON-format for AccountingQuest, med fokus på **varierte læringsmetoder** - ikke bare multiple choice.

### 🎮 Læringsfilosofi
For hver beregningsoppgave, lag **4 versjoner** for progressiv læring:

```
1. 🧩 DRAG_DROP (formula_completion) → Forstå formelen først
2. 📊 EXCEL_GRID (guided)            → Øv med hjelpeceller
3. 📈 EXCEL_GRID (standard)          → Løs med formel synlig
4. 🏆 EXCEL_GRID (expert)            → Full mestring, ingen hjelp
```

### 📁 Database-struktur
```
Firebase Realtime Database:
├── questions/corporate_finance/{questionId}  → Spørsmål (synlig)
└── solutions/corporate_finance/{questionId}  → Svar + forklaringer (krever auth)
```

---

## JSON-Struktur

### Basis-struktur (alle oppgavetyper)

```json
{
  "id": "cf_bok260_24v2_001",
  "module": "corporate_finance",
  "category": "corporate_finance",
  "topic": "wacc",
  "difficulty": "easy|medium|hard",
  "type": "mc|calculation|excel_grid|drag_drop|multi|fill_blank",
  "title": "Kort beskrivende tittel",
  "question": "Full oppgavetekst på norsk",
  "q": "Kortversjon av spørsmål",
  
  "answer": "a",
  "a": "a",
  "tolerance": 0.1,
  
  "explanation": "Detaljert forklaring med steg-for-steg",
  "exp": "Kort forklaring med formler",
  "formula": "WACC = E/V × Re + D/V × Rd × (1-T)",
  "hints": [
    "Hint 1 (enklest)",
    "Hint 2 (mer detaljert)",
    "Hint 3 (nesten svaret)"
  ],
  
  "source": "BØK260 2024V2 Q1",
  "tags": ["wacc", "cost-of-debt", "tax-shield"],
  "wiki": ["wacc", "gjeldskostnad"],
  "linkedTo": "cf_bok260_24v2_002",
  "createdAt": 1700000000000
}
```

### ID-format
```
cf_{kilde}_{oppgavenummer}_{variant}

Eksempler:
- cf_bok260_24v2_001           → Hovedoppgave
- cf_bok260_24v2_001_formula   → Drag & drop formelversjon
- cf_bok260_24v2_001_guided    → Excel grid med hjelp
- cf_bok260_24v2_001_expert    → Excel grid uten hjelp
```

---

## Oppgavetyper

### 📊 Oversikt

| Type | Subtype | Bruksområde | Interaktivitet |
|------|---------|-------------|----------------|
| `mc` | - | Konseptspørsmål | Velg ett svar |
| `multi` | - | Flervalg | Velg flere svar |
| `calculation` | - | Enkel beregning | Skriv inn tall |
| `fill_blank` | - | Fyll inn tekst | Skriv i felt |
| `excel_grid` | `guided` | Stegvis med hjelp | Fyll celler |
| `excel_grid` | `standard` | Data gitt | Fyll celler |
| `excel_grid` | `expert` | Alt selv | Fyll alle celler |
| `drag_drop` | `formula_completion` | Fullfør formel | Dra til plasser |
| `drag_drop` | `matching` | Koble begrep | Dra til par |
| `drag_drop` | `sequence` | Riktig rekkefølge | Dra til rekkefølge |
| `drag_drop` | `categorize` | Sorter i grupper | Dra til kategorier |

---

## Drag & Drop Varianter

### 1. Formula Completion (Fullfør formelen)

**Brukes for:** Formelforståelse, bygge intuisjon

```json
{
  "id": "cf_bok260_24v2_017_formula",
  "module": "corporate_finance",
  "topic": "wacc",
  "difficulty": "medium",
  "type": "drag_drop",
  "subtype": "formula_completion",
  "title": "Fullfør WACC-formelen",
  
  "question": "Dra elementene til riktig plass i WACC-formelen",
  
  "template": "WACC = [___] × Re + [___] × Rd × [___]",
  
  "dropZones": [
    {"id": "zone1", "correct": "E/V", "position": 1},
    {"id": "zone2", "correct": "D/V", "position": 2},
    {"id": "zone3", "correct": "(1-T)", "position": 3}
  ],
  
  "draggables": [
    {"id": "d1", "text": "E/V", "correct_zone": "zone1"},
    {"id": "d2", "text": "D/V", "correct_zone": "zone2"},
    {"id": "d3", "text": "(1-T)", "correct_zone": "zone3"},
    {"id": "d4", "text": "V/E", "correct_zone": null},
    {"id": "d5", "text": "(1+T)", "correct_zone": null},
    {"id": "d6", "text": "T", "correct_zone": null}
  ],
  
  "answer": ["E/V", "D/V", "(1-T)"],
  "explanation": "WACC = Egenkapitalandel × Egenkapitalkostnad + Gjeldsandel × Gjeldskostnad × (1 - Skattesats)",
  "hints": [
    "E står for Equity (egenkapital), V for Value (totalverdi)",
    "Gjeldskostnaden må justeres for skattefordelen",
    "(1-T) representerer skattefordelen av gjeld"
  ],
  "source": "BØK260 2024V2"
}
```

### 2. Matching (Koble begreper)

**Brukes for:** Definisjoner, begrepsforståelse

```json
{
  "id": "cf_concepts_match_001",
  "module": "corporate_finance",
  "topic": "general",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "matching",
  "title": "Match finansbegreper",
  
  "question": "Koble hvert finansbegrep med riktig definisjon",
  
  "pairs": [
    {
      "id": "p1",
      "term": "NPV",
      "definition": "Nåverdi av fremtidige kontantstrømmer minus investering"
    },
    {
      "id": "p2",
      "term": "IRR",
      "definition": "Diskonteringsrente som gir NPV = 0"
    },
    {
      "id": "p3",
      "term": "WACC",
      "definition": "Vektet gjennomsnittlig kapitalkostnad"
    },
    {
      "id": "p4",
      "term": "Beta",
      "definition": "Mål på systematisk risiko relativt til markedet"
    }
  ],
  
  "distractors": [
    "Risikofri avkastning pluss risikopremie",
    "Standardavvik av porteføljeavkastning"
  ],
  
  "answer": {
    "NPV": "Nåverdi av fremtidige kontantstrømmer minus investering",
    "IRR": "Diskonteringsrente som gir NPV = 0",
    "WACC": "Vektet gjennomsnittlig kapitalkostnad",
    "Beta": "Mål på systematisk risiko relativt til markedet"
  },
  
  "explanation": "Disse er grunnleggende begreper i corporate finance som brukes til verdsettelse og risikostyring.",
  "source": "BØK260 Pensum"
}
```

### 3. Sequence (Riktig rekkefølge)

**Brukes for:** Prosesser, steg-for-steg metoder

```json
{
  "id": "cf_npv_steps_001",
  "module": "corporate_finance",
  "topic": "npv",
  "difficulty": "medium",
  "type": "drag_drop",
  "subtype": "sequence",
  "title": "NPV-beregning - Riktig rekkefølge",
  
  "question": "Sett stegene i riktig rekkefølge for å beregne NPV",
  
  "items": [
    {"id": "s1", "text": "Identifiser alle kontantstrømmer", "order": 1},
    {"id": "s2", "text": "Bestem diskonteringsrente (r)", "order": 2},
    {"id": "s3", "text": "Diskontér hver kontantstrøm til nåverdi", "order": 3},
    {"id": "s4", "text": "Summer alle nåverdier", "order": 4},
    {"id": "s5", "text": "Trekk fra initial investering", "order": 5}
  ],
  
  "answer": [1, 2, 3, 4, 5],
  
  "explanation": "NPV beregnes systematisk ved å først kartlegge alle CF, velge riktig diskonteringsrente, og deretter beregne nåverdien.",
  "formula": "NPV = Σ(CFt / (1+r)^t) - I₀",
  "source": "BØK260 Pensum"
}
```

### 4. Categorize (Sortering)

**Brukes for:** Klassifisering, gruppering av konsepter

```json
{
  "id": "cf_risk_categorize_001",
  "module": "corporate_finance",
  "topic": "portfolio",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "categorize",
  "title": "Systematisk vs Usystematisk risiko",
  
  "question": "Dra hver risikofaktor til riktig kategori",
  
  "categories": [
    {
      "id": "systematic",
      "name": "Systematisk risiko",
      "description": "Markedsrisiko som ikke kan diversifiseres bort",
      "color": "#4ade80"
    },
    {
      "id": "unsystematic",
      "name": "Usystematisk risiko",
      "description": "Bedriftsspesifikk risiko som kan diversifiseres",
      "color": "#f59e0b"
    }
  ],
  
  "items": [
    {"id": "i1", "text": "Renteendringer", "category": "systematic"},
    {"id": "i2", "text": "Inflasjon", "category": "systematic"},
    {"id": "i3", "text": "Konjunktursvingninger", "category": "systematic"},
    {"id": "i4", "text": "CEO fratrer", "category": "unsystematic"},
    {"id": "i5", "text": "Produktfeil", "category": "unsystematic"},
    {"id": "i6", "text": "Streik i bedriften", "category": "unsystematic"},
    {"id": "i7", "text": "Tap av viktig kunde", "category": "unsystematic"},
    {"id": "i8", "text": "Politisk ustabilitet", "category": "systematic"}
  ],
  
  "answer": {
    "systematic": ["Renteendringer", "Inflasjon", "Konjunktursvingninger", "Politisk ustabilitet"],
    "unsystematic": ["CEO fratrer", "Produktfeil", "Streik i bedriften", "Tap av viktig kunde"]
  },
  
  "explanation": "Systematisk risiko påvirker hele markedet og kan ikke diversifiseres bort. Usystematisk risiko er bedriftsspesifikk og kan elimineres gjennom diversifisering.",
  "source": "BØK260 Pensum"
}
```

---

## Excel Grid Varianter

### Struktur for Excel Grid

```json
{
  "id": "cf_bok260_24v2_001",
  "type": "excel_grid",
  "title": "After-tax Cost of Debt",
  
  "question": "Beregn gjeldskostnad etter skatt gitt følgende informasjon.",
  
  "data": {
    "beta": 0.7,
    "riskFreeRate": 0.03,
    "marketReturn": 0.08,
    "debtPremium": 0.02,
    "taxRate": 0.30
  },
  
  "variants": {
    "guided": { ... },
    "standard": { ... },
    "expert": { ... }
  },
  
  "answer": 0.035,
  "tolerance": 0.001
}
```

### Variant 1: Guided (Med hjelpeceller)

```json
"guided": {
  "description": "Steg-for-steg med hjelpeceller som viser hva du må finne",
  "grid": {
    "columns": ["Beskrivelse", "Verdi", "Formel/Hint"],
    "rows": [
      {
        "cells": [
          {"value": "Risikofri rente (Rf)", "editable": false},
          {"value": 0.03, "editable": false, "format": "percent"},
          {"value": "Gitt i oppgaven", "editable": false}
        ]
      },
      {
        "cells": [
          {"value": "Gjeldspremie", "editable": false},
          {"value": 0.02, "editable": false, "format": "percent"},
          {"value": "Gitt i oppgaven", "editable": false}
        ]
      },
      {
        "cells": [
          {"value": "Rente på gjeld (Rd)", "editable": false},
          {"value": null, "editable": true, "answer": 0.05, "format": "percent"},
          {"value": "= Rf + premie", "editable": false}
        ]
      },
      {
        "cells": [
          {"value": "Skattesats (T)", "editable": false},
          {"value": 0.30, "editable": false, "format": "percent"},
          {"value": "Gitt i oppgaven", "editable": false}
        ]
      },
      {
        "cells": [
          {"value": "Gjeldskostnad etter skatt", "editable": false, "highlight": true},
          {"value": null, "editable": true, "answer": 0.035, "format": "percent"},
          {"value": "= Rd × (1-T)", "editable": false}
        ]
      }
    ]
  },
  "hints": [
    "Rd = Risikofri rente + Gjeldspremie",
    "Etter skatt = Rd × (1 - Skattesats)"
  ]
}
```

### Variant 2: Standard (Kun data, finn svaret)

```json
"standard": {
  "description": "Data er gitt, formel er synlig, finn svaret selv",
  "showFormula": true,
  "formula": "After-tax Rd = Rd × (1 - T)",
  "grid": {
    "columns": ["Parameter", "Verdi"],
    "rows": [
      {"cells": [{"value": "Risikofri rente"}, {"value": "3%"}]},
      {"cells": [{"value": "Gjeldspremie"}, {"value": "2%"}]},
      {"cells": [{"value": "Skattesats"}, {"value": "30%"}]},
      {"cells": [
        {"value": "Gjeldskostnad etter skatt", "highlight": true},
        {"value": null, "editable": true, "answer": 0.035, "format": "percent"}
      ]}
    ]
  },
  "inputField": {
    "label": "Svar (i prosent)",
    "placeholder": "f.eks. 3.5",
    "unit": "%"
  }
}
```

### Variant 3: Expert (Alt selv)

```json
"expert": {
  "description": "Fyll inn alle tall på rett plass - ingen hjelp",
  "grid": {
    "columns": ["", "Verdi", "Formel"],
    "rows": [
      {"cells": [
        {"value": "Rf"},
        {"value": null, "editable": true, "answer": 0.03},
        {"value": null, "editable": false}
      ]},
      {"cells": [
        {"value": "Premie"},
        {"value": null, "editable": true, "answer": 0.02},
        {"value": null, "editable": false}
      ]},
      {"cells": [
        {"value": "Rd"},
        {"value": null, "editable": true, "answer": 0.05},
        {"value": null, "editable": true, "answer": "Rf+Premie", "type": "formula"}
      ]},
      {"cells": [
        {"value": "T"},
        {"value": null, "editable": true, "answer": 0.30},
        {"value": null, "editable": false}
      ]},
      {"cells": [
        {"value": "Rd(1-T)", "highlight": true},
        {"value": null, "editable": true, "answer": 0.035},
        {"value": null, "editable": true, "answer": "Rd×(1-T)", "type": "formula"}
      ]}
    ]
  },
  "scoring": {
    "correctValue": 2,
    "correctFormula": 1,
    "partialCredit": true
  }
}
```

---

## Topic-mapping

### Corporate Finance Topics

| Eksamen-tema | Topic ID | Beskrivelse |
|--------------|----------|-------------|
| Cost of debt, WACC, capital structure | `wacc` | Kapitalkostnad |
| Beta, portfolio weights, diversification | `portfolio` | Porteføljeteori |
| Expected return, variance, std | `statistics` | Statistikk |
| NPV, IRR, payback, crossover rate | `npv` | Investeringsanalyse |
| Supply/demand of funds, markets | `markets` | Finansmarkeder |
| Annuity, perpetuity, TVM | `tvm` | Tidsverdier |
| Options, puts, calls, hedging | `options` | Derivater |
| Interest rate parity, forex | `forex` | Valuta |
| Tax shield, leverage, M&M | `capital_structure` | Kapitalstruktur |
| Bond pricing, YTM, duration | `bonds` | Obligasjoner |
| Stock valuation, DDM, Gordon | `stocks` | Aksjer |
| SML, CAPM, risk premium | `capm` | CAPM |
| Diversification benefits | `diversification` | Diversifisering |

### Difficulty Guidelines

| Nivå | Kriterier |
|------|-----------|
| `easy` | Ett steg, direkte formel, konseptspørsmål |
| `medium` | 2-3 steg, kombinere formler, tolkning |
| `hard` | 4+ steg, flere konsepter, kompleks analyse |

---

## Konverteringsprosess

### Steg 1: Les og kategoriser

For hver oppgave i PDF, noter:

```
Oppgave #: ___
Type: [ ] Konsept (→MC)  [ ] Beregning (→Excel/Calc)  [ ] Definisjon (→Drag&Drop)
Topic: _______________
Difficulty: [ ] Easy  [ ] Medium  [ ] Hard
Nødvendige data: _______________
Formler brukt: _______________
```

### Steg 2: Velg oppgavetyper

```
┌─────────────────────────────────────────────────────────────┐
│                    OPPGAVETYPE-BESLUTNING                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Er det en beregning?                                       │
│      │                                                      │
│      ├─► JA ──► Lag 4 versjoner:                           │
│      │         1. drag_drop (formula_completion)            │
│      │         2. excel_grid (guided)                       │
│      │         3. excel_grid (standard)                     │
│      │         4. excel_grid (expert)                       │
│      │                                                      │
│      └─► NEI ──► Er det definisjoner/begreper?             │
│                  │                                          │
│                  ├─► JA ──► drag_drop (matching)           │
│                  │                                          │
│                  └─► NEI ──► mc (multiple choice)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Steg 3: Skriv forklaringer

Hver oppgave skal ha:

1. **explanation** (detaljert): 
   - Steg-for-steg løsning
   - Hvorfor hvert steg
   - Vanlige feil å unngå

2. **exp** (kort):
   - 2-3 setninger
   - Nøkkelformel
   - Hovedpoeng

3. **hints** (3 stk, progressive):
   - Hint 1: Hvilket konsept/formel
   - Hint 2: Hvordan starte
   - Hint 3: Nesten svaret

4. **formula**:
   - Hovedformel brukt
   - LaTeX eller tekstformat

### Steg 4: Kvalitetssikring

Sjekkliste:
- [ ] ID er unik og følger format
- [ ] Module = "corporate_finance"
- [ ] Topic er gyldig fra listen
- [ ] Difficulty er satt riktig
- [ ] Answer er korrekt format
- [ ] Tolerance er satt for beregninger (typisk 0.01-0.1)
- [ ] Explanation er på norsk
- [ ] Source refererer til eksamen
- [ ] Hints er progressive
- [ ] Alle varianter er konsistente

---

## Komplette eksempler

### Eksempel 1: WACC-beregning (Full konvertering)

**Original oppgave (BØK260 2024V2 Q17):**
> Et firma har aksjer verdt 400,000 og gjeld verdt 600,000. 10,000 aksjer, siste utbytte $2, vekst 5%. Skatt 21%, YTM 3%. Finn WACC.

**Konvertert til 4 versjoner:**

#### Versjon A: Drag & Drop (Formel)

```json
{
  "id": "cf_bok260_24v2_017_formula",
  "module": "corporate_finance",
  "topic": "wacc",
  "difficulty": "medium",
  "type": "drag_drop",
  "subtype": "formula_completion",
  "title": "WACC-formelen",
  
  "question": "Fullfør WACC-formelen ved å dra elementene til riktig plass",
  
  "template": "WACC = [___] × [___] + [___] × [___] × (1-T)",
  
  "dropZones": [
    {"id": "z1", "correct": "E/V", "position": 1},
    {"id": "z2", "correct": "Re", "position": 2},
    {"id": "z3", "correct": "D/V", "position": 3},
    {"id": "z4", "correct": "Rd", "position": 4}
  ],
  
  "draggables": [
    {"id": "d1", "text": "E/V"},
    {"id": "d2", "text": "D/V"},
    {"id": "d3", "text": "Re"},
    {"id": "d4", "text": "Rd"},
    {"id": "d5", "text": "V/E"},
    {"id": "d6", "text": "Rf"}
  ],
  
  "answer": ["E/V", "Re", "D/V", "Rd"],
  "explanation": "WACC kombinerer kostnaden for egenkapital og gjeld, vektet etter deres andel av totalkapitalen. Gjeldskostnaden justeres for skattefordelen.",
  "source": "BØK260 2024V2 Q17",
  "linkedTo": "cf_bok260_24v2_017_guided"
}
```

#### Versjon B: Excel Grid (Guided)

```json
{
  "id": "cf_bok260_24v2_017_guided",
  "module": "corporate_finance",
  "topic": "wacc",
  "difficulty": "hard",
  "type": "excel_grid",
  "variant": "guided",
  "title": "WACC Beregning - Guided",
  
  "question": "Et firma har følgende kapitalstruktur: Ordinære aksjer 400,000 NOK, Gjeld 600,000 NOK. Det er 10,000 utestående aksjer, siste utbytte var $2, forventet vekst 5% for alltid. Skattesats 21%, YTM på obligasjoner 3%. Beregn WACC steg for steg.",
  
  "data": {
    "equityMV": 400000,
    "debtMV": 600000,
    "sharesOutstanding": 10000,
    "lastDividend": 2,
    "growthRate": 0.05,
    "taxRate": 0.21,
    "ytm": 0.03
  },
  
  "grid": {
    "columns": ["Steg", "Beregning", "Resultat"],
    "rows": [
      {
        "cells": [
          {"value": "1. Aksjepris (P₀)"},
          {"value": "Equity MV / Aksjer = 400,000 / 10,000"},
          {"value": null, "editable": true, "answer": 40, "format": "currency"}
        ]
      },
      {
        "cells": [
          {"value": "2. Neste utbytte (D₁)"},
          {"value": "D₀ × (1+g) = 2 × 1.05"},
          {"value": null, "editable": true, "answer": 2.1, "format": "currency"}
        ]
      },
      {
        "cells": [
          {"value": "3. Re (Gordon Growth)"},
          {"value": "D₁/P₀ + g = 2.1/40 + 0.05"},
          {"value": null, "editable": true, "answer": 0.1025, "format": "percent"}
        ]
      },
      {
        "cells": [
          {"value": "4. Rd etter skatt"},
          {"value": "YTM × (1-T) = 0.03 × 0.79"},
          {"value": null, "editable": true, "answer": 0.0237, "format": "percent"}
        ]
      },
      {
        "cells": [
          {"value": "5. Total verdi (V)"},
          {"value": "E + D = 400,000 + 600,000"},
          {"value": null, "editable": true, "answer": 1000000, "format": "number"}
        ]
      },
      {
        "cells": [
          {"value": "6. E/V"},
          {"value": "400,000 / 1,000,000"},
          {"value": null, "editable": true, "answer": 0.4, "format": "percent"}
        ]
      },
      {
        "cells": [
          {"value": "7. D/V"},
          {"value": "600,000 / 1,000,000"},
          {"value": null, "editable": true, "answer": 0.6, "format": "percent"}
        ]
      },
      {
        "cells": [
          {"value": "8. WACC", "highlight": true},
          {"value": "E/V × Re + D/V × Rd(1-T)"},
          {"value": null, "editable": true, "answer": 0.0552, "format": "percent"}
        ]
      }
    ]
  },
  
  "answer": 5.52,
  "tolerance": 0.1,
  "formula": "WACC = (E/V) × Re + (D/V) × Rd × (1-T)",
  
  "hints": [
    "Start med å finne aksjepris fra markedsverdi og antall aksjer",
    "Bruk Gordon Growth Model: Re = D₁/P₀ + g",
    "Husk at gjeldskostnad må justeres for skatt: Rd × (1-T)"
  ],
  
  "explanation": "WACC = 0.4 × 10.25% + 0.6 × 2.37% = 4.1% + 1.42% = 5.52%",
  "source": "BØK260 2024V2 Q17",
  "linkedTo": "cf_bok260_24v2_017_standard"
}
```

#### Versjon C: Excel Grid (Standard)

```json
{
  "id": "cf_bok260_24v2_017_standard",
  "module": "corporate_finance",
  "topic": "wacc",
  "difficulty": "hard",
  "type": "excel_grid",
  "variant": "standard",
  "title": "WACC Beregning",
  
  "question": "Beregn WACC for firmaet. Equity MV: 400,000, Debt MV: 600,000, 10,000 aksjer, D₀=$2, g=5%, T=21%, YTM=3%.",
  
  "data": {
    "equityMV": 400000,
    "debtMV": 600000,
    "sharesOutstanding": 10000,
    "lastDividend": 2,
    "growthRate": 0.05,
    "taxRate": 0.21,
    "ytm": 0.03
  },
  
  "showFormula": true,
  "formulas": [
    "Re = D₁/P₀ + g (Gordon Growth Model)",
    "WACC = (E/V) × Re + (D/V) × Rd × (1-T)"
  ],
  
  "inputFields": [
    {"id": "re", "label": "Egenkapitalkostnad (Re)", "unit": "%"},
    {"id": "rd_after_tax", "label": "Gjeldskostnad etter skatt", "unit": "%"},
    {"id": "wacc", "label": "WACC", "unit": "%", "primary": true}
  ],
  
  "answers": {
    "re": 10.25,
    "rd_after_tax": 2.37,
    "wacc": 5.52
  },
  
  "tolerance": 0.1,
  "source": "BØK260 2024V2 Q17",
  "linkedTo": "cf_bok260_24v2_017_expert"
}
```

#### Versjon D: Excel Grid (Expert)

```json
{
  "id": "cf_bok260_24v2_017_expert",
  "module": "corporate_finance",
  "topic": "wacc",
  "difficulty": "hard",
  "type": "excel_grid",
  "variant": "expert",
  "title": "WACC Beregning - Expert",
  
  "question": "Beregn WACC. Fyll inn alle verdier og formler selv.",
  
  "data": {
    "equityMV": 400000,
    "debtMV": 600000,
    "sharesOutstanding": 10000,
    "lastDividend": 2,
    "growthRate": 0.05,
    "taxRate": 0.21,
    "ytm": 0.03
  },
  
  "grid": {
    "columns": ["Parameter", "Verdi", "Formel"],
    "rows": [
      {"cells": [
        {"value": "P₀"},
        {"value": null, "editable": true, "answer": 40},
        {"value": null, "editable": true, "answer": "E/aksjer", "type": "formula"}
      ]},
      {"cells": [
        {"value": "D₁"},
        {"value": null, "editable": true, "answer": 2.1},
        {"value": null, "editable": true, "answer": "D₀×(1+g)", "type": "formula"}
      ]},
      {"cells": [
        {"value": "Re"},
        {"value": null, "editable": true, "answer": 0.1025},
        {"value": null, "editable": true, "answer": "D₁/P₀+g", "type": "formula"}
      ]},
      {"cells": [
        {"value": "Rd(1-T)"},
        {"value": null, "editable": true, "answer": 0.0237},
        {"value": null, "editable": true, "answer": "YTM×(1-T)", "type": "formula"}
      ]},
      {"cells": [
        {"value": "E/V"},
        {"value": null, "editable": true, "answer": 0.4},
        {"value": null, "editable": true, "answer": "E/(E+D)", "type": "formula"}
      ]},
      {"cells": [
        {"value": "D/V"},
        {"value": null, "editable": true, "answer": 0.6},
        {"value": null, "editable": true, "answer": "D/(E+D)", "type": "formula"}
      ]},
      {"cells": [
        {"value": "WACC", "highlight": true},
        {"value": null, "editable": true, "answer": 0.0552},
        {"value": null, "editable": true, "answer": "E/V×Re+D/V×Rd(1-T)", "type": "formula"}
      ]}
    ]
  },
  
  "scoring": {
    "correctValue": 2,
    "correctFormula": 1,
    "partialCredit": true,
    "maxScore": 21
  },
  
  "answer": 5.52,
  "tolerance": 0.1,
  "source": "BØK260 2024V2 Q17"
}
```

---

### Eksempel 2: Portfolio Beta (Komplett)

```json
[
  {
    "id": "cf_bok260_24v2_002_formula",
    "module": "corporate_finance",
    "topic": "portfolio",
    "type": "drag_drop",
    "subtype": "formula_completion",
    "title": "Portfolio Beta Formel",
    "question": "Fullfør formelen for porteføljebeta",
    "template": "βp = [___] × β₁ + [___] × β₂ + ... + [___] × βn",
    "dropZones": [
      {"id": "z1", "correct": "w₁"},
      {"id": "z2", "correct": "w₂"},
      {"id": "z3", "correct": "wn"}
    ],
    "draggables": [
      {"text": "w₁"}, {"text": "w₂"}, {"text": "wn"},
      {"text": "1/n"}, {"text": "β₁"}, {"text": "σ₁"}
    ],
    "answer": ["w₁", "w₂", "wn"],
    "explanation": "Porteføljebeta er vektet gjennomsnitt av individuelle betaer"
  },
  {
    "id": "cf_bok260_24v2_002",
    "module": "corporate_finance",
    "topic": "portfolio",
    "difficulty": "medium",
    "type": "excel_grid",
    "variant": "guided",
    "title": "Portfolio Beta Calculation",
    
    "question": "En risikabel portefølje inneholder 4 eiendeler. Asset 1: β=0.5, 30%. Asset 2: β=1.5, 30%. Asset 3: β=1.8, 20%. Asset 4: β=0.7, 20%. Risikofri rente 2%, markedspremie 6%. Investor allokerer 70% til risikabel portefølje. Finn total beta.",
    
    "data": {
      "assets": [
        {"name": "Asset 1", "beta": 0.5, "weight": 0.30},
        {"name": "Asset 2", "beta": 1.5, "weight": 0.30},
        {"name": "Asset 3", "beta": 1.8, "weight": 0.20},
        {"name": "Asset 4", "beta": 0.7, "weight": 0.20}
      ],
      "riskyAllocation": 0.70
    },
    
    "grid": {
      "columns": ["Eiendel", "Beta", "Vekt", "Bidrag (β×w)"],
      "rows": [
        {"cells": [
          {"value": "Asset 1"}, {"value": 0.5}, {"value": "30%"},
          {"value": null, "editable": true, "answer": 0.15}
        ]},
        {"cells": [
          {"value": "Asset 2"}, {"value": 1.5}, {"value": "30%"},
          {"value": null, "editable": true, "answer": 0.45}
        ]},
        {"cells": [
          {"value": "Asset 3"}, {"value": 1.8}, {"value": "20%"},
          {"value": null, "editable": true, "answer": 0.36}
        ]},
        {"cells": [
          {"value": "Asset 4"}, {"value": 0.7}, {"value": "20%"},
          {"value": null, "editable": true, "answer": 0.14}
        ]},
        {"cells": [
          {"value": "Risikabel β", "highlight": true}, {"value": ""}, {"value": ""},
          {"value": null, "editable": true, "answer": 1.1}
        ]},
        {"cells": [
          {"value": "Allokering"}, {"value": ""}, {"value": "70%"},
          {"value": ""}
        ]},
        {"cells": [
          {"value": "Total β", "highlight": true}, {"value": ""}, {"value": ""},
          {"value": null, "editable": true, "answer": 0.77}
        ]}
      ]
    },
    
    "answer": 0.77,
    "tolerance": 0.01,
    "formula": "βtotal = wrisky × βrisky + wriskfree × 0",
    
    "steps": [
      "Beregn bidrag: β × vekt for hver eiendel",
      "Asset 1: 0.5 × 0.3 = 0.15",
      "Asset 2: 1.5 × 0.3 = 0.45",
      "Asset 3: 1.8 × 0.2 = 0.36",
      "Asset 4: 0.7 × 0.2 = 0.14",
      "Risikabel portefølje: 0.15 + 0.45 + 0.36 + 0.14 = 1.1",
      "Total: 0.7 × 1.1 + 0.3 × 0 = 0.77"
    ],
    
    "source": "BØK260 2024V2 Q2"
  }
]
```

---

## Validering og Import

### JSON Validering

```javascript
// Påkrevde felt for alle typer
const requiredFields = ['id', 'module', 'topic', 'type', 'question', 'answer'];

// Påkrevde felt per type
const typeRequirements = {
  'mc': ['options'],
  'multi': ['options'],
  'calculation': ['data'],
  'excel_grid': ['grid', 'variant'],
  'drag_drop': ['subtype'],
  'fill_blank': ['blanks']
};

// Gyldige verdier
const validModules = ['corporate_finance', 'grunnleggende_regnskap', 'driftsregnskap'];
const validTopics = ['wacc', 'npv', 'portfolio', 'capm', 'bonds', 'stocks', 'options', 'forex', 'tvm', 'statistics', 'capital_structure', 'markets', 'diversification'];
const validDifficulties = ['easy', 'medium', 'hard'];
const validTypes = ['mc', 'multi', 'calculation', 'excel_grid', 'drag_drop', 'fill_blank'];
```

### Import til Firebase

**Via Admin Dashboard:**
1. Gå til admin.html → Import
2. Last opp JSON-fil
3. Verifiser at "📈 Corporate Finance" detekteres
4. Se preview med topics og difficulty
5. Klikk "Importer til Firebase"

**Resultat:**
```
/questions/corporate_finance/{id} → Spørsmålsdata
/solutions/corporate_finance/{id} → Svar + forklaringer
```

### Batch Import Format

```json
[
  { "id": "cf_001", ... },
  { "id": "cf_002", ... },
  { "id": "cf_003", ... }
]
```

Eller som objekt:

```json
{
  "cf_001": { ... },
  "cf_002": { ... },
  "cf_003": { ... }
}
```

---

## Hurtigreferanse

### Oppgavetype-beslutning

```
Beregning med tall?     → excel_grid (3 varianter) + drag_drop (formel)
Definisjon/begrep?      → drag_drop (matching)
Prosess/steg?           → drag_drop (sequence)
Klassifisering?         → drag_drop (categorize)
Konseptspørsmål?        → mc
Flere riktige svar?     → multi
```

### Difficulty Guidelines

```
Easy:   1 steg, direkte formel
Medium: 2-3 steg, kombinere formler
Hard:   4+ steg, flere konsepter
```

### Vanlige formler

```
NPV:    NPV = Σ(CFt / (1+r)^t) - I₀
IRR:    NPV = 0, løs for r
WACC:   WACC = (E/V)×Re + (D/V)×Rd×(1-T)
CAPM:   Re = Rf + β×(Rm - Rf)
Gordon: P₀ = D₁ / (r - g)
Bond:   P = Σ(C/(1+r)^t) + FV/(1+r)^n
Beta:   βp = Σ(wi × βi)
```

---

**Dokument slutt**

*Opprettet for AccountingQuest - Gamified Accounting Education*
