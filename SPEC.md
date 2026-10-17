# SPEC: NavigArt COLREG Radar Collision Avoidance Simulator

## 1. Why & Executive Intent

- **Purpose**: An interactive educational radar simulation game designed for a sailing school to practice maritime collision avoidance (COLREGs) and radar/AIS plotting.
- **Target Audience**: Sailing school students, skippers, and navigators preparing for certifications (Yachtmaster, coastal/offshore skippers, radar endorsement).
- **Delivery**: Public static web app hosted via GitHub Pages (`docs/` directory), accessible at `colreg.navigart.net`. Zero backend, no login, client-side only, installable PWA with web manifest.
- **Licensing**: Free for non-commercial educational use under **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** with attribution to NavigArt (`© Navigart` linking to `http://ahoy.navigart.net`).

---

## 2. Scope & Guiding Principles (v1 Foundation)

- **Philosophy**: Build a rock-solid, extensible simulation engine and realistic UI first. Advanced game modes (grading/scorecards, procedural scenarios, P2P student vs teacher) will build on this engine later.
- **Time Model**: Strictly **1:1 real-time**. Ensures authentic maritime pacing and realistic plotting intervals (scaling/replay deferred to later versions).
- **Collision & Evaluation**:
  - Continuous **CPA (Closest Point of Approach) & TCPA** calculation for all tracked vessels.
  - Proximity **alarm** triggered when CPA breaches a safety threshold (e.g., < 1.0 NM).
  - No pass/fail grading in v1; focuses on situational awareness and self-directed navigation.
- **Milestone Roadmap**:
  - **v1 (Current Foundation & UI Refinement)**:
    - High-fidelity marine Chartplotter (MFD) layout with corner HUDs and edge-to-edge navigation chart.
    - Right-hand control sidebar with dedicated nautical compass tape & rose, scenario selection, helm/throttle, telemetry, and ARPA data box.
    - Continuous real-time CPA/TCPA calculation and synthesized collision proximity alarm.
    - Day & Night display themes with zero-store caching and standalone PWA support.
    - Comprehensive UI/UX polish and refinement.
  - **v2 (Sensor Fusion & Navigational Context)**:
    - Radar Overlay & Chart vs Radar display mode toggle (sweep line, CRT phosphor bloom, raw echoes vs vector chart).
    - Adriatic Coastline & Navigation Aids (islands, shallows, lighthouses, buoys in Odysseus scenario).
    - Interactive Target Selection directly on Chart (tap/click any vessel on canvas to inspect ARPA telemetry and collision triangle).
  - **v3 (COLREG Rule Evaluation & Training Debrief)**:
    - Automated COLREG compliance grading (Rule 14 Head-On, Rule 15 Crossing, Rule 16 Action by Give-way Vessel, Rule 17 Action by Stand-on Vessel).
    - Evaluation of whether actions were early and substantial, minimum passing distance achieved.
    - Post-encounter scorecard, debrief log, and procedural scenario escalation.

---

## 3. Vessel Kinematics & Profile Architecture

Realism in user experience rather than heavy hydrodynamic calculus:
- **Parametric Profiles**: Each vessel instance is backed by a profile archetype:
  - *Sailing Yacht* (e.g. S/Y Odysseus): Low top speed (5-8 kn), high maneuverability, quick rudder response, high turning rate (~3-5°/s), low inertia.
  - *Large Merchant Ship / Cargo*: High inertia, slow rudder response (ROT ~0.5-1°/s), large turning circle, long deceleration distance.
  - *High Speed Craft (HSC)*: High speed (25-35 kn), high turning rate, sensitive to course alterations.
- **Core Kinematic Parameters**:
  - `maxSpeed` / `minSpeed` (knots)
  - `accelerationRate` / `decelerationRate` (kn/s)
  - `maxRateOfTurn` (deg/s)
  - `rudderResponseLag` (seconds delay before turn develops)
  - `turnSpeedLossFactor` (percentage speed loss during hard turn)

---

## 4. Radar & AIS Instrument Suite

- **Core PPI Plotting Tools**:
  - **EBL (Electronic Bearing Line)**: Rotatable bearing line with precise digital readout in degrees.
  - **VRM (Variable Range Marker)**: Expandable range ring with distance readout in nautical miles.
  - **Range Rings**: Concentric distance reference rings (toggled on/off with interval selection, e.g., 1 NM).
  - **Orientation Modes**:
    - `N.UP` (North-Up): 000° is True North at top.
    - `H.UP` (Head-Up): 000° is own vessel heading at top.
  - **Vector Modes (`T/R`)**:
    - *True Vectors*: Shows actual vessel courses over ground.
    - *Relative Vectors*: Vectors reflect relative motion relative to own ship (essential for instant CPA collision assessment: if vector points at center, CPA is 0).
- **Target Tracking & ARPA Data Box**:
  - Selecting/tapping any target displays an ARPA data readout:
    - Target ID / MMSI / Callsign
    - Bearing (°)
    - Range (NM)
    - CPA (NM)
    - TCPA (min)
    - Course (°) & Speed (kn)
- **Sensor Layer Toggles & Sensor Model**:
  - Independent display toggles: `Radar Only`, `AIS Only`, `Both (Hybrid)`.
  - Vessel sensor capability model:
    - *AIS-equipped*: Transmits identity, telemetry, true course & speed.
    - *Radar-only echo*: Reflected radar blip; requires tracking for kinematics.

---

## 5. UI/UX & Feedback Design

- **Visual Style**: **Modern Marine Chartplotter (ECDIS / MFD)** with toggleable **Day / Night Themes**:
  - *Day Mode*: High-visibility nautical paper-chart style (pale cyan sea `#d4e6f1`, crisp graticules, dark navy symbology).
  - *Night Mode*: Deep navy / slate MFD palette (`#0a1526`, glowing vectors, high-contrast night symbology).
- **Console Layout**:
  - **Full-Screen Chart View (Left & Center)**:
    - Edge-to-edge rectangular navigation chart area (no header/footer bars eating screen space).
    - **Pan & Drag Navigation**: Touch/mouse drag anywhere on chart to pan; floating `⌖ RE-CENTER` badge and double-click/double-tap to immediately snap back to own ship.
    - **Corner HUD Elements**:
      - Top-Left: Digital live readouts for `COG` (Course Over Ground) and `SOG` (Speed Over Ground).
      - Top-Right: Orientation indicator (`N.UP` / `H.UP`), `DAY / NIGHT` theme quick toggle, and `PANEL ◀ / ▶` sidebar collapse/expand toggle.
      - Bottom-Center: Floating `⌖ RE-CENTER` badge (appears automatically when panned).
      - Bottom-Left: Chart scale indicator & dynamic graticule coordinate reference.
      - Bottom-Right: Quick zoom buttons (`+` / `−`) and pinch-to-zoom / wheel zoom support.
    - **Display Feature Layers & Maritime Symbology**:
      - Concentric Range Rings centered on own vessel.
      - Heading / Ahead Line extending forward with 1 NM cross-ticks.
      - Historical Trail Dots / Motion Path.
      - Velocity Vectors (True vs Relative `T/R`): 6-minute vector scale with 2-minute and 4-minute speed cross-ticks, sharp directional arrowheads, and dashed CPA relative motion projected lines.
      - AIS Symbology: Distinct merchant cargo ship hull glyphs with stern deckhouses vs sailing craft triangles, true heading ticks, pulsating danger collision rings, and ECDIS 4-corner selection brackets.
      - EBL (Electronic Bearing Line) & VRM (Variable Range Marker) with direct canvas drag.
  - **Dedicated Control Sidebar (Right Column)**:
    - **Enforced Landscape & Responsive Scaling**: Responsive width (`clamp(280px, 27vw, 360px)`) that scales cleanly to screen size; portrait orientation warning prompt for mobile devices.
    - **Top Compass Box**: Dedicated analog/digital compass rose & tape with lubber line, steer-to bug, and live turn deviation badge (`STBD 15° ▶` / `◀ PORT 10°`).
    - **Telemetry Header**: Real-time Date, Time, and own ship Latitude/Longitude position.
    - **Scenario & Pacing**: Scenario selector and time multiplier buttons (`PAUSE`, `1x`, `2x`, `5x`, `RESET`).
    - **View & Layer Controls**: Grid of toggles for Rings, Ahead Line, Trails, Vector Mode (`T/R`), Day/Night, EBL, VRM.
    - **Ship Controls (Helm & Engine)**:
      - **Circular 360° Course Selector Track**: Continuous closed-loop circular course selector enclosing a 2×2 grid of rudder steppers (`−1°` / `+1°` fine trim and `−10°` / `+10°` standard alterations) with true compass bearing alignment, allowing direct target bug dragging, track rotating, click-to-steer, and mouse-wheel micro-stepping.
      - **Dual-Lever Marine Engine Console**: Authentic binnacle controls with left black-ish knob gear selector (`FORWARD`, `NEUTRAL`, `REVERSE` detents) and right red-ish knob RPM governor (`idleRPM` to `maxRPM`, no zero), simulating realistic RPM response and vessel acceleration inertia.
      - **Aligned Header Readouts**: Centered `CMD` course readout (`###° CMD`) horizontally aligned with the `HDG` readout in the compass section directly above it, sharing the unified `#ffcc00` amber color across `HDG`, `CMD`, compass pointer arrow, and helm track target bug chevron. Live digital RPM readout displayed on the right (`disp-rpm-readout`).
    - **Collision Proximity Banner**: Pulsing warning card with `ACK / MUTE` acknowledge button.
    - **ARPA / AIS Target Telemetry Box**: Target name, Bearing, Range, CPA, TCPA, Course, Speed, and Aspect.
- **Proximity & Collision Alarm**:
  - **Audio**: Synthesized maritime alarm beeper via Web Audio API (periodic pulse tone when dangerous CPA < 1.0 NM is detected).
  - **Visual**: Alert card in right panel and target color-shift to danger red on chart.
  - **Controls**: "ACK / MUTE" button to silence sound.

---

## 6. Technical Architecture & Delivery

- **Tech Stack**: **Zero-build vanilla web stack** (Pure HTML5 Canvas + modern ES Modules + clean CSS).
  - Zero external build tools (no npm/bundler required to run or edit).
  - Instant local and GitHub Pages execution directly from the `docs/` directory.
- **PWA & Offline Capability**:
  - Web App Manifest (`manifest.json`) supporting standalone display on tablets/iPads and mobile devices.
  - Lightweight service worker for offline caching.
- **Target Host**: GitHub Pages serving `docs/` with custom domain `colreg.navigart.net`.

---

## 7. Scenario Engine & Decoupled Architecture

- **Engine/UI Decoupling**:
  - The simulation engine runs independently of the Canvas UI render loop.
  - The engine manages physics, coordinates, target tracks, and CPA updates via discrete delta-time ticks (`step(dt)` in seconds).
  - The UI (PPI canvas, telemetry readouts, ARPA box) acts as an observer consuming clean state snapshots.
- **Geographic & Coordinate System**:
  - Open sea / open radar scope for v1 (no land contours).
  - Positions tracked in real **Latitude and Longitude** (`lat`, `lon`) using flat-earth projection with cosine latitude scaling:
    - 1 minute of latitude = 1 NM ($dy = d\text{lat} \times 60$)
    - 1 minute of longitude = $\cos(\text{lat}) \times 1\text{ NM}$ ($dx = d\text{lon} \times \cos(\text{lat}) \times 60$)
  - Formatted to authentic maritime standard (e.g., `43°17.3′ N`, `015°54.7′ E`).
- **Target Navigation Model**:
  - Steady course and speed only for v1 (ensures predictable, accurate radar plotting and COLREG assessment).
- **Baseline Scenario (S/Y Odysseus Adriatic Encounter)**:
  - Own Vessel: S/Y Odysseus, `43°17.3′ N`, `015°54.7′ E`, Initial Co `248°`, Spd `2.0 kn`.
  - Target 1: M/V AURA, initial bearing `193.5°`, range `3.59 NM`, steady Co `005°`, Spd `10.0 kn`.
  - Target 2: M/V KALLIOPE, initial bearing `190.0°`, range `3.40 NM`, steady Co `010°`, Spd `8.0 kn`.

---

## 8. Implementation Structure

1. **Engine Layer (`docs/js/engine/`)**:
   - `geo.js`: Flat-earth coordinate conversions, distances, bearings, lat/lon integration.
   - `kinematics.js`: Vessel profile archetypes, rate of turn, throttle lag, speed loss in turns.
   - `cpa.js`: Analytical CPA, TCPA, relative velocity vectors, and BCR/BCD calculations.
   - `scenario.js`: Decoupled simulation core, entity management, and state dispatcher.
2. **Audio Layer (`docs/js/audio/`)**:
   - `alarm.js`: Web Audio API collision proximity beeper with acknowledge/silence.
3. **UI Layer (`docs/js/ui/`)**:
   - `ppi.js`: Canvas PPI renderer (radar echoes, sweep line, range rings, EBL, VRM, N.UP/H.UP, T/R vectors).
   - `compass.js`: Horizontal compass tape with lubber line, deviation badge, and pointer arrow.
   - `helm_track.js`: 360° circular course selector dial enclosing 2×2 rudder steppers.
   - `engine_levers.js`: Dual-lever marine engine console (Gear F/N/R detents & RPM governor).
   - `controls.js`: Two-way UI event handling and engine synchronization coordinator.
   - `arpa.js`: ARPA data display and collision alarm banner.
4. **Application Glue (`docs/js/app.js`)**:
   - Coordinator wiring the decoupled engine to the UI at 60 FPS.
