/**
 * Zero-dependency standalone bundler for file:// protocol support.
 * Strips 'import' and 'export' statements and concatenates modules in dependency order
 * so that docs/index.html can run directly from disk (file:///...) without CORS errors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const jsDir = path.join(rootDir, 'docs', 'js');

const files = [
  path.join(jsDir, 'engine', 'geo.js'),
  path.join(jsDir, 'engine', 'kinematics.js'),
  path.join(jsDir, 'engine', 'cpa.js'),
  path.join(jsDir, 'engine', 'sensors.js'),
  path.join(jsDir, 'engine', 'scenarios.js'),
  path.join(jsDir, 'engine', 'scenario.js'),
  path.join(jsDir, 'audio', 'alarm.js'),
  path.join(jsDir, 'ui', 'compass.js'),
  path.join(jsDir, 'ui', 'helm_track.js'),
  path.join(jsDir, 'ui', 'engine_levers.js'),
  path.join(jsDir, 'ui', 'ppi.js'),
  path.join(jsDir, 'ui', 'controls.js'),
  path.join(jsDir, 'ui', 'arpa.js'),
  path.join(jsDir, 'app.js')
];

let bundleContent = '(() => {\n"use strict";\n\n';

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove import statements (multi-line and single-line)
  content = content.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
  
  // Replace "export default class/const" or "export class/const"
  content = content.replace(/export\s+default\s+/g, '');
  content = content.replace(/export\s+(class|const|function|let|var)\s+/g, '$1 ');
  
  bundleContent += `// --- File: ${path.relative(jsDir, file)} ---\n`;
  bundleContent += content + '\n\n';
}

bundleContent += '})();\n';

const outputFile = path.join(jsDir, 'bundle.js');
fs.writeFileSync(outputFile, bundleContent, 'utf8');
console.log(`Successfully generated standalone bundle: ${outputFile} (${bundleContent.length} bytes)`);
