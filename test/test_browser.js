import { chromium } from 'playwright';

async function test() {
  console.log('Launching browser with Playwright (msedge channel)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];
  const requests = [];

  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });
  page.on('requestfailed', req => {
    requests.push(`FAILED: ${req.url()} (${req.failure().errorText})`);
  });
  page.on('response', res => {
    if (res.status() >= 400) {
      requests.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const appStatus = await page.evaluate(() => {
    const chartCanvas = document.getElementById('chart-canvas');
    const compassCanvas = document.getElementById('compass-canvas');
    const hudCog = document.getElementById('hud-cog');
    const hudSog = document.getElementById('hud-sog');
    const hudRange = document.getElementById('hud-range');
    const hudThemeText = document.getElementById('hud-theme-text');
    const dispCourse = document.getElementById('disp-course-readout');
    return {
      title: document.title,
      chartCanvasFound: !!chartCanvas,
      chartWidth: chartCanvas ? chartCanvas.width : null,
      chartHeight: chartCanvas ? chartCanvas.height : null,
      compassCanvasFound: !!compassCanvas,
      helmTrackCanvasFound: !!document.getElementById('helm-track-canvas'),
      helmEngineCanvasFound: !!document.getElementById('helm-engine-canvas'),
      attributionLinkFound: !!document.getElementById('link-chart-attribution'),
      attributionHref: document.getElementById('link-chart-attribution') ? document.getElementById('link-chart-attribution').href : null,
      hudCog: hudCog ? hudCog.textContent : null,
      hudSog: hudSog ? hudSog.textContent : null,
      hudRange: hudRange ? hudRange.textContent : null,
      hudTheme: hudThemeText ? hudThemeText.textContent : null,
      dispCourseText: dispCourse ? dispCourse.textContent : null,
      zoomInRect: document.getElementById('btn-zoom-in') ? document.getElementById('btn-zoom-in').getBoundingClientRect().toJSON() : null,
      zoomOutRect: document.getElementById('btn-zoom-out') ? document.getElementById('btn-zoom-out').getBoundingClientRect().toJSON() : null,
      readyState: document.readyState
    };
  });

  console.log('\n=== INITIAL CHARTPLOTTER STATUS ===');
  console.log(JSON.stringify(appStatus, null, 2));

  // Test normal F5 reload
  console.log('\nSimulating normal F5 reload...');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1000);

  const postReloadStatus = await page.evaluate(() => {
    const chartCanvas = document.getElementById('chart-canvas');
    const dispCourse = document.getElementById('disp-course-readout');
    return {
      chartCanvasFound: !!chartCanvas,
      chartWidth: chartCanvas ? chartCanvas.width : null,
      dispCourseText: dispCourse ? dispCourse.textContent : null,
      readyState: document.readyState
    };
  });
  console.log('Post-F5 Reload Status:', postReloadStatus);

  console.log('\n=== NETWORK FAILURES ===');
  console.log(requests.join('\n') || '(no failed requests)');

  console.log('\n=== CONSOLE LOGS ===');
  console.log(consoleLogs.join('\n') || '(no logs)');

  console.log('\n=== PAGE ERRORS ===');
  console.log(pageErrors.join('\n') || '(no errors)');

  await page.screenshot({ path: 'docs/assets/playwright_chart_night.png' });
  console.log('\nSaved Night Mode screenshot to docs/assets/playwright_chart_night.png');

  // Test Day / Night Toggle
  console.log('Testing Day Mode switch...');
  await page.click('#btn-hud-theme');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/assets/playwright_chart_day.png' });
  console.log('Saved Day Mode screenshot to docs/assets/playwright_chart_day.png');

  // Switch back to Night mode
  await page.click('#btn-hud-theme');
  await page.waitForTimeout(300);

  // Test live user interaction: ACK alarm, set 5x time, zoom, quick rudder alter, throttle preset
  console.log('\nTesting live UI interaction: Zoom In, ACK alarm, set 5x time, alter course...');
  await page.click('#btn-zoom-in');
  await page.click('#btn-silence-alarm');
  await page.click('#btn-speed-5x');

  // Test Quick Rudder Alteration buttons (+10° Starboard turn, then Port turns)
  console.log('Testing quick rudder alteration buttons (+10° STBD, then PORT turns)...');
  await page.click('#btn-helm-stbd-10');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'docs/assets/playwright_compass_stbd.png' });
  console.log('Saved STBD turn screenshot to docs/assets/playwright_compass_stbd.png');
  await page.click('#btn-helm-port-10');
  await page.waitForTimeout(100);
  await page.click('#btn-helm-port-10');
  await page.waitForTimeout(100);
  await page.click('#btn-helm-port-10');
  await page.waitForTimeout(100);
  await page.click('#btn-helm-port-1');
  await page.waitForTimeout(100);
  await page.click('#btn-helm-stbd-1');
  await page.waitForTimeout(100);
  await page.click('#btn-helm-port-10');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'docs/assets/playwright_compass_port.png' });
  console.log('Saved PORT turn screenshot to docs/assets/playwright_compass_port.png');

  // Test Dual-Lever Engine Console (Throttle RPM Drag and Gear click)
  console.log('Testing Dual-Lever Engine Console (RPM throttle drag & gear)...');
  const engineBox = await page.$eval('#helm-engine-canvas', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  // Click RPM throttle (right lever, ~75% across width, higher RPM)
  await page.mouse.click(engineBox.x + engineBox.width * 0.75, engineBox.y + engineBox.height * 0.35);
  await page.waitForTimeout(200);

  // Test Chart Pan & Drag and Recenter
  console.log('Testing chart canvas pan & drag and re-center button...');
  const canvasBox = await page.$eval('#chart-canvas', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  // Drag canvas by 80px
  await page.mouse.move(canvasBox.x, canvasBox.y);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 80, canvasBox.y + 60, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  const isRecenterVisible = await page.$eval('#btn-recenter', el => !el.classList.contains('hidden'));
  console.log(`Re-center button visible after pan: ${isRecenterVisible}`);

  // Click re-center button
  if (isRecenterVisible) {
    await page.click('#btn-recenter');
    await page.waitForTimeout(200);
  }

  // Test Sidebar Toggle
  console.log('Testing sidebar toggle collapse/expand...');
  await page.click('#btn-toggle-sidebar');
  await page.waitForTimeout(300);
  const isSidebarCollapsed = await page.$eval('#sidebar-panel', el => el.classList.contains('collapsed'));
  console.log(`Sidebar collapsed state: ${isSidebarCollapsed}`);
  await page.click('#btn-toggle-sidebar'); // Expand back
  await page.waitForTimeout(300);

  // Let simulation advance for 2 seconds (10 seconds simulated time at 5x)
  await page.waitForTimeout(2000);

  const postManeuverStatus = await page.evaluate(() => {
    const dispCourse = document.getElementById('disp-course-readout');
    const dispRpm = document.getElementById('disp-rpm-readout') || document.getElementById('disp-speed-readout');
    const alarmBanner = document.getElementById('alarm-banner');
    const hudRange = document.getElementById('hud-range');
    const compassTurn = document.getElementById('disp-compass-turn');
    return {
      courseReadout: dispCourse ? dispCourse.textContent : null,
      rpmReadout: dispRpm ? dispRpm.textContent : null,
      alarmHidden: alarmBanner ? alarmBanner.classList.contains('hidden') : null,
      hudRange: hudRange ? hudRange.textContent : null,
      compassTurnBadge: compassTurn ? compassTurn.textContent : null
    };
  });
  console.log('Post-maneuver status:', postManeuverStatus);

  await page.screenshot({ path: 'docs/assets/playwright_chart_maneuver.png' });
  console.log('Saved maneuver screenshot to docs/assets/playwright_chart_maneuver.png');

  await browser.close();
}

test().catch(err => {
  console.error('Playwright Test Failed:', err);
  process.exit(1);
});
