# 📋 DEPLOYMENT SJEKKLISTE

## ✅ PRE-DEPLOY (før GitHub)

### 1. Filkontroll
- [ ] 12 filer totalt i mappen
- [ ] index.html (40 KB)
- [ ] bokforingsspill_excel.html (102 KB)
- [ ] quiz.html (21 KB)
- [ ] regnskapsanalyse.html (59 KB)
- [ ] case_studies.html (9.5 KB)
- [ ] beta-feedback-form.html (9.2 KB)
- [ ] test-index.html (1.6 KB)
- [ ] robots.txt (234 bytes)
- [ ] sitemap.xml (1.1 KB)
- [ ] _headers (1.8 KB)
- [ ] _redirects (498 bytes)
- [ ] favicon.svg (1.1 KB)

### 2. Manglende filer
- [ ] favicon.ico laget på favicon.io
  - Text: AQ
  - Font: Leckerli One
  - Background: #1a1a2e
  - Font Color: #4ade80

### 3. Encoding-test
- [ ] Åpne ENCODING-TEST.html i browser
- [ ] Sjekk at alle norske tegn vises riktig:
  - ✅ Bokføring (ikke BokfÃ¸ring)
  - ✅ Lær (ikke LÃ¦r)
  - ✅ Nøkkeltall (ikke NÃ¸kkeltall)
  - ✅ På år (ikke PÃ¥ Ã¥r)
  - ✅ Øvelse (ikke Ã˜velse)

### 4. Lokal test
- [ ] Åpne index.html i Chrome/Firefox/Safari
- [ ] Test navigasjon til alle 5 moduler
- [ ] Test at localStorage fungerer
- [ ] Test på mobil (responsive)

---

## 📦 GITHUB DEPLOY

### 1. Repository setup
- [ ] GitHub Desktop installert
- [ ] Logget inn med GitHub-konto
- [ ] Klar til å opprette nytt repository

### 2. Create repository
- [ ] File → New Repository
- [ ] Name: `accountingquest`
- [ ] Description: "Interactive Norwegian accounting learning platform"
- [ ] Local Path: [din mappe med alle filene]
- [ ] Initialize with README: ❌ NEI (vi har allerede README.md)
- [ ] Git ignore: None
- [ ] License: None

### 3. Initial commit
- [ ] Se at alle 13 filer er "staged" (grønne)
- [ ] Commit message: "Initial commit - Beta v1.0 - Norwegian encoding fixed"
- [ ] Klikk "Commit to main"

### 4. Publish
- [ ] Klikk "Publish repository"
- [ ] Keep this code private: ❌ NEI (velg PUBLIC)
- [ ] Klikk "Publish Repository"
- [ ] Vent på upload (1-2 min)

### 5. Verifiser på GitHub.com
- [ ] Gå til https://github.com/[din-bruker]/accountingquest
- [ ] Sjekk at alle 13 filer er der
- [ ] Åpne index.html og sjekk at norske tegn er riktige
- [ ] Copy repository URL

---

## ☁️ CLOUDFLARE PAGES DEPLOY

### 1. Cloudflare login
- [ ] Gå til https://dash.cloudflare.com
- [ ] Logg inn (eller opprett konto)
- [ ] Verifiser epost hvis ny konto

### 2. Create Pages project
- [ ] Gå til "Workers & Pages"
- [ ] Klikk "Create application"
- [ ] Velg "Pages" tab
- [ ] Klikk "Connect to Git"

### 3. GitHub integration
- [ ] Klikk "Connect GitHub"
- [ ] Autorisér Cloudflare
- [ ] Velg repository: `accountingquest`
- [ ] Klikk "Begin setup"

### 4. Build settings
- [ ] Project name: `accountingquest`
- [ ] Production branch: `main`
- [ ] Framework preset: **None**
- [ ] Build command: (la stå tom)
- [ ] Build output directory: **/** (eller tom)
- [ ] Root directory: / (default)
- [ ] Environment variables: (ingen)

### 5. Deploy
- [ ] Klikk "Save and Deploy"
- [ ] Vent på første deploy (2-5 min)
- [ ] Sjekk at "Build successful" ✅
- [ ] Copy Pages URL (.pages.dev)

### 6. Test Pages URL
- [ ] Åpne [prosjekt].pages.dev
- [ ] Test index.html
- [ ] Test bokforingsspill_excel.html
- [ ] Test quiz.html
- [ ] Test regnskapsanalyse.html
- [ ] Test case_studies.html
- [ ] Sjekk at norske tegn vises riktig!

---

## 🌐 CUSTOM DOMAIN SETUP

### 1. Add domain
- [ ] I Cloudflare Pages prosjekt
- [ ] Gå til "Custom domains"
- [ ] Klikk "Set up a custom domain"
- [ ] Skriv inn: `accountingquest.app`
- [ ] Klikk "Continue"

### 2. DNS setup (hvis domenet er på Cloudflare)
- [ ] Cloudflare legger automatisk til CNAME record
- [ ] Verifiser at record er lagt til
- [ ] Status skal være "Active" ✅

### 3. DNS setup (hvis domenet er eksternt)
- [ ] Gå til din DNS-provider
- [ ] Legg til CNAME record:
  - Name: `accountingquest.app` eller `@`
  - Value: `[prosjekt].pages.dev`
  - TTL: 3600 (eller auto)
- [ ] Vent på DNS-propagering (5-30 min)

### 4. Add www subdomain
- [ ] Klikk "Set up a custom domain" igjen
- [ ] Skriv inn: `www.accountingquest.app`
- [ ] Legg til CNAME som peker til `accountingquest.app`

### 5. Verifiser redirects
- [ ] Test at `www.accountingquest.app` redirecter til `accountingquest.app`
- [ ] Test at både HTTP og HTTPS fungerer
- [ ] SSL-sertifikat skal være aktivt (Cloudflare automatisk)

---

## 🧪 FINAL TESTING

### 1. Desktop testing
- [ ] Chrome - index.html fungerer
- [ ] Firefox - alle moduler fungerer
- [ ] Safari (Mac) - norske tegn korrekte
- [ ] Edge - localStorage fungerer

### 2. Mobile testing
- [ ] iPhone Safari - responsive design OK
- [ ] Android Chrome - touch fungerer
- [ ] Bokføringsspill - drag-and-drop mobil
- [ ] Kalkulator - flyttbar på mobil

### 3. Functionality testing
- [ ] Bokføringsspill:
  - [ ] Excel-grid fungerer
  - [ ] Formler (=B1*0.25) fungerer
  - [ ] Kalkulator åpnes og fungerer
  - [ ] Drag-and-drop kontoer
  - [ ] 3-liv system
  - [ ] Next-knapp låses/unlocks
  
- [ ] Quiz:
  - [ ] Alle 5 spørsmålstyper fungerer
  - [ ] Progresjon lagres i localStorage
  - [ ] Feedback vises korrekt
  - [ ] Lovhjemler lenkes (placeholder)
  
- [ ] Regnskapsanalyse:
  - [ ] Tabeller fungerer
  - [ ] Formler med celle-referanser
  - [ ] Kalkulator fungerer
  - [ ] Sjekk svar-funksjon
  
- [ ] Case Studies:
  - [ ] Tabeller fungerer
  - [ ] Input-felter fungerer
  - [ ] Sjekk svar-funksjon

### 4. Performance testing
- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Total page size < 500 KB

### 5. SEO testing
- [ ] robots.txt tilgjengelig: `/robots.txt`
- [ ] sitemap.xml tilgjengelig: `/sitemap.xml`
- [ ] Meta tags korrekte
- [ ] Favicon vises i browser tab

---

## 📊 POST-DEPLOY

### 1. Analytics (valgfritt)
- [ ] Legg til Cloudflare Web Analytics
- [ ] Eller Google Analytics
- [ ] Track page views
- [ ] Track conversions

### 2. Monitoring
- [ ] Sett opp uptime monitoring
- [ ] Error tracking
- [ ] Performance monitoring

### 3. Documentation
- [ ] Oppdater README.md med live URL
- [ ] Dokumenter deployment-prosess
- [ ] Lag backup av kode

---

## 🎓 BETA-TESTING LAUNCH

### 1. Prepare feedback form
- [ ] Test beta-feedback-form.html
- [ ] Sjekk at alle seksjoner fungerer
- [ ] Print eller eksporter som PDF

### 2. Send til revisor/lærer
- [ ] E-post med lenke til plattformen
- [ ] Vedlegg feedback-skjema
- [ ] Spesifiser frist (30. november)
- [ ] Be om faglig kvalitetssikring

### 3. Send til studenter (UiS)
- [ ] E-post med lenke
- [ ] Kort introduksjon
- [ ] Be om feedback
- [ ] Oppgi support-kontakt

### 4. Collect feedback
- [ ] Opprett shared folder for feedback
- [ ] Lag spreadsheet for bugs
- [ ] Prioriter fixes
- [ ] Plan neste release

---

## 🚨 EMERGENCY PROCEDURES

### Hvis noe går galt:

#### Problem: Deployment feiler
- [ ] Sjekk Build logs i Cloudflare
- [ ] Sjekk at alle filer er i GitHub
- [ ] Force re-deploy

#### Problem: DNS fungerer ikke
- [ ] Bruk .pages.dev URL i mellomtiden
- [ ] Sjekk DNS records
- [ ] Vent 30 min og prøv igjen

#### Problem: Norske tegn vises feil
- [ ] Sjekk at du brukte `accountingquest-FIXED` mappen
- [ ] Ikke den originale uploads-mappen
- [ ] Re-upload fikset versjon

#### Problem: Moduler fungerer ikke
- [ ] Sjekk browser console for errors
- [ ] Sjekk at localStorage er aktivert
- [ ] Test i inkognito-modus

---

## ✅ COMPLETION

Når alt over er sjekket av:

- [ ] **Platform is LIVE** 🎉
- [ ] **Beta-testing can begin** 🧪
- [ ] **URL shared with testers** 📧
- [ ] **Feedback collection started** 📊

---

## 📅 TIMELINE

| Aktivitet | Tid |
|-----------|-----|
| Pre-deploy checks | 15 min |
| GitHub upload | 10 min |
| Cloudflare setup | 10 min |
| DNS propagation | 5-30 min |
| Final testing | 20 min |
| **TOTAL** | **60-85 min** |

---

## 🎯 SUCCESS CRITERIA

✅ Platform accessible at `accountingquest.app`
✅ All Norwegian characters display correctly
✅ All 5 modules functional
✅ Mobile responsive
✅ LocalStorage working
✅ Beta feedback form available
✅ Ready for 150+ students

---

**You're ready to launch! 🚀**

Print denne sjekklisten og kryss av underveis!
