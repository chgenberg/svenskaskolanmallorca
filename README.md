# Underlaget

Hjälpreda för vårdnadshavare vid Svenska Skolan Mallorca som ska ta fram underlag till statsbidrag för **gymnasiet** (Hermods Distansgymnasium + skolans handledning).

Ni söker inte själva. Skolan och Hermods skickar underlaget till Skolverket. Vid godkännande sänks gymnasieavgiften med 2 200 €.

## Prereq

- Node 20+
- `OPENAI_API_KEY` — aldrig i koden. Lokalt i `.env.local`, i produktion i Railway Variables.

## Railway

1. Öppna tjänsten i Railway.
2. Gå till **Variables**.
3. **New Variable**
   - Name: `OPENAI_API_KEY`
   - Value: din OpenAI-nyckel (samma som i OpenAI Dashboard)
   - Name: `FIESTA_PASSWORD`
   - Value: festgruppens gemensamma lösenord (inte i git)
4. Spara. Railway gör en ny deploy. Nyckeln syns inte i git.

Fiesta ligger bakom lösenord på `/fiesta`. Utan `FIESTA_PASSWORD` går det inte att öppna tavlan. Tavlan sparas som JSON på servern (`data/fiesta-board.json`, eller `FIESTA_DATA_PATH` om ni sätter en Railway-volym).

## Starta lokalt

```bash
npm install
cp .env.example .env.local
# klistra in OPENAI_API_KEY=... och FIESTA_PASSWORD=... bara i .env.local
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Vad appen gör

- Välj Gymnasiet eller Grundskola (grundskolan kommer snart)
- Svara flik för flik
- GPT-5.6 skriver blanketttexten “varför utomlands” och ett brev till revisor eller HR
- Export: fältguide, text, brev och checklista

Appen är inte Skolverket. Den fyller inte i officiella PDF:er och skickar inget åt er.
