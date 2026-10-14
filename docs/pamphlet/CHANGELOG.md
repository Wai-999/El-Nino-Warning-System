# CHANGELOG — El Niño bi-fold leaflet and its digital hub

## 2026-10 edition 1 — single QR (14 Oct 2026)

**Input:** `DUSU_ElNino_Bifold_EDITABLE.pdf` (authoritative edition, SHA-256 `1b94288a5e5050ea…`).
**Output:** `DUSU_ElNino_Bifold_2026-10_QR.pdf` and the hub at <https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/>.

### Print PDF (back panel only)

- Removed the `[OFFICIAL_SOURCE_QR]` placeholder (white box, dashed frame, highlight and label).
- Added **one** QR code (vector, black on white, no logo) for `https://wai-999.github.io/El-Nino-Warning-System/pamphlet/el-nino/`: byte mode, version 5, ECC M,
  37×37 modules of 0.591 mm → **21.9 mm symbol, 26.6 mm with the 4-module quiet zone**.
  The code sits at the right edge of the text column, ≥ 8 mm from the fold, clear of the footer band.
- Replaced the line “အပြည့်အစုံကို QR တွင်ဖတ်ရှူနိုင်ပါသည်။” with the required caption
  “QR ကိုဖတ်၍ လက်ကမ်းစာစောင်၊ မူရင်းရင်းမြစ်များနှင့် ဆက်သွယ်ရန်လင့်ခ်များကို ကြည့်ရှုနိုင်သည်။”, a one-line offline note
  (“ပထမအကြိမ် အင်တာနက် လိုသည်။ “အော့ဖ်လိုင်း သိမ်းမည်” နှိပ်ပြီးနောက် အင်တာနက်မလိုပါ။”) and the printed URL. The sources line is kept.
- To free space without shrinking any text: Do/Avoid list pitch 6.0–6.8 mm → 5.65 mm (the heat box already used 5.3–5.7 mm),
  heat-box paragraph gaps 6.7/7.1 mm → 6.2 mm; the heat box is 9.8 mm shorter. Every original glyph run was only
  moved vertically (vector edit); nothing was re-typeset, resized or reworded.
- Front cover and inside sheet: unchanged (pixel-identical renders). Imposition, page size and fold position unchanged.
- Known issues found in the audit (C18 wording, C16 newer WMO statement, two typos, blank publication day) are **not**
  corrected in print — see SOURCE_AUDIT.md.

### Digital hub (first release)

- Burmese-first static page: all four panels as accessible text in reading order with `[Sxx]` source markers, facsimile
  images with zoom, the complete PDF (view and download), a searchable/filterable library of 23 sources in five groups,
  a claim-to-source map (35 claims), both Facebook links, method/disclaimer, English summary.
- Explicit **Save for offline** (IndexedDB, atomic, size- and SHA-256-verified, then served by the hub's own service worker),
  offline indicator, last-saved time, update prompt for stale copies and **Remove offline copy**. Portable
  `offline-pamphlet.zip` for direct device transfer.
- Repository changes outside the hub: app service worker excludes `pamphlet/`; e2e regression test; unit-test fix that
  unblocked deployment (see the repository CHANGELOG, version 2.2.1).
