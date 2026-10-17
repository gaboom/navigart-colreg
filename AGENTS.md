# AGENTS: Technical Architecture & Development Guidelines

This document details **how** the simulator is engineered, structured, and maintained.

---

## 1. Architecture Overview

The simulator is a client-side, zero-build web application located entirely inside the `docs/` folder for immediate hosting on GitHub Pages (`colreg.navigart.net`).

```
├── package.json            # Version 0.1.0, scripts for start, test, build
├── server.js               # Zero-dependency local Node.js HTTP server & browser launcher
├── start.bat               # Windows 1-click launcher
├── scripts/
│   └── build_bundle.js     # Standalone bundler for direct drive (file://) support
docs/
├── index.html              # Main application shell (Chartplotter & Sidebar layout)
├── styles.css              # MFD Day/Night theme & chartplotter control layout
├── test.html               # In-browser test runner
├── manifest.json           # PWA manifest for standalone installation
├── sw.js                   # Service worker for offline caching
├── assets/                 # Icons and screenshot assets
└── js/
    ├── app.js              # Application entry point & loop coordinator (ES Module)
    ├── bundle.js           # Standalone bundle for file:// fallback
    ├── engine/
    │   ├── geo.js          # Flat-earth nautical coordinate transformations & formatting
    │   ├── kinematics.js   # Ship movement, rate of turn, speed lag, profiles
    │   ├── cpa.js          # Continuous CPA/TCPA & vector calculation
    │   ├── sensors.js      # Radar return detection & AIS broadcast models
    │   ├── scenarios.js    # Presets: Odysseus Adriatic, Head-On, Crossing, Overtaking
    │   └── scenario.js     # ScenarioEngine: decoupled 10 Hz simulation lifecycle
    ├── ui/
    │   ├── compass.js      # Marine horizontal compass tape & lubber line
    │   ├── helm_track.js   # 360° continuous circular course selector dial
    │   ├── engine_levers.js# Dual-lever marine engine console (Gear F/N/R & RPM governor)
    │   ├── ppi.js          # Chartplotter canvas: graticule, yacht hull, AIS targets, EBL, VRM, trails
    │   ├── controls.js     # User interaction: compass, helm, throttle, display toggles, zoom
    │   └── arpa.js         # Telemetry panels and ARPA target data box
    └── audio/
        └── alarm.js        # Web Audio API synthesized collision beeper
test/
├── test_engine.js          # Automated Node.js unit & integration tests
└── test_browser.js         # Playwright headless browser test suite
```

---

## 2. Technical Guidelines

1. **Zero External Dependencies**:
   - Use standard HTML5 Canvas 2D and ES Modules.
   - Do not introduce npm build tools, bundlers, or frameworks that require compiling into `docs/`.
2. **Pure Mathematical Coordinate Conventions**:
   - Nautical coordinates: 000° is North (top in N.UP), angles increase clockwise (090° East, 180° South, 270° West).
   - Distances in Nautical Miles (1 NM = 1852 meters).
   - Speeds in Knots (1 knot = 1 NM/hour).
   - Time: 1:1 real-time simulation delta clock (`dt` in seconds).
3. **PWA Compliance & Responsive Landscape**:
   - Manifest configured for `display: "standalone"`, `orientation: "landscape"`.
   - Layout scales to screen size in landscape mode; portrait orientation prompt alerts mobile users to rotate.
   - Service worker caches static assets for offline use.
4. **Licensing & Attribution**:
   - Released under Creative Commons Attribution-NonCommercial 4.0 International (`CC BY-NC 4.0`).
   - In-app attribution link `© Navigart` must remain positioned on the chartplotter map (bottom-right corner, left of zoom controls) linking to `http://ahoy.navigart.net`.

---

## 3. Contribution Loop

Follow the loop defined in [GEMINI.md](GEMINI.md):
- Keep [SPEC.md](SPEC.md) updated with behavioral and pedagogical requirements.
- Keep [README.md](README.md) aligned with user-facing features.
- Keep [AGENTS.md](AGENTS.md) aligned with architectural implementations.
