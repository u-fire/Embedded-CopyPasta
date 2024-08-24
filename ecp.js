// This file is part of Embedded CopyPasta.
// Embedded CopyPasta is free software: you can redistribute it and/or modify it under the terms of the GNU General 
// Public License as published by the Free Software Foundation, either version 3 of the License, or any 
// later version.
// Embedded CopyPasta is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even 
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General 
// Public License for more details.
// You should have received a copy of the GNU General Public License along with Embedded CopyPasta. If not, see 
// <https://www.gnu.org/licenses/>.

const { Command } = require("commander");
const fs = require('fs');
const program = new Command();
const options = program.opts();
const figlet = require("figlet");
const chalk = require('chalk');
const commandExistsSync = require('command-exists').sync;
const { execSync } = require("child_process");
var _template;
var _data;
var code;
var merged__data = { includes: [], constructors: [], setups: [], loops: [], values: [], units: [], dependencies: [] };

const Handlebars = require("handlebars");

// start things, check arguments // embeded CP
console.log(chalk.bold.white(figlet.textSync("Embedded CopyPasta", {font: "Contessa"})));
console.log("(C) Microfire LLC 2024 (https://microfire.co)\n")
program
    .version("0.2.0")
    .description("Embedded CopyPasta")
    .option("-t, --template  [file]", ".handlebar Template file")
    .option("-j, --json [file/s...]", ".json data file")
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

if (!options.template) {
    console.error(chalk.bold.red("no template file specified"));
    process.exit(1);
}

if (!options.json) {
    console.error(chalk.bold.red("no JSON file specified"));
    process.exit(1);
}

if (!options.out) {
    console.error(chalk.bold.red("no output file specified"));
    process.exit(1);
}

// read template
try {
    console.log(chalk.bold.green("Reading template...") + options.template);
    _template = fs.readFileSync(options.template).toString();

    // check if there is a [template].json data file
    const path = require('path');
    if (fs.existsSync("templates\\" + path.parse(options.template).name + ".json")) {
        console.log(chalk.bold.green("Found template-related JSON file...") + "template\\" + path.parse(options.template).name + ".json");
        options.json.push("templates\\" + path.parse(options.template).name + ".json");
    }
} catch (err) {
    console.error(chalk.bold.red(err.message));
    process.exit(1);
}

// merge data files
try {
    for (var i = 0; i < options.json.length; ++i) {
        console.log(chalk.bold.green("Processing...") + options.json[i]);
        _data = fs.readFileSync(options.json[i]).toString();
        _data = JSON.parse(_data);

        for (var n = 0; n < _data.include.length; ++n) {
            merged__data['includes'].push(_data.include[n])
        }
        for (var n = 0; n < _data.constructor.length; ++n) {
            merged__data['constructors'].push(_data.constructor[n])
        }
        for (var n = 0; n < _data.setup.length; ++n) {
            merged__data['setups'].push(_data.setup[n])
        }
        for (var n = 0; n < _data.loop.length; ++n) {
            merged__data['loops'].push(_data.loop[n])
        }
        for (var n = 0; n < _data.dependencies.length; ++n) {
            merged__data['dependencies'].push(_data.dependencies[n])
        }
        for (var n = 0; n < _data.values.length; ++n) {
            merged__data['values'].push(_data.values[n].value);
            merged__data['units'].push(_data.values[n].unit);
        }
    }
} catch (err) {
    console.error(chalk.bold.red(err.message));
    process.exit(1);
}

// render code
try {
    console.log(chalk.bold.green("Rendering code..."));
    const template = Handlebars.compile(_template);
    code = template(merged__data);
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
for (var n = 0; n < merged__data.dependencies.length; ++n) {
    execSync("pio pkg install --library \"" + merged__data.dependencies[n] + "\"",
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