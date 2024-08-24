# How to make your own Embedded CopyPasta 🍝
Thanks for taking the time to contribute. 

Here are some things to know:
- *.json* files are JSON 🤡
- *.handlebars* files are [Handlebar Templates](https://handlebarsjs.com/)
- *.json* files contain data like include statements, class initialization or variable declaration, setup, and loop calls
- *.handlebar* is a template where the JSON data is inserted
- the binary and Node.js package look for *.handlebar* files in the `./templates` folder
    - and the .json files are in the `./json` folder
- All the *.json* files are merged together to make lists of includes, constructors, setups etc. 

## That was actually complicated...
Let's just look at an example then.

Open `./json/microfire_mod-ph.json`. 

Then look at `./templates/print.handlebars`. Everywhere you see {{[some_data]}}, ECP will insert `some_data`.

Notice that in `./json/microfire_mod-ph.json` it has `include`, `constructor` and several others? Now look through `./templates/print.handlebars` towards the top. 

```handlebars
{{#each includes}}
{{{this}}}
{{/each}}
```

**Embedded CopyPasta 🍝** fills the `includes` variable with all the include lines from all the *.json* files. In our example above, only one include file is there, so that handlebar statement would render to

```cpp
#include <Microfire_Mod-pH.h>
```

It works the same way for the following *.json* JSON entries:
- include
- constructor
- setup
- loop
- values. This is a little different, it looks like this `{value: [value], unit: [unit]}`

Any of them can be empty, but they must be empty arrays (ie. `loop:[]`).

### *.json* Contents
- `version` the library the *.json* is based on
- `name` for display purposes only
- `dependencies` the PlatformIO library name and version string. It can be found in the "Installation" tab of the PlatformIO library page. [Here](https://registry.platformio.org/libraries/microfire/Microfire%20Mod-pH/installation) is an example. If there are multiple dependencies, they can all be listed here, but keep in mind that if the library is configured to have dependencies within the PlatformIO system, they will be installed anyway. 
- `include` is for the `#include` statements
- `constructor` is where variables are declared or class initialization occurs outside of and above functions like `setup()` or `loop()`.
- `setup` for doing needed configuration in the `setup()` function. This is  `::begin()` for many sensors.
- `loop` should be how the data is updated. Maybe something like `::update()`. 
- `values.value` is how the data is made available. It might be a the return of a function call, or a variable previously declared and updated in the `loop` line. It should be formatted to be used as a variable (ie. `Serial.println([values.value])`), so no ending semicolon. 
- `values.unit` the unit of the `values.value` key. This is used as a variable name, so should conform to variable name standards (no spaces, special characters etc). This also needs to be sufficiently unique to avoid name collisions (`sht30_tempC` vs `tempC`).

### *.handlebars* Contents
When rendering, the following variables will be merged from all the used *.json* files.
- includes
- constructors
- setups
- loops
- values. This is now a flattened array of all the values
- units. This comes from the `values.unit` key in the *.copy* file and is a flattened array

Now that that is sorted, we can make our template file. `./templates/print.handlebars` looks like this:

```handlebars
{{#each includes}}
{{{this}}}
{{/each}}

{{#each constructors}}
{{{this}}}
{{/each}}

void setup()
{
	{{#each setups}}
    {{{this}}}
	{{/each}}
}


void loop()
{
    {{#each loops}}
    {{{this}}}
	{{/each}}

    {{#each units}}
    Serial.println((String)"{{{this}}}: " + {{{lookup ../values @index}}});
    {{/each}}
    
    delay(1000);
}
```

You can see...
- that the top Handlebar loop just pastes all the `#include` lines
- then the library classes are constructed/initialized
- after that is the normal Arduino `setup()` function
- inside the `setup()` function, there is normally some setup done, most commonly for sensors it is a `::begin()` call. 
- in the `loop()` function, you call whatever updates the sensor, and in this example, it prints the value and it identifies that value by unit. 
    - notice that the index of `units[x]` and `values[x]` always refers to the same value/unit pair. 

So in short, the *.handlebars* file is where everything comes together. This example just prints the values, but there are others that send measurements to AdafruitIO, or the Arduino IoT cloud. 

### A *.handlebars* *.json* file?
Yes, in the `./templates` directory, for each [name].pasta file, there should be a [name].json file. The *.json*  file has all the same data in it with the exception of `version` being changed to `board`. `board` contains which board variant the *.handlebars* file is for (ie ESP32, IoT 33, Uno). 

If the *.handlebars* file uses libraries, like AdafruitIO or InfluxDB, this is where you specify those libraries, constructors etc to get it running. This will also ensure those libraries are installed. All the fields will be at the top of the various JSON arrays. All the arrays can be empty, but there should at least be the `name` and `board` fields present. 

## It wasn't so hard...
Hopefully that explained enough to make you (dangerously?) effective at making your own. Have a look through this repo's examples for how various things are handled. 

## Last things
- Avoid name collisions: use specific class names like sht30 vs sensor
- No `#ifdef` for different boards. Some examples support multiple boards and variants. That doesn't make for readable code and it is easy to just make another template. ESP32 can have a separate template, so can ESP866 and RP2040.
- Some decisions need to be made like pin numbers. Pick one to ensure it compiles. use `/**/` inline comments to notate it. 
- Include links to the sketch and sensors if available

## Submit it all
You can do it through a PR of this repo, or you can [email](mailto:justin@microfire.co) it to me if that's easier. 

## A walkthrough
If you'd rather a walkthrough, [try this out](WALKTHROUGH.md). 