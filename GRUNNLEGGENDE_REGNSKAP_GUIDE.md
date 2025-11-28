# 📋 AccountingQuest: PDF til JSON Konverteringsguide

## Grunnleggende Regnskap & Bokføring

**Versjon:** 1.0  
**Sist oppdatert:** November 2024  
**Modul:** `grunnleggende_regnskap`

---

## 📑 Innholdsfortegnelse

1. [Oversikt](#oversikt)
2. [JSON-Struktur](#json-struktur)
3. [Oppgavetyper](#oppgavetyper)
4. [Bokføringsoppgaver (Excel Grid)](#bokføringsoppgaver-excel-grid)
5. [Drag & Drop Varianter](#drag--drop-varianter)
6. [Topic-mapping](#topic-mapping)
7. [Kontoplan (NS 4102)](#kontoplan-ns-4102)
8. [Lovhenvisninger](#lovhenvisninger)
9. [Komplette Eksempler](#komplette-eksempler)
10. [Validering og Import](#validering-og-import)

---

## Oversikt

### 🎯 Mål
Konvertere regnskapsoppgaver til interaktivt JSON-format med fokus på:
- **Praktisk bokføring** med T-kontoer og bilagsføring
- **Lovforståelse** med referanser til Bokføringsloven og Regnskapsloven
- **Varierte oppgavetyper** for ulike læringsmål

### 🎮 Læringsfilosofi
For bokføringsoppgaver, lag **progressiv læring**:

```
1. 🧩 DRAG_DROP (debet_kredit)     → Forstå debet/kredit først
2. 📊 EXCEL_GRID (guided)          → Bokføring med hjelpetekst
3. 📈 EXCEL_GRID (standard)        → Bokføring uten hjelp
4. 🏆 EXCEL_GRID (expert)          → Full bilagsføring med alle konti
```

### 📁 Database-struktur
```
Firebase Realtime Database:
├── questions/grunnleggende_regnskap/{questionId}  → Spørsmål
└── solutions/grunnleggende_regnskap/{questionId}  → Svar + forklaringer
```

---

## JSON-Struktur

### Basis-struktur (alle oppgavetyper)

```json
{
  "id": "gr_bokl_001",
  "module": "grunnleggende_regnskap",
  "category": "bokforing",
  "topic": "dobbelt_bokforing",
  "difficulty": "easy|medium|hard",
  "type": "mc|tf|para|multi|excel_grid|drag_drop|fill_blank",
  "title": "Kort beskrivende tittel",
  "question": "Full oppgavetekst på norsk",
  "q": "Kortversjon av spørsmål",
  
  "answer": "a",
  "a": "a",
  "tolerance": 0.01,
  
  "explanation": "Detaljert forklaring med lovhenvisning",
  "exp": "Kort forklaring",
  "law": "§ 4-1 (BOKL)",
  "hints": [
    "Hint 1 (enklest)",
    "Hint 2 (mer detaljert)",
    "Hint 3 (nesten svaret)"
  ],
  
  "source": "Eksamen 2024",
  "tags": ["dobbelt-bokforing", "debet-kredit"],
  "wiki": ["dobbelt", "debet-kredit"],
  "linkedTo": "gr_bokl_002",
  "createdAt": 1700000000000
}
```

### ID-format
```
gr_{kilde}_{oppgavenummer}_{variant}

Prefiks-forklaring:
- gr_ = grunnleggende regnskap
- bokl_ = bokføringsloven-relatert
- rskl_ = regnskapsloven-relatert
- mva_ = mva-relatert
- bilag_ = bilagsføring

Eksempler:
- gr_bokl_001              → Hovedoppgave
- gr_bokl_001_tkonto       → T-konto versjon
- gr_bokl_001_guided       → Bokføring med hjelp
- gr_bokl_001_expert       → Bokføring uten hjelp
```

---

## Oppgavetyper

### 📊 Oversikt

| Type | Subtype | Bruksområde | Interaktivitet |
|------|---------|-------------|----------------|
| `mc` | - | Konseptspørsmål, lov | Velg ett svar |
| `tf` | - | Sant/usant påstander | Velg sant/usant |
| `para` | - | Kortsvar (begrep, paragraf) | Skriv tekst |
| `multi` | - | Flervalg | Velg flere svar |
| `fill_blank` | - | Fyll inn bilagsføring | Skriv i felt |
| `excel_grid` | `tkonto` | T-konto bokføring | Fyll celler |
| `excel_grid` | `bilag` | Bilagsregistrering | Fyll celler |
| `excel_grid` | `saldobalanse` | Saldobalanse | Fyll celler |
| `drag_drop` | `debet_kredit` | Sortere til debet/kredit | Dra til sider |
| `drag_drop` | `kontoklasse` | Sortere til kontoklasser | Dra til grupper |
| `drag_drop` | `balanse_resultat` | Sortere til balanse/resultat | Dra til kategorier |
| `drag_drop` | `matching` | Koble begrep med definisjon | Dra til par |
| `drag_drop` | `sequence` | Bokføringsprosess i rekkefølge | Dra til rekkefølge |

---

## Bokføringsoppgaver (Excel Grid)

### Type 1: T-konto (Enkel bokføring)

```json
{
  "id": "gr_bilag_001_tkonto",
  "module": "grunnleggende_regnskap",
  "topic": "bilagsforing",
  "difficulty": "easy",
  "type": "excel_grid",
  "variant": "tkonto",
  "title": "Kontantsalg - T-konto",
  
  "question": "Bedriften selger varer for kr 10 000 kontant (ekskl. mva). Bokfør transaksjonen.",
  
  "data": {
    "amount": 10000,
    "vat": 0,
    "description": "Kontantsalg"
  },
  
  "grid": {
    "type": "tkonto",
    "accounts": [
      {
        "number": "1920",
        "name": "Bankinnskudd",
        "side": "debet",
        "amount": 10000
      },
      {
        "number": "3000",
        "name": "Salgsinntekt",
        "side": "kredit",
        "amount": 10000
      }
    ]
  },
  
  "validation": {
    "requireBalance": true,
    "tolerance": 0
  },
  
  "answer": {
    "debet": [{"konto": "1920", "belop": 10000}],
    "kredit": [{"konto": "3000", "belop": 10000}]
  },
  
  "explanation": "Ved kontantsalg:\n• DEBET 1920 Bankinnskudd - økning i eiendeler\n• KREDIT 3000 Salgsinntekt - økning i inntekt\n\nDebet = Kredit: 10 000 = 10 000 ✓",
  "law": "§ 4-1 (BOKL)",
  "hints": [
    "Vi mottar penger - hvilken konto øker?",
    "Bank er en eiendel - eiendeler øker i debet",
    "Salg er inntekt - inntekter øker i kredit"
  ],
  "source": "Grunnkurs bokføring"
}
```

### Type 2: Bilagsregistrering (Flere posteringer)

```json
{
  "id": "gr_bilag_002",
  "module": "grunnleggende_regnskap",
  "topic": "bilagsforing",
  "difficulty": "medium",
  "type": "excel_grid",
  "variant": "bilag",
  "title": "Varekjøp med MVA",
  
  "question": "Bedriften kjøper varer for kr 8 000 + 25% mva på faktura. Bokfør transaksjonen.",
  
  "data": {
    "netAmount": 8000,
    "vatRate": 0.25,
    "vatAmount": 2000,
    "totalAmount": 10000,
    "paymentMethod": "faktura"
  },
  
  "grid": {
    "columns": ["Konto", "Kontonavn", "Debet", "Kredit"],
    "rows": [
      {
        "cells": [
          {"value": null, "editable": true, "answer": "4300"},
          {"value": null, "editable": true, "answer": "Innkjøp av varer"},
          {"value": null, "editable": true, "answer": 8000},
          {"value": "", "editable": false}
        ]
      },
      {
        "cells": [
          {"value": null, "editable": true, "answer": "2710"},
          {"value": null, "editable": true, "answer": "Inng. mva"},
          {"value": null, "editable": true, "answer": 2000},
          {"value": "", "editable": false}
        ]
      },
      {
        "cells": [
          {"value": null, "editable": true, "answer": "2400"},
          {"value": null, "editable": true, "answer": "Leverandørgjeld"},
          {"value": "", "editable": false},
          {"value": null, "editable": true, "answer": 10000}
        ]
      },
      {
        "cells": [
          {"value": "SUM", "editable": false, "highlight": true},
          {"value": "", "editable": false},
          {"value": null, "editable": true, "answer": 10000, "calculated": true},
          {"value": null, "editable": true, "answer": 10000, "calculated": true}
        ]
      }
    ]
  },
  
  "validation": {
    "requireBalance": true,
    "tolerance": 0
  },
  
  "answer": {
    "posteringer": [
      {"konto": "4300", "debet": 8000, "kredit": 0},
      {"konto": "2710", "debet": 2000, "kredit": 0},
      {"konto": "2400", "debet": 0, "kredit": 10000}
    ]
  },
  
  "explanation": "Varekjøp på faktura med MVA:\n\n• DEBET 4300 Innkjøp av varer: 8 000 (kostnad øker)\n• DEBET 2710 Inngående MVA: 2 000 (fordring på staten)\n• KREDIT 2400 Leverandørgjeld: 10 000 (gjeld øker)\n\nKontroll: 8 000 + 2 000 = 10 000 ✓",
  "law": "§ 4-1 (BOKL), § 8-1 (MVAL)",
  "hints": [
    "Varekjøp er kostnad (klasse 4) - øker i debet",
    "MVA på kjøp er fordring (klasse 27) - øker i debet",
    "Faktura = leverandørgjeld (konto 2400) - øker i kredit"
  ],
  "source": "Grunnkurs bokføring"
}
```

### Type 3: Saldobalanse (Guided)

```json
{
  "id": "gr_saldobalanse_001",
  "module": "grunnleggende_regnskap",
  "topic": "saldobalanse",
  "difficulty": "hard",
  "type": "excel_grid",
  "variant": "saldobalanse",
  "title": "Saldobalanse - Kontroll",
  
  "question": "Fyll ut saldobalansen basert på følgende informasjon:\n- Bankinnskudd: 50 000\n- Kundefordringer: 30 000\n- Leverandørgjeld: 20 000\n- Egenkapital: 40 000\n- Salgsinntekt: 80 000\n- Varekostnad: 45 000\n- Lønn: 15 000",
  
  "grid": {
    "columns": ["Konto", "Kontonavn", "Debet", "Kredit"],
    "rows": [
      {"cells": [
        {"value": "1920"}, {"value": "Bankinnskudd"},
        {"value": null, "editable": true, "answer": 50000},
        {"value": ""}
      ]},
      {"cells": [
        {"value": "1500"}, {"value": "Kundefordringer"},
        {"value": null, "editable": true, "answer": 30000},
        {"value": ""}
      ]},
      {"cells": [
        {"value": "2400"}, {"value": "Leverandørgjeld"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 20000}
      ]},
      {"cells": [
        {"value": "2000"}, {"value": "Egenkapital"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 40000}
      ]},
      {"cells": [
        {"value": "3000"}, {"value": "Salgsinntekt"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 80000}
      ]},
      {"cells": [
        {"value": "4300"}, {"value": "Varekostnad"},
        {"value": null, "editable": true, "answer": 45000},
        {"value": ""}
      ]},
      {"cells": [
        {"value": "5000"}, {"value": "Lønn"},
        {"value": null, "editable": true, "answer": 15000},
        {"value": ""}
      ]},
      {"cells": [
        {"value": "SUM", "highlight": true}, {"value": ""},
        {"value": null, "editable": true, "answer": 140000},
        {"value": null, "editable": true, "answer": 140000}
      ]}
    ]
  },
  
  "validation": {
    "requireBalance": true,
    "tolerance": 0
  },
  
  "explanation": "Saldobalansen viser alle kontoer med sine saldoer:\n\nDEBET-konti:\n• Eiendeler (klasse 1): Bank, Fordringer\n• Kostnader (klasse 4-7): Varekjøp, Lønn\n\nKREDIT-konti:\n• Gjeld (klasse 2): Leverandørgjeld\n• Egenkapital (klasse 2): Egenkapital\n• Inntekter (klasse 3): Salg\n\nSUM DEBET = SUM KREDIT: 140 000 = 140 000 ✓",
  "source": "Grunnkurs bokføring"
}
```

---

## Drag & Drop Varianter

### 1. Debet/Kredit Sortering

```json
{
  "id": "gr_konsept_debetkred_001",
  "module": "grunnleggende_regnskap",
  "topic": "dobbelt_bokforing",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "debet_kredit",
  "title": "Debet eller Kredit?",
  
  "question": "Dra hver hendelse til riktig side av T-kontoen",
  
  "categories": [
    {
      "id": "debet",
      "name": "DEBET (venstre)",
      "description": "Økning eiendeler, kostnader, reduksjon gjeld/EK",
      "color": "#4ade80"
    },
    {
      "id": "kredit",
      "name": "KREDIT (høyre)",
      "description": "Økning gjeld/EK/inntekter, reduksjon eiendeler",
      "color": "#f59e0b"
    }
  ],
  
  "items": [
    {"id": "i1", "text": "Bankinnskudd øker", "category": "debet"},
    {"id": "i2", "text": "Salgsinntekt registreres", "category": "kredit"},
    {"id": "i3", "text": "Vi betaler lønn", "category": "debet"},
    {"id": "i4", "text": "Vi får ny leverandørgjeld", "category": "kredit"},
    {"id": "i5", "text": "Kundefordring øker", "category": "debet"},
    {"id": "i6", "text": "Egenkapital øker", "category": "kredit"},
    {"id": "i7", "text": "Varekostnad registreres", "category": "debet"},
    {"id": "i8", "text": "Leverandørgjeld betales", "category": "debet"}
  ],
  
  "answer": {
    "debet": ["Bankinnskudd øker", "Vi betaler lønn", "Kundefordring øker", "Varekostnad registreres", "Leverandørgjeld betales"],
    "kredit": ["Salgsinntekt registreres", "Vi får ny leverandørgjeld", "Egenkapital øker"]
  },
  
  "explanation": "Hovedregler for debet/kredit:\n\nDEBET (venstre side):\n• Eiendeler ØKER\n• Kostnader registreres\n• Gjeld/EK REDUSERES\n\nKREDIT (høyre side):\n• Eiendeler REDUSERES\n• Inntekter registreres\n• Gjeld/EK ØKER",
  "law": "§ 4-1 (BOKL)",
  "source": "Grunnkurs bokføring"
}
```

### 2. Kontoklasse Sortering

```json
{
  "id": "gr_konsept_kontoklasse_001",
  "module": "grunnleggende_regnskap",
  "topic": "kontoplan",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "kontoklasse",
  "title": "Hvilken kontoklasse?",
  
  "question": "Dra hver konto til riktig kontoklasse",
  
  "categories": [
    {"id": "klasse1", "name": "Klasse 1: Eiendeler", "color": "#3b82f6"},
    {"id": "klasse2", "name": "Klasse 2: EK og Gjeld", "color": "#8b5cf6"},
    {"id": "klasse3", "name": "Klasse 3: Inntekter", "color": "#22c55e"},
    {"id": "klasse4_7", "name": "Klasse 4-7: Kostnader", "color": "#ef4444"}
  ],
  
  "items": [
    {"id": "i1", "text": "1920 Bankinnskudd", "category": "klasse1"},
    {"id": "i2", "text": "2400 Leverandørgjeld", "category": "klasse2"},
    {"id": "i3", "text": "3000 Salgsinntekt", "category": "klasse3"},
    {"id": "i4", "text": "4300 Varekjøp", "category": "klasse4_7"},
    {"id": "i5", "text": "1500 Kundefordringer", "category": "klasse1"},
    {"id": "i6", "text": "5000 Lønn", "category": "klasse4_7"},
    {"id": "i7", "text": "2000 Egenkapital", "category": "klasse2"},
    {"id": "i8", "text": "6300 Leiekostnader", "category": "klasse4_7"}
  ],
  
  "answer": {
    "klasse1": ["1920 Bankinnskudd", "1500 Kundefordringer"],
    "klasse2": ["2400 Leverandørgjeld", "2000 Egenkapital"],
    "klasse3": ["3000 Salgsinntekt"],
    "klasse4_7": ["4300 Varekjøp", "5000 Lønn", "6300 Leiekostnader"]
  },
  
  "explanation": "NS 4102 Kontoplan:\n• Klasse 1: Eiendeler (det vi eier)\n• Klasse 2: Egenkapital og gjeld (finansiering)\n• Klasse 3: Inntekter (det vi tjener)\n• Klasse 4-7: Kostnader (det vi bruker)\n• Klasse 8: Finans og skatt",
  "source": "NS 4102"
}
```

### 3. Balanse vs Resultat

```json
{
  "id": "gr_konsept_balanseresultat_001",
  "module": "grunnleggende_regnskap",
  "topic": "arsregnskap",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "balanse_resultat",
  "title": "Balanse eller Resultat?",
  
  "question": "Dra hver post til riktig oppstilling",
  
  "categories": [
    {
      "id": "balanse",
      "name": "BALANSE",
      "description": "Viser stilling på et tidspunkt",
      "color": "#3b82f6"
    },
    {
      "id": "resultat",
      "name": "RESULTATREGNSKAP",
      "description": "Viser resultat over en periode",
      "color": "#22c55e"
    }
  ],
  
  "items": [
    {"id": "i1", "text": "Bankinnskudd", "category": "balanse"},
    {"id": "i2", "text": "Salgsinntekt", "category": "resultat"},
    {"id": "i3", "text": "Varekostnad", "category": "resultat"},
    {"id": "i4", "text": "Kundefordringer", "category": "balanse"},
    {"id": "i5", "text": "Leverandørgjeld", "category": "balanse"},
    {"id": "i6", "text": "Lønn", "category": "resultat"},
    {"id": "i7", "text": "Egenkapital", "category": "balanse"},
    {"id": "i8", "text": "Renteinntekter", "category": "resultat"},
    {"id": "i9", "text": "Maskiner", "category": "balanse"},
    {"id": "i10", "text": "Avskrivninger", "category": "resultat"}
  ],
  
  "answer": {
    "balanse": ["Bankinnskudd", "Kundefordringer", "Leverandørgjeld", "Egenkapital", "Maskiner"],
    "resultat": ["Salgsinntekt", "Varekostnad", "Lønn", "Renteinntekter", "Avskrivninger"]
  },
  
  "explanation": "BALANSE (stilling):\n• Eiendeler (klasse 1)\n• Egenkapital og gjeld (klasse 2)\n\nRESULTATREGNSKAP (periode):\n• Inntekter (klasse 3)\n• Kostnader (klasse 4-8)",
  "law": "§ 3-2 (RSKL)",
  "source": "Regnskapsloven"
}
```

### 4. Bokføringsprosess (Sekvens)

```json
{
  "id": "gr_prosess_bokforing_001",
  "module": "grunnleggende_regnskap",
  "topic": "bokforingsprosess",
  "difficulty": "medium",
  "type": "drag_drop",
  "subtype": "sequence",
  "title": "Bokføringsprosessen - Riktig rekkefølge",
  
  "question": "Sett stegene i riktig rekkefølge for bokføringsprosessen",
  
  "items": [
    {"id": "s1", "text": "Bilag mottas/opprettes", "order": 1},
    {"id": "s2", "text": "Bilag kontrolleres", "order": 2},
    {"id": "s3", "text": "Kontoer velges", "order": 3},
    {"id": "s4", "text": "Postering registreres", "order": 4},
    {"id": "s5", "text": "Avstemming gjennomføres", "order": 5},
    {"id": "s6", "text": "Arkivering", "order": 6}
  ],
  
  "answer": [1, 2, 3, 4, 5, 6],
  
  "explanation": "Bokføringsprosessen:\n1. Bilag mottas eller opprettes\n2. Bilag kontrolleres for fullstendighet\n3. Riktige kontoer identifiseres\n4. Postering registreres i regnskapssystemet\n5. Regelmessig avstemming\n6. Bilag arkiveres (5 års oppbevaring)",
  "law": "§ 5-1 til § 5-7 (BOKL)",
  "source": "Bokføringsloven"
}
```

### 5. Begrep Matching

```json
{
  "id": "gr_konsept_match_001",
  "module": "grunnleggende_regnskap",
  "topic": "generelt",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "matching",
  "title": "Match regnskapsbegreper",
  
  "question": "Koble hvert begrep med riktig definisjon",
  
  "pairs": [
    {
      "id": "p1",
      "term": "Dobbelt bokføring",
      "definition": "Hver transaksjon registreres i både debet og kredit"
    },
    {
      "id": "p2",
      "term": "Bilag",
      "definition": "Dokumentasjon for en regnskapstransaksjon"
    },
    {
      "id": "p3",
      "term": "Hovedbok",
      "definition": "Oversikt over alle kontoer med posteringer og saldoer"
    },
    {
      "id": "p4",
      "term": "Reskontro",
      "definition": "Spesifikasjon av kunde- og leverandørfordringer"
    },
    {
      "id": "p5",
      "term": "Saldobalanse",
      "definition": "Liste over alle kontoer med debet- og kreditsaldoer"
    }
  ],
  
  "distractors": [
    "Månedlig rapportering til skattemyndighetene",
    "Årlig revisjon av regnskapet"
  ],
  
  "answer": {
    "Dobbelt bokføring": "Hver transaksjon registreres i både debet og kredit",
    "Bilag": "Dokumentasjon for en regnskapstransaksjon",
    "Hovedbok": "Oversikt over alle kontoer med posteringer og saldoer",
    "Reskontro": "Spesifikasjon av kunde- og leverandørfordringer",
    "Saldobalanse": "Liste over alle kontoer med debet- og kreditsaldoer"
  },
  
  "explanation": "Grunnleggende regnskapsbegreper som er viktige å kjenne.",
  "law": "Bokføringsloven kap. 5",
  "source": "Grunnkurs bokføring"
}
```

---

## Topic-mapping

### Grunnleggende Regnskap Topics

| Tema | Topic ID | Beskrivelse |
|------|----------|-------------|
| Dobbelt bokføring, debet/kredit | `dobbelt_bokforing` | Grunnprinsippet |
| Bilagsføring, posteringer | `bilagsforing` | Praktisk bokføring |
| Kontoplan NS 4102 | `kontoplan` | Kontosystemet |
| Saldobalanse, avstemming | `saldobalanse` | Kontroll |
| Resultatregnskap | `resultatregnskap` | Inntekter og kostnader |
| Balanse | `balanse` | Eiendeler, EK, gjeld |
| MVA-beregning og bokføring | `mva` | Merverdiavgift |
| Lønn og arbeidsgiveravgift | `lonn` | Personalkostnader |
| Avskrivninger | `avskrivning` | Verdiforringelse |
| Årsavslutning | `arsavslutning` | Periodeavslutning |
| Bokføringsloven | `bokforingsloven` | Lovkrav |
| Regnskapsloven | `regnskapsloven` | Lovkrav |
| Oppbevaringskrav | `oppbevaring` | Arkivering |
| Varelager | `varelager` | Beholdning |
| Kundefordringer | `kundefordringer` | Utestående |
| Leverandørgjeld | `leverandorgjeld` | Skyldig |

### Difficulty Guidelines

| Nivå | Kriterier |
|------|-----------|
| `easy` | Enkelt konseptspørsmål, én konto, sant/usant |
| `medium` | 2-3 posteringer, MVA, standard bilag |
| `hard` | Kompleks bilagsføring, mange konti, sammensatte transaksjoner |

---

## Kontoplan (NS 4102)

### Vanlige kontoer å bruke i oppgaver

```
KLASSE 1 - EIENDELER
1200 Maskiner og anlegg
1500 Kundefordringer
1700 Forskuddsbetalt kostnad
1900 Kontanter
1920 Bankinnskudd

KLASSE 2 - EGENKAPITAL OG GJELD
2000 Aksjekapital/Egenkapital
2050 Annen egenkapital
2400 Leverandørgjeld
2600 Skattetrekk
2700 Utgående MVA (2710 Inngående MVA)
2780 Oppgjørskonto MVA
2900 Annen kortsiktig gjeld

KLASSE 3 - INNTEKTER
3000 Salgsinntekt, avgiftspliktig
3100 Salgsinntekt, avgiftsfri
3600 Leieinntekt
3900 Annen driftsinntekt

KLASSE 4 - VAREKOSTNAD
4300 Innkjøp av varer for videresalg
4500 Frakt, toll, spedisjon

KLASSE 5 - LØNN OG PERSONALKOSTNADER
5000 Lønn til ansatte
5400 Arbeidsgiveravgift
5900 Annen personalkostnad

KLASSE 6 - AVSKRIVNING, LEIE, ANNEN DRIFTSKOSTNAD
6000 Avskrivning
6300 Leiekostnad
6700 Reparasjon og vedlikehold
6800 Kontorkostnader
6900 Telefon, porto

KLASSE 7 - ANDRE DRIFTSKOSTNADER
7000 Drivstoff
7100 Bilkostnader
7300 Markedsføring
7700 Provisjonskostnad

KLASSE 8 - FINANSPOSTER OG SKATT
8000 Renteinntekt
8100 Rentekostnad
8170 Tap på fordringer
8300 Skattekostnad
```

---

## Lovhenvisninger

### Format for lovhenvisninger

```json
"law": "§ 4-1 (BOKL)"       // Bokføringsloven
"law": "§ 3-2 (RSKL)"       // Regnskapsloven
"law": "§ 8-1 (MVAL)"       // Merverdiavgiftsloven
"law": "§ 5-12 (SKTL)"      // Skatteloven
```

### Viktige paragrafer

| Lov | Paragraf | Tema |
|-----|----------|------|
| BOKL | § 4-1 | Grunnleggende bokføringsprinsipper |
| BOKL | § 5-1 | Bokføring av opplysninger |
| BOKL | § 5-3 | Ajourhold |
| BOKL | § 5-5 | Avstemming |
| BOKL | § 5-6 | Rettelser |
| BOKL | § 13-1 | Oppbevaring (5 år) |
| RSKL | § 1-2 | Regnskapsplikt |
| RSKL | § 3-2 | Årsregnskapets innhold |
| RSKL | § 4-1 | Balanselikningen |
| MVAL | § 3-1 | MVA-plikt |
| MVAL | § 8-1 | Fradragsrett |

---

## Komplette Eksempler

### Eksempel 1: Varesalg med MVA (Komplett sett)

#### Versjon A: MC (Konsept)

```json
{
  "id": "gr_mva_varesalg_001",
  "module": "grunnleggende_regnskap",
  "topic": "mva",
  "difficulty": "easy",
  "type": "mc",
  "title": "MVA-sats på varer",
  
  "question": "Hva er standard MVA-sats på varesalg i Norge?",
  
  "options": [
    {"id": "a", "text": "15%"},
    {"id": "b", "text": "20%"},
    {"id": "c", "text": "25%"},
    {"id": "d", "text": "30%"}
  ],
  
  "answer": "c",
  "explanation": "Standard MVA-sats i Norge er 25% på de fleste varer og tjenester.\n\nReduserte satser:\n• 15% på mat\n• 12% på transport, kino, NRK-lisens\n• 0% på eksport",
  "law": "§ 5-1 (MVAL)",
  "source": "Merverdiavgiftsloven"
}
```

#### Versjon B: Drag & Drop (Debet/Kredit)

```json
{
  "id": "gr_mva_varesalg_001_dnd",
  "module": "grunnleggende_regnskap",
  "topic": "mva",
  "difficulty": "easy",
  "type": "drag_drop",
  "subtype": "debet_kredit",
  "title": "Varesalg - Debet eller Kredit?",
  
  "question": "Ved varesalg på faktura (10 000 + 25% mva), hvor bokføres beløpene?",
  
  "categories": [
    {"id": "debet", "name": "DEBET", "color": "#4ade80"},
    {"id": "kredit", "name": "KREDIT", "color": "#f59e0b"}
  ],
  
  "items": [
    {"id": "i1", "text": "Kundefordringer 12 500", "category": "debet"},
    {"id": "i2", "text": "Salgsinntekt 10 000", "category": "kredit"},
    {"id": "i3", "text": "Utgående MVA 2 500", "category": "kredit"}
  ],
  
  "answer": {
    "debet": ["Kundefordringer 12 500"],
    "kredit": ["Salgsinntekt 10 000", "Utgående MVA 2 500"]
  },
  
  "explanation": "Ved varesalg på faktura:\n• Kundefordring ØKER (debet) - vi har penger til gode\n• Salgsinntekt registreres (kredit)\n• Utgående MVA er gjeld til staten (kredit)",
  "linkedTo": "gr_mva_varesalg_001_guided"
}
```

#### Versjon C: Excel Grid (Guided)

```json
{
  "id": "gr_mva_varesalg_001_guided",
  "module": "grunnleggende_regnskap",
  "topic": "mva",
  "difficulty": "medium",
  "type": "excel_grid",
  "variant": "bilag",
  "title": "Varesalg med MVA - Guided",
  
  "question": "Bokfør varesalg på faktura: 10 000 + 25% MVA = 12 500 totalt.",
  
  "data": {
    "netAmount": 10000,
    "vatRate": 0.25,
    "vatAmount": 2500,
    "totalAmount": 12500
  },
  
  "grid": {
    "columns": ["Konto", "Kontonavn", "Debet", "Kredit"],
    "rows": [
      {"cells": [
        {"value": "1500", "hint": "Kundefordringer"},
        {"value": null, "editable": true, "answer": "Kundefordringer"},
        {"value": null, "editable": true, "answer": 12500},
        {"value": ""}
      ]},
      {"cells": [
        {"value": "3000", "hint": "Salgsinntekt"},
        {"value": null, "editable": true, "answer": "Salgsinntekt"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 10000}
      ]},
      {"cells": [
        {"value": "2700", "hint": "Utg. MVA"},
        {"value": null, "editable": true, "answer": "Utgående MVA"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 2500}
      ]},
      {"cells": [
        {"value": "SUM", "highlight": true},
        {"value": ""},
        {"value": null, "calculated": true, "answer": 12500},
        {"value": null, "calculated": true, "answer": 12500}
      ]}
    ]
  },
  
  "hints": [
    "Fakturasalg betyr at kunden skylder oss penger",
    "MVA på salg er gjeld til staten (konto 2700)",
    "Netto salgsbeløp er 10 000, MVA er 2 500"
  ],
  
  "explanation": "Varesalg på faktura med 25% MVA:\n\n• DEBET 1500 Kundefordringer: 12 500 (vi har til gode)\n• KREDIT 3000 Salgsinntekt: 10 000 (netto salg)\n• KREDIT 2700 Utgående MVA: 2 500 (skylder staten)\n\nKontroll: 12 500 = 10 000 + 2 500 ✓",
  "linkedTo": "gr_mva_varesalg_001_expert"
}
```

#### Versjon D: Excel Grid (Expert)

```json
{
  "id": "gr_mva_varesalg_001_expert",
  "module": "grunnleggende_regnskap",
  "topic": "mva",
  "difficulty": "hard",
  "type": "excel_grid",
  "variant": "bilag",
  "title": "Varesalg med MVA - Expert",
  
  "question": "Bokfør varesalg på faktura: 10 000 + 25% MVA. Fyll inn alle verdier selv.",
  
  "grid": {
    "columns": ["Konto", "Kontonavn", "Debet", "Kredit"],
    "rows": [
      {"cells": [
        {"value": null, "editable": true, "answer": "1500"},
        {"value": null, "editable": true, "answer": "Kundefordringer"},
        {"value": null, "editable": true, "answer": 12500},
        {"value": ""}
      ]},
      {"cells": [
        {"value": null, "editable": true, "answer": "3000"},
        {"value": null, "editable": true, "answer": "Salgsinntekt"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 10000}
      ]},
      {"cells": [
        {"value": null, "editable": true, "answer": "2700"},
        {"value": null, "editable": true, "answer": "Utgående MVA"},
        {"value": ""},
        {"value": null, "editable": true, "answer": 2500}
      ]}
    ]
  },
  
  "scoring": {
    "correctAccount": 1,
    "correctAmount": 2,
    "correctSide": 1,
    "partialCredit": true,
    "maxScore": 12
  }
}
```

---

### Eksempel 2: Lønn (Komplett sett)

```json
[
  {
    "id": "gr_lonn_001",
    "module": "grunnleggende_regnskap",
    "topic": "lonn",
    "difficulty": "easy",
    "type": "mc",
    "title": "Hva er arbeidsgiveravgift?",
    "question": "Arbeidsgiveravgift er:",
    "options": [
      {"id": "a", "text": "Skatt som trekkes fra den ansattes lønn"},
      {"id": "b", "text": "Avgift arbeidsgiver betaler til NAV basert på lønnskostnader"},
      {"id": "c", "text": "Forsikringspremie for ansatte"},
      {"id": "d", "text": "Pensjonsinnskudd"}
    ],
    "answer": "b",
    "explanation": "Arbeidsgiveravgift betales av arbeidsgiver til NAV. Satsen varierer fra 0-14,1% avhengig av sone.",
    "law": "Folketrygdloven",
    "source": "Grunnkurs lønn"
  },
  {
    "id": "gr_lonn_001_guided",
    "module": "grunnleggende_regnskap",
    "topic": "lonn",
    "difficulty": "medium",
    "type": "excel_grid",
    "variant": "bilag",
    "title": "Lønnsutbetaling - Guided",
    "question": "Bokfør lønn: Bruttolønn 30 000, Skattetrekk 8 000, Utbetalt 22 000",
    "grid": {
      "columns": ["Konto", "Kontonavn", "Debet", "Kredit"],
      "rows": [
        {"cells": [
          {"value": "5000"},
          {"value": "Lønn"},
          {"value": null, "editable": true, "answer": 30000},
          {"value": ""}
        ]},
        {"cells": [
          {"value": "2600"},
          {"value": "Skattetrekk"},
          {"value": ""},
          {"value": null, "editable": true, "answer": 8000}
        ]},
        {"cells": [
          {"value": "1920"},
          {"value": "Bank"},
          {"value": ""},
          {"value": null, "editable": true, "answer": 22000}
        ]}
      ]
    },
    "explanation": "Lønnsutbetaling:\n• DEBET 5000 Lønn: 30 000 (kostnad)\n• KREDIT 2600 Skattetrekk: 8 000 (gjeld til staten)\n• KREDIT 1920 Bank: 22 000 (utbetalt til ansatt)"
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
  'tf': [],
  'para': ['variations'],
  'multi': ['options'],
  'excel_grid': ['grid', 'variant'],
  'drag_drop': ['subtype'],
  'fill_blank': ['blanks']
};

// Gyldige verdier
const validModules = ['grunnleggende_regnskap'];
const validTopics = [
  'dobbelt_bokforing', 'bilagsforing', 'kontoplan', 'saldobalanse',
  'resultatregnskap', 'balanse', 'mva', 'lonn', 'avskrivning',
  'arsavslutning', 'bokforingsloven', 'regnskapsloven', 'oppbevaring',
  'varelager', 'kundefordringer', 'leverandorgjeld', 'generelt'
];
const validDifficulties = ['easy', 'medium', 'hard'];
```

### Import til Firebase

**Via Admin Dashboard:**
1. Gå til admin.html → Import
2. Last opp JSON-fil
3. Verifiser at "📚 Grunnleggende Regnskap" detekteres
4. Se preview med topics
5. Klikk "Importer til Firebase"

**Resultat:**
```
/questions/grunnleggende_regnskap/{id} → Spørsmålsdata
/solutions/grunnleggende_regnskap/{id} → Svar + forklaringer
```

---

## Hurtigreferanse

### Oppgavetype-beslutning

```
Bokføringsoppgave?        → excel_grid (tkonto/bilag)
Debet/kredit forståelse?  → drag_drop (debet_kredit)
Kontoklassifisering?      → drag_drop (kontoklasse)
Balanse vs Resultat?      → drag_drop (balanse_resultat)
Prosess/rekkefølge?       → drag_drop (sequence)
Begrep/definisjon?        → drag_drop (matching)
Sant/usant?               → tf
Lovparagraf?              → para
Flervalg?                 → multi
Konseptspørsmål?          → mc
```

### Standard posteringsmønster

```
KJØP PÅ FAKTURA:
  Debet: Kostnad/Eiendel + Inng. MVA
  Kredit: Leverandørgjeld

SALG PÅ FAKTURA:
  Debet: Kundefordringer
  Kredit: Salgsinntekt + Utg. MVA

KONTANTKJØP:
  Debet: Kostnad/Eiendel + Inng. MVA
  Kredit: Bank

KONTANTSALG:
  Debet: Bank
  Kredit: Salgsinntekt + Utg. MVA

BETALING TIL LEVERANDØR:
  Debet: Leverandørgjeld
  Kredit: Bank

BETALING FRA KUNDE:
  Debet: Bank
  Kredit: Kundefordringer

LØNN:
  Debet: Lønn (kostnad)
  Kredit: Skattetrekk + Bank
```

---

**Dokument slutt**

*Opprettet for AccountingQuest - Gamified Accounting Education*
