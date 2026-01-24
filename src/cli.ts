#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { tree } from './fs-tree';
import { getParser, showSingleFileOutline, readFile } from './file-tree';

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
    const targetPath = dirArg || options.directory || process.cwd();

    // Check if it is a file -> Outline Mode
    try {
        const stats = fs.statSync(targetPath);
        if (stats.isFile()) {
            const content = readFile(targetPath);
            const parser = getParser(targetPath);
            const { lines, sections } = parser.parse(content);
            showSingleFileOutline(targetPath, lines, sections);
            return;
        }
    } catch (e) {
        // If file doesn't exist, let 'tree' handle the error or fail
    }

    // Directory Mode
    const output = tree({
      directory: targetPath,
      ignore: options.ignore,
      onlyFolder: options.onlyFolder,
    });

    if (!output) {
      console.error(`Error: Could not read directory "${targetPath}"`);
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
