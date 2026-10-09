import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const pkg = readJson('package.json');
const requiredKeywords = ['dsh-plugin', 'deepseek-harness', 'openclaw', 'memory'];
for (const keyword of requiredKeywords) {
  check(pkg.keywords?.includes(keyword), `package.json is missing keyword: ${keyword}`);
}
check(pkg.license === 'MIT', 'package.json license must be MIT');
check(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'package.json must declare dsh.bundle.patch as ./cordis.patch.yml');
check(pkg.dsh?.client?.platform === 'web', 'package.json must declare the web client platform');
check(fs.existsSync(path.join(root, 'LICENSE')), 'LICENSE file is missing');
check(fs.existsSync(path.join(root, 'cordis.patch.yml')), 'cordis.patch.yml is missing');

const installCommand = 'dsh plugin --profile web add dsh-openclaw-memory';
for (const readme of ['README.md', 'README.zh-CN.md']) {
  const content = fs.readFileSync(path.join(root, readme), 'utf8');
  check(content.includes(installCommand), `${readme} is missing the published install command`);
}

const screenshots = readJson('screenshots.json');
const screenshotPaths = Array.isArray(screenshots) ? screenshots : screenshots.screenshots;
check(Array.isArray(screenshotPaths), 'screenshots.json must be an array or an object with a screenshots array');
check(Array.isArray(screenshotPaths) && screenshotPaths.length >= 1 && screenshotPaths.length <= 8, 'screenshots.json must declare 1-8 screenshots');
for (const screenshot of screenshotPaths ?? []) {
  check(typeof screenshot === 'string' && screenshot.length > 0, 'each screenshot path must be a non-empty string');
  if (typeof screenshot !== 'string') continue;
  check(!path.isAbsolute(screenshot) && !screenshot.split('/').includes('..'), `screenshot path must stay relative: ${screenshot}`);
  check(fs.existsSync(path.join(root, screenshot)), `screenshot file is missing: ${screenshot}`);
}

if (failures.length > 0) {
  console.error('Discoverability metadata check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Discoverability metadata OK (${screenshotPaths.length} screenshots).`);
}
