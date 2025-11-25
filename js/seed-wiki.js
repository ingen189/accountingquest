/**
 * 📖 AccountingQuest Wiki Seeder
 * 
 * Seeder wiki-artikler til Firebase
 * Kjør dette én gang for å fylle databasen med innhold
 * 
 * BRUK:
 * 1. Åpne seed-wiki.html i nettleser
 * 2. Logg inn (krever autentisering)
 * 3. Klikk "Seed Wiki"
 */

const WikiSeeder = {
    
    // ===== WIKI ARTICLES =====
    articles: [
        // ==================
        // LOVVERK
        // ==================
        {
            id: 'mval-3-1',
            title: 'Utgående merverdiavgift',
            category: 'lovverk',
            law: 'MVAL',
            paragraph: '§ 3-1',
            tags: ['mva', 'utgående', 'avgift', 'merverdiavgift', 'salg', 'omsetning'],
            accounts: ['2700', '2701', '2702'],
            summary: 'Hovedregelen om avgiftsplikt ved omsetning av varer og tjenester',
            content: `
                <h2>Avgiftsplikt ved omsetning</h2>
                <p>Det skal beregnes merverdiavgift ved omsetning av varer og tjenester i Norge.</p>
                
                <div class="wiki-law-text">
                    Det skal beregnes og betales merverdiavgift av omsetning av varer og tjenester som er avgiftspliktige etter denne lov.
                </div>
                
                <h3>MVA-satser (2024)</h3>
                <ul>
                    <li><strong>Alminnelig sats:</strong> 25% - gjelder de fleste varer og tjenester</li>
                    <li><strong>Redusert sats:</strong> 15% - næringsmidler (mat og drikke)</li>
                    <li><strong>Lav sats:</strong> 12% - persontransport, overnatting, kino, kultur</li>
                    <li><strong>Nullsats:</strong> 0% - eksport, elektrisk kraft til husholdninger</li>
                </ul>
                
                <h3>Bokføring av utgående MVA</h3>
                <p>Ved salg med MVA:</p>
                <ul>
                    <li><strong>Debet:</strong> Kundefordringer (1500) med totalbeløp inkl. MVA</li>
                    <li><strong>Kredit:</strong> Salgsinntekt (3000) med nettobeløp</li>
                    <li><strong>Kredit:</strong> Utgående MVA (2700) med MVA-beløpet</li>
                </ul>
                
                <div class="wiki-info-box tip">
                    <div class="wiki-info-box-title">💡 Beregning</div>
                    MVA-beløp = Nettobeløp × MVA-sats<br>
                    Bruttobeløp = Nettobeløp × (1 + MVA-sats)
                </div>
            `,
            related: ['mval-8-1', 'mval-5-2']
        },
        {
            id: 'mval-8-1',
            title: 'Fradragsrett for inngående MVA',
            category: 'lovverk',
            law: 'MVAL',
            paragraph: '§ 8-1',
            tags: ['mva', 'fradrag', 'inngående', 'avgift', 'merverdiavgift', 'kjøp'],
            accounts: ['2710', '2711', '2712'],
            summary: 'Regler for fradrag av inngående merverdiavgift på kjøp',
            content: `
                <h2>Fradragsrett</h2>
                <p>Et registrert avgiftssubjekt har rett til fradrag for inngående merverdiavgift på anskaffelser til bruk i den registrerte virksomheten.</p>
                
                <div class="wiki-law-text">
                    Et registrert avgiftssubjekt har rett til fradrag for inngående merverdiavgift på anskaffelser av varer og tjenester som er til bruk i den registrerte virksomheten.
                </div>
                
                <h3>Vilkår for fradrag</h3>
                <ul>
                    <li>Virksomheten må være registrert i Merverdiavgiftsregisteret</li>
                    <li>Omsetning må være over kr 50 000 i løpet av 12 måneder</li>
                    <li>Anskaffelsen må være til bruk i avgiftspliktig virksomhet</li>
                    <li>Det må foreligge gyldig salgsdokumentasjon (faktura)</li>
                </ul>
                
                <h3>Bokføring av inngående MVA</h3>
                <p>Ved kjøp med MVA:</p>
                <ul>
                    <li><strong>Debet:</strong> Varekostnad/Kostnad (4000/6xxx) med nettobeløp</li>
                    <li><strong>Debet:</strong> Inngående MVA (2710) med MVA-beløpet</li>
                    <li><strong>Kredit:</strong> Leverandørgjeld (2400) eller Bank (1920)</li>
                </ul>
                
                <div class="wiki-info-box warning">
                    <div class="wiki-info-box-title">⚠️ Viktig</div>
                    Representasjonskostnader og personbiler har normalt ikke fradragsrett, selv om det er beregnet MVA på kjøpet.
                </div>
            `,
            related: ['mval-3-1', 'bokl-5-5']
        },
        {
            id: 'mval-5-2',
            title: 'Redusert MVA-sats på næringsmidler',
            category: 'lovverk',
            law: 'MVAL',
            paragraph: '§ 5-2',
            tags: ['mva', 'næringsmidler', 'mat', 'redusert sats', '15%'],
            accounts: ['2701'],
            summary: 'Bestemmelser om 15% MVA på matvarer',
            content: `
                <h2>Redusert sats på næringsmidler</h2>
                <p>Det skal beregnes merverdiavgift med redusert sats på omsetning av næringsmidler.</p>
                
                <div class="wiki-law-text">
                    Det skal beregnes merverdiavgift med redusert sats, 15 prosent, av omsetning, uttak og innførsel av næringsmidler.
                </div>
                
                <h3>Hva er næringsmidler?</h3>
                <ul>
                    <li>Mat og drikkevarer beregnet for mennesker</li>
                    <li>Råvarer til matproduksjon</li>
                    <li>Ikke alkoholholdige drikkevarer</li>
                </ul>
                
                <h3>Unntak (25% sats)</h3>
                <ul>
                    <li>Serveringstjenester (restauranter, kafeer)</li>
                    <li>Alkoholholdige drikkevarer</li>
                    <li>Tobakksvarer</li>
                </ul>
            `,
            related: ['mval-3-1']
        },
        {
            id: 'rskl-3-2',
            title: 'Årsregnskapets innhold',
            category: 'lovverk',
            law: 'RSKL',
            paragraph: '§ 3-2',
            tags: ['årsregnskap', 'resultatregnskap', 'balanse', 'noter', 'kontantstrøm'],
            summary: 'Hva årsregnskapet skal inneholde',
            content: `
                <h2>Årsregnskapets bestanddeler</h2>
                <p>Årsregnskapet skal bestå av følgende deler:</p>
                
                <div class="wiki-law-text">
                    Årsregnskapet skal inneholde resultatregnskap, balanse, kontantstrømoppstilling og noteopplysninger.
                </div>
                
                <h3>Obligatoriske deler</h3>
                <ul>
                    <li><strong>Resultatregnskap:</strong> Viser inntekter og kostnader i perioden</li>
                    <li><strong>Balanse:</strong> Viser eiendeler, gjeld og egenkapital på et tidspunkt</li>
                    <li><strong>Noter:</strong> Utfyllende informasjon til regnskapet</li>
                </ul>
                
                <h3>For større foretak</h3>
                <ul>
                    <li><strong>Kontantstrømoppstilling:</strong> Obligatorisk for store foretak</li>
                    <li><strong>Årsberetning:</strong> For regnskapspliktige som ikke er små</li>
                </ul>
                
                <div class="wiki-info-box info">
                    <div class="wiki-info-box-title">ℹ️ Små foretak</div>
                    Små foretak har forenklede krav og kan unnlate kontantstrømoppstilling og årsberetning.
                </div>
            `,
            related: ['rskl-5-3', 'rskl-4-1']
        },
        {
            id: 'rskl-5-3',
            title: 'Avskrivning av anleggsmidler',
            category: 'lovverk',
            law: 'RSKL',
            paragraph: '§ 5-3',
            tags: ['avskrivning', 'anleggsmidler', 'regnskap', 'verdifall', 'levetid'],
            accounts: ['1000', '1050', '1200', '1280', '6000', '6010'],
            summary: 'Regnskapslovens regler om avskrivning',
            content: `
                <h2>Avskrivning</h2>
                <p>Anleggsmidler som har begrenset økonomisk levetid, skal avskrives etter en fornuftig avskrivningsplan.</p>
                
                <div class="wiki-law-text">
                    Anleggsmidler som har begrenset økonomisk levetid, skal avskrives etter en fornuftig avskrivningsplan.
                </div>
                
                <h3>Avskrivningsmetoder</h3>
                <ul>
                    <li><strong>Lineær avskrivning:</strong> Like store beløp hvert år</li>
                    <li><strong>Saldoavskrivning:</strong> Fast prosent av bokført verdi</li>
                    <li><strong>Produksjonsenhetsmetoden:</strong> Basert på faktisk bruk</li>
                </ul>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Lineær avskrivning</div>
                    <div class="wiki-formula">Årlig avskrivning = (Anskaffelseskost - Restverdi) / Levetid</div>
                </div>
                
                <h3>Bokføring</h3>
                <ul>
                    <li><strong>Debet:</strong> Avskrivningskostnad (6000)</li>
                    <li><strong>Kredit:</strong> Akkumulerte avskrivninger (1050/1280)</li>
                </ul>
                
                <div class="wiki-info-box info">
                    <div class="wiki-info-box-title">ℹ️ Regnskapsmessig vs. skattemessig</div>
                    Regnskapsmessig avskrivning følger faktisk verdifall, mens skattemessig avskrivning følger saldogruppene i skatteloven § 14-43.
                </div>
            `,
            related: ['sktl-14-43']
        },
        {
            id: 'sktl-14-43',
            title: 'Saldoavskrivning (skattemessig)',
            category: 'lovverk',
            law: 'SKTL',
            paragraph: '§ 14-43',
            tags: ['avskrivning', 'saldo', 'skatt', 'skattemessig', 'saldogrupper'],
            accounts: ['1000', '1200', '6000'],
            summary: 'Skattelovens regler om saldoavskrivning',
            content: `
                <h2>Saldogrupper og avskrivningssatser</h2>
                <p>Skattemessig avskrivning følger faste saldogrupper med maksimale avskrivningssatser.</p>
                
                <h3>Saldogruppene</h3>
                <table style="width:100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <th style="text-align:left; padding: 8px;">Gruppe</th>
                        <th style="text-align:left; padding: 8px;">Beskrivelse</th>
                        <th style="text-align:right; padding: 8px;">Maks sats</th>
                    </tr>
                    <tr><td style="padding: 8px;">a</td><td>Kontormaskiner o.l.</td><td style="text-align:right;">30%</td></tr>
                    <tr><td style="padding: 8px;">b</td><td>Ervervet goodwill</td><td style="text-align:right;">20%</td></tr>
                    <tr><td style="padding: 8px;">c</td><td>Vogntog, lastebiler, busser</td><td style="text-align:right;">24%</td></tr>
                    <tr><td style="padding: 8px;">d</td><td>Personbiler, maskiner, inventar</td><td style="text-align:right;">20%</td></tr>
                    <tr><td style="padding: 8px;">e</td><td>Skip, fartøyer, rigger</td><td style="text-align:right;">14%</td></tr>
                    <tr><td style="padding: 8px;">f</td><td>Fly, helikopter</td><td style="text-align:right;">12%</td></tr>
                    <tr><td style="padding: 8px;">g</td><td>Anlegg for kraftoverføring</td><td style="text-align:right;">5%</td></tr>
                    <tr><td style="padding: 8px;">h</td><td>Bygg og anlegg, hoteller</td><td style="text-align:right;">4%</td></tr>
                    <tr><td style="padding: 8px;">i</td><td>Forretningsbygg</td><td style="text-align:right;">2%</td></tr>
                    <tr><td style="padding: 8px;">j</td><td>Tekniske installasjoner i bygg</td><td style="text-align:right;">10%</td></tr>
                </table>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Saldoavskrivning</div>
                    <div class="wiki-formula">Avskrivning = Saldo × Avskrivningssats</div>
                </div>
            `,
            related: ['rskl-5-3']
        },
        {
            id: 'bokl-5-5',
            title: 'Krav til salgsdokumentasjon',
            category: 'lovverk',
            law: 'BOKL',
            paragraph: '§ 5-1',
            tags: ['faktura', 'salgsdokument', 'bilag', 'dokumentasjon', 'bokføring'],
            summary: 'Bokføringslovens krav til fakturaer og salgsdokumenter',
            content: `
                <h2>Salgsdokumentasjon</h2>
                <p>Salgsdokument skal utstedes ved salg av varer og tjenester.</p>
                
                <h3>Obligatoriske opplysninger</h3>
                <ul>
                    <li>Selgers navn og organisasjonsnummer</li>
                    <li>Kjøpers navn (ved kjøp over kr 1 000)</li>
                    <li>Dato for utstedelse</li>
                    <li>Fortløpende nummer (fakturanummer)</li>
                    <li>Ytelsens art og omfang</li>
                    <li>Vederlag og betalingsvilkår</li>
                    <li>Eventuell merverdiavgift spesifisert</li>
                </ul>
                
                <div class="wiki-info-box warning">
                    <div class="wiki-info-box-title">⚠️ MVA-fradrag</div>
                    Mangler fakturaen påkrevde opplysninger, kan dette medføre tap av fradragsrett for inngående MVA.
                </div>
            `,
            related: ['mval-8-1']
        },
        
        // ==================
        // FORMLER
        // ==================
        {
            id: 'formula-roe',
            title: 'Egenkapitalrentabilitet (ROE)',
            category: 'formler',
            tags: ['rentabilitet', 'nøkkeltall', 'analyse', 'roe', 'egenkapital', 'avkastning'],
            summary: 'Mål på avkastning på egenkapitalen',
            content: `
                <h2>Egenkapitalrentabilitet (ROE)</h2>
                <p>Egenkapitalrentabiliteten viser hvor mye avkastning eierne får på sin investerte kapital.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Formel</div>
                    <div class="wiki-formula">ROE = (Ordinært resultat / Gjennomsnittlig EK) × 100%</div>
                </div>
                
                <h3>Tolkning</h3>
                <ul>
                    <li><strong>&gt; 15%:</strong> God rentabilitet</li>
                    <li><strong>10-15%:</strong> Akseptabel</li>
                    <li><strong>&lt; 10%:</strong> Svak - bør undersøkes</li>
                </ul>
                
                <h3>Gjennomsnittlig egenkapital</h3>
                <div class="wiki-formula-box">
                    <div class="wiki-formula">Gj.snitt EK = (EK IB + EK UB) / 2</div>
                </div>
                
                <div class="wiki-info-box info">
                    <div class="wiki-info-box-title">ℹ️ Sammenligning</div>
                    Sammenlign alltid med bransjegjennomsnitt og selskapets historikk. ROE bør være høyere enn risikofri rente + risikopremie.
                </div>
            `,
            related: ['formula-roa', 'formula-tkr']
        },
        {
            id: 'formula-roa',
            title: 'Totalkapitalrentabilitet (ROA)',
            category: 'formler',
            tags: ['rentabilitet', 'nøkkeltall', 'analyse', 'roa', 'totalkapital'],
            summary: 'Mål på avkastning på total investert kapital',
            content: `
                <h2>Totalkapitalrentabilitet (ROA)</h2>
                <p>Totalkapitalrentabiliteten viser avkastningen på all kapital investert i selskapet, uavhengig av finansieringsform.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Formel</div>
                    <div class="wiki-formula">ROA = ((Driftsresultat + Finansinntekter) / Gj.snitt TK) × 100%</div>
                </div>
                
                <h3>Alternativ formel</h3>
                <div class="wiki-formula-box">
                    <div class="wiki-formula">ROA = (Resultat før skatt + Rentekostnad) / Gj.snitt TK × 100%</div>
                </div>
                
                <h3>Tolkning</h3>
                <ul>
                    <li><strong>&gt; 10%:</strong> God rentabilitet</li>
                    <li><strong>5-10%:</strong> Akseptabel</li>
                    <li><strong>&lt; 5%:</strong> Svak</li>
                </ul>
            `,
            related: ['formula-roe', 'formula-tkr']
        },
        {
            id: 'formula-likviditetsgrad',
            title: 'Likviditetsgrad 1 og 2',
            category: 'formler',
            tags: ['likviditet', 'nøkkeltall', 'analyse', 'betalingsevne', 'omløpsmidler'],
            summary: 'Mål på kortsiktig betalingsevne',
            content: `
                <h2>Likviditetsgrad</h2>
                <p>Likviditetsgraden viser selskapets evne til å betale kortsiktig gjeld med omløpsmidler.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Likviditetsgrad 1</div>
                    <div class="wiki-formula">LG1 = Omløpsmidler / Kortsiktig gjeld</div>
                </div>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Likviditetsgrad 2 (Acid Test)</div>
                    <div class="wiki-formula">LG2 = (Omløpsmidler - Varelager) / Kortsiktig gjeld</div>
                </div>
                
                <h3>Tommelfingerregler</h3>
                <ul>
                    <li><strong>LG1 &gt; 2:</strong> God likviditet</li>
                    <li><strong>LG1 = 1-2:</strong> Akseptabel likviditet</li>
                    <li><strong>LG1 &lt; 1:</strong> Svak likviditet - fare for betalingsproblemer</li>
                </ul>
                <ul>
                    <li><strong>LG2 &gt; 1:</strong> God - kan dekke kortsiktig gjeld uten å selge varer</li>
                    <li><strong>LG2 &lt; 1:</strong> Avhengig av varesalg for å dekke forpliktelser</li>
                </ul>
                
                <div class="wiki-info-box tip">
                    <div class="wiki-info-box-title">💡 Tips</div>
                    LG2 er strengere enn LG1 fordi varelager kan være vanskelig å gjøre om til kontanter raskt.
                </div>
            `,
            related: ['formula-arbeidskapital']
        },
        {
            id: 'formula-arbeidskapital',
            title: 'Arbeidskapital',
            category: 'formler',
            tags: ['arbeidskapital', 'likviditet', 'omløpsmidler', 'kortsiktig gjeld'],
            summary: 'Differansen mellom omløpsmidler og kortsiktig gjeld',
            content: `
                <h2>Arbeidskapital</h2>
                <p>Arbeidskapital viser hvor mye av omløpsmidlene som er finansiert med langsiktig kapital.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Formel</div>
                    <div class="wiki-formula">Arbeidskapital = Omløpsmidler - Kortsiktig gjeld</div>
                </div>
                
                <h3>Tolkning</h3>
                <ul>
                    <li><strong>Positiv:</strong> Selskapet har buffer mot kortsiktige forpliktelser</li>
                    <li><strong>Negativ:</strong> Deler av anleggsmidlene er finansiert kortsiktig - risikabelt!</li>
                </ul>
                
                <div class="wiki-info-box warning">
                    <div class="wiki-info-box-title">⚠️ Negativ arbeidskapital</div>
                    Negativ arbeidskapital kan indikere likviditetsproblemer, men kan være normalt i bransjer med kort omløpstid (f.eks. dagligvarehandel).
                </div>
            `,
            related: ['formula-likviditetsgrad']
        },
        {
            id: 'formula-egenkapitalandel',
            title: 'Egenkapitalandel (Soliditet)',
            category: 'formler',
            tags: ['soliditet', 'egenkapital', 'finansiering', 'nøkkeltall'],
            summary: 'Andel av eiendelene som er finansiert med egenkapital',
            content: `
                <h2>Egenkapitalandel</h2>
                <p>Egenkapitalandelen viser hvor stor del av selskapets eiendeler som er finansiert med egenkapital.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Formel</div>
                    <div class="wiki-formula">Egenkapitalandel = (Egenkapital / Totalkapital) × 100%</div>
                </div>
                
                <h3>Tolkning</h3>
                <ul>
                    <li><strong>&gt; 40%:</strong> Solid finansiering</li>
                    <li><strong>20-40%:</strong> Normal/akseptabel</li>
                    <li><strong>&lt; 20%:</strong> Høy gjeldsgrad - sårbar for nedgangstider</li>
                </ul>
                
                <div class="wiki-info-box info">
                    <div class="wiki-info-box-title">ℹ️ Gjeldsgrad</div>
                    Gjeldsgrad = Gjeld / Egenkapital, eller (1 - EK-andel) / EK-andel
                </div>
            `,
            related: ['formula-roe', 'formula-roa']
        },
        {
            id: 'formula-tkr',
            title: 'Totalkapitalens omløpshastighet',
            category: 'formler',
            tags: ['omløpshastighet', 'effektivitet', 'nøkkeltall', 'totalkapital'],
            summary: 'Hvor effektivt selskapet utnytter sine eiendeler',
            content: `
                <h2>Totalkapitalens omløpshastighet</h2>
                <p>Viser hvor mange ganger totalkapitalen omsettes i løpet av et år.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Formel</div>
                    <div class="wiki-formula">TK omløpshastighet = Driftsinntekter / Gjennomsnittlig totalkapital</div>
                </div>
                
                <h3>DuPont-modellen</h3>
                <p>ROA kan dekomponeres til:</p>
                <div class="wiki-formula-box">
                    <div class="wiki-formula">ROA = Resultatgrad × TK omløpshastighet</div>
                </div>
                
                <h3>Tolkning</h3>
                <ul>
                    <li><strong>Høy:</strong> Effektiv kapitalutnyttelse</li>
                    <li><strong>Lav:</strong> Mye bundet kapital i forhold til omsetning</li>
                </ul>
            `,
            related: ['formula-roa', 'formula-roe']
        },
        
        // ==================
        // KONSEPTER
        // ==================
        {
            id: 'concept-debet-kredit',
            title: 'Debet og Kredit',
            category: 'konsepter',
            tags: ['debet', 'kredit', 'bokføring', 't-konto', 'grunnleggende'],
            summary: 'Grunnleggende om debet og kredit i bokføring',
            content: `
                <h2>Debet og Kredit</h2>
                <p>Debet (venstre side) og kredit (høyre side) er grunnlaget for dobbelt bokføring. Hver transaksjon må alltid ha like mye i debet som i kredit.</p>
                
                <h3>Hovedregler for kontoer</h3>
                <table style="width:100%; border-collapse: collapse;">
                    <tr style="border-bottom: 2px solid var(--accent-primary);">
                        <th style="text-align:left; padding: 8px;">Kontotype</th>
                        <th style="text-align:center; padding: 8px;">Øker i</th>
                        <th style="text-align:center; padding: 8px;">Reduseres i</th>
                    </tr>
                    <tr><td style="padding: 8px;"><strong>Eiendeler</strong></td><td style="text-align:center;">DEBET</td><td style="text-align:center;">Kredit</td></tr>
                    <tr><td style="padding: 8px;"><strong>Gjeld</strong></td><td style="text-align:center;">Kredit</td><td style="text-align:center;">DEBET</td></tr>
                    <tr><td style="padding: 8px;"><strong>Egenkapital</strong></td><td style="text-align:center;">Kredit</td><td style="text-align:center;">DEBET</td></tr>
                    <tr><td style="padding: 8px;"><strong>Inntekter</strong></td><td style="text-align:center;">Kredit</td><td style="text-align:center;">DEBET</td></tr>
                    <tr><td style="padding: 8px;"><strong>Kostnader</strong></td><td style="text-align:center;">DEBET</td><td style="text-align:center;">Kredit</td></tr>
                </table>
                
                <div class="wiki-info-box tip">
                    <div class="wiki-info-box-title">💡 Huskeregel</div>
                    <p><strong>AKING</strong> = Alle Kontoer I balanselikningen balanserer</p>
                    <p>Eiendeler (Aktiva) = Gjeld + Egenkapital (Passiva)</p>
                </div>
                
                <h3>T-konto eksempel</h3>
                <pre style="background: var(--bg-primary); padding: 15px; border-radius: 8px; font-family: monospace;">
     1920 Bank          |      2400 Leverandørgjeld
  -------------------- |     ---------------------
  Debet    |  Kredit   |     Debet    |  Kredit
  ---------|---------- |     ---------|----------
  + øker   |  - minker |     - minker |  + øker
                </pre>
            `,
            related: ['concept-balanselikningen', 'concept-dobbelt-bokforing']
        },
        {
            id: 'concept-balanselikningen',
            title: 'Balanselikningen',
            category: 'konsepter',
            tags: ['balanse', 'eiendeler', 'gjeld', 'egenkapital', 'grunnleggende'],
            summary: 'Den fundamentale sammenhengen i regnskapet',
            content: `
                <h2>Balanselikningen</h2>
                <p>Balanselikningen er det grunnleggende prinsippet som all bokføring bygger på.</p>
                
                <div class="wiki-formula-box">
                    <div class="wiki-formula-title">Balanselikningen</div>
                    <div class="wiki-formula">Eiendeler = Egenkapital + Gjeld</div>
                </div>
                
                <h3>Forklaring</h3>
                <ul>
                    <li><strong>Eiendeler (Aktiva):</strong> Alt selskapet eier - kontanter, varer, maskiner, fordringer</li>
                    <li><strong>Gjeld:</strong> Det selskapet skylder andre - leverandørgjeld, lån, MVA</li>
                    <li><strong>Egenkapital:</strong> Det som er igjen til eierne - innskutt og opptjent kapital</li>
                </ul>
                
                <h3>Utvidet balanselikning</h3>
                <div class="wiki-formula-box">
                    <div class="wiki-formula">Eiendeler = Gjeld + Aksjekapital + Opptjent EK + Inntekter - Kostnader</div>
                </div>
                
                <div class="wiki-info-box info">
                    <div class="wiki-info-box-title">ℹ️ Alltid i balanse</div>
                    Balanselikningen må alltid stemme. Hvis den ikke gjør det, er det en feil i bokføringen.
                </div>
            `,
            related: ['concept-debet-kredit']
        },
        {
            id: 'concept-periodisering',
            title: 'Periodisering',
            category: 'konsepter',
            tags: ['periodisering', 'opptjening', 'sammenstilling', 'inntekter', 'kostnader'],
            summary: 'Prinsipper for å fordele inntekter og kostnader til riktig periode',
            content: `
                <h2>Periodisering</h2>
                <p>Periodisering handler om å føre inntekter og kostnader i den perioden de tilhører, uavhengig av når betalingen skjer.</p>
                
                <h3>Grunnleggende prinsipper</h3>
                <ul>
                    <li><strong>Opptjeningsprinsippet:</strong> Inntekter skal resultatføres når de er opptjent</li>
                    <li><strong>Sammenstillingsprinsippet:</strong> Kostnader skal sammenstilles med tilhørende inntekter</li>
                </ul>
                
                <h3>Vanlige periodiseringer</h3>
                <ul>
                    <li><strong>Forskuddsbetalt:</strong> Betalt, men ikke brukt (f.eks. forsikring)</li>
                    <li><strong>Påløpt kostnad:</strong> Brukt, men ikke betalt (f.eks. strøm)</li>
                    <li><strong>Forskuddsbetaling fra kunde:</strong> Mottatt, men ikke levert</li>
                    <li><strong>Opptjent, ikke fakturert:</strong> Levert, men ikke fakturert</li>
                </ul>
                
                <div class="wiki-info-box tip">
                    <div class="wiki-info-box-title">💡 Hovedregel</div>
                    Spør deg selv: "Hvilken periode hører dette egentlig til?"
                </div>
            `,
            related: ['rskl-4-1']
        },
        
        // ==================
        // KONTOPLAN
        // ==================
        {
            id: 'account-1920',
            title: 'Konto 1920 - Bankinnskudd',
            category: 'kontoplan',
            tags: ['bank', 'bankinnskudd', '1920', 'kontanter', 'likvider', 'omløpsmidler'],
            accounts: ['1920'],
            summary: 'Virksomhetens bankkonto og likvide midler',
            content: `
                <h2>Konto 1920 - Bankinnskudd</h2>
                <p>Brukes for virksomhetens ordinære bankkonto.</p>
                
                <h3>Kontotype</h3>
                <ul>
                    <li><strong>Klasse:</strong> 1 - Eiendeler</li>
                    <li><strong>Gruppe:</strong> 19 - Bankinnskudd, kontanter o.l.</li>
                    <li><strong>Type:</strong> Omløpsmiddel</li>
                </ul>
                
                <h3>Debet/Kredit</h3>
                <ul>
                    <li><strong>Debet (øker):</strong> Innbetalinger fra kunder, mottatte lån, innskudd</li>
                    <li><strong>Kredit (minker):</strong> Utbetalinger til leverandører, lønn, skatter, avgifter</li>
                </ul>
                
                <h3>Relaterte kontoer</h3>
                <ul>
                    <li>1900 - Kontanter (kasse)</li>
                    <li>1910 - Bankinnskudd (alternativ)</li>
                    <li>1930 - Andre bankinnskudd</li>
                    <li>1950 - Skattetrekkskonto</li>
                </ul>
            `,
            related: ['account-2400', 'account-1500']
        },
        {
            id: 'account-2400',
            title: 'Konto 2400 - Leverandørgjeld',
            category: 'kontoplan',
            tags: ['leverandør', 'leverandørgjeld', '2400', 'gjeld', 'kreditt', 'kortsiktig'],
            accounts: ['2400'],
            summary: 'Gjeld til leverandører for kjøp på kreditt',
            content: `
                <h2>Konto 2400 - Leverandørgjeld</h2>
                <p>Brukes for gjeld til leverandører ved kjøp på kreditt.</p>
                
                <h3>Kontotype</h3>
                <ul>
                    <li><strong>Klasse:</strong> 2 - Egenkapital og gjeld</li>
                    <li><strong>Gruppe:</strong> 24 - Leverandørgjeld</li>
                    <li><strong>Type:</strong> Kortsiktig gjeld</li>
                </ul>
                
                <h3>Debet/Kredit</h3>
                <ul>
                    <li><strong>Kredit (øker):</strong> Nye fakturaer fra leverandører</li>
                    <li><strong>Debet (minker):</strong> Betaling av fakturaer</li>
                </ul>
                
                <h3>Vanlige posteringer</h3>
                <p><strong>Varekjøp på kreditt:</strong></p>
                <ul>
                    <li>Debet: 4000 Varekostnad</li>
                    <li>Debet: 2710 Inngående MVA</li>
                    <li>Kredit: 2400 Leverandørgjeld</li>
                </ul>
                <p><strong>Betaling til leverandør:</strong></p>
                <ul>
                    <li>Debet: 2400 Leverandørgjeld</li>
                    <li>Kredit: 1920 Bank</li>
                </ul>
            `,
            related: ['account-1920', 'account-1500']
        },
        {
            id: 'account-1500',
            title: 'Konto 1500 - Kundefordringer',
            category: 'kontoplan',
            tags: ['kunde', 'kundefordring', '1500', 'fordring', 'salg', 'kreditt'],
            accounts: ['1500'],
            summary: 'Utestående beløp fra kunder ved salg på kreditt',
            content: `
                <h2>Konto 1500 - Kundefordringer</h2>
                <p>Brukes for utestående beløp fra kunder ved kredittsalg.</p>
                
                <h3>Kontotype</h3>
                <ul>
                    <li><strong>Klasse:</strong> 1 - Eiendeler</li>
                    <li><strong>Gruppe:</strong> 15 - Kundefordringer</li>
                    <li><strong>Type:</strong> Omløpsmiddel</li>
                </ul>
                
                <h3>Debet/Kredit</h3>
                <ul>
                    <li><strong>Debet (øker):</strong> Nye utgående fakturaer</li>
                    <li><strong>Kredit (minker):</strong> Innbetalinger fra kunder</li>
                </ul>
                
                <h3>Vanlige posteringer</h3>
                <p><strong>Salg på kreditt:</strong></p>
                <ul>
                    <li>Debet: 1500 Kundefordringer (inkl. MVA)</li>
                    <li>Kredit: 3000 Salgsinntekt</li>
                    <li>Kredit: 2700 Utgående MVA</li>
                </ul>
                <p><strong>Innbetaling fra kunde:</strong></p>
                <ul>
                    <li>Debet: 1920 Bank</li>
                    <li>Kredit: 1500 Kundefordringer</li>
                </ul>
            `,
            related: ['account-1920', 'account-2400', 'account-2700']
        },
        {
            id: 'account-2700',
            title: 'Konto 2700 - Utgående MVA',
            category: 'kontoplan',
            tags: ['mva', 'utgående', '2700', 'merverdiavgift', 'salg'],
            accounts: ['2700', '2701', '2702', '2703'],
            summary: 'MVA som skal betales til staten ved salg',
            content: `
                <h2>Konto 2700 - Utgående merverdiavgift</h2>
                <p>Utgående MVA er avgiften som beregnes ved salg og som skal innbetales til staten.</p>
                
                <h3>Underskontoer</h3>
                <ul>
                    <li><strong>2700:</strong> Utgående MVA, høy sats (25%)</li>
                    <li><strong>2701:</strong> Utgående MVA, middels sats (15%)</li>
                    <li><strong>2702:</strong> Utgående MVA, lav sats (12%)</li>
                    <li><strong>2703:</strong> Utgående MVA, 0% (eksport)</li>
                </ul>
                
                <h3>Debet/Kredit</h3>
                <ul>
                    <li><strong>Kredit (øker):</strong> Ved salg - beregnet MVA</li>
                    <li><strong>Debet (minker):</strong> Ved MVA-oppgjør</li>
                </ul>
                
                <h3>MVA-oppgjør</h3>
                <p>Ved terminoppgjør:</p>
                <ul>
                    <li>Debet: 2700 Utgående MVA</li>
                    <li>Kredit: 2710 Inngående MVA</li>
                    <li>Kredit/Debet: 2740 Oppgjørskonto MVA (differansen)</li>
                </ul>
            `,
            related: ['account-2710', 'mval-3-1']
        },
        {
            id: 'account-2710',
            title: 'Konto 2710 - Inngående MVA',
            category: 'kontoplan',
            tags: ['mva', 'inngående', '2710', 'merverdiavgift', 'kjøp', 'fradrag'],
            accounts: ['2710', '2711', '2712', '2713'],
            summary: 'MVA på kjøp som kan fradragsføres',
            content: `
                <h2>Konto 2710 - Inngående merverdiavgift</h2>
                <p>Inngående MVA er avgiften som betales ved kjøp og som kan trekkes fra ved MVA-oppgjøret.</p>
                
                <h3>Underskontoer</h3>
                <ul>
                    <li><strong>2710:</strong> Inngående MVA, høy sats (25%)</li>
                    <li><strong>2711:</strong> Inngående MVA, middels sats (15%)</li>
                    <li><strong>2712:</strong> Inngående MVA, lav sats (12%)</li>
                </ul>
                
                <h3>Debet/Kredit</h3>
                <ul>
                    <li><strong>Debet (øker):</strong> Ved kjøp - betalt MVA</li>
                    <li><strong>Kredit (minker):</strong> Ved MVA-oppgjør</li>
                </ul>
                
                <div class="wiki-info-box warning">
                    <div class="wiki-info-box-title">⚠️ Fradragsrett</div>
                    Ikke all inngående MVA gir fradragsrett! Sjekk MVAL § 8-1 og § 8-3 for unntak.
                </div>
            `,
            related: ['account-2700', 'mval-8-1']
        }
    ],
    
    // ===== SEED FUNCTION =====
    async seed(db) {
        console.log('📖 Starter seeding av wiki-artikler...');
        
        const updates = {};
        
        // Add articles
        this.articles.forEach(article => {
            updates[`wiki/articles/${article.id}`] = {
                ...article,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        });
        
        // Add metadata
        updates['wiki/_metadata'] = {
            lastUpdated: Date.now(),
            articleCount: this.articles.length,
            version: '1.0.0'
        };
        
        try {
            await db.ref().update(updates);
            console.log(`✅ Seedet ${this.articles.length} wiki-artikler`);
            return { success: true, count: this.articles.length };
        } catch (error) {
            console.error('❌ Feil ved seeding:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WikiSeeder;
}
