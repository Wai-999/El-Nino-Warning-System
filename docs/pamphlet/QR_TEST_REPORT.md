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

## Does it open the intended page?

PENDING — production URL not yet verified.

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
