# NavigArt COLREG — Radar & AIS Collision Avoidance Simulator

Interactive maritime radar and AIS simulation web application designed for sailing schools, skippers, and navigators to practice collision avoidance regulations (COLREGs) and radar plotting.

Live at: [colreg.navigart.net](https://colreg.navigart.net)

![NavigArt COLREG Console](docs/assets/screenshot_desktop.png)

## Features (v1 Engine)

- **Edge-to-Edge Nautical Chartplotter**: Large rectangular navigation chart display with corner HUD badges (COG, SOG, Mode, Range Zoom `+` / `−`, and `PANEL` toggle).
- **Interactive Pan & Drag Navigation**: Touch/mouse drag anywhere on chart to inspect surroundings, with instant `⌖ RE-CENTER` badge and double-click/double-tap snapping back to own ship.
- **Quick Rudder Alteration Steppers**: Tactile helm buttons for fast COLREG evasive maneuvers (`◀ 10°`, `◀ 5°`, `STEADY`, `5° ▶`, `10° ▶`, and bold `+30° ▶` starboard action).
- **Quick Throttle Steppers & Presets**: Stepper buttons (`−1.0`, `+1.0`) and presets (`STOP`, `SLOW`, `CRUISE`).
- **Enhanced AIS & Radar Symbology**:
  - Detailed merchant vessel hull outlines (M/V AURA, M/V KALLIOPE) with true heading ticks vs sailing craft glyphs.
  - 6-minute velocity vectors with 2-minute and 4-minute time cross-ticks, arrowheads, and projected relative CPA tracks.
  - Pulsing danger collision rings and ECDIS 4-corner target selection brackets.
- **Unified Helm & 360° Circular Course Selector**: Continuous closed-loop circular track enclosing a 2×2 grid of rudder steppers (top row: `−1°` / `+1°` fine trim; bottom row: `−10°` / `+10°` standard alteration) with true compass bearing alignment, allowing direct bug dragging, track rotating, click-to-steer, and mouse-wheel micro-stepping.
- **Cartographic Attribution**: Discrete in-map attribution link `© Navigart` placed at the bottom-right corner of the chartplotter linking to [ahoy.navigart.net](http://ahoy.navigart.net).
- **Dual-Lever Marine Engine Console**: Authentic binnacle controls with left black-ish knob gear selector (`FORWARD`, `NEUTRAL`, `REVERSE`) and right red-ish knob RPM governor (`idleRPM` to `maxRPM`, no zero), simulating realistic RPM response and vessel acceleration inertia.
- **Layer & Plotting Toggles**:
  - Concentric **Range Rings** (toggled on/off)
  - **Ahead / Heading Line** extending from vessel bow with 1 NM cross-ticks
  - **Motion Trail / History Dots** tracking past positions
  - **True Vectors** vs. **Relative Vectors** (`T/R`) for instant collision assessment
  - **EBL** (Electronic Bearing Line) & **VRM** (Variable Range Marker) with direct canvas drag
  - **Head-Up** (`H.UP`) and **North-Up** (`N.UP`) orientation modes
- **Kinematics Engine**: Realistic vessel handling (rate of turn, throttle inertia, vessel profile archetypes).
- **Collision & Proximity Alarm**: Continuous CPA/TCPA calculations with Web Audio proximity alarm.
- **Client-Side & Offline Ready**: Zero backend, zero build dependencies, installable Progressive Web App (PWA) served directly from `docs/` on GitHub Pages.

## How to Run

### Option 1: Live Web (Recommended)
Visit the deployed application at **[colreg.navigart.net](https://colreg.navigart.net)**.

### Option 2: Local Node.js Server (Recommended for Development & Packaging)
Run with zero external npm dependencies using Node.js built-ins:
```bash
npm start
# or: node server.js
```
*On Windows, you can also simply double-click `start.bat`.* The server will start at `http://localhost:3000` and automatically open your default browser.

### Option 3: Direct from Drive (Offline File Explorer)
Double-click [`docs/index.html`](docs/index.html) directly from your file manager. The app includes an automatic fallback bundle so it runs immediately over `file:///` without browser CORS restrictions.

## Scenarios & Testing

- **4 Training Scenarios**:
  - `S/Y Odysseus (Adriatic Encounter)` (Rule 15 baseline)
  - `Rule 14: Head-On Encounter` (Reciprocal collision course)
  - `Rule 15: Crossing (Give-Way Duty)` (Starboard crossing target)
  - `Rule 13: Overtaking Fast Craft` (High-speed craft overtaking abaft the beam)
- **Automated Tests**: Run unit tests via `npm test` (`node test/test_engine.js`), headless browser tests via `npm run test:browser` (`node test/test_browser.js`), or in-browser via [`docs/test.html`](test.html).
- **Advisory Audit**: See the full maritime & architecture audit report in [docs/AUDIT.md](docs/AUDIT.md).

## Documentation Map

- **Why?** [SPEC.md](SPEC.md)
- **What?** [README.md](README.md)
- **How?** [AGENTS.md](AGENTS.md)
- **Audit**: [docs/AUDIT.md](docs/AUDIT.md)

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International Public License (CC BY-NC 4.0)**.

- **Free to use & share**: You are free to share and adapt the material for non-commercial educational purposes.
- **Attribution required**: You must provide appropriate credit and attribution to **NavigArt** linking to [© Navigart](http://ahoy.navigart.net).
- See the [LICENSE](LICENSE) file for the full legal terms.

