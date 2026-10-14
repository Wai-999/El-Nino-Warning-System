# QR_TEST_REPORT — the single QR code

| Property     | Value                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Encoded text | `https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/` (66 bytes, byte mode, no ECI)                |
| Symbol       | version 5, ECC M (~15 % recovery), 37×37 modules, 4-module quiet zone                                             |
| Print size   | 21.9 mm symbol, 26.6 mm with quiet zone, module 0.591 mm, black on white, no logo                                 |
| Placement    | back panel, x 113.5–140.1 mm, y 160.7–187.2 mm of the A4 sheet (fold at 148.5 mm)                                 |
| Files        | `single-qr.svg` (vector) and `single-qr.png` (1440 px) — the same matrix (SHA-256 of modules `29d8b533d68af23f…`) |

Why ECC M: the URL is fixed and printed on uncoated paper that gets folded and handled; M keeps ~15 % recovery while the
modules stay ≥ 0.55 mm. The quiet zone is plain paper inside the panel; nothing prints within it.

## Programmatic decoding (no phone)

Decoders: zxing-cpp (ZXing family, as used by many Android scanners), ZBar and OpenCV. “✔” = decoded text equals the URL
byte-for-byte.

### Exactly one QR in the print PDF

- sheet 1: 1 QR found by zxing-cpp, 1 by OpenCV → `https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/`
- sheet 2: 0 QR found by zxing-cpp, 0 by OpenCV

### assets

- `single-qr.png`: zxing-cpp ✔, zbar ✔, opencv ✔
- `single-qr.svg (rasterised 900 px)`: zxing-cpp ✔, zbar ✔, opencv ✔
- `png_and_svg_same_matrix`: identical ✔

### print_pdf

- `sheet 1, QR area @ 600 dpi`: zxing-cpp ✔, zbar ✔, opencv ✔
- `sheet 1, QR area @ 300 dpi`: zxing-cpp ✔, zbar ✔, opencv ✔
- `sheet 1, QR area @ 150 dpi`: zxing-cpp ✔, zbar ✔, opencv ✔
- `sheet 1, QR area @ 100 dpi`: zxing-cpp ✔, zbar ✔, opencv ✔
- `sheet 1, QR area @ 72 dpi`: zxing-cpp ✔, zbar ✔, opencv ✘

### Simulated phone capture at the printed size

135 simulated photos of the printed code (600 dpi print with ink spread, 1920-px camera frame with ~70° field of
view, distance 10–30 cm, defocus blur 0–1.3 px, tilt 0–40°, normal / dim+noise / uneven light, JPEG). Decoded by at least
one decoder: **116/135**.

| Distance | px per module | decoded (all conditions) | decoded (sharp, normal light) |
| -------- | ------------- | ------------------------ | ----------------------------- |
| 10 cm    | 8.1           | 27/27                    | 3/3                           |
| 15 cm    | 5.4           | 27/27                    | 3/3                           |
| 20 cm    | 4.05          | 25/27                    | 3/3                           |
| 25 cm    | 3.24          | 21/27                    | 3/3                           |
| 30 cm    | 2.7           | 16/27                    | 3/3                           |

Simulation is not a substitute for real phones; it shows the margin, not the guarantee.

## Does it open the intended page?

- ✅ QR URL answers 200 over HTTPS without redirect — HTTP 200, text/html; charset=utf-8, server GitHub.com
- ✅ page is the hub (title, h1, four panels, build id) — build 32ee4d2ed158 in page: True
- ✅ both Facebook links present and exact — GiHmanHAICT, DaweiUniSU
- ✅ URL without trailing slash redirects to the canonical URL — HTTP 301
- ✅ deployed version.json = local build — 2026-10-e1 / 32ee4d2ed158
- ✅ all 21 offline-set files served byte-identical (size + SHA-256) — all match
- ✅ full print PDF online = the print-ready file — 705964 bytes, application/pdf
- ✅ offline-pamphlet.zip served — HTTP 200, 1569129 bytes
- ✅ sw.js served — HTTP 200, 4941 bytes
- ✅ manifest.webmanifest served — HTTP 200, 751 bytes
- ✅ img/panel-1-2x.webp served — HTTP 200, 213286 bytes
- ✅ missing path returns 404 — HTTP 404
- ✅ app service worker excludes pamphlet/ (no precache, early return) — 33 app shell entries
- ✅ app release deployed with the change — {"version":"2.2.1"}
- ✅ app home still served — HTTP 200
- ✅ printed QR decodes to exactly this live URL — ['https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/']
- ✅ external links reachable (31/31 HTTP 200) — all 200

## Physical phone tests — PENDING

No physical iPhone or Android device was available in this environment. Before printing a run, test the **printed proof**:

1. Print `DUSU_ElNino_Bifold_2026-10_QR.pdf` at **100 % / Actual size** (not “fit to page”), duplex, flip on short edge.
2. Measure the QR: the black square should be about 22 mm wide.
3. iPhone (iOS 17+): open **Camera**, point at the code from 15–20 cm, tap the yellow link banner. Android (12+): open the
   **Camera** app (or Google Lens) and tap the link chip.
4. Expected: Safari/Chrome opens `https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/` showing “အယ်လ်နီညို”, four panels, sources and two Facebook links. The address bar
   must show exactly this URL (no redirect, padlock present).
5. Repeat in daylight, under indoor light, at a 30–40° angle, and with the leaflet folded as it will be handed out.
6. Offline check: on the same phone tap **အော့ဖ်လိုင်း သိမ်းမည်**, wait for “သိမ်းပြီးပါပြီ”, switch on airplane mode,
   scan again → the leaflet must open (with the offline banner). On a second phone that never visited, airplane mode + scan
   must **fail** (expected: “no internet”).
7. Record device, OS, app, distance, light, result and time in the table below.

| Device / OS      | Scanner app   | Distance / light / angle | Opened correct URL? | Offline after save? | Tester, date |
| ---------------- | ------------- | ------------------------ | ------------------- | ------------------- | ------------ |
| iPhone … / iOS … | Camera        |                          | PENDING             | PENDING             |              |
| Android … / …    | Camera / Lens |                          | PENDING             | PENDING             |              |
