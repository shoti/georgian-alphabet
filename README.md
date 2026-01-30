# ქართული ანბანი — Georgian Alphabet Evolution

An interactive educational web application exploring the evolution of the Georgian alphabet across three historical scripts: **Asomtavruli**, **Nuskhuri**, and **Mkhedruli**.

![Preview](assets/preview.png)

## Features

- **33 letter cards** with animated reveal, hover tooltips showing all three scripts, and vowel highlighting
- **5 obsolete letters** removed in the 1879 Ilia Chavchavadze reform, displayed with ghost styling
- **Letter detail modal** with animated SVG illustrations for each example word — demo words drawn from *ვეფხისტყაოსანი* (The Knight in the Panther's Skin)
- **Script evolution timeline** showing each letter's form across Asomtavruli (V c.) → Nuskhuri (IX c.) → Mkhedruli (X c.)
- **Era switching** — toggle the entire card grid between the three scripts
- **Text converter** — type Mkhedruli text and see real-time conversion to Asomtavruli, Nuskhuri, and the ancient numerical value (ანბანური სათვალავი)
- **Flashcard learning mode** with 3D flip animation, swipe gestures, and keyboard navigation
- **Quiz mode** with multiple-choice questions, streak counter, and star-rating summary
- **Dark theme** with gold accents, custom cursor, grain texture, and particle effects

## Live Demo

[mtvarelishvili.com/alphabet](https://mtvarelishvili.com/alphabet/)

## Getting Started

No build tools required. Open `index.html` directly in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Project Structure

```
alphabet/
├── index.html          Main exploration page
├── learn.html          Flashcard & quiz learning page
├── css/
│   ├── base.css        Shared styles (variables, reset, scrollbar, cursor)
│   ├── index.css       Main page styles
│   └── learn.css       Learn page styles
├── js/
│   ├── converter.js    Georgian script conversion utilities
│   ├── index.js        Main page logic (cards, modal, converter, particles)
│   └── learn.js        Learn page logic (flashcards, quiz)
├── data/
│   └── alphabet.json   Complete alphabet dataset (33 + 5 obsolete)
├── assets/
│   ├── favicon.svg     Site icon (Georgian letter ა)
│   └── preview.png         Social preview image
├── LICENSE
└── README.md
```

## Technologies

- HTML5, CSS3, Vanilla JavaScript
- No frameworks or build tools
- Google Fonts (Cormorant Garamond, Noto Sans Georgian)
- SVG animations for word illustrations
- CSS custom properties for theming
- Responsive design with touch/swipe support

## Data

`data/alphabet.json` contains:

- **33 active letters** — each with Mkhedruli, Asomtavruli, Nuskhuri forms, name, transliteration, example word, English meaning, and numerical value
- **5 obsolete letters** — removed in 1879

## License

[MIT](LICENSE) — Shota Mtvarelishvili
