# How to make your own Embedded CopyPasta 🍝
Thanks for taking the time to contribute. 

Here are some things to know:
- *.copy* files are just plain JSON
- *.pasta* files are [Embedded JavaScript](https://ejs.co/)
- Embedded Javascript (EJS) is a templating language
    - it takes just a few minutes to learn if you know JavaScript already
- *.copy* files contain data like include statements, class initialization or variable declaration, setup, and loop calls
- *.pasta* is where the data goes with the help of EJS
- the binary and Node.js package look for *.pasta* files in the `./pasta` folder
    - and the .copy files are in the `./copy` folder
- All the *.copy* (JSON) files are merged together to make list of includes, constructors, setups etc. 

## That was actually complicated...
Let's just look at an example then.

Open `./copy/microfire_mod-ph.copy` and remember it is just plain JSON. 

Then look at `./pasta/print.pasta`, this looks a little crazy, it is the EJS file. 

Notice that in `./copy/microfire_mod-ph.copy` it has `include`, `constructor` and several others? Now look through `./pasta/print.pasta` towards the top. 

```js
<% for(var i = 0; i < includes.length; ++i) {%>
<%-includes[i]%><%}%>
```

What is happening there is your normal JavaScript for loop, if you pretend the %> aren't there, you can see it. **Embedded CopyPasta 🍝** fills the `includes` variable with all the include lines from all the *.copy* files. In our example above, only one include file is there, so that EJS statement would render to

```cpp
#include <Microfire_Mod-pH.h>
```

It works the same way for the following *.copy* JSON entries:
- include
- constructor
- setup
- loop
- values. This is a little different, it looks like this `{value: [value], unit: [unit]}` and there can be several 
Any of them can be empty, but they must be empty arrays (ie. `loop:[]`).

### *.copy* Contents
- `version` the library the *.copy* is based on
- `name` for display purposes only
- `dependencies` the PlatformIO library name and version string. It can be found in the "Installation" tab of the PlatformIO library page. [Here](https://registry.platformio.org/libraries/microfire/Microfire%20Mod-pH/installation) is an example. If there are multiple dependencies, they can all be listed here, but keep in mind that if the library is configured to have dependencies within the PlatformIO system, they will be installed anyway. 
- `include` is for the `#include` statements
- `constructor` is where variables are declared or class initialization occurs outside of and above functions like `setup()` or `loop()`.
- `setup` for doing needed configuration in the `setup()` function. This is  `::begin()` for many sensors.
- `loop` should be how the data is updated. Maybe something like `::update()`. 
- `values.value` is how the data is made available. It might be a the return of a function call, or a variable previously declared and updated in the `loop` line. It should be formatted to be used as a variable (ie. `Serial.println([value])`), so no ending semicolon. 
- `values.unit` the unit of the `values.value` key. This is used as a variable name, so should conform to variable name standards (no spaces, special characters etc). 

### *.pasta* Contents
When rendering, the following EJS variables will be merged from all the used *.copy* files.
- includes
- constructors
- setups
- loops
- values. This is now a flattened array of all the values
- units. This comes from the `values.unit` key in the *.copy* file and is a flattened array

Now that that is sorted, we can make our *.pasta* (template) file. `./pasta/print.pasta` looks like this:

```js
<% for(var i = 0; i < includes.length; ++i) {%>
<%-includes[i]%><%}%>
    
<% for(var i = 0; i < constructors.length; ++i) 
{%><%-constructors[i]%>
<%}%>
void setup()
{
    Serial.begin(9600);
    <% for(var i = 0; i < setups.length; ++i) {%>
    <%-setups[i]%><%}%>
}

void loop()
{<% for(var i = 0; i < loops.length; ++i) {%>
    <%-loops[i]%><%}%>
<% for(var i = 0; i < values.length; ++i) {%>
    Serial.println((String)"<%-units[i]%>: " + <%-values[i]%>);<%}%>

    delay(1000);
}
```

You can see...
- that the top EJS loop just pastes all the `#include` lines
- then the sensor library classes are initialized
- after that is the normal Arduino `setup()` function
- inside the `setup()` function, there is normally some setup done, most commonly for sensors it is a `::begin()` call. 
- in the `loop()` function, you call whatever updates the sensor, and in this example, it prints the value and it identifies that value by unit. 
    - notice that the index of `units[x]` and `values[x]` always refers to the same value/unit pair. 

So in short, the *.pasta* file is where everything comes together. This example just prints the values, but there are others that send measurements to AdafruitIO, or the Arduino IoT cloud. 

### A *.pasta* *.copy* file?
Yes, in the `./pasta` directory, for each [name].pasta file, there should be a [name].copy file. The *.copy*  file has all the same data in it with the exception of `version` being changed to `board`. `board` contains which board variant the *.pasta* file is for (ie ESP32, IoT 33, Uno). 

If the *.pasta* file uses libraries, like AdafruitIO or InfluxDB, this is where you specify those libraries, constructors etc to get it running. This will also ensure those libraries are installed. All the fields will be at the top of the various JSON arrays. All the arrays can be empty, but there should at least be the `name` and `board` fields present. 

## It wasn't so hard...
Hopefully that explained enough to make you (dangerously?) effective at making your own. Have a look through this repo's examples for how various things are handled. 

## Last things
- Avoid name collisions: use specific class names like sht30 vs sensor
- No `#ifdef` for different boards. Some examples support multiple boards and variants. That doesn't make for readable code and it is easy to just make another template. ESP32 can have a separate template, so can ESP866 and RP2040.
- Some decisions need to be made like pin numbers. Pick one to ensure it compiles. use `/**/` inline comments to notate it. 
- Include links to the sketch and sensors is available
- Make sure `values.units` in the *.copy* files are valid C++ variable names. Name them with avoid name collisions in mind. `sht30_tempC` vs `tempC`. 

## Submit it all
You can do it through a PR of this repo, or you can [email](mailto:justin@microfire.co) it to me if that's easier. 

## A walkthrough
If you'd rather a walkthrough, [try this out](WALKTHROUGH.md). 