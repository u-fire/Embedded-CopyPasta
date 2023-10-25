// This file is part of Embedded CopyPasta.
// Embedded CopyPasta is free software: you can redistribute it and/or modify it under the terms of the GNU General 
// Public License as published by the Free Software Foundation, either version 3 of the License, or any 
// later version.
// Embedded CopyPasta is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General 
// Public License for more details.
// You should have received a copy of the GNU General Public License along with Embedded CopyPasta. If not, see 
// <https://www.gnu.org/licenses/>.

const ejs = require('ejs');
const { Command } = require("commander");
const fs = require('fs');
const program = new Command();
const options = program.opts();
const figlet = require("figlet");
const chalk = require('chalk');
const commandExistsSync = require('command-exists').sync;
const { execSync } = require("child_process");
var ejs_template;
var ejs_data;
var code;
var merged_ejs_data = { includes: [], constructors: [], setups: [], loops: [], values: [], units: [], dependencies: [] };

// start things, check arguments // embeded CP
console.log(chalk.bold.white(figlet.textSync("Embedded CopyPasta", {font: "Contessa"})));
console.log("(C) Microfire LLC 2023 (http://microfire.co)\n")
program
    .version("0.1.0")
    .description("Embedded CopyPasta")
    .option("-p, --pasta  [file]", ".pasta Template file")
    .option("-c, --copy [file/s...]", ".copy data file")
    .option("-o, --out [folder]", "output folder")
    .option("-b, --board [value]", "PlatformIO board identifier")
    .option("-a, --about", "Copy and paste Arduino libraries and sensors together automatically.")
    .parse(process.argv);

if (options.about) {
    console.log("Embedded CopyPasta was written by Justin Decker at Microfire LLC");
    console.log(`This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.`)
    process.exit(0);
}

if (!options.pasta) {
    console.error(chalk.bold.red("no pasta file specified"));
    process.exit(1);
}

if (!options.copy) {
    console.error(chalk.bold.red("no data file specified"));
    process.exit(1);
}

if (!options.out) {
    console.error(chalk.bold.red("no output file specified"));
    process.exit(1);
}

// read template
try {
    console.log(chalk.bold.green("Reading pasta...") + options.pasta);
    ejs_template = fs.readFileSync(options.pasta).toString();

    // check if there is a [template].copy data file
    const path = require('path');
    if (fs.existsSync("pasta/" + path.parse(options.pasta).name + ".copy")) {
        console.log(chalk.bold.green("Found template copy file...") + "pasta/" + path.parse(options.pasta).name + ".copy");
        options.copy.push("pasta/" + path.parse(options.pasta).name + ".copy");
    }
} catch (err) {
    console.error(chalk.bold.red(err.message));
    process.exit(1);
}

// merge data files
try {
    for (var i = 0; i < options.copy.length; ++i) {
        console.log(chalk.bold.green("Processing...") + options.copy[i]);
        ejs_data = fs.readFileSync(options.copy[i]).toString();
        ejs_data = JSON.parse(ejs_data);

        for (var n = 0; n < ejs_data.include.length; ++n) {
            merged_ejs_data['includes'].push(ejs_data.include[n])
        }
        for (var n = 0; n < ejs_data.constructor.length; ++n) {
            merged_ejs_data['constructors'].push(ejs_data.constructor[n])
        }
        for (var n = 0; n < ejs_data.setup.length; ++n) {
            merged_ejs_data['setups'].push(ejs_data.setup[n])
        }
        for (var n = 0; n < ejs_data.loop.length; ++n) {
            merged_ejs_data['loops'].push(ejs_data.loop[n])
        }
        for (var n = 0; n < ejs_data.dependencies.length; ++n) {
            merged_ejs_data['dependencies'].push(ejs_data.dependencies[n])
        }
        for (var n = 0; n < ejs_data.values.length; ++n) {
            merged_ejs_data['values'].push(ejs_data.values[n].value);
            merged_ejs_data['units'].push(ejs_data.values[n].unit);
        }
    }
} catch (err) {
    console.error(chalk.bold.red(err.message));
    process.exit(1);
}

// render code
try {
    console.log(chalk.bold.green("Rendering code..."));
    code = ejs.render(ejs_template, merged_ejs_data);
} catch (err) {
    console.error(chalk.bold.red(err.message));
    process.exit(1);
}

// check if PlatformIO is installed
if (commandExistsSync('pio')) {
    console.log(chalk.bold.green("Creating PlatformIO project..."));
} else {
    console.log("PlatformIO not detected, see https://docs.platformio.org/en/latest/core/installation/index.html")
    console.log(code);
    process.exit(1);
}

// make sure a board is specified
if (!options.board) {
    console.log(chalk.bold.red("No board specified to make PlatformIO project. Use -b to pass board identifier"));
    console.log(code);
    process.exit(1);
}

// make directory
try {
    if (!fs.existsSync(options.out)) {
        fs.mkdirSync(options.out);
    }
} catch (err) {
    console.error(chalk.bold.red(err.message));
    process.exit(1);
}

// create PlatformIO project
process.chdir(options.out);
execSync(
    "pio project init --board " + options.board,
    { stdio: 'inherit' }
);

// save main.cpp rendered code
try {
    fs.writeFileSync("src/main.cpp", code);
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

// install libraries
for (var n = 0; n < merged_ejs_data.dependencies.length; ++n) {
    execSync("pio pkg install --library \"" + merged_ejs_data.dependencies[n] + "\"",
        { stdio: 'inherit' }
    );
}

// compile
execSync("pio run",
    { stdio: 'inherit' }
);

var abs_path = require("path");
var project_path = abs_path.resolve(options.out);
project_path = abs_path.normalize(abs_path.join(project_path, '..'))
console.log("Looks like everything worked, the project is in " + project_path);