/**
 * AccountingQuest - Corporate Finance Seed Data (Secure Version)
 * 
 * Splitter data i to deler:
 * 1. questions - Det studenten ser (ingen fasit/hints)
 * 2. solutions - Fasit, hints, forklaringer (hentes on-demand)
 * 
 * Struktur i Firebase:
 * questions/corporate_finance/{topic}/{difficulty}/{id}
 * solutions/corporate_finance/{id}
 */

var CorporateFinanceSeed = {
    
    // ==================== NPV QUESTIONS ====================
    
    questions: {
        npv: [
            {
                id: "cf_npv_mc_001",
                module: "corporate_finance",
                topic: "npv",
                difficulty: "easy",
                type: "multiple_choice",
                title: "NPV Definisjon",
                question: "Hva måler Net Present Value (NPV)?",
                options: [
                    { id: "a", text: "Prosjektets totale kontantstrømmer uten diskontering" },
                    { id: "b", text: "Nåverdien av fremtidige kontantstrømmer minus initial investering" },
                    { id: "c", text: "Prosjektets internrente" },
                    { id: "d", text: "Gjennomsnittlig årlig avkastning" }
                ],
                tags: ["npv", "definisjon", "grunnleggende"]
            },
            {
                id: "cf_npv_mc_002",
                module: "corporate_finance",
                topic: "npv",
                difficulty: "easy",
                type: "multiple_choice",
                title: "NPV Beslutningsregel",
                question: "Når bør et uavhengig prosjekt aksepteres basert på NPV?",
                options: [
                    { id: "a", text: "Når NPV = 0" },
                    { id: "b", text: "Når NPV < 0" },
                    { id: "c", text: "Når NPV > 0" },
                    { id: "d", text: "Når NPV er høyere enn IRR" }
                ],
                tags: ["npv", "beslutningsregel"]
            },
            {
                id: "cf_npv_calc_001",
                module: "corporate_finance",
                topic: "npv",
                difficulty: "medium",
                type: "calculation",
                title: "Enkel NPV Beregning",
                description: "Et prosjekt krever en investering på 100 000 kr i dag og gir følgende kontantstrømmer: År 1: 40 000 kr, År 2: 50 000 kr, År 3: 45 000 kr. Diskonteringsrenten er 10%. Beregn NPV.",
                data: {
                    initial_investment: 100000,
                    cash_flows: [40000, 50000, 45000],
                    discount_rate: 0.10
                },
                input_fields: [
                    { id: "npv", label: "NPV", unit: "kr" }
                ],
                tags: ["npv", "beregning", "diskontering"]
            },
            {
                id: "cf_npv_calc_002",
                module: "corporate_finance",
                topic: "npv",
                difficulty: "medium",
                type: "excel_grid",
                title: "NPV med Tabell",
                description: "Fyll ut tabellen for å beregne NPV. Investeringen er 50 000 kr, og kontantstrømmene er: År 1: 20 000, År 2: 25 000, År 3: 20 000. Rente: 8%.",
                data: {
                    rate: 0.08
                },
                grid_config: {
                    columns: ["År", "Kontantstrøm", "Diskonteringsfaktor", "Nåverdi"],
                    rows: 5,
                    editable_cells: [
                        {row: 1, col: 2}, {row: 1, col: 3},
                        {row: 2, col: 2}, {row: 2, col: 3},
                        {row: 3, col: 2}, {row: 3, col: 3},
                        {row: 4, col: 3}
                    ],
                    prefilled: {
                        "0,0": "0", "0,1": "-50000",
                        "1,0": "1", "1,1": "20000",
                        "2,0": "2", "2,1": "25000",
                        "3,0": "3", "3,1": "20000",
                        "4,0": "Sum", "4,1": ""
                    }
                },
                tags: ["npv", "excel", "tabell"]
            }
        ],
        
        bonds: [
            {
                id: "cf_bond_mc_001",
                module: "corporate_finance",
                topic: "bonds",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Obligasjonspris og Rente",
                question: "Hva skjer med prisen på en obligasjon når markedsrenten stiger?",
                options: [
                    { id: "a", text: "Prisen stiger" },
                    { id: "b", text: "Prisen synker" },
                    { id: "c", text: "Prisen forblir uendret" },
                    { id: "d", text: "Avhenger av kupongrenten" }
                ],
                tags: ["obligasjon", "rente", "pris"]
            },
            {
                id: "cf_bond_mc_002",
                module: "corporate_finance",
                topic: "bonds",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Premium vs Discount Bond",
                question: "En obligasjon handles til premium når:",
                options: [
                    { id: "a", text: "Kupongrenten er lavere enn YTM" },
                    { id: "b", text: "Kupongrenten er lik YTM" },
                    { id: "c", text: "Kupongrenten er høyere enn YTM" },
                    { id: "d", text: "Obligasjonen har kort løpetid" }
                ],
                tags: ["obligasjon", "premium", "discount"]
            },
            {
                id: "cf_bond_calc_001",
                module: "corporate_finance",
                topic: "bonds",
                difficulty: "medium",
                type: "calculation",
                title: "Obligasjonspris",
                description: "En obligasjon har pålydende 1000 kr, kupongrente 6% (årlig), og 5 år til forfall. YTM er 8%. Beregn obligasjonens pris.",
                data: {
                    face_value: 1000,
                    coupon_rate: 0.06,
                    years: 5,
                    ytm: 0.08
                },
                input_fields: [
                    { id: "price", label: "Obligasjonspris", unit: "kr" }
                ],
                tags: ["obligasjon", "prising", "kupong"]
            }
        ],
        
        stocks: [
            {
                id: "cf_stock_mc_001",
                module: "corporate_finance",
                topic: "stocks",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Gordon Growth Model",
                question: "Gordon Growth Model (DDM) forutsetter at:",
                options: [
                    { id: "a", text: "Dividenden vokser med variabel rate" },
                    { id: "b", text: "Dividenden vokser med konstant rate for alltid" },
                    { id: "c", text: "Selskapet ikke betaler dividende" },
                    { id: "d", text: "Vekstraten er høyere enn avkastningskravet" }
                ],
                tags: ["aksje", "ddm", "gordon"]
            },
            {
                id: "cf_stock_calc_001",
                module: "corporate_finance",
                topic: "stocks",
                difficulty: "medium",
                type: "calculation",
                title: "DDM Verdsettelse",
                description: "Et selskap betalte nettopp dividende på 5 kr per aksje. Dividenden forventes å vokse 4% årlig. Avkastningskravet er 10%. Hva er aksjeprisen?",
                data: {
                    D0: 5,
                    g: 0.04,
                    r: 0.10
                },
                input_fields: [
                    { id: "price", label: "Aksjepris", unit: "kr" }
                ],
                tags: ["aksje", "ddm", "verdsettelse"]
            }
        ],
        
        wacc: [
            {
                id: "cf_wacc_mc_001",
                module: "corporate_finance",
                topic: "wacc",
                difficulty: "easy",
                type: "multiple_choice",
                title: "WACC Definisjon",
                question: "WACC representerer:",
                options: [
                    { id: "a", text: "Kun kostnaden for egenkapital" },
                    { id: "b", text: "Kun kostnaden for gjeld" },
                    { id: "c", text: "Vektet gjennomsnittlig kapitalkostnad for alle finansieringskilder" },
                    { id: "d", text: "Risikofri rente pluss risikopremie" }
                ],
                tags: ["wacc", "definisjon"]
            },
            {
                id: "cf_wacc_mc_002",
                module: "corporate_finance",
                topic: "wacc",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Skatteskjold",
                question: "Hvorfor brukes gjeldskostnad etter skatt i WACC?",
                options: [
                    { id: "a", text: "Fordi gjeld alltid er billigere" },
                    { id: "b", text: "Fordi rentekostnader er skattemessig fradragsberettiget" },
                    { id: "c", text: "Fordi egenkapital ikke har skatteeffekt" },
                    { id: "d", text: "Det er en regnskapsmessig konvensjon" }
                ],
                tags: ["wacc", "skatt", "gjeld"]
            },
            {
                id: "cf_wacc_calc_001",
                module: "corporate_finance",
                topic: "wacc",
                difficulty: "hard",
                type: "calculation",
                title: "WACC Beregning",
                description: "Et selskap har 60% egenkapital og 40% gjeld. Egenkapitalkostnaden er 12%, gjeldskostnaden er 6%, og skattesatsen er 25%. Beregn WACC.",
                data: {
                    equity_weight: 0.60,
                    debt_weight: 0.40,
                    cost_of_equity: 0.12,
                    cost_of_debt: 0.06,
                    tax_rate: 0.25
                },
                input_fields: [
                    { id: "wacc", label: "WACC", unit: "%" }
                ],
                tags: ["wacc", "beregning"]
            }
        ],
        
        portfolio: [
            {
                id: "cf_port_mc_001",
                module: "corporate_finance",
                topic: "portfolio",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Diversifisering",
                question: "Diversifisering reduserer primært:",
                options: [
                    { id: "a", text: "Systematisk risiko" },
                    { id: "b", text: "Usystematisk risiko" },
                    { id: "c", text: "Markedsrisiko" },
                    { id: "d", text: "Forventet avkastning" }
                ],
                tags: ["portefølje", "diversifisering", "risiko"]
            },
            {
                id: "cf_port_calc_001",
                module: "corporate_finance",
                topic: "portfolio",
                difficulty: "medium",
                type: "calculation",
                title: "Porteføljeavkastning",
                description: "En portefølje består av: Aksje A (40%, forventet 12%), Aksje B (35%, forventet 8%), Aksje C (25%, forventet 15%). Beregn forventet porteføljeavkastning.",
                data: {
                    assets: [
                        { weight: 0.40, return: 0.12 },
                        { weight: 0.35, return: 0.08 },
                        { weight: 0.25, return: 0.15 }
                    ]
                },
                input_fields: [
                    { id: "expected_return", label: "Forventet avkastning", unit: "%" }
                ],
                tags: ["portefølje", "avkastning"]
            }
        ],
        
        annuity: [
            {
                id: "cf_ann_calc_001",
                module: "corporate_finance",
                topic: "annuity",
                difficulty: "medium",
                type: "calculation",
                title: "Nåverdi av Annuitet",
                description: "Du skal motta 10 000 kr per år i 5 år, første betaling om 1 år. Renten er 6%. Hva er nåverdien?",
                data: {
                    payment: 10000,
                    years: 5,
                    rate: 0.06
                },
                input_fields: [
                    { id: "pv", label: "Nåverdi", unit: "kr" }
                ],
                tags: ["annuitet", "nåverdi"]
            }
        ],
        
        forex: [
            {
                id: "cf_fx_mc_001",
                module: "corporate_finance",
                topic: "forex",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Valutakursnotering",
                question: "Hvis EUR/NOK = 11.50, hva koster 1 euro?",
                options: [
                    { id: "a", text: "0.087 NOK" },
                    { id: "b", text: "11.50 NOK" },
                    { id: "c", text: "11.50 EUR" },
                    { id: "d", text: "Kan ikke beregnes" }
                ],
                tags: ["forex", "valutakurs"]
            }
        ],
        
        options: [
            {
                id: "cf_opt_mc_001",
                module: "corporate_finance",
                topic: "options",
                difficulty: "easy",
                type: "multiple_choice",
                title: "Call vs Put",
                question: "En call-opsjon gir eieren rett til å:",
                options: [
                    { id: "a", text: "Selge underliggende til strike price" },
                    { id: "b", text: "Kjøpe underliggende til strike price" },
                    { id: "c", text: "Motta dividende" },
                    { id: "d", text: "Stemme på generalforsamling" }
                ],
                tags: ["opsjon", "call", "definisjon"]
            }
        ],
        
        leverage: [
            {
                id: "cf_lev_mc_001",
                module: "corporate_finance",
                topic: "leverage",
                difficulty: "medium",
                type: "multiple_choice",
                title: "MM Proposisjon I",
                question: "Modigliani-Miller Proposisjon I (uten skatt) sier at:",
                options: [
                    { id: "a", text: "Firmaverdi øker med mer gjeld" },
                    { id: "b", text: "Firmaverdi avhenger ikke av kapitalstruktur" },
                    { id: "c", text: "Egenkapitalkostnaden er konstant" },
                    { id: "d", text: "WACC øker med gearing" }
                ],
                tags: ["mm", "kapitalstruktur"]
            }
        ]
    },
    
    // ==================== SOLUTIONS (SEPARAT) ====================
    
    solutions: {
        // NPV Solutions
        cf_npv_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 NPV handler om å sammenligne verdier på SAMME tidspunkt" },
                { level: 2, text: "📐 Tenk på tidsverdien av penger - 100 kr i dag ≠ 100 kr om 5 år" },
                { level: 3, text: "✅ NPV = Σ(CF_t / (1+r)^t) - Investering_0" }
            ],
            explanation: "**Net Present Value (NPV)** måler verdiskapning fra et prosjekt.\n\n" +
                "📐 **Formel:**\n" +
                "NPV = -I₀ + CF₁/(1+r)¹ + CF₂/(1+r)² + ... + CFₙ/(1+r)ⁿ\n\n" +
                "**Hva betyr dette?**\n" +
                "• Vi diskonterer ALLE fremtidige kontantstrømmer til dagens verdi\n" +
                "• Så trekker vi fra den initiale investeringen\n" +
                "• Resultatet viser hvor mye verdi prosjektet skaper\n\n" +
                "**NPV > 0:** Prosjektet skaper verdi ✅\n" +
                "**NPV < 0:** Prosjektet ødelegger verdi ❌\n" +
                "**NPV = 0:** Break-even",
            formula: "NPV = -I₀ + Σ(CFₜ / (1+r)^t)",
            learning_objectives: ["Forstå NPV-konseptet", "Forstå tidsverdien av penger"]
        },
        
        cf_npv_mc_002: {
            correct: "c",
            hints: [
                { level: 1, text: "💡 NPV måler verdiskapning - når skaper et prosjekt verdi?" },
                { level: 2, text: "📐 Positiv NPV betyr at nåverdien av inntekter > nåverdien av kostnader" },
                { level: 3, text: "✅ Aksepter hvis NPV > 0 (prosjektet skaper verdi for aksjonærene)" }
            ],
            explanation: "**NPV Beslutningsregel:**\n\n" +
                "| NPV | Beslutning | Begrunnelse |\n" +
                "|-----|------------|-------------|\n" +
                "| > 0 | **Aksepter** | Skaper verdi |\n" +
                "| = 0 | Indifferent | Break-even |\n" +
                "| < 0 | **Avslå** | Ødelegger verdi |\n\n" +
                "**Hvorfor fungerer dette?**\n" +
                "NPV > 0 betyr at prosjektets avkastning er HØYERE enn avkastningskravet (diskonteringsrenten).\n\n" +
                "Dette øker aksjonærverdien! ✅",
            formula: "Aksepter hvis NPV > 0",
            learning_objectives: ["Anvende NPV-beslutningsregelen"]
        },
        
        cf_npv_calc_001: {
            correct: { npv: 12566 },
            tolerance: 100,
            hints: [
                { level: 1, text: "💡 Diskonter hver kontantstrøm separat: CF/(1+r)^t" },
                { level: 2, text: "📐 År 1: 40000/1.10 = 36364, År 2: 50000/1.10² = ?, År 3: 45000/1.10³ = ?" },
                { level: 3, text: "✅ NPV = -100000 + 36364 + 41322 + 33802 = 12566 kr" }
            ],
            explanation: "**NPV Beregning Steg-for-Steg:**\n\n" +
                "📐 **Formel:** NPV = -I₀ + Σ(CFₜ / (1+r)^t)\n\n" +
                "**Beregning:**\n\n" +
                "| År | CF | Faktor 1/(1.10)^t | Nåverdi |\n" +
                "|----|-------|-------------------|--------|\n" +
                "| 0 | -100,000 | 1.000 | -100,000 |\n" +
                "| 1 | 40,000 | 0.909 | 36,364 |\n" +
                "| 2 | 50,000 | 0.826 | 41,322 |\n" +
                "| 3 | 45,000 | 0.751 | 33,802 |\n" +
                "| **Sum** | | | **11,488** |\n\n" +
                "**NPV ≈ 12,566 kr** ✅\n\n" +
                "Siden NPV > 0, bør prosjektet aksepteres!",
            formula: "NPV = -100000 + 40000/1.10 + 50000/1.10² + 45000/1.10³"
        },
        
        cf_npv_calc_002: {
            correct: {
                "1,2": 0.926, "1,3": 18519,
                "2,2": 0.857, "2,3": 21433,
                "3,2": 0.794, "3,3": 15876,
                "4,3": 5828
            },
            tolerance: 50,
            hints: [
                { level: 1, text: "💡 Diskonteringsfaktor = 1/(1+r)^t der r=8% og t=år" },
                { level: 2, text: "📐 År 1: 1/1.08=0.926, År 2: 1/1.08²=0.857, År 3: 1/1.08³=0.794" },
                { level: 3, text: "✅ Nåverdi = Kontantstrøm × Faktor. Sum alle nåverdier for NPV." }
            ],
            explanation: "**NPV-tabell utfylt:**\n\n" +
                "| År | CF | Faktor | Nåverdi |\n" +
                "|----|--------|--------|--------|\n" +
                "| 0 | -50,000 | 1.000 | -50,000 |\n" +
                "| 1 | 20,000 | 0.926 | 18,519 |\n" +
                "| 2 | 25,000 | 0.857 | 21,433 |\n" +
                "| 3 | 20,000 | 0.794 | 15,876 |\n" +
                "| **NPV** | | | **5,828** |\n\n" +
                "**Diskonteringsfaktor:**\n" +
                "• År 1: 1/1.08 = 0.9259\n" +
                "• År 2: 1/1.08² = 0.8573\n" +
                "• År 3: 1/1.08³ = 0.7938",
            formula: "Faktor = 1/(1+r)^t, Nåverdi = CF × Faktor"
        },
        
        // Bond Solutions
        cf_bond_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 Obligasjonspris = Nåverdi av fremtidige kuponger + nåverdi av pålydende" },
                { level: 2, text: "📐 Høyere rente → høyere diskontering → lavere nåverdi" },
                { level: 3, text: "✅ Rente ↑ = Pris ↓ (invers sammenheng)" }
            ],
            explanation: "**Obligasjonspriser og Renter:**\n\n" +
                "🔑 **Hovedregel:** Rente og pris beveger seg i MOTSATT retning!\n\n" +
                "**Hvorfor?**\n" +
                "Obligasjonspris = PV(kuponger) + PV(pålydende)\n\n" +
                "Når renten stiger:\n" +
                "• Diskonteringsfaktoren øker\n" +
                "• Nåverdien av fremtidige CF synker\n" +
                "• Obligasjonsprisen FALLER\n\n" +
                "**Eksempel:**\n" +
                "En kupong på 50 kr om 1 år:\n" +
                "• Ved 5% rente: 50/1.05 = 47.62 kr\n" +
                "• Ved 10% rente: 50/1.10 = 45.45 kr ↓",
            formula: "Pris = Σ(Kupong/(1+r)^t) + Pålydende/(1+r)^n"
        },
        
        cf_bond_mc_002: {
            correct: "c",
            hints: [
                { level: 1, text: "💡 Premium = Pris > Pålydende. Discount = Pris < Pålydende." },
                { level: 2, text: "📐 Sammenlign kupongrente med YTM (yield to maturity)" },
                { level: 3, text: "✅ Kupong > YTM → Investorer betaler mer → Premium" }
            ],
            explanation: "**Premium vs Discount Obligasjoner:**\n\n" +
                "| Forhold | Pris | Type |\n" +
                "|---------|------|------|\n" +
                "| Kupong > YTM | > Pålydende | **Premium** |\n" +
                "| Kupong = YTM | = Pålydende | **Par** |\n" +
                "| Kupong < YTM | < Pålydende | **Discount** |\n\n" +
                "**Intuisjon:**\n" +
                "Hvis obligasjonen gir 8% kupong, men markedet kun krever 5%, er den attraktiv → investorer byr opp prisen over pålydende.",
            formula: "Kupong > YTM → Premium"
        },
        
        cf_bond_calc_001: {
            correct: { price: 920.15 },
            tolerance: 2,
            hints: [
                { level: 1, text: "💡 Pris = PV av kuponger + PV av pålydende" },
                { level: 2, text: "📐 Kupong = 1000 × 6% = 60 kr/år. Bruk annuitetsformel for kupongene." },
                { level: 3, text: "✅ PV(kuponger) = 60 × [(1-1.08^-5)/0.08] = 239.56. PV(pål) = 1000/1.08^5 = 680.58" }
            ],
            explanation: "**Obligasjonsprising:**\n\n" +
                "📐 **Formel:**\n" +
                "Pris = Kupong × [1-(1+r)^-n]/r + Pålydende/(1+r)^n\n\n" +
                "**Gitt:**\n" +
                "• Pålydende = 1000 kr\n" +
                "• Kupong = 1000 × 6% = 60 kr/år\n" +
                "• n = 5 år, YTM = 8%\n\n" +
                "**Beregning:**\n" +
                "PV(kuponger) = 60 × [(1 - 1.08^-5) / 0.08]\n" +
                "= 60 × 3.9927 = **239.56 kr**\n\n" +
                "PV(pålydende) = 1000 / 1.08^5\n" +
                "= 1000 / 1.4693 = **680.58 kr**\n\n" +
                "**Pris = 239.56 + 680.58 = 920.15 kr** ✅\n\n" +
                "💡 Prisen er under pålydende (discount) fordi YTM (8%) > Kupong (6%)",
            formula: "P = C×[(1-(1+r)^-n)/r] + FV/(1+r)^n"
        },
        
        // Stock Solutions
        cf_stock_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 Gordon Growth Model kalles også 'constant growth DDM'" },
                { level: 2, text: "📐 Formelen P = D1/(r-g) krever at g er konstant" },
                { level: 3, text: "✅ Modellen forutsetter konstant vekst for ALLTID (perpetuitet)" }
            ],
            explanation: "**Gordon Growth Model (DDM):**\n\n" +
                "📐 **Formel:**\n" +
                "P₀ = D₁ / (r - g)\n\n" +
                "**Forutsetninger:**\n" +
                "1. Dividenden vokser med **konstant rate g** for alltid\n" +
                "2. Vekstraten g < avkastningskravet r\n" +
                "3. Selskapet betaler dividende\n\n" +
                "**Eksempel:**\n" +
                "• D₁ = 5 kr, r = 10%, g = 3%\n" +
                "• P = 5 / (0.10 - 0.03) = 5 / 0.07 = **71.43 kr**",
            formula: "P₀ = D₁ / (r - g)"
        },
        
        cf_stock_calc_001: {
            correct: { price: 86.67 },
            tolerance: 1,
            hints: [
                { level: 1, text: "💡 D₀ er dividenden som NETTOPP ble utbetalt. D₁ = D₀ × (1+g)" },
                { level: 2, text: "📐 D₁ = 5 × 1.04 = 5.20 kr" },
                { level: 3, text: "✅ P = D₁/(r-g) = 5.20/(0.10-0.04) = 5.20/0.06 = 86.67 kr" }
            ],
            explanation: "**DDM Verdsettelse:**\n\n" +
                "📐 **Gordon Growth Model:**\n" +
                "P₀ = D₁ / (r - g)\n\n" +
                "**Steg 1: Beregn D₁**\n" +
                "D₁ = D₀ × (1 + g)\n" +
                "D₁ = 5 × 1.04 = **5.20 kr**\n\n" +
                "**Steg 2: Beregn pris**\n" +
                "P₀ = 5.20 / (0.10 - 0.04)\n" +
                "P₀ = 5.20 / 0.06\n" +
                "P₀ = **86.67 kr** ✅\n\n" +
                "💡 **Merk:** Vi bruker D₁ (neste dividende), ikke D₀ (sist utbetalt)!",
            formula: "P₀ = D₀(1+g) / (r-g)"
        },
        
        // WACC Solutions
        cf_wacc_mc_001: {
            correct: "c",
            hints: [
                { level: 1, text: "💡 WACC = Weighted Average Cost of Capital" },
                { level: 2, text: "📐 'Vektet gjennomsnitt' betyr at vi kombinerer flere kilder" },
                { level: 3, text: "✅ WACC inkluderer både egenkapital OG gjeld, vektet etter andel" }
            ],
            explanation: "**WACC (Weighted Average Cost of Capital):**\n\n" +
                "📐 **Formel:**\n" +
                "WACC = (E/V) × Re + (D/V) × Rd × (1-T)\n\n" +
                "**Komponenter:**\n" +
                "• E/V = Egenkapitalandel\n" +
                "• D/V = Gjeldsandel\n" +
                "• Re = Egenkapitalkostnad\n" +
                "• Rd = Gjeldskostnad\n" +
                "• T = Skattesats\n\n" +
                "WACC representerer selskapets totale kapitalkostnad - den minimumsavkastningen selskapet må tjene for å tilfredsstille ALLE kapitaltilbydere.",
            formula: "WACC = wE×Re + wD×Rd×(1-T)"
        },
        
        cf_wacc_mc_002: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 Rentekostnader reduserer skattbar inntekt" },
                { level: 2, text: "📐 Skattefradrag betyr at staten 'betaler' deler av rentene" },
                { level: 3, text: "✅ Effektiv gjeldskostnad = Rd × (1-T) fordi renter er fradragsberettiget" }
            ],
            explanation: "**Skatteskjold på Gjeld:**\n\n" +
                "🔑 **Hvorfor (1-T)?**\n\n" +
                "Rentekostnader er skattemessig fradragsberettiget:\n" +
                "• Hvis Rd = 6% og T = 25%\n" +
                "• Effektiv kostnad = 6% × (1 - 0.25) = **4.5%**\n\n" +
                "**Eksempel:**\n" +
                "• Gjeld = 1 000 000 kr\n" +
                "• Rente = 6% = 60 000 kr\n" +
                "• Skattefradrag = 60 000 × 25% = 15 000 kr\n" +
                "• Netto kostnad = 60 000 - 15 000 = **45 000 kr** (4.5%)\n\n" +
                "Dette er 'tax shield' - gjeld har en skattefordel!",
            formula: "Rd(etter skatt) = Rd × (1-T)"
        },
        
        cf_wacc_calc_001: {
            correct: { wacc: 9.0 },
            tolerance: 0.1,
            hints: [
                { level: 1, text: "💡 WACC = (E/V)×Re + (D/V)×Rd×(1-T)" },
                { level: 2, text: "📐 Gjeldskostnad etter skatt = 6% × (1-0.25) = 4.5%" },
                { level: 3, text: "✅ WACC = 0.60×12% + 0.40×4.5% = 7.2% + 1.8% = 9.0%" }
            ],
            explanation: "**WACC Beregning:**\n\n" +
                "📐 **Formel:**\n" +
                "WACC = (E/V) × Re + (D/V) × Rd × (1-T)\n\n" +
                "**Gitt:**\n" +
                "• E/V = 60%, D/V = 40%\n" +
                "• Re = 12%, Rd = 6%\n" +
                "• T = 25%\n\n" +
                "**Steg 1: Gjeldskostnad etter skatt**\n" +
                "Rd(1-T) = 6% × (1 - 0.25) = 6% × 0.75 = **4.5%**\n\n" +
                "**Steg 2: WACC**\n" +
                "WACC = 0.60 × 12% + 0.40 × 4.5%\n" +
                "WACC = 7.2% + 1.8%\n" +
                "WACC = **9.0%** ✅",
            formula: "WACC = 0.60×12% + 0.40×6%×0.75 = 9.0%"
        },
        
        // Portfolio Solutions
        cf_port_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 Det finnes to typer risiko: systematisk og usystematisk" },
                { level: 2, text: "📐 Systematisk = markedsrisiko (påvirker alt). Usystematisk = firmaspesifikk" },
                { level: 3, text: "✅ Diversifisering eliminerer firmaspesifikk risiko, ikke markedsrisiko" }
            ],
            explanation: "**Diversifisering og Risiko:**\n\n" +
                "📊 **To typer risiko:**\n\n" +
                "| Type | Eksempel | Kan diversifiseres? |\n" +
                "|------|----------|---------------------|\n" +
                "| Systematisk | Resesjon, renteøkning | ❌ Nei |\n" +
                "| Usystematisk | Produktfeil, lederskandaler | ✅ Ja |\n\n" +
                "**Hvorfor?**\n" +
                "Med mange aksjer 'jevnes' firmaspesifikke hendelser ut:\n" +
                "• Noen firmaer gjør det bra\n" +
                "• Andre gjør det dårlig\n" +
                "• I sum = markedsavkastning\n\n" +
                "💡 **30-40 aksjer** er ofte nok for full diversifisering!",
            formula: "Total risiko = Systematisk + Usystematisk"
        },
        
        cf_port_calc_001: {
            correct: { expected_return: 11.35 },
            tolerance: 0.1,
            hints: [
                { level: 1, text: "💡 Porteføljeavkastning = vektet gjennomsnitt av individuelle avkastninger" },
                { level: 2, text: "📐 E(Rp) = w₁×R₁ + w₂×R₂ + w₃×R₃" },
                { level: 3, text: "✅ E(Rp) = 0.40×12% + 0.35×8% + 0.25×15% = 4.8% + 2.8% + 3.75% = 11.35%" }
            ],
            explanation: "**Porteføljeavkastning:**\n\n" +
                "📐 **Formel:**\n" +
                "E(Rp) = Σ (wi × Ri)\n\n" +
                "**Beregning:**\n\n" +
                "| Aksje | Vekt | Avkastning | Bidrag |\n" +
                "|-------|------|------------|--------|\n" +
                "| A | 40% | 12% | 4.80% |\n" +
                "| B | 35% | 8% | 2.80% |\n" +
                "| C | 25% | 15% | 3.75% |\n" +
                "| **Sum** | 100% | | **11.35%** |\n\n" +
                "**E(Rp) = 11.35%** ✅",
            formula: "E(Rp) = 0.40×12% + 0.35×8% + 0.25×15%"
        },
        
        // Annuity Solutions
        cf_ann_calc_001: {
            correct: { pv: 42124 },
            tolerance: 50,
            hints: [
                { level: 1, text: "💡 En annuitet er en serie like store betalinger" },
                { level: 2, text: "📐 PV = PMT × [(1 - (1+r)^-n) / r]" },
                { level: 3, text: "✅ PV = 10000 × [(1 - 1.06^-5) / 0.06] = 10000 × 4.212 = 42,124 kr" }
            ],
            explanation: "**Nåverdi av Annuitet:**\n\n" +
                "📐 **Formel:**\n" +
                "PV = PMT × [(1 - (1+r)^-n) / r]\n\n" +
                "**Beregning:**\n" +
                "PV = 10,000 × [(1 - (1.06)^-5) / 0.06]\n\n" +
                "Annuitetsfaktor = (1 - 0.7473) / 0.06 = 0.2527 / 0.06 = **4.212**\n\n" +
                "PV = 10,000 × 4.212 = **42,124 kr** ✅\n\n" +
                "💡 **Alternativ:** Summer hver enkelt nåverdi:\n" +
                "PV = 10000/1.06 + 10000/1.06² + ... + 10000/1.06⁵",
            formula: "PV = PMT × [(1-(1+r)^-n) / r]"
        },
        
        // Forex Solutions
        cf_fx_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 EUR/NOK betyr 'prisen på 1 EUR i NOK'" },
                { level: 2, text: "📐 Formatet er: Basisvaluta/Prisvaluta = Pris" },
                { level: 3, text: "✅ EUR/NOK = 11.50 → 1 EUR koster 11.50 NOK" }
            ],
            explanation: "**Valutakursnotering:**\n\n" +
                "📐 **Format:** Basis/Pris = Kurs\n\n" +
                "EUR/NOK = 11.50 betyr:\n" +
                "• 1 EUR = 11.50 NOK\n" +
                "• For å kjøpe 1 euro, betaler du 11.50 kroner\n\n" +
                "**Vanlige noteringer:**\n" +
                "• EUR/NOK ≈ 11-12\n" +
                "• USD/NOK ≈ 10-11\n" +
                "• GBP/NOK ≈ 13-14\n\n" +
                "💡 Basisvalutaen (første) er alltid = 1",
            formula: "EUR/NOK = NOK per 1 EUR"
        },
        
        // Options Solutions
        cf_opt_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 Call = Kjøpsopsjon, Put = Salgsopsjon" },
                { level: 2, text: "📐 Strike price = den avtalte prisen" },
                { level: 3, text: "✅ Call gir RETT (ikke plikt) til å KJØPE til strike price" }
            ],
            explanation: "**Opsjoner - Grunnleggende:**\n\n" +
                "| Type | Rett til | Brukes når |\n" +
                "|------|----------|------------|\n" +
                "| **Call** | KJØPE til strike | Tror pris stiger |\n" +
                "| **Put** | SELGE til strike | Tror pris faller |\n\n" +
                "**Call-opsjon eksempel:**\n" +
                "• Strike = 100 kr\n" +
                "• Markedspris = 120 kr\n" +
                "• Verdi = 120 - 100 = **20 kr** (in-the-money)\n\n" +
                "💡 Opsjoner gir RETT, ikke PLIKT. Du betaler premie for denne retten.",
            formula: "Call payoff = max(S - K, 0)"
        },
        
        // Leverage Solutions
        cf_lev_mc_001: {
            correct: "b",
            hints: [
                { level: 1, text: "💡 MM = Modigliani og Miller, vinnere av Nobelprisen" },
                { level: 2, text: "📐 Proposisjon I handler om firmaverdi og kapitalstruktur" },
                { level: 3, text: "✅ I perfekte markeder (uten skatt): Kapitalstruktur er irrelevant!" }
            ],
            explanation: "**Modigliani-Miller Proposisjon I:**\n\n" +
                "🏆 **Teoremet (uten skatt):**\n" +
                "Firmaverdi avhenger IKKE av kapitalstruktur\n\n" +
                "V_levered = V_unlevered\n\n" +
                "**Forutsetninger:**\n" +
                "• Ingen skatt\n" +
                "• Ingen transaksjonskostnader\n" +
                "• Ingen konkurskostnader\n" +
                "• Perfekte kapitalmarkeder\n\n" +
                "**Intuisjon:**\n" +
                "Å dele en pizza i flere stykker endrer ikke pizzaens størrelse!\n\n" +
                "💡 I virkeligheten (MED skatt): Gjeld skaper verdi pga. tax shield.",
            formula: "V_L = V_U (uten skatt)"
        }
    },
    
    /**
     * Hent alle spørsmål (uten løsninger)
     */
    getAllQuestions: function() {
        var all = [];
        var self = this;
        Object.keys(this.questions).forEach(function(topic) {
            self.questions[topic].forEach(function(q) {
                all.push(q);
            });
        });
        return all;
    },
    
    /**
     * Hent alle løsninger
     */
    getAllSolutions: function() {
        return this.solutions;
    },
    
    /**
     * Hent spørsmål for et tema
     */
    getQuestionsByTopic: function(topic) {
        return this.questions[topic] || [];
    },
    
    /**
     * Hent løsning for et spørsmål
     */
    getSolution: function(questionId) {
        return this.solutions[questionId] || null;
    }
};

// Eksport
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CorporateFinanceSeed;
}
