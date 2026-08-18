# Underlaget

Hjälpreda för vårdnadshavare vid Svenska Skolan Mallorca som ska ta fram underlag till statsbidrag för **gymnasiet** (Hermods Distansgymnasium + skolans handledning).

Ni söker inte själva. Skolan och Hermods skickar underlaget till Skolverket. Vid godkännande sänks gymnasieavgiften med 2 200 €.

## Prereq

- Node 20+
- `OPENAI_API_KEY` i `.env.local` (se `.env.example`)

## Starta

```bash
npm install
cp .env.example .env.local
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Vad appen gör

- Välj Gymnasiet eller Grundskola (grundskolan kommer snart)
- Svara flik för flik
- GPT-5.6 skriver blanketttexten “varför utomlands” och ett brev till revisor eller HR
- Export: fältguide, text, brev och checklista

Appen är inte Skolverket. Den fyller inte i officiella PDF:er och skickar inget åt er.
