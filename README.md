# atahanguney.github.io

Personal site of **Atahan Güney** (Atahan Guney), 3rd-year electrical & electronics engineering student at Antalya Bilim University.

Live: **https://atahanguney.github.io/**

Static HTML, no build step, no framework. Every page is in English and Turkish; the visitor switches with the EN / TR toggle, and `?lang=tr` on any URL opens the Turkish version directly (shareable).

```
index.html                      home
projects/index.html             project index + stack
projects/electrofield/          write-up: ElectroField
projects/serialscope/           write-up: SerialScope
projects/drowsiness/            write-up: EAR drowsiness detection (OpenCV)
projects/gesture-servo/         write-up: OpenCV → Arduino servo
projects/ble-display/           write-up: ESP32 BLE → SSD1306 notification display
projects/telegram-morse/        write-up: Raspberry Pi Telegram relay, Morse + thermal log
notes/index.html                concept notes (filterable)
about/index.html                background, education, interests
assets/site.css, assets/site.js shared style and behaviour (language, theme, menu)
```

## Adding a project

1. Copy one of the folders in `projects/` (e.g. `projects/ble-display/`) to a new folder name.
2. Edit the text. Each piece of text exists twice: `lang="en"` and `lang="tr"`. CSS hides the one that is not active.
3. Add a `<a class="row">` entry to `projects/index.html` (and to `index.html` if it should be on the home page).
4. Add the URL to `sitemap.xml`.

## Local preview

```
python -m http.server 8765
```

Then open http://localhost:8765. Paths are root-relative (`/assets/...`), so open the site from the repo root, not as a file.
