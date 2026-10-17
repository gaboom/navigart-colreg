/**
 * Automated Mathematical & Integration Test Suite for NavigArt COLREG Engine
 * Pure ES Module tests using standard Node.js assert.
 */

import assert from 'node:assert';
import { Geo } from '../docs/js/engine/geo.js';
import { Vessel, PROFILES } from '../docs/js/engine/kinematics.js';
import { CPACalculator } from '../docs/js/engine/cpa.js';
import { SCENARIOS } from '../docs/js/engine/scenarios.js';
import { ScenarioEngine } from '../docs/js/engine/scenario.js';
import { SensorModel } from '../docs/js/engine/sensors.js';

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(err);
    failed++;
  }
}

console.log('=== 1. GEO MODULE TESTS ===');

it('calculates 1 degree of latitude as exactly 60 NM', () => {
  const dist = Geo.distanceNM(43.0, 15.0, 44.0, 15.0);
  assert(Math.abs(dist - 60.0) < 0.001, `Expected 60 NM, got ${dist}`);
});

it('calculates true bearing accurately due North (000°) and due East (090°)', () => {
  const brgNorth = Geo.bearingDeg(43.0, 15.0, 44.0, 15.0);
  assert(Math.abs(brgNorth - 0.0) < 0.001, `Expected 0°, got ${brgNorth}`);

  const brgEast = Geo.bearingDeg(43.0, 15.0, 43.0, 16.0);
  assert(Math.abs(brgEast - 90.0) < 0.001, `Expected 90°, got ${brgEast}`);
});

it('displaces position and returns exact distance and bearing back', () => {
  const startLat = 43.288;
  const startLon = 15.912;
  const targetBrg = 193.5;
  const targetDist = 3.59;

  const displaced = Geo.displace(startLat, startLon, targetBrg, targetDist);
  const calculatedDist = Geo.distanceNM(startLat, startLon, displaced.lat, displaced.lon);
  const calculatedBrg = Geo.bearingDeg(startLat, startLon, displaced.lat, displaced.lon);

  assert(Math.abs(calculatedDist - targetDist) < 0.01, `Distance mismatch: ${calculatedDist} vs ${targetDist}`);
  assert(Math.abs(calculatedBrg - targetBrg) < 0.1, `Bearing mismatch: ${calculatedBrg} vs ${targetBrg}`);
});

it('formats coordinates in standard nautical degrees and minutes', () => {
  const formatted = Geo.formatCoord(43 + 17.3 / 60, 15 + 54.7 / 60);
  assert(formatted.latStr.includes('43°17.3\' N'), `Expected 43°17.3' N, got ${formatted.latStr}`);
  assert(formatted.lonStr.includes('015°54.7\' E'), `Expected 015°54.7' E, got ${formatted.lonStr}`);
});

console.log('\n=== 2. KINEMATICS MODULE TESTS ===');

it('clamps Rate of Turn (ROT) to vessel profile maximum', () => {
  const yacht = new Vessel({
    profile: PROFILES.SAILING_YACHT,
    course: 0,
    speed: 5
  });
  yacht.setHelm(90);

  // Advance by 1 second. Max ROT is 4.0 deg/sec
  yacht.step(1.0);
  assert(Math.abs(yacht.course - 4.0) < 0.001, `Expected course 4.0°, got ${yacht.course}°`);
});

it('turns along the shortest angular arc across 000°/360° meridian', () => {
  const yacht = new Vessel({
    profile: PROFILES.SAILING_YACHT,
    course: 5,
    speed: 5
  });
  yacht.setHelm(355); // Shortest turn is to port (-10°)

  yacht.step(1.0); // 4° turn to port -> 1°
  assert(Math.abs(yacht.course - 1.0) < 0.001, `Expected course 1.0°, got ${yacht.course}°`);
});

it('applies speed loss during maximum rate turning', () => {
  const yacht = new Vessel({
    profile: PROFILES.SAILING_YACHT,
    course: 0,
    speed: 8.0,
    lat: 43.0,
    lon: 15.0
  });
  yacht.setHelm(180); // hard turn

  const startLat = yacht.lat;
  yacht.step(1.0);
  const traveledNM = Geo.distanceNM(startLat, yacht.lon, yacht.lat, yacht.lon);
  const unhinderedNM = 8.0 * (1 / 3600);

  // Effective speed should be reduced by turnSpeedLossFactor (15%)
  assert(traveledNM < unhinderedNM, 'Vessel should lose speed during hard turn');
});

console.log('\n=== 3. CPA MODULE TESTS ===');

it('calculates CPA = 0 and exact TCPA for pure Head-On collision course', () => {
  const own = { lat: 43.0, lon: 15.0, course: 0, speed: 10.0 };
  const targetPos = Geo.displace(43.0, 15.0, 0, 5.0); // 5 NM North
  const tgt = { lat: targetPos.lat, lon: targetPos.lon, course: 180, speed: 10.0 };

  const cpaData = CPACalculator.calculate(own, tgt);

  // Relative speed = 10 + 10 = 20 kn. Distance = 5 NM.
  // TCPA = 5 / 20 = 0.25 h = 15 minutes. CPA = 0 NM.
  assert(Math.abs(cpaData.cpa) < 0.01, `Expected CPA ~0, got ${cpaData.cpa}`);
  assert(Math.abs(cpaData.tcpa - 15.0) < 0.1, `Expected TCPA 15 min, got ${cpaData.tcpa}`);
  assert(Math.abs(cpaData.relSpeed - 20.0) < 0.1, `Expected relSpeed 20 kn, got ${cpaData.relSpeed}`);
});

it('detects parallel identical motion with 0 relative speed and CPA = range', () => {
  const own = { lat: 43.0, lon: 15.0, course: 90, speed: 10.0 };
  const targetPos = Geo.displace(43.0, 15.0, 0, 2.0); // 2 NM beam
  const tgt = { lat: targetPos.lat, lon: targetPos.lon, course: 90, speed: 10.0 };

  const cpaData = CPACalculator.calculate(own, tgt);
  assert(Math.abs(cpaData.relSpeed) < 0.001, `Expected relative speed 0, got ${cpaData.relSpeed}`);
  assert(Math.abs(cpaData.cpa - 2.0) < 0.01, `Expected CPA = current range 2.0, got ${cpaData.cpa}`);
});

console.log('\n=== 4. SCENARIO ENGINE INTEGRATION TESTS ===');

it('loads all 4 scenario presets with valid vessel states', () => {
  const engine = new ScenarioEngine();

  for (const scenarioId of ['odysseus', 'head_on', 'crossing_giveway', 'overtaking']) {
    engine.loadScenario(scenarioId);
    assert.strictEqual(engine.currentScenarioId, scenarioId);
    assert(engine.ownShip != null, `Own ship must exist for ${scenarioId}`);
    assert(engine.targets.length > 0, `Targets must exist for ${scenarioId}`);
  }
});

it('triggers collision alarm when CPA < 1.0 NM on head-on scenario', () => {
  const engine = new ScenarioEngine();
  engine.loadScenario('head_on');

  let alarmState = null;
  engine.subscribe((snapshot) => {
    alarmState = snapshot.hasDanger;
  });

  assert.strictEqual(alarmState, true, 'Head-on scenario should trigger collision danger alarm');
});

it('correctly handles time scale multiplier in physics integration', () => {
  const engine = new ScenarioEngine();
  engine.loadScenario('odysseus');
  engine.setTimeScale(5.0);

  const initialLat = engine.ownShip.lat;
  const initialLon = engine.ownShip.lon;
  engine.step(1.0); // 1 second with 5x scale moves 5 seconds of distance
  const movedNM = Geo.distanceNM(initialLat, initialLon, engine.ownShip.lat, engine.ownShip.lon);
  const expectedNM = 2.0 * (5.0 / 3600);

  assert(Math.abs(movedNM - expectedNM) < 0.001, `Expected distance ${expectedNM}, got ${movedNM}`);
});

console.log('\n=== 5. SENSOR MODEL TESTS ===');

it('computes radar horizon and echo strength appropriately', () => {
  const horizon = SensorModel.getRadarHorizonNM(8, 16);
  assert(horizon > 10 && horizon < 20, `Radar horizon should be ~15 NM, got ${horizon}`);

  const closeEcho = SensorModel.getEchoStrength(1.0);
  const farEcho = SensorModel.getEchoStrength(15.0);
  assert(closeEcho > farEcho, 'Close targets must have stronger echo than distant targets');
});

console.log('\n=== 6. COLREG MANEUVERING TESTS ===');

it('maneuvering own ship to starboard resolves collision danger', () => {
  const engine = new ScenarioEngine();
  engine.loadScenario('head_on');

  // Verify initial danger state
  assert.strictEqual(engine.hasCollisionDanger(), true, 'Initial state must be collision danger');

  // Command helm to starboard (from 000° to 045°)
  engine.ownShip.setHelm(45);

  // Advance simulation by 60 seconds (with ROT 4 deg/sec, turns 45 deg in ~12 sec, then opens range)
  for (let i = 0; i < 600; i++) {
    engine.step(0.1);
  }

  // Target CPA should now be significantly widened
  const activeTgt = engine.targets[0];
  const cpaData = CPACalculator.calculate(engine.ownShip, activeTgt);
  assert(cpaData.cpa > 0.3, `CPA should widen after starboard alteration, got ${cpaData.cpa.toFixed(2)} NM`);
});

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
