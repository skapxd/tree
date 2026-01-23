#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { tree } from './index';

// We need to read package.json version. 
// In TS/ESM, import assertions are the way, or reading file sync.
// For simplicity and compatibility, we'll read it.
const pkgPath = path.join(__dirname, '../package.json');
let version = '0.0.0';
try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    version = pkg.version;
} catch {
    // ignore
}

program
  .version(version)
  .argument('[directory]', 'Directory to generate structure tree')
  .option('-d, --directory <dir>', 'Specify a directory (alternative to positional argument)')
  .option('-i, --ignore [ig]', 'You can ignore specific directory name')
  .option('-e, --export [epath]', 'export into file')
  .option('-f, --only-folder', 'output folder only')
  .action((dirArg, options) => {
    const targetDir = dirArg || options.directory || process.cwd();

    const output = tree({
      directory: targetDir,
      ignore: options.ignore,
      onlyFolder: options.onlyFolder,
    });

    if (!output) {
      console.error(`Error: Could not read directory "${targetDir}"`);
      process.exit(1);
    }

    // Output to console
    console.log(output);

    // Export to file if requested
    if (options.export) {
      fs.writeFile(options.export, output, (err) => {
        if (err) throw err;
        console.log('\n\nThe result has been saved into ' + options.export);
      });
    }
  });

program.parse(process.argv);
