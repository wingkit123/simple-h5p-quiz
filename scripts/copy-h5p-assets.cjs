// scripts/copy-h5p-assets.cjs
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const projectRoot = path.resolve(__dirname, '..');
const from = path.join(projectRoot, 'node_modules', 'h5p-standalone', 'dist');
const to = path.join(projectRoot, 'public', 'assets', 'h5p-player');

try {
  // Ensure the target directory is cleaned before copying
  fs.emptyDirSync(to);
  fs.copySync(from, to);
  console.log('✅ Copied h5p-standalone dist ->', to);

  // remove dev-only type declaration files (not needed in public deployment)
  try {
    const dtFiles = glob.sync(path.join(to, '**', '*.d.ts'));
    dtFiles.forEach(f => fs.removeSync(f));
    console.log('Removed .d.ts files from public assets');
  } catch (err) {
    // non-fatal
    console.error('Failed to remove .d.ts files:', err);
  }
} catch (err) {
  console.error('❌ Failed to copy h5p-standalone dist:', err);
  process.exit(1);
}
