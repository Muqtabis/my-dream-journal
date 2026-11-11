const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('Skipping SPA route generation: build/index.html not found.');
  process.exit(0);
}

const routes = [
  'visualizer',
  'journal',
  'stats',
  'about',
  'contact',
  'privacy',
  'terms',
  'login',
  'signup'
];

const indexHtml = fs.readFileSync(indexPath, 'utf8');

for (const route of routes) {
  const routeDir = path.join(buildDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml, 'utf8');
}

console.log(`Generated static HTTP 200 entrypoints for ${routes.length} SPA routes.`);
