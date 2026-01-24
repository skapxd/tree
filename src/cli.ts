#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { tree, getGitIgnoreRegex } from './fs-tree';
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
  .name('tree')
  .description('Powerful project structure visualizer: generates directory trees or file outlines.')
  .version(version)
  .argument('[path]', 'Directory or File path to analyze')
  .option('-d, --directory <dir>', 'Specify a path (alternative to positional argument)')
  .option('-i, --ignore [ig]', 'Regex pattern to ignore (only for directories)')
  .option('-e, --export [epath]', 'Export result to a file')
  .option('-f, --only-folder', 'Output folders only (only for directories)')
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
    // Construct base ignore regex with defaults and user input
    const defaultIgnores = ['^\\.git$', '^\\.DS_Store$'];
    const ignorePatterns = [...defaultIgnores];
    
    if (options.ignore) {
        ignorePatterns.push(options.ignore);
    }
    
    const ignoreRegex = new RegExp(ignorePatterns.join('|'));

    const output = tree({
      directory: targetPath,
      ignore: ignoreRegex,
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
