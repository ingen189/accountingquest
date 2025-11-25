/**
 * AccountingQuest - Seed Data for Corporate Finance
 * 
 * Konverterte spørsmål fra BØK260 eksamener til database-format.
 * Kjør dette scriptet for å laste opp til Firebase.
 * 
 * BRUK:
 * 1. Åpne seed-corporate-finance.html i nettleseren
 * 2. Klikk "Seed Database"
 * 3. Vent på bekreftelse
 */

var CorporateFinanceSeedData = {
    
    // ==================== METADATA ====================
    
    metadata: {
        module: "corporate_finance",
        version: "1.0.0",
        topics: [
            { id: "npv", name: "Net Present Value", count: 0 },
            { id: "irr", name: "Internal Rate of Return", count: 0 },
            { id: "bonds", name: "Obligasjoner", count: 0 },
            { id: "stocks", name: "Aksjer & Dividender", count: 0 },
            { id: "wacc", name: "WACC & Kapitalstruktur", count: 0 },
            { id: "portfolio", name: "Portefølje & Risiko", count: 0 },
            { id: "leverage", name: "Financial Leverage", count: 0 },
            { id: "forex", name: "Valuta & Hedging", count: 0 },
            { id: "options", name: "Opsjoner", count: 0 },
            { id: "annuity", name: "Annuiteter & Lån", count: 0 }
        ],
        last_updated: new Date().toISOString()
    },
    
    // ==================== NPV SPØRSMÅL ====================
    
    npv_questions: [
        {
            id: "cf_npv_mc_001",
            module: "corporate_finance",
            topic: "npv",
            difficulty: "easy",
            type: "multiple_choice",
            title: "NPV vs IRR Konflikt",
            question: "Når kan NPV og IRR gi motstridende rangeringer av prosjekter?",
            options: [
                { id: "a", text: "Aldri - de gir alltid samme rangering" },
                { id: "b", text: "Når prosjektene har forskjellige størrelser eller tidsprofiler", correct: true },
                { id: "c", text: "Bare når NPV er negativ" },
                { id: "d", text: "Bare når IRR er høyere enn WACC" }
            ],
            solution: {
                correct: "b",
                explanation: "NPV og IRR kan være uenige når: 1) Prosjektene har forskjellig størrelse (scale), 2) Prosjektene har forskjellig timing av cash flows, 3) Ikke-konvensjonelle cash flows (multiple sign changes). NPV er generelt å foretrekke fordi den antar reinvestering til WACC (mer realistisk)."
            },
            hints: [
                { level: 1, text: "Tenk på hva som skjer når prosjekter har ulik størrelse" },
                { level: 2, text: "NPV måler absolutt verdiskaping, IRR måler relativ avkastning" }
            ],
            tags: ["npv", "irr", "prosjektanalyse", "beslutning"],
            source: "BØK260 Eksamen"
        },
        {
            id: "cf_npv_mc_002",
            module: "corporate_finance",
            topic: "npv",
            difficulty: "easy",
            type: "multiple_choice",
            title: "NPV ved ulik diskonteringsrente",
            question: "Ved 5% diskonteringsrente er NPV av prosjekt A lik 500 og lik NPV av prosjekt B. Hvis diskonteringsrenten er 4%, hva skjer da?",
            options: [
                { id: "a", text: "NPV A > NPV B" },
                { id: "b", text: "NPV B = NPV A" },
                { id: "c", text: "NPV A < NPV B" },
                { id: "d", text: "Det kan ikke bestemmes", correct: true }
            ],
            solution: {
                correct: "d",
                explanation: "Det avhenger av antall og størrelse på kontantstrømmene. Hvis kontantstrømmene er identiske, vil NPV være lik. Men hvis de er forskjellige (f.eks. ulik timing), vil endring i diskonteringsrente påvirke dem ulikt."
            },
            hints: [
                { level: 1, text: "Lavere rente gir høyere NPV, men effekten varierer" },
                { level: 2, text: "Kontantstrømmer langt frem i tid påvirkes mer av renteendringer" }
            ],
            tags: ["npv", "diskontering", "sensitivitet"],
            source: "BØK260 2023"
        },
        {
            id: "cf_npv_calc_001",
            module: "corporate_finance",
            topic: "npv",
            difficulty: "medium",
            type: "calculation",
            title: "NPV Beregning - Basisoppgave",
            description: "Beregn NPV for følgende investeringsprosjekt:",
            scenario: "Norsk Tech AS vurderer å investere i nytt produksjonsutstyr.",
            variables: {
                investment: { min: 400000, max: 600000, step: 50000 },
                cf1: { min: 100000, max: 200000, step: 25000 },
                cf2: { min: 150000, max: 250000, step: 25000 },
                cf3: { min: 150000, max: 250000, step: 25000 },
                cf4: { min: 100000, max: 200000, step: 25000 },
                rate: { values: [0.08, 0.10, 0.12] }
            },
            data: {
                investment: "{investment}",
                cashflows: ["{cf1}", "{cf2}", "{cf3}", "{cf4}"],
                rate: "{rate}",
                years: 4
            },
            input_fields: [
                { id: "pv1", label: "PV År 1", unit: "kr", decimals: 0 },
                { id: "pv2", label: "PV År 2", unit: "kr", decimals: 0 },
                { id: "pv3", label: "PV År 3", unit: "kr", decimals: 0 },
                { id: "pv4", label: "PV År 4", unit: "kr", decimals: 0 },
                { id: "npv", label: "NPV", unit: "kr", decimals: 0 },
                { id: "accept", label: "Aksepter?", type: "boolean" }
            ],
            solution: {
                pv1: "{cf1/(1+rate)}",
                pv2: "{cf2/(1+rate)^2}",
                pv3: "{cf3/(1+rate)^3}",
                pv4: "{cf4/(1+rate)^4}",
                npv: "{-investment + cf1/(1+rate) + cf2/(1+rate)^2 + cf3/(1+rate)^3 + cf4/(1+rate)^4}",
                accept: true, // Beregnes dynamisk
                tolerance: 500
            },
            explanation: "NPV beregnes ved å diskontere alle fremtidige kontantstrømmer til nåverdi og trekke fra initial investering. Aksepter prosjektet hvis NPV > 0.",
            hints: [
                { level: 1, text: "PV Factor = 1 / (1 + r)^n" },
                { level: 2, text: "PV = CF × PV Factor" },
                { level: 3, text: "NPV = Sum av alle PV - Initial investering" }
            ],
            formulas: ["npv", "pv_factor"],
            tags: ["npv", "investering", "prosjektanalyse"],
            source: "BØK260 Practice"
        },
        {
            id: "cf_npv_calc_002",
            module: "corporate_finance",
            topic: "npv",
            difficulty: "hard",
            type: "excel_grid",
            title: "Prosjekt Sammenligning",
            description: "Du er finansdirektør og må velge mellom tre prosjekter. Firmaet har kun kapital til ETT prosjekt.",
            scenario: "Nordic Invest AS evaluerer tre alternative investeringsprosjekter. Du må beregne NPV, IRR, Payback Period og PI for alle tre, og gi en anbefaling.",
            data: {
                projects: {
                    A: {
                        name: "Utvidelse av fabrikk",
                        investment: 1000000,
                        cashflows: [300000, 300000, 300000, 300000, 300000],
                        salvage: 100000
                    },
                    B: {
                        name: "Ny produktlinje",
                        investment: 800000,
                        cashflows: [150000, 150000, 400000, 400000, 400000],
                        salvage: 0
                    },
                    C: {
                        name: "Teknologi oppgradering",
                        investment: 1200000,
                        cashflows: [200000, 400000, 600000, 400000, 200000],
                        salvage: 0
                    }
                },
                rate: 0.12
            },
            grid_config: {
                headers: ["Metric", "Prosjekt A", "Prosjekt B", "Prosjekt C"],
                rows: [
                    ["NPV", "", "", ""],
                    ["IRR", "", "", ""],
                    ["Payback", "", "", ""],
                    ["PI", "", "", ""],
                    ["Rangering", "", "", ""]
                ]
            },
            solution: {
                A: { npv: 181866, irr: 0.1524, payback: 3.33, pi: 1.18, rank: 2 },
                B: { npv: 172819, irr: 0.1856, payback: 4.33, pi: 1.22, rank: 3 },
                C: { npv: 234558, irr: 0.1689, payback: 3.17, pi: 1.20, rank: 1 },
                recommendation: "C",
                tolerance: { npv: 1000, irr: 0.01, payback: 0.1, pi: 0.02 }
            },
            explanation: "Prosjekt C anbefales fordi det har høyest NPV (verdi-maksimering), god IRR (over WACC), raskest payback, og godt PI. Ved kapitalrasjonering bør NPV prioriteres.",
            hints: [
                { level: 1, text: "Start med å beregne NPV for hvert prosjekt" },
                { level: 2, text: "IRR er renten som gir NPV = 0" },
                { level: 3, text: "Payback = År før break-even + (Gjenstående/CF neste år)" }
            ],
            tags: ["npv", "irr", "payback", "pi", "prosjektvalg"],
            source: "BØK260 Practice"
        }
    ],
    
    // ==================== OBLIGASJONER ====================
    
    bond_questions: [
        {
            id: "cf_bond_mc_001",
            module: "corporate_finance",
            topic: "bonds",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Zero-coupon Bond Pris",
            question: "Det er tre zero-coupon obligasjoner (alle med FV 1000) med årlig YTM på henholdsvis 5%, 10%, og 12%, alle med 3 år til forfall. Hvilken obligasjon har høyest pris?",
            options: [
                { id: "a", text: "Obligasjonen med 5% YTM", correct: true },
                { id: "b", text: "Obligasjonen med 10% YTM" },
                { id: "c", text: "Obligasjonen med 12% YTM" }
            ],
            solution: {
                correct: "a",
                explanation: "For zero-coupon obligasjoner er avkastningen kun fra YTM. Siden alle har samme FV og tid til forfall, vil den med lavest YTM ha høyest pris. Pris = FV / (1+YTM)^n. Høyere YTM = lavere pris."
            },
            hints: [
                { level: 1, text: "Tenk på forholdet mellom rente og pris" },
                { level: 2, text: "Pris = FV / (1 + r)^n" }
            ],
            tags: ["obligasjoner", "zero-coupon", "ytm", "pris"],
            source: "BØK260 2023"
        },
        {
            id: "cf_bond_mc_002",
            module: "corporate_finance",
            topic: "bonds",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Premium vs Discount Bond",
            question: "En obligasjon med pris under pålydende er:",
            options: [
                { id: "a", text: "En discount bond; avkastning er høyere enn kupongrenten", correct: true },
                { id: "b", text: "En discount bond; avkastning er lavere enn kupongrenten" },
                { id: "c", text: "En premium bond; avkastning er høyere enn kupongrenten" },
                { id: "d", text: "En premium bond; avkastning er lavere enn kupongrenten" }
            ],
            solution: {
                correct: "a",
                explanation: "En discount bond har pris under FV. Investorer får både kupong OG kursgevinst (pris stiger mot FV ved forfall), så total avkastning (YTM) er høyere enn kupongrenten."
            },
            hints: [
                { level: 1, text: "Hva skjer med prisen når obligasjonen nærmer seg forfall?" },
                { level: 2, text: "Total avkastning = kupong + kursendring" }
            ],
            tags: ["obligasjoner", "premium", "discount", "ytm"],
            source: "BØK260 2024"
        },
        {
            id: "cf_bond_calc_001",
            module: "corporate_finance",
            topic: "bonds",
            difficulty: "medium",
            type: "calculation",
            title: "Obligasjonsverdsetning",
            description: "Et selskap utstedte obligasjoner i dag med årlige kuponger.",
            variables: {
                fv: { values: [1000] },
                coupon_rate: { values: [0.08, 0.10, 0.12] },
                ytm: { values: [0.06, 0.08, 0.10] },
                years: { values: [10, 15, 20] }
            },
            data: {
                face_value: "{fv}",
                coupon_rate: "{coupon_rate}",
                ytm: "{ytm}",
                years: "{years}"
            },
            input_fields: [
                { id: "coupon", label: "Årlig kupong", unit: "kr" },
                { id: "pv_coupons", label: "PV av kuponger", unit: "kr" },
                { id: "pv_fv", label: "PV av pålydende", unit: "kr" },
                { id: "price", label: "Obligasjonspris", unit: "kr" },
                { id: "bond_type", label: "Type", type: "select", options: ["Premium", "Par", "Discount"] }
            ],
            solution: {
                // Beregnes dynamisk basert på variabler
                tolerance: 10
            },
            explanation: "Obligasjonspris = PV av kuponger + PV av pålydende. Premium hvis kupongrente > YTM, Discount hvis kupongrente < YTM, Par hvis kupongrente = YTM.",
            hints: [
                { level: 1, text: "Kupong = FV × Kupongrente" },
                { level: 2, text: "PV av kuponger = Kupong × [(1 - (1+r)^-n) / r]" },
                { level: 3, text: "PV av FV = FV / (1+r)^n" }
            ],
            tags: ["obligasjoner", "verdsetning", "kupong", "ytm"],
            source: "BØK260 Practice"
        },
        {
            id: "cf_bond_calc_002",
            module: "corporate_finance",
            topic: "bonds",
            difficulty: "hard",
            type: "calculation",
            title: "Restrukturert Obligasjon",
            description: "Firm A har restrukturert sine obligasjoner. Obligasjonene har 10 år til forfall og 10% kupongrente med årlige utbetalinger. Den nye avtalen tillater firmaet å IKKE betale kupong de neste 5 årene. Etter det gjenopptas normale kupongbetalinger. Ved forfall betales pålydende PLUSS alle utsatte kuponger.",
            data: {
                face_value: 1000,
                coupon_rate: 0.10,
                years_total: 10,
                years_deferred: 5,
                required_return: 0.15
            },
            input_fields: [
                { id: "annual_coupon", label: "Årlig kupong", unit: "$" },
                { id: "deferred_total", label: "Sum utsatte kuponger", unit: "$" },
                { id: "final_payment", label: "Totalt ved forfall", unit: "$" },
                { id: "bond_price", label: "Obligasjonspris i dag", unit: "$" }
            ],
            solution: {
                annual_coupon: 100,
                deferred_total: 500,
                final_payment: 1500,
                bond_price: 519.87,
                tolerance: 5
            },
            explanation: "Kontantstrømmer: År 1-5: 0, År 6-9: 100, År 10: 1500 (1000 FV + 500 utsatte kuponger). Diskonter alle til nåverdi med 15%.",
            hints: [
                { level: 1, text: "Tegn opp kontantstrømmene år for år" },
                { level: 2, text: "5 kuponger utsettes: 5 × 100 = 500" },
                { level: 3, text: "Diskonter hver kontantstrøm separat" }
            ],
            tags: ["obligasjoner", "restrukturering", "utsatte kuponger"],
            source: "BØK260 Practice Q2"
        },
        {
            id: "cf_bond_mc_003",
            module: "corporate_finance",
            topic: "bonds",
            difficulty: "medium",
            type: "multiple_choice",
            title: "Change-of-Control Klausul - Profitt",
            question: "En obligasjon har en change-of-control klausul som gir obligasjonseier rett til umiddelbar tilbakebetaling av pålydende. Hvis pålydende er NOK 1000 og markedspris er NOK 600, hva er profitten per obligasjon ved en overraskende change-of-control annonsering? (Anta kjøp til markedspris)",
            options: [
                { id: "a", text: "NOK 1000" },
                { id: "b", text: "NOK 800" },
                { id: "c", text: "NOK 600" },
                { id: "d", text: "NOK 400", correct: true },
                { id: "e", text: "NOK 200" },
                { id: "f", text: "NOK 0" }
            ],
            solution: {
                correct: "d",
                explanation: "Ved change-of-control kan du kreve tilbakebetaling til pålydende (1000). Kjøpt til 600, selger/får tilbakebetalt 1000. Profitt = 1000 - 600 = 400."
            },
            hints: [
                { level: 1, text: "Hva kan du kreve tilbakebetalt?" },
                { level: 2, text: "Profitt = Salg/tilbakebetaling - Kjøp" }
            ],
            tags: ["obligasjoner", "change-of-control", "profitt"],
            source: "BØK260 2023"
        }
    ],
    
    // ==================== AKSJER & DIVIDENDER ====================
    
    stock_questions: [
        {
            id: "cf_stock_calc_001",
            module: "corporate_finance",
            topic: "stocks",
            difficulty: "medium",
            type: "calculation",
            title: "Multi-stage Dividend Growth Model",
            description: "Verdsett en aksje med varierende vekst i dividende.",
            scenario: "Et selskap betaler nå dividende på $2 per aksje. Forventet vekst er 10% per år de neste 3 årene, deretter 5% konstant for alltid. Investorer krever 7% avkastning.",
            data: {
                d0: 2,
                g_high: 0.10,
                g_stable: 0.05,
                high_growth_years: 3,
                required_return: 0.07
            },
            input_fields: [
                { id: "d1", label: "D1", unit: "$" },
                { id: "d2", label: "D2", unit: "$" },
                { id: "d3", label: "D3", unit: "$" },
                { id: "d4", label: "D4", unit: "$" },
                { id: "pv_dividends", label: "PV av D1-D3", unit: "$" },
                { id: "p3", label: "Pris i år 3 (P3)", unit: "$" },
                { id: "pv_p3", label: "PV av P3", unit: "$" },
                { id: "p0", label: "Aksjepris i dag", unit: "$" }
            ],
            solution: {
                d1: 2.20,
                d2: 2.42,
                d3: 2.662,
                d4: 2.7951,
                pv_dividends: 6.34,
                p3: 139.755,
                pv_p3: 114.08,
                p0: 120.42,
                tolerance: 0.5
            },
            explanation: "1) Beregn dividender i høyvekstperioden. 2) Beregn P3 = D4/(r-g). 3) Diskonter alle dividender og P3 til nåverdi. P0 = PV(D1) + PV(D2) + PV(D3) + PV(P3).",
            hints: [
                { level: 1, text: "D_t = D_0 × (1+g)^t" },
                { level: 2, text: "Gordon Growth: P = D/(r-g)" },
                { level: 3, text: "Husk å diskontere P3 tilbake 3 år" }
            ],
            tags: ["aksjer", "dividende", "ddm", "gordon", "vekst"],
            source: "BØK260 Final 2022 Q1"
        },
        {
            id: "cf_stock_mc_001",
            module: "corporate_finance",
            topic: "stocks",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Growing Perpetuity Forutsetning",
            question: "Growing perpetuity modellen antar at g < r. Er dette realistisk?",
            options: [
                { id: "a", text: "Sant - dette er urealistisk", correct: true },
                { id: "b", text: "Usant - dette er helt realistisk" }
            ],
            solution: {
                correct: "a",
                explanation: "Forutsetningen g < r er nødvendig matematisk (ellers blir verdien uendelig eller negativ), men i praksis kan selskaper ha perioder hvor g > r. Modellen er en forenkling som fungerer best for modne selskaper med stabil vekst."
            },
            hints: [
                { level: 1, text: "Hva skjer hvis g ≥ r i formelen P = D/(r-g)?" }
            ],
            tags: ["aksjer", "gordon", "perpetuity", "forutsetninger"],
            source: "BØK260 Practice Q1"
        },
        {
            id: "cf_stock_calc_002",
            module: "corporate_finance",
            topic: "stocks",
            difficulty: "medium",
            type: "calculation",
            title: "Cash Flow i År 4 - Vekstmodell",
            description: "Et selskap betaler dividende på $5 per aksje nå. Forventet vekst er 10% per år de neste 2 årene, deretter 8% konstant.",
            question: "Hva er kontantstrømmen (dividende) i år 4?",
            data: {
                d0: 5,
                g_high: 0.10,
                g_stable: 0.08,
                high_growth_years: 2
            },
            input_fields: [
                { id: "d4", label: "D4", unit: "$" }
            ],
            solution: {
                d4: 6.4152,
                steps: [
                    "D1 = 5 × 1.10 = 5.50",
                    "D2 = 5.50 × 1.10 = 6.05",
                    "D3 = 6.05 × 1.08 = 6.534",
                    "D4 = 6.534 × 1.08 = 7.057"
                ],
                tolerance: 0.01,
                // Alternativ tolkning: D4 = 5 × (1.10)^2 × (1.08)^2 = 6.4152
                alternative: {
                    interpretation: "D4 = D0 × (1+g_high)^2 × (1+g_stable)^2",
                    value: 6.4152
                }
            },
            explanation: "Etter 2 år med 10% vekst har vi D2 = 5 × (1.10)^2 = 6.05. År 3-4 vokser med 8%. D4 = 6.05 × (1.08)^2 = 7.057, eller tolket som D4 = 5 × (1.10)^2 × (1.08)^2.",
            hints: [
                { level: 1, text: "Vekst er 10% i år 1-2, deretter 8%" },
                { level: 2, text: "D_n = D_0 × (1+g1)^t1 × (1+g2)^t2" }
            ],
            tags: ["aksjer", "dividende", "vekst", "kontantstrøm"],
            source: "BØK260 2023 Q12"
        }
    ],
    
    // ==================== WACC & KAPITALSTRUKTUR ====================
    
    wacc_questions: [
        {
            id: "cf_wacc_calc_001",
            module: "corporate_finance",
            topic: "wacc",
            difficulty: "medium",
            type: "calculation",
            title: "WACC Beregning",
            description: "Beregn WACC for et selskap gitt følgende informasjon.",
            scenario: "Aksjer selges for $20 hver. Siste dividende var $2.00. Dividender forventes å vokse 5% årlig. Skattesats er 30%, YTM på obligasjoner er 7%. Risikofri rente er 2%.",
            data: {
                price: 20,
                dividend: 2.00,
                growth: 0.05,
                tax_rate: 0.30,
                ytm: 0.07,
                rf: 0.02,
                equity_mv: 200000,
                debt_mv: 50000
            },
            input_fields: [
                { id: "re", label: "Kostnad EK (Re)", unit: "%", decimals: 2 },
                { id: "rd_after_tax", label: "Kostnad gjeld etter skatt", unit: "%", decimals: 2 },
                { id: "weight_e", label: "Vekt EK", unit: "%", decimals: 0 },
                { id: "weight_d", label: "Vekt gjeld", unit: "%", decimals: 0 },
                { id: "wacc", label: "WACC", unit: "%", decimals: 2 }
            ],
            solution: {
                re: 15.5,
                rd_after_tax: 4.9,
                weight_e: 80,
                weight_d: 20,
                wacc: 13.38,
                tolerance: 0.1
            },
            explanation: "Re = (D1/P0) + g = (2×1.05)/20 + 0.05 = 15.5%. Rd(1-T) = 7% × 0.70 = 4.9%. Vekter: E = 200k/(200k+50k) = 80%, D = 20%. WACC = 0.80×15.5% + 0.20×4.9% = 13.38%",
            hints: [
                { level: 1, text: "Re = D1/P0 + g (Gordon-modellen)" },
                { level: 2, text: "Etter-skatt gjeldskostnad = Rd × (1 - skattesats)" },
                { level: 3, text: "WACC = wE×Re + wD×Rd(1-T)" }
            ],
            tags: ["wacc", "kapitalstruktur", "egenkapital", "gjeld"],
            source: "BØK260 Final 2022 Q2"
        },
        {
            id: "cf_wacc_mc_001",
            module: "corporate_finance",
            topic: "wacc",
            difficulty: "easy",
            type: "multiple_choice",
            title: "WACC ved null gjeld",
            question: "WACC for et firma er 10%. Gjeld-egenkapital ratio er lik null. Hva er avkastningen for aksjonærene?",
            options: [
                { id: "a", text: "0%" },
                { id: "b", text: "5%" },
                { id: "c", text: "10%", correct: true },
                { id: "d", text: "15%" },
                { id: "e", text: "20%" }
            ],
            solution: {
                correct: "c",
                explanation: "Når D/E = 0, er firmaet 100% egenkapitalfinansiert. WACC = wE × Re + wD × Rd. Med wD = 0 og wE = 1, blir WACC = Re. Altså Re = WACC = 10%."
            },
            hints: [
                { level: 1, text: "Hva er vektene når det ikke er gjeld?" },
                { level: 2, text: "WACC = wE × Re når wD = 0" }
            ],
            tags: ["wacc", "egenkapital", "kapitalstruktur"],
            source: "BØK260 2023 Q14"
        },
        {
            id: "cf_wacc_mc_002",
            module: "corporate_finance",
            topic: "wacc",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Effekt av økt gjeld på WACC",
            question: "Hvis et firma øker sin gjeld (med alt annet likt), hva skjer med avkastning til egenkapital og WACC?",
            options: [
                { id: "a", text: "Re øker; WACC øker" },
                { id: "b", text: "Re uendret; WACC øker" },
                { id: "c", text: "Re synker; WACC synker" },
                { id: "d", text: "Re uendret; WACC synker", correct: true }
            ],
            solution: {
                correct: "d",
                explanation: "Mer gjeld gir større vekt på den billigere finansieringskilden (gjeld har lavere kostnad enn EK pga skattefradrag). Re er uendret hvis vi antar 'alt annet likt'. WACC synker pga økt vekt på lavkostfinansieringen."
            },
            hints: [
                { level: 1, text: "Gjeld er typisk billigere enn egenkapital (skattefordel)" },
                { level: 2, text: "Mer av den billige kilden = lavere snitt" }
            ],
            tags: ["wacc", "gjeld", "leverage", "kapitalstruktur"],
            source: "BØK260 Final 2022 Q3"
        },
        {
            id: "cf_wacc_calc_002",
            module: "corporate_finance",
            topic: "wacc",
            difficulty: "medium",
            type: "calculation",
            title: "PV av Tax Shield",
            description: "Beregn nåverdien av skatteskjoldet for et firma.",
            question: "Renteforpliktelsene til firma A er en evigvarende annuitet på 200 000 kr per periode. Gjeldskostnaden er 8%, skattesats er 21%. Hva er PV av skatteskjoldet?",
            data: {
                interest: 200000,
                cost_of_debt: 0.08,
                tax_rate: 0.21
            },
            input_fields: [
                { id: "annual_shield", label: "Årlig skatteskjold", unit: "kr" },
                { id: "pv_shield", label: "PV av skatteskjold", unit: "kr" }
            ],
            solution: {
                annual_shield: 42000,
                pv_shield: 525000,
                tolerance: 1000
            },
            explanation: "Årlig skatteskjold = Rente × Skattesats = 200k × 0.21 = 42k. PV av perpetuitet = CF/r = 42k/0.08 = 525k.",
            hints: [
                { level: 1, text: "Skatteskjold = Rente × Skattesats" },
                { level: 2, text: "PV av perpetuitet = CF / r" }
            ],
            tags: ["skatteskjold", "tax-shield", "perpetuitet", "gjeld"],
            source: "BØK260 2024 Q12"
        }
    ],
    
    // ==================== PORTEFØLJE & RISIKO ====================
    
    portfolio_questions: [
        {
            id: "cf_port_calc_001",
            module: "corporate_finance",
            topic: "portfolio",
            difficulty: "easy",
            type: "calculation",
            title: "Forventet avkastning",
            description: "Beregn forventet avkastning for aksje A.",
            data: {
                states: [
                    { name: "Recession", prob: 0.30, ra: -0.02, rb: -0.10 },
                    { name: "Normal", prob: 0.50, ra: 0.06, rb: 0.05 },
                    { name: "Expansion", prob: 0.20, ra: 0.08, rb: 0.15 }
                ]
            },
            input_fields: [
                { id: "er_a", label: "E(Ra)", unit: "%" }
            ],
            solution: {
                er_a: 4.0,
                calculation: "E(Ra) = 0.3×(-2%) + 0.5×(6%) + 0.2×(8%) = -0.6% + 3% + 1.6% = 4%",
                tolerance: 0.1
            },
            explanation: "Forventet avkastning = Σ (Sannsynlighet × Avkastning i hver tilstand)",
            hints: [
                { level: 1, text: "E(R) = Σ P_i × R_i" },
                { level: 2, text: "Summer alle (sannsynlighet × avkastning)" }
            ],
            tags: ["portefølje", "forventet-avkastning", "sannsynlighet"],
            source: "BØK260 2023 Q7"
        },
        {
            id: "cf_port_calc_002",
            module: "corporate_finance",
            topic: "portfolio",
            difficulty: "medium",
            type: "calculation",
            title: "Standardavvik",
            description: "Beregn standardavviket for aksje B.",
            data: {
                states: [
                    { name: "Recession", prob: 0.30, rb: -0.10 },
                    { name: "Normal", prob: 0.50, rb: 0.05 },
                    { name: "Expansion", prob: 0.20, rb: 0.15 }
                ],
                er_b: 0.025
            },
            input_fields: [
                { id: "var_b", label: "Varians", unit: "" },
                { id: "sd_b", label: "Standardavvik", unit: "%" }
            ],
            solution: {
                var_b: 0.008125,
                sd_b: 9.01,
                tolerance: 0.5
            },
            explanation: "E(Rb) = 2.5%. Var = 0.3×(-10%-2.5%)² + 0.5×(5%-2.5%)² + 0.2×(15%-2.5%)² = 0.008125. SD = √0.008125 = 9.01%",
            hints: [
                { level: 1, text: "Først beregn forventet avkastning" },
                { level: 2, text: "Var = Σ P_i × (R_i - E(R))²" },
                { level: 3, text: "SD = √Var" }
            ],
            tags: ["portefølje", "standardavvik", "varians", "risiko"],
            source: "BØK260 2023 Q8"
        },
        {
            id: "cf_port_calc_003",
            module: "corporate_finance",
            topic: "portfolio",
            difficulty: "medium",
            type: "calculation",
            title: "Portefølje Beta",
            description: "Beregn porteføljens beta.",
            data: {
                assets: [
                    { name: "A", beta: 0.4, weight: 0.20 },
                    { name: "B", beta: 1.6, weight: 0.10 },
                    { name: "C", beta: 2.0, weight: 0.30 },
                    { name: "D", beta: 1.0, weight: 0.20 },
                    { name: "E", beta: 0.75, weight: 0.20 }
                ]
            },
            input_fields: [
                { id: "portfolio_beta", label: "Portefølje Beta", unit: "", decimals: 2 }
            ],
            solution: {
                portfolio_beta: 1.19,
                calculation: "β_p = 0.4×0.2 + 1.6×0.1 + 2.0×0.3 + 1.0×0.2 + 0.75×0.2 = 1.19",
                tolerance: 0.02
            },
            explanation: "Portefølje-beta er vektet gjennomsnitt av individuelle betaer: β_p = Σ w_i × β_i",
            hints: [
                { level: 1, text: "β_p = Σ (vekt × beta)" },
                { level: 2, text: "Multipliser hver beta med vekten og summer" }
            ],
            tags: ["portefølje", "beta", "capm", "risiko"],
            source: "BØK260 Final 2022 Q12"
        },
        {
            id: "cf_port_mc_001",
            module: "corporate_finance",
            topic: "portfolio",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Mest aggressive aksje",
            question: "Hvilken aksje er mest aggressiv i porteføljen?",
            data: {
                assets: [
                    { name: "A", beta: 0.4 },
                    { name: "B", beta: 1.6 },
                    { name: "C", beta: 2.0 },
                    { name: "D", beta: 1.0 },
                    { name: "E", beta: 0.75 }
                ]
            },
            options: [
                { id: "a", text: "A" },
                { id: "b", text: "B" },
                { id: "c", text: "C", correct: true },
                { id: "d", text: "D" },
                { id: "e", text: "E" }
            ],
            solution: {
                correct: "c",
                explanation: "En 'aggressiv' aksje har høy beta (> 1), som betyr at den beveger seg mer enn markedet. Aksje C har høyest beta (2.0), så den er mest aggressiv."
            },
            hints: [
                { level: 1, text: "Aggressiv = høy beta" },
                { level: 2, text: "Beta > 1 betyr mer volatil enn markedet" }
            ],
            tags: ["portefølje", "beta", "aggressiv", "defensiv"],
            source: "BØK260 Final 2022 Q11"
        }
    ],
    
    // ==================== ANNUITETER & LÅN ====================
    
    annuity_questions: [
        {
            id: "cf_ann_calc_001",
            module: "corporate_finance",
            topic: "annuity",
            difficulty: "medium",
            type: "calculation",
            title: "Annuity Due",
            description: "Beregn nåverdien av en annuitet som starter umiddelbart.",
            question: "Du tilbys en 10-års annuitet som betaler $1000 per år, med første betaling umiddelbart. Renten er 5%. Hva er maksimum du bør betale?",
            data: {
                payment: 1000,
                years: 10,
                rate: 0.05,
                type: "due"
            },
            input_fields: [
                { id: "pv_ordinary", label: "PV ordinær annuitet", unit: "$" },
                { id: "pv_due", label: "PV annuity due", unit: "$" }
            ],
            solution: {
                pv_ordinary: 7721.73,
                pv_due: 8107.82,
                tolerance: 10
            },
            explanation: "Annuity due starter med betaling i dag. PV = PMT × [(1-(1+r)^-n)/r] × (1+r) = 1000 × 7.7217 × 1.05 = 8107.82",
            hints: [
                { level: 1, text: "Annuity due = Ordinær annuitet × (1+r)" },
                { level: 2, text: "Beregn først ordinær annuitet" }
            ],
            tags: ["annuitet", "annuity-due", "nåverdi"],
            source: "BØK260 Final 2022 Q7"
        },
        {
            id: "cf_ann_calc_002",
            module: "corporate_finance",
            topic: "annuity",
            difficulty: "medium",
            type: "calculation",
            title: "Utsatt Annuitet",
            description: "Beregn nåverdi av en annuitet som starter senere.",
            question: "Din far tilbyr å betale deg $100 per år i tre år, med første betaling 2 år fra i dag. Diskonteringsrenten er 9%. Hva er nåverdien?",
            data: {
                payment: 100,
                years: 3,
                start_year: 2,
                rate: 0.09
            },
            input_fields: [
                { id: "pv_year1", label: "PV i år 1", unit: "$" },
                { id: "pv_today", label: "PV i dag", unit: "$" }
            ],
            solution: {
                pv_year1: 253.13,
                pv_today: 232.23,
                tolerance: 1
            },
            explanation: "Først beregn PV av annuiteten som om den startet i år 1: PV_1 = 100 × [(1-1.09^-3)/0.09] = 253.13. Deretter diskonter ett år til: PV_0 = 253.13/1.09 = 232.23",
            hints: [
                { level: 1, text: "Beregn først PV ved start av annuiteten" },
                { level: 2, text: "Diskonter deretter tilbake til i dag" }
            ],
            tags: ["annuitet", "utsatt", "nåverdi"],
            source: "BØK260 Final 2022 Q19"
        },
        {
            id: "cf_ann_calc_003",
            module: "corporate_finance",
            topic: "annuity",
            difficulty: "hard",
            type: "calculation",
            title: "Restgjeld på lån",
            description: "Beregn gjenstående saldo på et lån.",
            question: "For 6 år siden tok din venn opp et lån på $150,000 over 10 år til 12% rente (årlig). Hun har gjort regulære årlige betalinger. Hvor mye må hun betale for å innfri lånet nå?",
            data: {
                original_loan: 150000,
                total_years: 10,
                years_paid: 6,
                rate: 0.12
            },
            input_fields: [
                { id: "annual_payment", label: "Årlig betaling", unit: "$" },
                { id: "remaining_balance", label: "Restgjeld", unit: "$" }
            ],
            solution: {
                annual_payment: 26549.04,
                remaining_balance: 80660.45,
                tolerance: 100
            },
            explanation: "Årlig betaling = 150000 × [r(1+r)^n]/[(1+r)^n-1] = 26549. Etter 6 betalinger, 4 år gjenstår. Restgjeld = PV av 4 gjenværende betalinger = 26549 × [(1-1.12^-4)/0.12] = 80660",
            hints: [
                { level: 1, text: "Finn først årlig betaling med annuitetsformelen" },
                { level: 2, text: "Restgjeld = PV av gjenværende betalinger" }
            ],
            tags: ["lån", "annuitet", "restgjeld", "amortisering"],
            source: "BØK260 Practice Q4"
        }
    ],
    
    // ==================== VALUTA & HEDGING ====================
    
    forex_questions: [
        {
            id: "cf_fx_mc_001",
            module: "corporate_finance",
            topic: "forex",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Forward Premium/Discount",
            question: "Spot-kurs S(NOK/USD) = 12, Forward-kurs F(NOK/USD) = 10. Hva er status for NOK og USD?",
            options: [
                { id: "a", text: "Premium; Discount" },
                { id: "b", text: "Premium; Premium" },
                { id: "c", text: "Discount; Premium", correct: true },
                { id: "d", text: "Discount; Discount" },
                { id: "e", text: "Begge på par" }
            ],
            solution: {
                correct: "c",
                explanation: "Forward premium/discount = (F-S)/S = (10-12)/12 = -16.7%. USD selger til discount (forward < spot). NOK selger til premium (du trenger flere USD for å kjøpe NOK i fremtiden)."
            },
            hints: [
                { level: 1, text: "Premium betyr forward > spot" },
                { level: 2, text: "Når én valuta er på discount, er den andre på premium" }
            ],
            tags: ["valuta", "forward", "premium", "discount"],
            source: "BØK260 2023 Q20"
        },
        {
            id: "cf_fx_calc_001",
            module: "corporate_finance",
            topic: "forex",
            difficulty: "medium",
            type: "calculation",
            title: "Valuta Hedging med Opsjoner",
            description: "Vurder om hedging lønner seg.",
            question: "Ditt selskap har 100,000 AUD til gode om 3 måneder. Spot-kurs er 10 NOK/AUD. Du kan kjøpe en call-opsjon på AUD med premium 0.5 og strike 11 NOK/AUD. Forventet kurs: 7 NOK/AUD (40% sjanse) eller 13 NOK/AUD (60% sjanse). Bør du hedge?",
            data: {
                receivable: 100000,
                spot: 10,
                option_premium: 0.5,
                strike: 11,
                scenario_low: { rate: 7, prob: 0.40 },
                scenario_high: { rate: 13, prob: 0.60 }
            },
            input_fields: [
                { id: "cost_hedge", label: "Forventet kostnad med hedge", unit: "NOK" },
                { id: "cost_no_hedge", label: "Forventet kostnad uten hedge", unit: "NOK" },
                { id: "should_hedge", label: "Hedge?", type: "boolean" }
            ],
            solution: {
                cost_hedge: 990000,
                cost_no_hedge: 1060000,
                should_hedge: true,
                tolerance: 5000
            },
            explanation: "Med hedge: Hvis kurs < strike, utøv opsjon → (11+0.5)×100k = 1.15M. Ellers, ikke utøv → (kurs+0.5)×100k. E[kostnad] = 0.4×(7+0.5)×100k + 0.6×(11+0.5)×100k = 990k. Uten hedge: E = 0.4×7×100k + 0.6×13×100k = 1060k.",
            hints: [
                { level: 1, text: "Call-opsjon gir rett (ikke plikt) til å kjøpe AUD til strike" },
                { level: 2, text: "Utøv opsjonen kun hvis markedskurs < strike" },
                { level: 3, text: "Sammenlign forventet kostnad med og uten hedge" }
            ],
            tags: ["valuta", "hedge", "opsjon", "call"],
            source: "BØK260 Final 2022 Q13"
        }
    ],
    
    // ==================== OPSJONER ====================
    
    option_questions: [
        {
            id: "cf_opt_mc_001",
            module: "corporate_finance",
            topic: "options",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Protective Put",
            question: "En protective put...",
            options: [
                { id: "a", text: "Setter en nedre grense på porteføljeverdien lik strike-prisen", correct: true },
                { id: "b", text: "Lar deg holde både put og call samtidig" },
                { id: "c", text: "Gir deg opsjon til å kjøpe aksje ved prisfall" },
                { id: "d", text: "Inkluderer salg av call og kjøp av put" }
            ],
            solution: {
                correct: "a",
                explanation: "En protective put er en strategi hvor du eier aksjen OG kjøper en put-opsjon. Put-opsjonen gir deg rett til å selge aksjen til strike-prisen, uansett hvor mye aksjen faller. Dette setter en 'gulv' under porteføljeverdien."
            },
            hints: [
                { level: 1, text: "Put gir rett til å SELGE" },
                { level: 2, text: "Tenk på det som forsikring mot kursfall" }
            ],
            tags: ["opsjoner", "put", "protective-put", "hedging"],
            source: "BØK260 Final 2022 Q5"
        },
        {
            id: "cf_opt_mc_002",
            module: "corporate_finance",
            topic: "options",
            difficulty: "easy",
            type: "multiple_choice",
            title: "Begrense tap ved prisfall",
            question: "Hvilken strategi begrenser ditt tap ved prisfall?",
            options: [
                { id: "a", text: "Price ceiling" },
                { id: "b", text: "Protective put", correct: true },
                { id: "c", text: "Deleveraging" }
            ],
            solution: {
                correct: "b",
                explanation: "Protective put fungerer som en 'price floor' (prisgulv) for din portefølje. Ved å kjøpe en put-opsjon sikrer du deg retten til å selge til en minimumspris (strike), uavhengig av hvor langt markedsprisen faller."
            },
            hints: [
                { level: 1, text: "Hva beskytter mot downside?" }
            ],
            tags: ["opsjoner", "protective-put", "risikostyring"],
            source: "BØK260 2023 Q19"
        }
    ],

    // ==================== LEVERAGE ====================
    
    leverage_questions: [
        {
            id: "cf_lev_calc_001",
            module: "corporate_finance",
            topic: "leverage",
            difficulty: "medium",
            type: "excel_grid",
            title: "Financial Leverage Effects",
            description: "Analyser effekten av finansiell leverage på ROE.",
            scenario: "Bergen Shipping AS sammenligner to kapitalstrukturer: Plan A (ingen gjeld) og Plan B (med gjeld). Analyser hvordan EBIT-endringer påvirker ROE.",
            data: {
                plan_a: { equity: 10000000, debt: 0 },
                plan_b: { equity: 6000000, debt: 4000000, interest_rate: 0.08 },
                tax_rate: 0.22,
                scenarios: [
                    { name: "Base", ebit: 1500000 },
                    { name: "Good", ebit: 2000000 },
                    { name: "Bad", ebit: 1000000 }
                ]
            },
            grid_config: {
                headers: ["", "Plan A (No Debt)", "Plan B (With Debt)"],
                rows: [
                    ["EBIT", "", ""],
                    ["Rentekostnad", "", ""],
                    ["EBT", "", ""],
                    ["Skatt (22%)", "", ""],
                    ["Nettoinntekt", "", ""],
                    ["Egenkapital", "", ""],
                    ["ROE (%)", "", ""]
                ]
            },
            solution: {
                base: {
                    plan_a: { interest: 0, ebt: 1500000, tax: 330000, ni: 1170000, roe: 11.7 },
                    plan_b: { interest: 320000, ebt: 1180000, tax: 259600, ni: 920400, roe: 15.34 }
                },
                tolerance: { roe: 0.1 }
            },
            explanation: "Leverage forstørrer (magnifies) avkastningen. Når EBIT er høy, gir gjeld høyere ROE. Men ved lav EBIT, kan ROE bli lavere (eller negativ) pga faste rentekostnader.",
            hints: [
                { level: 1, text: "Rentekostnad = Gjeld × Rentesats" },
                { level: 2, text: "ROE = Nettoinntekt / Egenkapital" }
            ],
            tags: ["leverage", "roe", "kapitalstruktur", "gearing"],
            source: "BØK260 Practice Financial Leverage"
        }
    ],

    // ==================== HJELPEFUNKSJONER ====================
    
    /**
     * Hent alle spørsmål som flat liste
     */
    getAllQuestions: function() {
        var all = [];
        all = all.concat(this.npv_questions);
        all = all.concat(this.bond_questions);
        all = all.concat(this.stock_questions);
        all = all.concat(this.wacc_questions);
        all = all.concat(this.portfolio_questions);
        all = all.concat(this.annuity_questions);
        all = all.concat(this.forex_questions);
        all = all.concat(this.option_questions);
        all = all.concat(this.leverage_questions);
        return all;
    },
    
    /**
     * Hent spørsmål gruppert etter topic
     */
    getQuestionsByTopic: function() {
        return {
            npv: this.npv_questions,
            bonds: this.bond_questions,
            stocks: this.stock_questions,
            wacc: this.wacc_questions,
            portfolio: this.portfolio_questions,
            annuity: this.annuity_questions,
            forex: this.forex_questions,
            options: this.option_questions,
            leverage: this.leverage_questions
        };
    },
    
    /**
     * Tell spørsmål per topic
     */
    countByTopic: function() {
        var counts = {};
        var all = this.getAllQuestions();
        all.forEach(function(q) {
            counts[q.topic] = (counts[q.topic] || 0) + 1;
        });
        return counts;
    }
};

// Eksporter
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CorporateFinanceSeedData;
}
